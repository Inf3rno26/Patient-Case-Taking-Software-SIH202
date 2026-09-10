import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI = null;

export function getGenAI() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "your_gemini_api_key_here") {
      throw new Error(
        "GEMINI_API_KEY is not set. Please add your Gemini API key to .env.local"
      );
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

// Model name — update here if Google deprecates a version
const FLASH_MODEL = "gemini-3.6-flash";

/**
 * Get a Gemini model for text conversation (Module A & C)
 */
export function getConversationModel() {
  const ai = getGenAI();
  return ai.getGenerativeModel({
    model: FLASH_MODEL,
    generationConfig: {
      temperature: 0.7,
      topP: 0.9,
      topK: 40,
      maxOutputTokens: 2048,
      responseMimeType: "application/json",
    },
  });
}

/**
 * Get a Gemini model for vision/OCR tasks (Module B)
 */
export function getVisionModel() {
  const ai = getGenAI();
  return ai.getGenerativeModel({
    model: FLASH_MODEL,
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 4096,
      responseMimeType: "application/json",
    },
  });
}

/**
 * Get a Gemini model for summary generation (Module C)
 */
export function getSummaryModel() {
  const ai = getGenAI();
  return ai.getGenerativeModel({
    model: FLASH_MODEL,
    generationConfig: {
      temperature: 0.4,
      topP: 0.95,
      maxOutputTokens: 4096,
      responseMimeType: "application/json",
    },
  });
}

