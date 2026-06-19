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
    const { role, experienceLevel, interviewType } = await req.json();

    if (!role || !experienceLevel || !interviewType) {
      return NextResponse.json(
        { success: false, error: "Missing required parameters: role, experienceLevel, and interviewType are required." },
        { status: 400 }
      );
    }

    const systemPrompt = `You are an expert AI Technical Recruiter and Career Coach.
Your task is to generate exactly 5 interview questions for a candidate with the following profile:
- Role: ${role}
- Experience Level: ${experienceLevel}
- Interview Type: ${interviewType}

You must return a valid JSON array of objects representing the questions. Do not wrap in markdown or return any extra text.

Depending on the Interview Type:
1. If the Interview Type is "Coding Interview":
   Return a JSON array of coding questions matching this schema:
   [
     {
       "id": 1,
       "type": "coding",
       "title": "Problem Title (e.g. Two Sum)",
       "difficulty": "Easy/Medium/Hard",
       "questionText": "Detailed description of the coding challenge, including constraints and sample inputs.",
       "boilerplate": "Boilerplate code for JavaScript function to write",
       "testCases": [
         { "input": "[2, 7, 11, 15], 9", "output": "[0, 1]" },
         { "input": "[3, 2, 4], 6", "output": "[1, 2]" }
       ]
     },
     ...
   ]

2. For any other Interview Type (HR, Technical, Behavioral, System Design, Mixed):
   Return a JSON array of conceptual questions matching this schema:
   [
     {
       "id": 1,
       "type": "text",
       "questionText": "Specific interview question based on the role, experience level, and interview type."
     },
     ...
   ]

Make the questions highly relevant to the role. For example, if the role is a "React Developer" and the type is "Technical", generate questions about hooks, rendering optimization, state management, etc. If it is a "System Design" interview, generate architectural design problems suitable for their experience level.`;

    let finalJsonResponseStr = "";
    const errorsList: string[] = [];

    // ===================================
    // FALLBACK 1: Gemini 2.5 Flash
    // ===================================
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        console.log("➡️ [Questions API] Trying Gemini 2.5 Flash...");
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
          console.log("✅ [Questions API] Gemini 2.5 Flash succeeded!");
        }
      } catch (err: any) {
        console.warn("⚠️ [Questions API] Gemini 2.5 Flash failed:", err.message);
        errorsList.push(`Gemini 2.5: ${err.message}`);
      }
    }

    // ===================================
    // FALLBACK 2: Gemini 1.5 Flash
    // ===================================
    if (!finalJsonResponseStr && apiKey) {
      try {
        console.log("➡️ [Questions API] Trying Gemini 1.5 Flash...");
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
          console.log("✅ [Questions API] Gemini 1.5 Flash succeeded!");
        }
      } catch (err: any) {
        console.warn("⚠️ [Questions API] Gemini 1.5 Flash failed:", err.message);
        errorsList.push(`Gemini 1.5: ${err.message}`);
      }
    }

    // ===================================
    // FALLBACK 3: Groq (llama-3.3-70b-versatile)
    // ===================================
    const groqKey = process.env.GROQ_API_KEY;
    if (!finalJsonResponseStr && groqKey) {
      try {
        console.log("➡️ [Questions API] Trying Groq (llama-3.3-70b)...");
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
                { role: "system", content: "You are a professional hiring manager. Generate a list of questions in JSON matching the exact schema." },
                { role: "user", content: systemPrompt },
              ],
              temperature: 0.2,
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
          console.log("✅ [Questions API] Groq succeeded!");
        }
      } catch (err: any) {
        console.warn("⚠️ [Questions API] Groq failed:", err.message);
        errorsList.push(`Groq: ${err.message}`);
      }
    }

    // ===================================
    // FALLBACK 4: OpenRouter (google/gemini-2.5-flash)
    // ===================================
    const orKey = process.env.OPENROUTER_API_KEY;
    if (!finalJsonResponseStr && orKey) {
      try {
        console.log("➡️ [Questions API] Trying OpenRouter (google/gemini-2.5-flash)...");
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
                { role: "system", content: "You are a professional recruiter. Generate dynamic interview questions in JSON format." },
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
          console.log("✅ [Questions API] OpenRouter succeeded!");
        }
      } catch (err: any) {
        console.warn("⚠️ [Questions API] OpenRouter failed:", err.message);
        errorsList.push(`OpenRouter: ${err.message}`);
      }
    }

    if (!finalJsonResponseStr) {
      return NextResponse.json(
        { success: false, error: `Failed to generate questions. AI services busy: [${errorsList.join(", ")}]` },
        { status: 503 }
      );
    }

    return NextResponse.json({
      success: true,
      questions: JSON.parse(finalJsonResponseStr),
    });

  } catch (error: any) {
    console.error("Generate questions API error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
