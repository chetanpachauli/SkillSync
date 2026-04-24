import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

// 🔧 timeout helper
async function fetchWithTimeout(url, options, timeout = 8000) {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), timeout)
    ),
  ]);
}

// 🔧 JSON extractor
const parseJsonArray = (text) => {
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]") + 1;
  if (start === -1 || end === 0 || end <= start) {
    throw new Error("Invalid JSON format");
  }
  return JSON.parse(text.slice(start, end));
};

export async function POST(req) {
  try {
    const { topic = "JavaScript", type = "Multiple Choice" } =
      await req.json();

    const prompt = `Generate 5 ${type} quiz questions on "${topic}".
Return ONLY JSON array.
Format:
[
 { "question": "...", "options": ["A","B","C","D"], "answer": "..." }
]`;

    // =========================
    // 1️⃣ OPENROUTER (PRIMARY)
    // =========================
    try {
      console.log("➡️ OpenRouter...");

      const res = await fetchWithTimeout(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:3000",
          },
          body: JSON.stringify({
            model: "openai/gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
          }),
        }
      );

      const data = await res.json();

      if (res.ok && data.choices) {
        console.log("✅ OpenRouter success");

        const text = data.choices[0].message.content;
        const questions = parseJsonArray(text);

        return new Response(JSON.stringify({ questions }), {
          headers: { "Content-Type": "application/json" },
        });
      }
    } catch (err) {
      console.log("❌ OpenRouter failed:", err.message);
    }

    // =========================
    // 2️⃣ GROQ (BACKUP)
    // =========================
    try {
      console.log("➡️ Groq...");

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
            messages: [{ role: "user", content: prompt }],
          }),
        }
      );

      const data = await res.json();

      if (res.ok && data.choices) {
        console.log("✅ Groq success");

        const text = data.choices[0].message.content;
        const questions = parseJsonArray(text);

        return new Response(JSON.stringify({ questions }), {
          headers: { "Content-Type": "application/json" },
        });
      }
    } catch (err) {
      console.log("❌ Groq failed:", err.message);
    }

    // =========================
    // 3️⃣ GEMINI (LAST)
    // =========================
    try {
      console.log("➡️ Gemini...");

      if (!genAI) throw new Error("Missing Gemini key");

      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
      });

      const result = await Promise.race([
        model.generateContent(prompt),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Timeout")), 8000)
        ),
      ]);

      const text = result.response.text();
      const questions = parseJsonArray(text);

      console.log("✅ Gemini success");

      return new Response(JSON.stringify({ questions }), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      console.log("❌ Gemini failed:", err.message);
    }

    // =========================
    // FINAL FAIL SAFE
    // =========================
    return new Response(
      JSON.stringify({
        error: "All AI services failed. Try again later.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Quiz API Error:", err);

    return new Response(
      JSON.stringify({ error: "Server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
