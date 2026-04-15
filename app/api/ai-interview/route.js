import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const { messages } = await req.json();

    const chat = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }).startChat({
      history: [],
      generationConfig: {
        maxOutputTokens: 2048,
      },
    });

    const userMessage = messages[messages.length - 1]?.content || "Tell me about yourself";
    const result = await chat.sendMessage(userMessage);
    const response = await result.response;
    const text = response.text();

    return new Response(JSON.stringify({ reply: text }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Gemini API error:", err);
    return new Response(
      JSON.stringify({ error: "Something went wrong. Please try again." }),
      { status: 500 }
    );
  }
}
