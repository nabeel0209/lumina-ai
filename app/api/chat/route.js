// route.js
import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

// Helper function: retry with exponential backoff
async function retryWithBackoff(fn, retries = 3, delay = 1000) {
  try {
    return await fn();
  } catch (err) {
    if (retries <= 0) throw err;
    await new Promise((res) => setTimeout(res, delay));
    return retryWithBackoff(fn, retries - 1, delay * 2); // exponential backoff
  }
}

export async function POST(req) {
  try {
    const { message } = await req.json();
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const generate = async () =>
      ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: message,
      });

    let response;
    try {
      response = await retryWithBackoff(generate, 3, 1000);
    } catch (err) {
      console.error("AI retries failed:", err);
      return NextResponse.json({
        reply:
          "Sorry, the AI is temporarily unavailable. Please try again in a few seconds.",
      });
    }

    return NextResponse.json({ reply: response.text });
  } catch (err) {
    console.error("Unexpected API error:", err);
    return NextResponse.json({
      reply: "Error: Could not process your request. Try again later.",
    });
  }
}
