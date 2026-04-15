import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const { topic = "JavaScript", type = "Multiple Choice" } = await req.json();

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Generate 5 ${type} questions on the topic "${topic}".
Each question must return a JSON object with:
{
  "question": "...",
  "options": [...], // only if Multiple Choice
  "answer": "..." // exact string
}
Return a valid JSON array.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();

    const jsonStart = text.indexOf("[");
    const jsonEnd = text.lastIndexOf("]") + 1;
    const jsonString = text.slice(jsonStart, jsonEnd);
    const questions = JSON.parse(jsonString);

    return new Response(JSON.stringify({ questions }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Gemini Error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
