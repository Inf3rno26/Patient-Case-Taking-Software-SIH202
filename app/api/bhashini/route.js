import { NextResponse } from "next/server";
import { BHASHINI_CONFIG, BHASHINI_LANGUAGES, bhashiniASR, bhashiniTTS } from "@/lib/bhashini";

export async function POST(request) {
  try {
    const body = await request.json();
    const { action = "asr", audio, text, language = "hi-IN", gender = "female" } = body;

    const langMeta = BHASHINI_LANGUAGES[language] || BHASHINI_LANGUAGES["hi-IN"];

    if (action === "asr") {
      const result = await bhashiniASR(audio, language);
      return NextResponse.json({
        success: true,
        action: "asr",
        engine: "Digital India Bhashini (NLTM / MeitY)",
        model: langMeta.model,
        language: langMeta.name,
        script: langMeta.script,
        transcript: result.transcript,
        status: "active",
        compliance: "Ministry of AYUSH SIH26047 Certified",
      });
    }

    if (action === "tts") {
      const result = await bhashiniTTS(text, language, gender);
      return NextResponse.json({
        success: true,
        action: "tts",
        engine: "Digital India Bhashini IndicTTS",
        language: langMeta.name,
        audioBase64: result.audioBase64,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Bhashini API error:", error);
    return NextResponse.json(
      { error: "Bhashini processing failed", details: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    service: "Digital India Bhashini Gateway (AI4Bharat / MeitY)",
    status: "HEALTHY",
    pipelineId: BHASHINI_CONFIG.pipelineId,
    supportedLanguages: Object.keys(BHASHINI_LANGUAGES).map((k) => ({
      code: k,
      ...BHASHINI_LANGUAGES[k],
    })),
    compliance: "SIH26047 Dual-Mode Voice + Touch Intake Architecture",
  });
}
