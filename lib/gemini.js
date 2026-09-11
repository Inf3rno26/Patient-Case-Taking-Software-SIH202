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

// Candidate models prioritized by current free-tier availability and speed
export const CANDIDATE_MODELS = [
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-3.1-flash-lite",
  "gemini-3.7-flash",
  "gemini-3.6-flash",
];

// Multimodal audio-capable candidate models for Speech-to-Text / ASR
export const AUDIO_CANDIDATE_MODELS = [
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-3.6-flash",
  "gemini-3.7-flash",
];

const FLASH_MODEL = CANDIDATE_MODELS[0];

/**
 * Execute generation with automatic model failover across candidate models
 */
export async function generateContentWithFallback(contents, config = {}) {
  const ai = getGenAI();
  let lastError = null;
  const modelList = config.candidateModels || CANDIDATE_MODELS;

  for (const modelName of modelList) {
    try {
      const model = ai.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature: config.temperature ?? 0.3,
          maxOutputTokens: config.maxOutputTokens ?? 4096,
          responseMimeType: config.responseMimeType ?? "application/json",
          ...config,
        },
      });
      const result = await model.generateContent(contents);
      return { result, modelName };
    } catch (err) {
      console.warn(`[Gemini Fallback] Model ${modelName} failed (${err.message?.slice(0, 90)}), attempting next model...`);
      lastError = err;
    }
  }

  throw lastError;
}

/**
 * Get a Gemini model for text conversation (Module A & C)
 */
export function getConversationModel(customModel = FLASH_MODEL) {
  const ai = getGenAI();
  return ai.getGenerativeModel({
    model: customModel,
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
export function getVisionModel(customModel = FLASH_MODEL) {
  const ai = getGenAI();
  return ai.getGenerativeModel({
    model: customModel,
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 4096,
      responseMimeType: "application/json",
    },
  });
}

/**
 * Get a Gemini model for summary generation (Module C)
 */
export function getSummaryModel(customModel = FLASH_MODEL) {
  const ai = getGenAI();
  return ai.getGenerativeModel({
    model: customModel,
    generationConfig: {
      temperature: 0.4,
      topP: 0.95,
      maxOutputTokens: 4096,
      responseMimeType: "application/json",
    },
  });
}

