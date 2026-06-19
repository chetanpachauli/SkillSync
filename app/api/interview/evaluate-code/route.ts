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
    const { role, experienceLevel, questionText, codeSubmitted, language } = await req.json();

    if (!role || !experienceLevel || !questionText || !codeSubmitted || !language) {
      return NextResponse.json(
        { success: false, error: "Missing required parameters: role, experienceLevel, questionText, codeSubmitted, and language are required." },
        { status: 400 }
      );
    }

    const systemPrompt = `You are an expert AI Technical Interviewer, Principal Software Engineer, and Code Reviewer.
Evaluate the candidate's coding solution to the coding challenge below.

Context:
- Candidate Target Role: ${role}
- Candidate Experience Level: ${experienceLevel}
- Coding Challenge Question: "${questionText}"
- Language Selected: ${language}
- Code Submitted by Candidate:
${codeSubmitted}

You must return a valid JSON object matching this schema. Do not wrap in markdown or return extra text:
{
  "correctness": 0, // A number between 0 and 100 representing logical correctness and edge-case coverage. Give 0 if code is empty/boilerplate only.
  "codeQuality": 0, // A number between 0 and 100 representing use of code standards, clean naming, and syntax validity.
  "optimization": 0, // A number between 0 and 100 representing time complexity (Big O) and space complexity optimization.
  "readability": 0, // A number between 0 and 100 representing ease of understanding and commenting.
  "feedback": ["Point 1", "Point 2", ...], // Up to 3 constructive critiques about what is correct or incorrect.
  "improvements": ["Improvement 1", "Improvement 2", ...], // Up to 3 concrete suggestions for clean-up or efficiency.
  "optimizedSolution": "Full code block showing the clean, fully optimized solution written in ${language}."
}

If the code is empty, extremely minimal, or contains massive syntax errors, score accordingly (e.g. 0-20) and provide the optimized solution in detail.`;

    let finalJsonResponseStr = "";
    const errorsList: string[] = [];

    // ===================================
    // FALLBACK 1: Gemini 2.5 Flash
    // ===================================
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        console.log("➡️ [Code Eval API] Trying Gemini 2.5 Flash...");
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
          console.log("✅ [Code Eval API] Gemini 2.5 Flash succeeded!");
        }
      } catch (err: any) {
        console.warn("⚠️ [Code Eval API] Gemini 2.5 Flash failed:", err.message);
        errorsList.push(`Gemini 2.5: ${err.message}`);
      }
    }

    // ===================================
    // FALLBACK 2: Gemini 1.5 Flash
    // ===================================
    if (!finalJsonResponseStr && apiKey) {
      try {
        console.log("➡️ [Code Eval API] Trying Gemini 1.5 Flash...");
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
          console.log("✅ [Code Eval API] Gemini 1.5 Flash succeeded!");
        }
      } catch (err: any) {
        console.warn("⚠️ [Code Eval API] Gemini 1.5 Flash failed:", err.message);
        errorsList.push(`Gemini 1.5: ${err.message}`);
      }
    }

    // ===================================
    // FALLBACK 3: Groq (llama-3.3-70b-versatile)
    // ===================================
    const groqKey = process.env.GROQ_API_KEY;
    if (!finalJsonResponseStr && groqKey) {
      try {
        console.log("➡️ [Code Eval API] Trying Groq (llama-3.3-70b)...");
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
                { role: "system", content: "You are a professional code review tool. Analyze code and return JSON matching the schema." },
                { role: "user", content: systemPrompt },
              ],
              temperature: 0.1,
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
          console.log("✅ [Code Eval API] Groq succeeded!");
        }
      } catch (err: any) {
        console.warn("⚠️ [Code Eval API] Groq failed:", err.message);
        errorsList.push(`Groq: ${err.message}`);
      }
    }

    // ===================================
    // FALLBACK 4: OpenRouter (google/gemini-2.5-flash)
    // ===================================
    const orKey = process.env.OPENROUTER_API_KEY;
    if (!finalJsonResponseStr && orKey) {
      try {
        console.log("➡️ [Code Eval API] Trying OpenRouter (google/gemini-2.5-flash)...");
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
                { role: "system", content: "You are a professional code reviewer. Evaluate the coding solution and return JSON format." },
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
          console.log("✅ [Code Eval API] OpenRouter succeeded!");
        }
      } catch (err: any) {
        console.warn("⚠️ [Code Eval API] OpenRouter failed:", err.message);
        errorsList.push(`OpenRouter: ${err.message}`);
      }
    }

    if (!finalJsonResponseStr) {
      return NextResponse.json(
        { success: false, error: `Failed to evaluate code. AI services busy: [${errorsList.join(", ")}]` },
        { status: 503 }
      );
    }

    return NextResponse.json({
      success: true,
      review: JSON.parse(finalJsonResponseStr),
    });

  } catch (error: any) {
    console.error("Evaluate code API error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
