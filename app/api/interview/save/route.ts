import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/app/lib/mongodb";
import User from "@/models/User";
import Interview from "@/models/Interview";
import { GoogleGenerativeAI } from "@google/generative-ai";

async function fetchWithTimeout(url: string, options: any, timeout = 12000) {
  return Promise.race([
    fetch(url, options),
    new Promise<Response>((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), timeout)
    ),
  ]);
}

function cleanJsonResponse(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.substring(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  return cleaned.trim();
}

export async function POST(req: NextRequest) {
  try {
    await connectMongoDB();
    
    const { 
      email,
      role, 
      experienceLevel, 
      interviewType, 
      questions 
    } = await req.json();

    if (!role || !experienceLevel || !interviewType || !questions || !Array.isArray(questions)) {
      return NextResponse.json(
        { success: false, error: "Missing required fields or invalid questions list." },
        { status: 400 }
      );
    }

    // Calculate Averages from individual question evaluations
    const count = questions.length || 1;
    let avgTechnical = 0;
    let avgCommunication = 0;
    let avgConfidence = 0;
    let avgProblemSolving = 0;

    questions.forEach((q: any) => {
      const ev = q.evaluation;
      if (ev) {
        avgTechnical += ev.technicalScore || 0;
        avgCommunication += ev.communicationScore || 0;
        avgConfidence += ev.confidenceScore || 0;
        avgProblemSolving += ev.problemSolvingScore || 0;
      }
    });

    avgTechnical = Math.round(avgTechnical / count);
    avgCommunication = Math.round(avgCommunication / count);
    avgConfidence = Math.round(avgConfidence / count);
    avgProblemSolving = Math.round(avgProblemSolving / count);

    const overall = Math.round((avgTechnical + avgCommunication + avgConfidence + avgProblemSolving) / 4);

    // AI Summary and Hiring Recommendation prompt
    const summaryPrompt = `You are an expert HR Recruiter, Tech Lead, and Career Coach.
Based on the following candidate mock interview performance, compile a final summary report.

Context:
- Candidate Target Role: ${role}
- Experience Level: ${experienceLevel}
- Interview Type: ${interviewType}
- Technical Avg Score: ${avgTechnical}/100
- Communication Avg Score: ${avgCommunication}/100
- Confidence Avg Score: ${avgConfidence}/100
- Problem Solving Avg Score: ${avgProblemSolving}/100
- Overall Average Score: ${overall}/100

Detailed Questions and Answers list:
${questions.map((q: any, idx: number) => `Question ${idx + 1}: ${q.questionText}\nCandidate Answer: ${q.userAnswer}\n`).join("\n")}

You must return a valid JSON object matching this schema. Do not wrap in markdown or any other tags:
{
  "strengths": ["string", "string", ...], // Up to 3 main overall strengths observed in their answers
  "weaknesses": ["string", "string", ...], // Up to 3 main overall weaknesses observed in their answers
  "improvements": ["string", "string", ...], // Up to 3 concrete steps to improve for their next real interview
  "summary": "An executive summary (3-4 sentences) evaluating the candidate's performance, alignment with the target experience level, and key areas of expertise.",
  "hiringRecommendation": "Strong Hire" // Must be one of: "Strong Hire", "Hire", "Borderline", "No Hire"
}`;

    let summaryData: any = null;
    const errorsList: string[] = [];

    // ===================================
    // FALLBACK 1: Gemini 2.5 Flash
    // ===================================
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        console.log("➡️ [Save/Summary API] Trying Gemini 2.5 Flash...");
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: "gemini-2.5-flash",
          generationConfig: { responseMimeType: "application/json" },
        });

        const result = await Promise.race([
          model.generateContent(summaryPrompt),
          new Promise<any>((_, reject) =>
            setTimeout(() => reject(new Error("Gemini 2.5 Flash timeout")), 12000)
          ),
        ]);

        const responseText = result.response.text();
        if (responseText) {
          const cleaned = cleanJsonResponse(responseText);
          summaryData = JSON.parse(cleaned);
          console.log("✅ [Save/Summary API] Gemini 2.5 Flash succeeded!");
        }
      } catch (err: any) {
        console.warn("⚠️ [Save/Summary API] Gemini 2.5 Flash failed:", err.message);
        errorsList.push(`Gemini 2.5: ${err.message}`);
      }
    }

    // ===================================
    // FALLBACK 2: Gemini 1.5 Flash
    // ===================================
    if (!summaryData && apiKey) {
      try {
        console.log("➡️ [Save/Summary API] Trying Gemini 1.5 Flash...");
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: "gemini-1.5-flash",
          generationConfig: { responseMimeType: "application/json" },
        });

        const result = await Promise.race([
          model.generateContent(summaryPrompt),
          new Promise<any>((_, reject) =>
            setTimeout(() => reject(new Error("Gemini 1.5 Flash timeout")), 12000)
          ),
        ]);

        const responseText = result.response.text();
        if (responseText) {
          const cleaned = cleanJsonResponse(responseText);
          summaryData = JSON.parse(cleaned);
          console.log("✅ [Save/Summary API] Gemini 1.5 Flash succeeded!");
        }
      } catch (err: any) {
        console.warn("⚠️ [Save/Summary API] Gemini 1.5 Flash failed:", err.message);
        errorsList.push(`Gemini 1.5: ${err.message}`);
      }
    }

    // ===================================
    // FALLBACK 3: Groq (llama-3.3-70b-versatile)
    // ===================================
    const groqKey = process.env.GROQ_API_KEY;
    if (!summaryData && groqKey) {
      try {
        console.log("➡️ [Save/Summary API] Trying Groq (llama-3.3-70b)...");
        const response = await fetchWithTimeout(
          "https://api.groq.com/openai/v1/chat/completions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${groqKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "llama-3.3-70b-versatile",
              response_format: { type: "json_object" },
              messages: [
                { role: "system", content: "You are a professional technical recruiter. Summarize the mock interview in JSON format matching the schema." },
                { role: "user", content: summaryPrompt },
              ],
              temperature: 0.15,
            }),
          },
          12000
        );

        const data = await response.json();
        if (response.ok && data.choices?.[0]?.message?.content) {
          const text = data.choices[0].message.content;
          const cleaned = cleanJsonResponse(text);
          summaryData = JSON.parse(cleaned);
          console.log("✅ [Save/Summary API] Groq succeeded!");
        }
      } catch (err: any) {
        console.warn("⚠️ [Save/Summary API] Groq failed:", err.message);
        errorsList.push(`Groq: ${err.message}`);
      }
    }

    // Fallback Mock Summary if all AI fails
    if (!summaryData) {
      let recommendation: "Strong Hire" | "Hire" | "Borderline" | "No Hire" = "Borderline";
      if (overall >= 80) recommendation = "Strong Hire";
      else if (overall >= 65) recommendation = "Hire";
      else if (overall < 50) recommendation = "No Hire";

      summaryData = {
        strengths: ["Completed the simulated mock session."],
        weaknesses: ["AI summary service was temporarily busy during analysis."],
        improvements: ["Continue to practice answering technical mock interviews."],
        summary: `Mock interview completed for the role of ${role}. Candidate scored an overall average of ${overall}/100 across categories.`,
        hiringRecommendation: recommendation
      };
    }

    let userId = null;
    if (email) {
      const user = await (User as any).findOne({ email });
      if (user) {
        userId = user._id;
      }
    }

    const newInterview = new (Interview as any)({
      userId,
      role,
      experienceLevel,
      interviewType,
      overallScore: overall,
      technicalScore: avgTechnical,
      communicationScore: avgCommunication,
      confidenceScore: avgConfidence,
      problemSolvingScore: avgProblemSolving,
      strengths: summaryData.strengths,
      weaknesses: summaryData.weaknesses,
      improvements: summaryData.improvements,
      summary: summaryData.summary,
      hiringRecommendation: summaryData.hiringRecommendation,
      questions
    });

    await newInterview.save();

    return NextResponse.json({
      success: true,
      message: "Interview evaluated and saved successfully!",
      id: newInterview._id,
      report: {
        overallScore: overall,
        technicalScore: avgTechnical,
        communicationScore: avgCommunication,
        confidenceScore: avgConfidence,
        problemSolvingScore: avgProblemSolving,
        strengths: summaryData.strengths,
        weaknesses: summaryData.weaknesses,
        improvements: summaryData.improvements,
        summary: summaryData.summary,
        hiringRecommendation: summaryData.hiringRecommendation
      }
    });

  } catch (error: any) {
    console.error("Save & evaluate interview error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to save interview." },
      { status: 500 }
    );
  }
}
