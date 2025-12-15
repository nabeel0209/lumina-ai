import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(req) {
  try {
    const { message } = await req.json(); // get user input
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: message,
    });

    return NextResponse.json({ reply: response.text });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ reply: "Error: AI could not respond." });
  }
}
