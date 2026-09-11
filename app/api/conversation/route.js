import { NextResponse } from "next/server";
import { generateContentWithFallback } from "@/lib/gemini";
import { buildGroundedSystemPrompt } from "@/lib/prompts";
import { getInitialGreeting, getInitialOptions } from "@/lib/languages";

// Strip emoji/icon characters from a string
function stripEmoji(str) {
  if (!str) return str;
  return str
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F000}-\u{1F02F}\u{1F0A0}-\u{1F0FF}]/gu, "")
    .replace(/[\u2702-\u27B0\u24C2]/gu, "")
    .trim();
}

/**
 * Robustly extract the first valid JSON object from a model response.
 * Handles: plain JSON, markdown code blocks, extra prose before/after.
 */
function extractJSON(text) {
  if (!text) return null;
  // Try direct parse first
  try { return JSON.parse(text); } catch (_) {}
  // Try extracting from ```json ... ``` block
  const mdMatch = text.match(/```(?:json)?\s*([\s\S]+?)```/);
  if (mdMatch) {
    try { return JSON.parse(mdMatch[1].trim()); } catch (_) {}
  }
  // Try extracting the first { ... } block
  const start = text.indexOf("{");
  if (start === -1) return null;
  // Walk to find the matching closing brace
  let depth = 0;
  for (let i = start; i < text.length; i++) {
    if (text[i] === "{") depth++;
    else if (text[i] === "}") { depth--; if (depth === 0) {
      try { return JSON.parse(text.slice(start, i + 1)); } catch (_) {}
      break;
    }}
  }
  return null;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      message,
      conversationHistory = [],
      language = "en-IN",
      isAyush = false,
      currentSection = "chief_complaint",
    } = body;

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Extract complaint hint from the first patient message in history
    const firstPatientMsg = conversationHistory.find((m) => m.role === "patient")?.text || message;
    const complaintHint = firstPatientMsg.toLowerCase().split(/[\s,]+/).slice(0, 3).join(" ");

    try {
      // Build grounded system prompt with few-shot training examples
      const systemPrompt = buildGroundedSystemPrompt(language, currentSection, isAyush, complaintHint);

      const isEnglish = !language || language === "en" || language.startsWith("en");

      // Build chat history for context
      const chatHistory = conversationHistory.map((msg) => ({
        role: msg.role === "ai" ? "model" : "user",
        parts: [{ text: msg.text }],
      }));

      const initialGreeting = getInitialGreeting(language);
      const initialOptions = getInitialOptions(language);

      // Use generateContentWithFallback for consistent model failover
      const { result } = await generateContentWithFallback(
        [
          `System Instructions:\n${systemPrompt}\n\n` +
          `Previous conversation:\n${chatHistory.map(m => `${m.role === "model" ? "AI" : "PATIENT"}: ${m.parts[0].text}`).join("\n")}\n\n` +
          `PATIENT: ${message}\n\nASSISTANT (respond ONLY with valid JSON):`,
        ],
        {
          temperature: 0.3,
          maxOutputTokens: 4096,
          responseMimeType: "application/json",
        }
      );

      const responseText = result.response.text();

      // Parse the AI response robustly
      let parsed = extractJSON(responseText);
      if (!parsed || typeof parsed.response !== "string") {
        // If the model returned a JSON string inside the response field, unwrap it
        if (parsed?.response && typeof parsed.response === "string" && parsed.response.trim().startsWith("{")) {
          const inner = extractJSON(parsed.response);
          if (inner && typeof inner.response === "string") parsed = inner;
        }
      }
      if (!parsed || typeof parsed.response !== "string") {
        // Last resort: treat as plain text response
        const fallbackText = typeof responseText === "string" ? responseText.replace(/^[\s{"]*response["\s]*:[\s"]*/, "").slice(0, 300) : "I understand. Could you tell me more about your symptoms?";
        parsed = {
          response: fallbackText || "Could you please describe your symptoms further?",
          response_english: fallbackText || "Could you please describe your symptoms further?",
          options: [],
          section: currentSection,
          progress: 0,
          isRedFlag: false,
          redFlagReason: null,
          extractedData: {},
        };
      }

      // STRICT POST-PROCESSING: language guard + emoji removal
      if (isEnglish) {
        const hasDevanagari = /[\u0900-\u097F]/.test(parsed.response || "");
        if (hasDevanagari && parsed.response_english) {
          parsed.response = parsed.response_english;
        }
      }

      // Clean options: remove icons and emoji from all option text
      if (parsed.options && Array.isArray(parsed.options)) {
        parsed.options = parsed.options.map((opt) => {
          const cleanText = isEnglish && /[\u0900-\u097F]/.test(opt.text || "") && opt.text_english
            ? opt.text_english
            : opt.text;
          return {
            text: stripEmoji(cleanText),
            text_english: stripEmoji(opt.text_english || cleanText),
          };
        });
      }

      return NextResponse.json(parsed);
    } catch (modelError) {
      console.warn("Using smart fallback interview flow:", modelError.message);
      const fallback = generateFallbackResponse(message, currentSection, language, conversationHistory.length);
      return NextResponse.json(fallback);
    }
  } catch (error) {
    console.error("Conversation API error:", error);
    return NextResponse.json(
      { error: "Failed to process conversation", details: error.message },
      { status: 500 }
    );
  }
}

function generateFallbackResponse(message, currentSection, language, turnCount) {
  const isHi = language?.startsWith("hi");
  const msg = message.toLowerCase();

  // ── Red flag detection ──────────────────────────────────────────────────────
  const redFlagKeywords = [
    "chest pain", "सीने में दर्द", "heart attack", "दिल", "breathing", "सांस",
    "unconscious", "बेहोश", "seizure", "दौरा", "heavy bleeding", "तेज खून",
    "stroke", "weakness one side", "एक तरफ कमज़ोर", "severe headache", "तेज सिरदर्द",
  ];
  const hasRedFlag = redFlagKeywords.some((kw) => msg.includes(kw));
  if (hasRedFlag) {
    return {
      response: isHi
        ? "यह गंभीर लक्षण लग रहे हैं। क्या अभी बहुत तेज दर्द हो रहा है या सांस लेने में तकलीफ है?"
        : "These sound like serious symptoms. Are you in severe pain or having difficulty breathing right now?",
      response_english: "These sound like serious symptoms. Are you in severe pain or having difficulty breathing?",
      options: [
        { text: isHi ? "हां, बहुत तेज़" : "Yes, very severe", text_english: "Yes, very severe" },
        { text: isHi ? "नहीं, सहनीय है" : "No, manageable", text_english: "No, manageable" },
      ],
      section: "hpi",
      progress: 20,
      isRedFlag: true,
      redFlagReason: "Potential emergency symptoms detected — immediate triage required",
      extractedData: { chiefComplaint: message },
    };
  }

  // ── Section 1: Chief Complaint → ask about onset & severity ─────────────────
  if (currentSection === "chief_complaint" || turnCount <= 1) {
    return {
      response: isHi
        ? `समझा। यह समस्या कब से है और कितनी गंभीर लगती है (1-10)?`
        : `Understood. How long have you had this problem, and how severe does it feel (1–10)?`,
      response_english: "How long have you had this problem, and how severe is it (1–10)?",
      options: [
        { text: isHi ? "आज से (1 दिन)" : "Started today", text_english: "Started today" },
        { text: isHi ? "2–3 दिनों से" : "2–3 days", text_english: "2–3 days" },
        { text: isHi ? "1 सप्ताह से" : "About 1 week", text_english: "About 1 week" },
        { text: isHi ? "1 महीने से ज़्यादा" : "More than a month", text_english: "More than a month" },
        { text: isHi ? "हल्का (1–3)" : "Mild (1–3)", text_english: "Mild (1–3)" },
        { text: isHi ? "मध्यम (4–6)" : "Moderate (4–6)", text_english: "Moderate (4–6)" },
        { text: isHi ? "गंभीर (7–10)" : "Severe (7–10)", text_english: "Severe (7–10)" },
        { text: isHi ? "अन्य" : "Other", text_english: "Other" },
      ],
      section: "hpi",
      progress: 15,
      isRedFlag: false,
      extractedData: { chiefComplaint: message },
    };
  }

  // ── Section 2: HPI details → ask about past medical conditions ──────────────
  if (currentSection === "hpi" || turnCount <= 3) {
    return {
      response: isHi
        ? "क्या आपको पहले से कोई बीमारी है? जैसे डायबिटीज, बीपी, थायराइड, हृदय रोग?"
        : "Do you have any existing medical conditions? Such as Diabetes, High Blood Pressure, Thyroid, or Heart disease?",
      response_english: "Do you have any existing medical conditions such as Diabetes, BP, Thyroid, or Heart disease?",
      options: [
        { text: isHi ? "डायबिटीज (शुगर)" : "Diabetes", text_english: "Diabetes" },
        { text: isHi ? "उच्च रक्तचाप (बीपी)" : "Hypertension (BP)", text_english: "Hypertension" },
        { text: isHi ? "थायराइड" : "Thyroid disease", text_english: "Thyroid" },
        { text: isHi ? "दमा / अस्थमा" : "Asthma", text_english: "Asthma" },
        { text: isHi ? "हृदय रोग" : "Heart disease", text_english: "Heart disease" },
        { text: isHi ? "कोई पुरानी बीमारी नहीं" : "No past conditions", text_english: "No past conditions" },
        { text: isHi ? "अन्य" : "Other", text_english: "Other" },
      ],
      section: "past_medical",
      progress: 30,
      isRedFlag: false,
      extractedData: { hpiDetails: message },
    };
  }

  // ── Section 3: Past medical → ask about current medications ─────────────────
  if (currentSection === "past_medical" || turnCount <= 5) {
    return {
      response: isHi
        ? "क्या आप अभी कोई नियमित दवाइयाँ ले रहे हैं? कोई भी — डॉक्टर की दवा हो या खुद से ली हो।"
        : "Are you currently taking any regular medications? Include any prescription or over-the-counter medicines.",
      response_english: "Are you currently taking any regular medications?",
      options: [
        { text: isHi ? "हाँ, नियमित दवाएं हैं" : "Yes, on regular medicines", text_english: "Yes, regular meds" },
        { text: isHi ? "सिर्फ़ पेनकिलर/पैरासिटामोल" : "Only painkillers/Paracetamol", text_english: "Only painkillers" },
        { text: isHi ? "कोई दवा नहीं" : "No medications", text_english: "No medications" },
        { text: isHi ? "अन्य" : "Other", text_english: "Other" },
      ],
      section: "drug_history",
      progress: 45,
      isRedFlag: false,
      extractedData: { pastConditions: message },
    };
  }

  // ── Section 4: Drug history → ask about allergies ───────────────────────────
  if (currentSection === "drug_history" || turnCount <= 7) {
    return {
      response: isHi
        ? "क्या आपको किसी दवा, खाने की चीज़, या किसी अन्य चीज़ से एलर्जी है?"
        : "Do you have any known allergies to medicines, food, or anything else?",
      response_english: "Do you have any known allergies to medicines, food, or anything else?",
      options: [
        { text: isHi ? "पेनिसिलिन से एलर्जी" : "Penicillin allergy", text_english: "Penicillin" },
        { text: isHi ? "सल्फा दवाओं से" : "Sulfa drugs", text_english: "Sulfa drugs" },
        { text: isHi ? "खाने से एलर्जी" : "Food allergy", text_english: "Food allergy" },
        { text: isHi ? "धूल / पराग से" : "Dust / Pollen allergy", text_english: "Dust/Pollen" },
        { text: isHi ? "कोई एलर्जी नहीं (NKDA)" : "No known drug allergies (NKDA)", text_english: "No known allergies" },
        { text: isHi ? "अन्य" : "Other", text_english: "Other" },
      ],
      section: "allergy_history",
      progress: 60,
      isRedFlag: false,
      extractedData: { drugHistory: message },
    };
  }

  // ── Section 5: Allergy → ask about family history ───────────────────────────
  if (currentSection === "allergy_history" || turnCount <= 9) {
    return {
      response: isHi
        ? "आपके परिवार में — माता, पिता, भाई-बहन — किसी को कोई विशेष बीमारी है या थी?"
        : "Do any of your close family members — parents, siblings — have or had any significant illnesses?",
      response_english: "Do any close family members have significant illnesses?",
      options: [
        { text: isHi ? "पिता को डायबिटीज / बीपी" : "Father — Diabetes / BP", text_english: "Father - Diabetes/BP" },
        { text: isHi ? "माता को डायबिटीज / बीपी" : "Mother — Diabetes / BP", text_english: "Mother - Diabetes/BP" },
        { text: isHi ? "परिवार में हृदय रोग" : "Family heart disease", text_english: "Heart disease in family" },
        { text: isHi ? "परिवार में कैंसर" : "Cancer in family", text_english: "Cancer in family" },
        { text: isHi ? "परिवार में टीबी" : "TB in family", text_english: "TB in family" },
        { text: isHi ? "कोई विशेष बीमारी नहीं" : "No significant family history", text_english: "No family history" },
        { text: isHi ? "अन्य" : "Other", text_english: "Other" },
      ],
      section: "family_history",
      progress: 75,
      isRedFlag: false,
      extractedData: { allergyHistory: message },
    };
  }

  // ── Section 6: Family history → ask personal/social history ─────────────────
  if (currentSection === "family_history" || turnCount <= 11) {
    return {
      response: isHi
        ? "आपकी जीवनशैली के बारे में बताएं — क्या आप धूम्रपान, शराब करते हैं? आपका आहार कैसा है?"
        : "Tell me about your lifestyle — do you smoke or drink? What is your diet like?",
      response_english: "Tell me about your lifestyle — smoking, alcohol, diet?",
      options: [
        { text: isHi ? "धूम्रपान करता/करती हूँ" : "I smoke", text_english: "Smoker" },
        { text: isHi ? "शराब पीता/पीती हूँ" : "I drink alcohol", text_english: "Alcohol" },
        { text: isHi ? "शाकाहारी भोजन" : "Vegetarian diet", text_english: "Vegetarian" },
        { text: isHi ? "मांसाहारी भोजन" : "Non-vegetarian diet", text_english: "Non-vegetarian" },
        { text: isHi ? "न धूम्रपान, न शराब" : "No smoking / No alcohol", text_english: "Non-smoker, teetotaler" },
        { text: isHi ? "अन्य" : "Other", text_english: "Other" },
      ],
      section: "personal_history",
      progress: 88,
      isRedFlag: false,
      extractedData: { familyHistory: message },
    };
  }

  // ── Section 7: Complete ───────────────────────────────────────────────────────
  return {
    response: isHi
      ? "बहुत बहुत धन्यवाद! आपकी पूरी मेडिकल हिस्ट्री दर्ज हो गई है। अब आप दस्तावेज़ स्कैन कर सकते हैं या सारांश देख सकते हैं।"
      : "Thank you! Your complete clinical history has been recorded. You can now scan your medical documents or view your clinical summary.",
    response_english: "Your clinical history has been recorded. Proceed to scan documents or view summary.",
    options: [
      { text: isHi ? "दस्तावेज़ स्कैन करें" : "Scan Documents", text_english: "Scan Documents" },
      { text: isHi ? "सारांश देखें" : "View Summary", text_english: "View Summary" },
    ],
    section: "complete",
    progress: 100,
    isRedFlag: false,
    extractedData: { personalHistory: message },
  };
}

