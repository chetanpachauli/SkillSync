import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    console.log("Starting AI interview request...");

    const geminiKey = process.env.GEMINI_API_KEY;
    console.log("GEMINI_API_KEY present:", !!geminiKey);

    if (!geminiKey) {
      console.error("Missing Gemini API key");
      return NextResponse.json(
        { error: "Missing Gemini API key in server environment." },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(geminiKey);
    console.log("GoogleGenerativeAI initialized");

    const body = await req.json();
    console.log("Request body received:", !!body);

    const { messages } = body;
    console.log("Messages array:", Array.isArray(messages), messages?.length);

    const userMessage = messages?.[messages.length - 1]?.content || messages?.message;
    console.log("User message extracted:", !!userMessage, userMessage?.substring(0, 50));

    if (!userMessage) {
      console.error("No message provided in request");
      return NextResponse.json(
        { error: "No message provided" },
        { status: 400 }
      );
    }

    console.log("Creating Gemini model...");
    let model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    let chat = model.startChat();
    console.log("Chat session started with gemini-2.5-flash");

    const prompt = `You are an expert AI Assistant designed to assist a developer with "SkillSync". You have two distinct modes based on user intent:

MODE 1: TECHNICAL INTERVIEWER
If the user provides a response to an interview question or asks a technical query, act as a professional interviewer.
- Provide a concise, clear technical answer if asked.
- Evaluate the user's previous answer with constructive feedback.
- ALWAYS ask exactly one relevant follow-up question.
- Format:
  1. Answer: [Your text]
  2. Feedback: [Your text]
  3. Follow-up Question: [Your text]

MODE 2: QUIZ GENERATOR
If the user asks for a quiz or topic-based questions, generate a structured quiz.
- Return ONLY valid JSON array.
- No conversational text, no intro, no outro.
- Format:
  [
    {
      "question": "String",
      "options": ["A", "B", "C", "D"],
      "answer": "String"
    }
  ]

DETECTION RULES:
- Detect the mode automatically based on the user's message.
- If the intent is unclear, default to INTERVIEWER mode.
- Maintain a professional and structured tone.
- Current User Input: ${userMessage}`;

    console.log("Sending message to Gemini...");
    let result;
    try {
      result = await chat.sendMessage(prompt);
    } catch (sendError) {
      const message = sendError?.message || "";
      console.warn("Gemini sendMessage failed, retrying with gemini-2.5-pro if possible:", message);
      if (message.includes("models/gemini-2.5-flash") || message.includes("model not found")) {
        model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
        chat = model.startChat();
        console.log("Retrying with gemini-2.5-pro");
        result = await chat.sendMessage(prompt);
      } else {
        throw sendError;
      }
    }

    console.log("Gemini response received");
    const response = await result.response;
    const text = await response.text();
    console.log("Response text length:", text?.length);

    const reply = text?.trim() || "I could not generate a response.";
    console.log("Final reply prepared");

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("Gemini AI Error details:", {
      message: err.message,
      stack: err.stack,
      name: err.name
    });
    return NextResponse.json(
      { error: `AI assistant request failed: ${err.message}` },
      { status: 500 }
    );
  }
}