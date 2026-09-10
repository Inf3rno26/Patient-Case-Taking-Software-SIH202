import { NextResponse } from "next/server";
import { getConversationModel } from "@/lib/gemini";
import {
  CLINICAL_INTERVIEW_SYSTEM_PROMPT,
  AYUSH_INTERVIEW_EXTENSION,
} from "@/lib/prompts";

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

    try {
      const model = getConversationModel();

      // Build the system instruction
      let systemPrompt = CLINICAL_INTERVIEW_SYSTEM_PROMPT;
      if (isAyush) {
        systemPrompt += "\n\n" + AYUSH_INTERVIEW_EXTENSION;
      }

      // Add language instruction
      systemPrompt += `\n\nIMPORTANT: The patient speaks ${language}. Respond in the SAME language the patient used. Also provide English translations. Current interview section: ${currentSection}.`;

      // Build chat history for context
      const chatHistory = conversationHistory.map((msg) => ({
        role: msg.role === "ai" ? "model" : "user",
        parts: [{ text: msg.text }],
      }));

      // Start chat with system prompt
      const chat = model.startChat({
        history: [
          {
            role: "user",
            parts: [{ text: `System Instructions: ${systemPrompt}` }],
          },
          {
            role: "model",
            parts: [
              {
                text: JSON.stringify({
                  response:
                    language === "hi-IN"
                      ? "नमस्ते! मैं MediKiosk AI हूँ। आज आप अस्पताल क्यों आए हैं?"
                      : "Hello! I am MediKiosk AI. What brings you to the hospital today?",
                  response_english:
                    "Hello! I am MediKiosk AI. What brings you to the hospital today?",
                  options: [
                    {
                      text: language === "hi-IN" ? "बुखार" : "Fever",
                      text_english: "Fever",
                      icon: "🤒",
                    },
                    {
                      text: language === "hi-IN" ? "दर्द" : "Pain",
                      text_english: "Pain",
                      icon: "😣",
                    },
                    {
                      text: language === "hi-IN" ? "खांसी" : "Cough",
                      text_english: "Cough",
                      icon: "😷",
                    },
                    {
                      text:
                        language === "hi-IN"
                          ? "सामान्य जांच"
                          : "General checkup",
                      text_english: "General checkup",
                      icon: "🏥",
                    },
                    {
                      text: language === "hi-IN" ? "अन्य" : "Other",
                      text_english: "Other",
                      icon: "💬",
                    },
                  ],
                  section: "chief_complaint",
                  progress: 0,
                  isRedFlag: false,
                  redFlagReason: null,
                  extractedData: {},
                }),
              },
            ],
          },
          ...chatHistory,
        ],
      });

      // Send the patient's message
      const result = await chat.sendMessage(message);
      const responseText = result.response.text();

      // Parse the AI response
      let parsed;
      try {
        parsed = JSON.parse(responseText);
      } catch (e) {
        parsed = {
          response: responseText,
          response_english: responseText,
          options: [],
          section: currentSection,
          progress: 0,
          isRedFlag: false,
          redFlagReason: null,
          extractedData: {},
        };
      }

      return NextResponse.json(parsed);
    } catch (modelError) {
      console.warn("Using smart fallback interview flow (Gemini Key not configured or unavailable):", modelError.message);
      
      const fallback = generateFallbackResponse(message, currentSection, language, conversationHistory.length);
      return NextResponse.json(fallback);
    }
  } catch (error) {
    console.error("Conversation API error:", error);
    return NextResponse.json(
      {
        error: "Failed to process conversation",
        details: error.message,
      },
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
        ? "⚠️ यह गंभीर लक्षण लग रहे हैं। क्या अभी बहुत तेज दर्द हो रहा है या सांस लेने में तकलीफ है?"
        : "⚠️ These sound like serious symptoms. Are you in severe pain or having difficulty breathing right now?",
      response_english: "These sound like serious symptoms. Are you in severe pain or having difficulty breathing?",
      options: [
        { text: isHi ? "हां, बहुत तेज़" : "Yes, very severe", text_english: "Yes, very severe", icon: "🚨" },
        { text: isHi ? "नहीं, सहनीय है" : "No, manageable", text_english: "No, manageable", icon: "👍" },
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
        { text: isHi ? "आज से (1 दिन)" : "Started today", text_english: "Started today", icon: "⏱️" },
        { text: isHi ? "2–3 दिनों से" : "2–3 days", text_english: "2–3 days", icon: "📅" },
        { text: isHi ? "1 सप्ताह से" : "About 1 week", text_english: "About 1 week", icon: "🗓️" },
        { text: isHi ? "1 महीने से ज़्यादा" : "More than a month", text_english: "More than a month", icon: "📆" },
        { text: isHi ? "हल्का (1–3)" : "Mild (1–3)", text_english: "Mild (1–3)", icon: "🟢" },
        { text: isHi ? "मध्यम (4–6)" : "Moderate (4–6)", text_english: "Moderate (4–6)", icon: "🟡" },
        { text: isHi ? "गंभीर (7–10)" : "Severe (7–10)", text_english: "Severe (7–10)", icon: "🔴" },
        { text: isHi ? "अन्य" : "Other", text_english: "Other", icon: "💬" },
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
        { text: isHi ? "डायबिटीज (शुगर)" : "Diabetes", text_english: "Diabetes", icon: "🩺" },
        { text: isHi ? "उच्च रक्तचाप (बीपी)" : "Hypertension (BP)", text_english: "Hypertension", icon: "💓" },
        { text: isHi ? "थायराइड" : "Thyroid disease", text_english: "Thyroid", icon: "🦋" },
        { text: isHi ? "दमा / अस्थमा" : "Asthma", text_english: "Asthma", icon: "🫁" },
        { text: isHi ? "हृदय रोग" : "Heart disease", text_english: "Heart disease", icon: "❤️" },
        { text: isHi ? "कोई पुरानी बीमारी नहीं" : "No past conditions", text_english: "No past conditions", icon: "✅" },
        { text: isHi ? "अन्य" : "Other", text_english: "Other", icon: "💬" },
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
        { text: isHi ? "हाँ, नियमित दवाएं हैं" : "Yes, on regular medicines", text_english: "Yes, regular meds", icon: "💊" },
        { text: isHi ? "सिर्फ़ पेनकिलर/पैरासिटामोल" : "Only painkillers/Paracetamol", text_english: "Only painkillers", icon: "🩹" },
        { text: isHi ? "कोई दवा नहीं" : "No medications", text_english: "No medications", icon: "❌" },
        { text: isHi ? "अन्य" : "Other", text_english: "Other", icon: "💬" },
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
        { text: isHi ? "पेनिसिलिन से एलर्जी" : "Penicillin allergy", text_english: "Penicillin", icon: "⚠️" },
        { text: isHi ? "सल्फा दवाओं से" : "Sulfa drugs", text_english: "Sulfa drugs", icon: "⚠️" },
        { text: isHi ? "खाने से एलर्जी" : "Food allergy", text_english: "Food allergy", icon: "🍽️" },
        { text: isHi ? "धूल / पराग से" : "Dust / Pollen allergy", text_english: "Dust/Pollen", icon: "🌿" },
        { text: isHi ? "कोई एलर्जी नहीं (NKDA)" : "No known drug allergies (NKDA)", text_english: "No known allergies", icon: "✅" },
        { text: isHi ? "अन्य" : "Other", text_english: "Other", icon: "💬" },
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
        { text: isHi ? "पिता को डायबिटीज / बीपी" : "Father — Diabetes / BP", text_english: "Father - Diabetes/BP", icon: "👨" },
        { text: isHi ? "माता को डायबिटीज / बीपी" : "Mother — Diabetes / BP", text_english: "Mother - Diabetes/BP", icon: "👩" },
        { text: isHi ? "परिवार में हृदय रोग" : "Family heart disease", text_english: "Heart disease in family", icon: "❤️" },
        { text: isHi ? "परिवार में कैंसर" : "Cancer in family", text_english: "Cancer in family", icon: "🔬" },
        { text: isHi ? "परिवार में टीबी" : "TB in family", text_english: "TB in family", icon: "🫁" },
        { text: isHi ? "कोई विशेष बीमारी नहीं" : "No significant family history", text_english: "No family history", icon: "✅" },
        { text: isHi ? "अन्य" : "Other", text_english: "Other", icon: "💬" },
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
        { text: isHi ? "धूम्रपान करता/करती हूँ" : "I smoke", text_english: "Smoker", icon: "🚬" },
        { text: isHi ? "शराब पीता/पीती हूँ" : "I drink alcohol", text_english: "Alcohol", icon: "🍺" },
        { text: isHi ? "शाकाहारी भोजन" : "Vegetarian diet", text_english: "Vegetarian", icon: "🥗" },
        { text: isHi ? "मांसाहारी भोजन" : "Non-vegetarian diet", text_english: "Non-vegetarian", icon: "🍖" },
        { text: isHi ? "न धूम्रपान, न शराब" : "No smoking / No alcohol", text_english: "Non-smoker, teetotaler", icon: "✅" },
        { text: isHi ? "अन्य" : "Other", text_english: "Other", icon: "💬" },
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
      { text: isHi ? "दस्तावेज़ स्कैन करें" : "Scan Documents", text_english: "Scan Documents", icon: "📄" },
      { text: isHi ? "सारांश देखें" : "View Summary", text_english: "View Summary", icon: "📋" },
    ],
    section: "complete",
    progress: 100,
    isRedFlag: false,
    extractedData: { personalHistory: message },
  };
}

