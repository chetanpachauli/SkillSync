import { GoogleGenerativeAI } from "@google/generative-ai";

const geminiKey = process.env.GEMINI_API_KEY;
const genAI = geminiKey ? new GoogleGenerativeAI(geminiKey) : null;

const parseJsonArray = (text) => {
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]") + 1;
  if (start === -1 || end === 0 || end <= start) {
    throw new Error("Could not parse quiz output as JSON array.");
  }
  return JSON.parse(text.slice(start, end));
};

export async function POST(req) {
  try {
    if (!genAI) {
      return new Response(
        JSON.stringify({ error: "Missing Gemini API key in server environment." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const { topic = "JavaScript", type = "Multiple Choice" } = await req.json();
    let model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    let chat = model.startChat();

    const prompt = `You are a helpful assistant that generates quiz questions in valid JSON format. Generate 5 ${type} quiz questions on the topic "${topic}". Return only a valid JSON array in the response. Use this structure for every entry:\n\n[{\n  "question": "...",\n  "options": [...],\n  "answer": "..."\n}]`;

    let result;
    try {
      result = await chat.sendMessage(prompt);
    } catch (sendError) {
      const message = sendError?.message || "";
      console.warn("Gemini quiz sendMessage failed, retrying with gemini-2.5-pro if possible:", message);
      if (message.includes("models/gemini-2.5-flash") || message.includes("model not found") || message.includes("not found")) {
        model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
        chat = model.startChat();
        result = await chat.sendMessage(prompt);
      } else {
        throw sendError;
      }
    }

    const response = await result.response;
    const text = await response.text();
    const questions = parseJsonArray(text);

    return new Response(JSON.stringify({ questions }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Gemini Generate Quiz Error:", err);
    return new Response(
      JSON.stringify({ error: "Quiz generation failed. Please try again." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
