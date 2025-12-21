// route.js
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

// Retry helper with exponential backoff
async function retryWithBackoff(fn, retries = 3, delay = 1000) {
  try {
    return await fn();
  } catch (err) {
    if (retries <= 0) throw err;
    await new Promise((res) => setTimeout(res, delay));
    return retryWithBackoff(fn, retries - 1, delay * 2);
  }
}

export async function POST(req) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ reply: "Invalid request." }, { status: 400 });
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const generate = async () =>
      ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: message,
      });

    let response;
    try {
      response = await retryWithBackoff(generate, 3, 1000);
    } catch (err) {
      console.error("Gemini overloaded:", err);
      return NextResponse.json(
        {
          reply: "AI is currently overloaded. Please try again in a moment.",
        },
        { status: 503 }
      );
    }

    if (!response?.text) {
      return NextResponse.json(
        {
          reply: "AI response was empty. Please retry your message.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({ reply: response.text });
  } catch (err) {
    console.error("Unexpected API error:", err);
    return NextResponse.json(
      {
        reply: "Unexpected server error. Please try again later.",
      },
      { status: 500 }
    );
  }
}
