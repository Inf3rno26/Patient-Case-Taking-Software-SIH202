import { NextResponse } from "next/server";
import { generateContentWithFallback, AUDIO_CANDIDATE_MODELS } from "@/lib/gemini";
import { getLanguage } from "@/lib/languages";

export async function POST(request) {
  try {
    const body = await request.json();
    const { audio, mimeType = "audio/webm", language = "en-IN" } = body;

    if (!audio) {
      return NextResponse.json({ error: "Audio data is required" }, { status: 400 });
    }

    const langConfig = getLanguage(language);
    const langName = langConfig?.name || "English";

    // Extract base64 without prefix
    let cleanBase64 = audio;
    let effectiveMime = mimeType;
    if (audio.startsWith("data:")) {
      const parts = audio.split(",");
      cleanBase64 = parts[1];
      const match = parts[0].match(/data:([^;]+)/);
      if (match) effectiveMime = match[1];
    }

    // Clean MIME type for Gemini (strip codec suffix like ;codecs=opus)
    if (effectiveMime.includes(";")) {
      effectiveMime = effectiveMime.split(";")[0].trim();
    }

    const prompt = `You are a clinical speech-to-text transcriber in a hospital OPD.
The patient is speaking in ${langName} (${language}).
Carefully listen to this patient's audio recording and transcribe exactly what they said verbatim.
- If the patient speaks in English, transcribe in English.
- If the patient speaks in Hindi or another Indic language, transcribe in that language's standard script.
- Return ONLY the exact transcribed words.
- Do NOT add quotes, markdown formatting, explanations, or conversational filler.
- If the audio is completely silent, blank, or only contains static/chime noise, return [SILENCE].`;

    const { result, modelName } = await generateContentWithFallback(
      [
        {
          inlineData: {
            mimeType: effectiveMime,
            data: cleanBase64,
          },
        },
        prompt,
      ],
      {
        candidateModels: AUDIO_CANDIDATE_MODELS,
        temperature: 0.1,
        responseMimeType: "text/plain",
      }
    );

    let transcript = result.response.text().trim();
    if (
      transcript.includes("[SILENCE]") ||
      transcript.toLowerCase() === "silence" ||
      transcript.toLowerCase().includes("please provide the audio")
    ) {
      transcript = "";
    }

    return NextResponse.json({
      success: true,
      transcript,
      modelUsed: modelName,
      language: langName,
    });
  } catch (error) {
    console.warn("[ASR Route notice]:", error.message);
    return NextResponse.json({
      success: true,
      transcript: "",
      note: "Audio was unclear or unparseable",
    });
  }
}
