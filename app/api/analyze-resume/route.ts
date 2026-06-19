import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import pdf from "pdf-parse";

// Helper for timeout fetches
async function fetchWithTimeout(url: string, options: any, timeout = 12000) {
  return Promise.race([
    fetch(url, options),
    new Promise<Response>((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), timeout)
    ),
  ]);
}

// Clean markdown and formatting from JSON responses
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
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file was uploaded." },
        { status: 400 }
      );
    }

    // Validate file type
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json(
        { success: false, error: "Only PDF files are supported." },
        { status: 400 }
      );
    }

    // Validate size (5MB limit)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: "File size exceeds the 5MB limit." },
        { status: 400 }
      );
    }

    // Extract text from the PDF file
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    let resumeText = "";
    try {
      const pdfData = await pdf(buffer);
      resumeText = pdfData.text || "";
    } catch (parseError: any) {
      console.error("PDF Parsing error:", parseError);
      return NextResponse.json(
        { success: false, error: "Failed to parse the PDF file. Please ensure it is a valid PDF." },
        { status: 422 }
      );
    }

    if (!resumeText.trim()) {
      return NextResponse.json(
        { success: false, error: "The uploaded PDF appears to be empty or contains no extractable text (e.g., scanned without OCR)." },
        { status: 422 }
      );
    }

    const systemPrompt = `You are an expert ATS Resume Reviewer, HR Recruiter, and Career Coach.
Analyze the resume below and return ONLY valid JSON matching the following schema. Do not wrap in markdown or any other tags:
{
  "atsScore": 0, // A number between 0 and 100 representing the ATS suitability score
  "summary": "Professional summary of the candidate's resume and overall experience quality",
  "strengths": ["Strength 1", "Strength 2", ...], // List of key strengths identified in the resume
  "missingSkills": ["Skill 1", "Skill 2", ...], // List of missing skills or tools based on the career trajectory
  "improvements": ["Improvement suggestion 1", "Improvement suggestion 2", ...], // Actionable ways to improve the resume layout, content, or writing style
  "recommendedRoles": ["Role 1", "Role 2", ...], // Job roles that fit this candidate's profile
  "keywordsToAdd": ["Keyword 1", "Keyword 2", ...], // Industry-standard keywords to add to bypass ATS screening
  "experienceEvaluation": "Comprehensive evaluation of the candidate's professional experience, highlighting details, gaps, action verbs usage, and quantifiable impact",
  "educationEvaluation": "Evaluation of the academic background, certifications, and credentials",
  "projectEvaluation": "Evaluation of personal or academic projects listed in the resume, detailing tech stack and complexity relevance"
}

Resume Text:
${resumeText.trim()}`;

    // Contact AI API with fallbacks to handle rate limit, 503 high demand, and quota errors
    let finalJsonResponseStr = "";
    const errorsList: string[] = [];

    // ===================================
    // FALLBACK 1: Gemini 2.5 Flash (Primary)
    // ===================================
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        console.log("➡️ Trying Gemini 2.5 Flash...");
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: "gemini-2.5-flash",
          generationConfig: {
            responseMimeType: "application/json",
          },
        });

        const result = await Promise.race([
          model.generateContent(systemPrompt),
          new Promise<any>((_, reject) =>
            setTimeout(() => reject(new Error("Gemini 2.5 Flash timeout")), 12000)
          ),
        ]);

        const responseText = result.response.text();
        if (responseText) {
          const cleaned = cleanJsonResponse(responseText);
          JSON.parse(cleaned); // Verify valid JSON
          finalJsonResponseStr = cleaned;
          console.log("✅ Gemini 2.5 Flash completed successfully!");
        }
      } catch (err: any) {
        console.warn("⚠️ Gemini 2.5 Flash failed:", err.message);
        errorsList.push(`Gemini 2.5 Flash: ${err.message}`);
      }
    }

    // ===================================
    // FALLBACK 2: Gemini 1.5 Flash (Backup)
    // ===================================
    if (!finalJsonResponseStr && apiKey) {
      try {
        console.log("➡️ Trying Gemini 1.5 Flash...");
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: "gemini-1.5-flash",
          generationConfig: {
            responseMimeType: "application/json",
          },
        });

        const result = await Promise.race([
          model.generateContent(systemPrompt),
          new Promise<any>((_, reject) =>
            setTimeout(() => reject(new Error("Gemini 1.5 Flash timeout")), 12000)
          ),
        ]);

        const responseText = result.response.text();
        if (responseText) {
          const cleaned = cleanJsonResponse(responseText);
          JSON.parse(cleaned); // Verify valid JSON
          finalJsonResponseStr = cleaned;
          console.log("✅ Gemini 1.5 Flash completed successfully!");
        }
      } catch (err: any) {
        console.warn("⚠️ Gemini 1.5 Flash failed:", err.message);
        errorsList.push(`Gemini 1.5 Flash: ${err.message}`);
      }
    }

    // ===================================
    // FALLBACK 3: Groq (llama-3.3-70b-versatile)
    // ===================================
    const groqKey = process.env.GROQ_API_KEY;
    if (!finalJsonResponseStr && groqKey) {
      try {
        console.log("➡️ Trying Groq (llama-3.3-70b)...");
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
                { role: "system", content: "You are a professional resume parser. You must review the resume and return only a JSON object matching the requested schema." },
                { role: "user", content: systemPrompt },
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
          JSON.parse(cleaned); // Verify valid JSON
          finalJsonResponseStr = cleaned;
          console.log("✅ Groq completed successfully!");
        } else {
          const errorMsg = data?.error?.message || "Unknown Groq error";
          throw new Error(errorMsg);
        }
      } catch (err: any) {
        console.warn("⚠️ Groq failed:", err.message);
        errorsList.push(`Groq: ${err.message}`);
      }
    }

    // ===================================
    // FALLBACK 4: OpenRouter (google/gemini-flash-1.5)
    // ===================================
    const orKey = process.env.OPENROUTER_API_KEY;
    if (!finalJsonResponseStr && orKey) {
      try {
        console.log("➡️ Trying OpenRouter (google/gemini-2.5-flash)...");
        const response = await fetchWithTimeout(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${orKey}`,
              "Content-Type": "application/json",
              "HTTP-Referer": "http://localhost:3000",
              "X-Title": "SkillSync",
            },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash",
              response_format: { type: "json_object" },
              messages: [
                { role: "system", content: "You are a professional resume parser. You must review the resume and return only a JSON object matching the requested schema." },
                { role: "user", content: systemPrompt },
              ],
            }),
          },
          12000
        );

        const data = await response.json();
        if (response.ok && data.choices?.[0]?.message?.content) {
          const text = data.choices[0].message.content;
          const cleaned = cleanJsonResponse(text);
          JSON.parse(cleaned); // Verify valid JSON
          finalJsonResponseStr = cleaned;
          console.log("✅ OpenRouter completed successfully!");
        } else {
          const errorMsg = data?.error?.message || "Unknown OpenRouter error";
          throw new Error(errorMsg);
        }
      } catch (err: any) {
        console.warn("⚠️ OpenRouter failed:", err.message);
        errorsList.push(`OpenRouter: ${err.message}`);
      }
    }

    if (!finalJsonResponseStr) {
      return NextResponse.json(
        { 
          success: false, 
          error: `AI analysis services are currently experiencing high demand. Please try again in a moment. Debug logs: [${errorsList.join(", ")}]` 
        },
        { status: 503 }
      );
    }

    return NextResponse.json({
      success: true,
      data: JSON.parse(finalJsonResponseStr),
    });

  } catch (error: any) {
    console.error("Resume analysis server error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "An unexpected server error occurred." },
      { status: 500 }
    );
  }
}
