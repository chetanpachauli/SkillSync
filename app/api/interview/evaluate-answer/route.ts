import { NextRequest, NextResponse } from "next/server";
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
    const { role, experienceLevel, questionText, userAnswer } = await req.json();

    if (!role || !experienceLevel || !questionText) {
      return NextResponse.json(
        { success: false, error: "Missing required parameters: role, experienceLevel, and questionText are required." },
        { status: 400 }
      );
    }

    const systemPrompt = `You are an expert AI Technical Interviewer, Recruiter, and Speech Coach.
Evaluate the candidate's response to the interview question below.

Context:
- Candidate Target Role: ${role}
- Candidate Experience Level: ${experienceLevel}
- Question Asked: "${questionText}"
- Candidate Answer: "${userAnswer || "[No answer / Skipped]"}"

You must return a valid JSON object matching this schema. Do not wrap in markdown or return extra text:
{
  "technicalScore": 0, // A number between 0 and 100 representing technical content correctness. Give 0 if answer is empty/skipped.
  "communicationScore": 0, // A number between 0 and 100 representing clarity and language delivery. Give 0 if empty/skipped.
  "confidenceScore": 0, // A number between 0 and 100 representing tone and conviction. Give 0 if empty/skipped.
  "problemSolvingScore": 0, // A number between 0 and 100 representing approach, logic, and analytical depth. Give 0 if empty/skipped.
  "strengths": ["Strength 1", "Strength 2", ...], // Up to 3 key strengths of the answer. If empty/skipped, state "No response provided."
  "weaknesses": ["Weakness 1", "Weakness 2", ...], // Up to 3 areas lacking detail, incorrect concepts, or communication gaps.
  "improvements": ["Improvement suggestion 1", "Improvement suggestion 2", ...], // Concrete suggestions to improve this specific answer.
  "idealAnswer": "A professional, comprehensive, and high-scoring ideal response to this specific question, tailored for a ${experienceLevel} ${role}."
}

If the userAnswer was skipped, empty, or extremely short (e.g. "don't know"), score it very low (0-15) and outline how they should approach such questions in the idealAnswer and improvements.`;

    let finalJsonResponseStr = "";
    const errorsList: string[] = [];

    // ===================================
    // FALLBACK 1: Gemini 2.5 Flash
    // ===================================
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        console.log("➡️ [Answer Eval API] Trying Gemini 2.5 Flash...");
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: "gemini-2.5-flash",
          generationConfig: { responseMimeType: "application/json" },
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
          JSON.parse(cleaned); // Validate JSON format
          finalJsonResponseStr = cleaned;
          console.log("✅ [Answer Eval API] Gemini 2.5 Flash succeeded!");
        }
      } catch (err: any) {
        console.warn("⚠️ [Answer Eval API] Gemini 2.5 Flash failed:", err.message);
        errorsList.push(`Gemini 2.5: ${err.message}`);
      }
    }

    // ===================================
    // FALLBACK 2: Gemini 1.5 Flash
    // ===================================
    if (!finalJsonResponseStr && apiKey) {
      try {
        console.log("➡️ [Answer Eval API] Trying Gemini 1.5 Flash...");
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: "gemini-1.5-flash",
          generationConfig: { responseMimeType: "application/json" },
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
          JSON.parse(cleaned); // Validate JSON format
          finalJsonResponseStr = cleaned;
          console.log("✅ [Answer Eval API] Gemini 1.5 Flash succeeded!");
        }
      } catch (err: any) {
        console.warn("⚠️ [Answer Eval API] Gemini 1.5 Flash failed:", err.message);
        errorsList.push(`Gemini 1.5: ${err.message}`);
      }
    }

    // ===================================
    // FALLBACK 3: Groq (llama-3.3-70b-versatile)
    // ===================================
    const groqKey = process.env.GROQ_API_KEY;
    if (!finalJsonResponseStr && groqKey) {
      try {
        console.log("➡️ [Answer Eval API] Trying Groq (llama-3.3-70b)...");
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
                { role: "system", content: "You are a professional hiring manager. Evaluate the candidate response in JSON format matching the schema." },
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
          JSON.parse(cleaned); // Validate JSON format
          finalJsonResponseStr = cleaned;
          console.log("✅ [Answer Eval API] Groq succeeded!");
        }
      } catch (err: any) {
        console.warn("⚠️ [Answer Eval API] Groq failed:", err.message);
        errorsList.push(`Groq: ${err.message}`);
      }
    }

    // ===================================
    // FALLBACK 4: OpenRouter (google/gemini-2.5-flash)
    // ===================================
    const orKey = process.env.OPENROUTER_API_KEY;
    if (!finalJsonResponseStr && orKey) {
      try {
        console.log("➡️ [Answer Eval API] Trying OpenRouter (google/gemini-2.5-flash)...");
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
                { role: "system", content: "You are a professional interview evaluator. Evaluate the candidate response in JSON format." },
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
          JSON.parse(cleaned); // Validate JSON format
          finalJsonResponseStr = cleaned;
          console.log("✅ [Answer Eval API] OpenRouter succeeded!");
        }
      } catch (err: any) {
        console.warn("⚠️ [Answer Eval API] OpenRouter failed:", err.message);
        errorsList.push(`OpenRouter: ${err.message}`);
      }
    }

    if (!finalJsonResponseStr) {
      return NextResponse.json(
        { success: false, error: `Failed to evaluate answer. AI services busy: [${errorsList.join(", ")}]` },
        { status: 503 }
      );
    }

    return NextResponse.json({
      success: true,
      evaluation: JSON.parse(finalJsonResponseStr),
    });

  } catch (error: any) {
    console.error("Evaluate answer API error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
