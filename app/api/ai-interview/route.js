import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// ✅ helper: timeout fetch
async function fetchWithTimeout(url, options, timeout = 8000) {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), timeout)
    ),
  ]);
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { messages } = body;

    const userMessage =
      messages?.[messages.length - 1]?.content || messages?.message;

    if (!userMessage) {
      return NextResponse.json(
        { success: false, reply: "Invalid input" },
        { status: 400 }
      );
    }

    const systemPrompt = `
You are an expert AI Assistant for SkillSync.

MODE 1: Technical Interviewer
- Answer
- Feedback
- Ask 1 follow-up question

MODE 2: Quiz Generator
- Return ONLY JSON array

User: ${userMessage}
`;

   // =========================
   // 1️⃣ GROQ (BEST PRIMARY)
   // =========================
    try {
      console.log("➡️ Trying Groq...");

      const res = await fetchWithTimeout(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userMessage },
            ],
          }),
        },
        8000
      );

      const data = await res.json();

      if (res.ok && data.choices) {
        console.log("✅ Groq success");

        return NextResponse.json({
          success: true,
          reply: data.choices[0].message.content,
        });
      } else {
        console.log("❌ Groq failed:", data);
      }
    } catch (err) {
      console.log("❌ Groq error:", err.message);
    }

    //=========================
   // 2️⃣ OPENROUTER
   // =========================
 try {
  console.log("➡️ Trying OpenRouter...");

  const key = process.env.OPENROUTER_API_KEY;

  if (!key) {
    console.log("❌ OpenRouter key missing");
    throw new Error("Missing OpenRouter key");
  }

  // 🔥 Multiple models fallback (important)
  const models = [
    "openai/gpt-3.5-turbo",
    "mistralai/mistral-7b-instruct",
    "google/gemini-flash-1.5"
  ];

  let lastError = null;

  for (const model of models) {
    try {
      console.log("Trying model:", model);

      const res = await fetchWithTimeout(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${key.trim()}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:3000", // ⚠️ IMPORTANT (skillsync.com hata)
            "X-Title": "SkillSync",
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userMessage },
            ],
            temperature: 0.7,
            max_tokens: 1000,
          }),
        },
        8000
      );

      const data = await res.json();

      if (res.ok && data.choices?.length > 0) {
        console.log("✅ OpenRouter success with:", model);

        return NextResponse.json({
          success: true,
          reply: data.choices[0].message.content,
        });
      } else {
        console.log(`❌ Model failed (${model}):`, data);
        lastError = data;
      }

    } catch (err) {
      console.log(`❌ Error with model (${model}):`, err.message);
      lastError = err;
    }
  }

  console.log("❌ All OpenRouter models failed:", lastError);

} catch (err) {
  console.log("❌ OpenRouter error:", err.message);
}

   // =========================
// 3️⃣ GEMINI (LAST - SAFE)
// =========================
try {
  console.log("➡️ Trying Gemini...");

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.log("❌ Gemini key missing");
    throw new Error("Missing Gemini API key");
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash", 
  });

  // ⏱️ timeout wrapper (important)
  const result = await Promise.race([
    model.generateContent(systemPrompt),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Gemini timeout")), 8000)
    ),
  ]);

  const response = await result.response;

  const text = response?.text()?.trim();

  if (!text) {
    throw new Error("Empty Gemini response");
  }

  console.log("✅ Gemini success");

  return NextResponse.json({
    success: true,
    reply: text,
  });

} catch (err) {
  console.log("❌ Gemini failed:", err.message);
}

    // =========================
    // FINAL FAIL SAFE
    // =========================
    return NextResponse.json({
      success: false,
      reply: "All AI services are busy. Try again in a moment.",
    });

  } catch (error) {
    console.error("Server Error:", error);

    return NextResponse.json({
      success: false,
      reply: "Server error",
    });
  }
}