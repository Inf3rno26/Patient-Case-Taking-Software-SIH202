/**
 * MediKiosk — Language Configuration
 * Supports 10+ Indian languages with BCP-47 codes, native labels, and TTS voices
 */

export const LANGUAGES = [
  {
    code: "hi-IN",
    name: "Hindi",
    native: "हिन्दी",
    icon: "🇮🇳",
    greeting: "नमस्ते! मेडीकियोस्क में आपका स्वागत है।",
    voiceName: "Google हिन्दी",
  },
  {
    code: "en-IN",
    name: "English",
    native: "English",
    icon: "🇬🇧",
    greeting: "Hello! Welcome to MediKiosk.",
    voiceName: "Google UK English Female",
  },
  {
    code: "bn-IN",
    name: "Bengali",
    native: "বাংলা",
    icon: "🇮🇳",
    greeting: "নমস্কার! মেডিকিয়স্কে আপনাকে স্বাগতম।",
    voiceName: "Google বাংলা",
  },
  {
    code: "ta-IN",
    name: "Tamil",
    native: "தமிழ்",
    icon: "🇮🇳",
    greeting: "வணக்கம்! மெடிகியோஸ்க்-க்கு வரவேற்கிறோம்.",
    voiceName: "Google தமிழ்",
  },
  {
    code: "te-IN",
    name: "Telugu",
    native: "తెలుగు",
    icon: "🇮🇳",
    greeting: "నమస్కారం! మెడికియోస్క్‌కు స్వాగతం.",
    voiceName: "Google తెలుగు",
  },
  {
    code: "mr-IN",
    name: "Marathi",
    native: "मराठी",
    icon: "🇮🇳",
    greeting: "नमस्कार! मेडीकियोस्कमध्ये आपले स्वागत आहे.",
    voiceName: "Google मराठी",
  },
  {
    code: "kn-IN",
    name: "Kannada",
    native: "ಕನ್ನಡ",
    icon: "🇮🇳",
    greeting: "ನಮಸ್ಕಾರ! ಮೆಡಿಕಿಯೋಸ್ಕ್‌ಗೆ ಸುಸ್ವಾಗತ.",
    voiceName: "Google ಕನ್ನಡ",
  },
  {
    code: "ml-IN",
    name: "Malayalam",
    native: "മലയാളം",
    icon: "🇮🇳",
    greeting: "നമസ്കാരം! മെഡികിയോസ്‌കിലേക്ക് സ്വാഗതം.",
    voiceName: "Google മലയാളം",
  },
  {
    code: "gu-IN",
    name: "Gujarati",
    native: "ગુજરાતી",
    icon: "🇮🇳",
    greeting: "નમસ્તે! મેડીકિઓસ્કમાં આપનું સ્વાગત છે.",
    voiceName: "Google ગુજરાતી",
  },
  {
    code: "pa-IN",
    name: "Punjabi",
    native: "ਪੰਜਾਬੀ",
    icon: "🇮🇳",
    greeting: "ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਡੀਕਿਓਸਕ ਵਿੱਚ ਤੁਹਾਡਾ ਸੁਆਗਤ ਹੈ।",
    voiceName: "Google ਪੰਜਾਬੀ",
  },
  {
    code: "or-IN",
    name: "Odia",
    native: "ଓଡ଼ିଆ",
    icon: "🇮🇳",
    greeting: "ନମସ୍କାର! ମେଡିକିୟୋସ୍କକୁ ସ୍ୱାଗତ.",
    voiceName: "Google ଓଡ଼ିଆ",
  },
  {
    code: "as-IN",
    name: "Assamese",
    native: "অসমীয়া",
    icon: "🇮🇳",
    greeting: "নমস্কাৰ! মেডিকিয়স্কলৈ আপোনাক স্বাগতম।",
    voiceName: "Google অসমীয়া",
  },
];

/**
 * Get language config by BCP-47 code
 */
export function getLanguage(code) {
  return LANGUAGES.find((l) => l.code === code) || LANGUAGES[1]; // default English
}

/**
 * Common UI translations for key phrases
 */
export const UI_TRANSLATIONS = {
  "hi-IN": {
    welcome: "स्वागत है",
    selectLanguage: "अपनी भाषा चुनें",
    startInterview: "शुरू करें",
    speak: "बोलें",
    tapToAnswer: "जवाब देने के लिए टैप करें",
    next: "आगे",
    back: "पीछे",
    submit: "जमा करें",
    consent: "मैं सहमत हूँ",
    decline: "मैं असहमत हूँ",
    scanDocument: "दस्तावेज़ स्कैन करें",
    uploadDocument: "दस्तावेज़ अपलोड करें",
    viewSummary: "सारांश देखें",
    emergency: "आपातकालीन",
    listening: "सुन रहे हैं...",
    processing: "प्रोसेसिंग...",
    chiefComplaint: "मुख्य शिकायत",
    pastHistory: "पिछला इतिहास",
    medications: "दवाइयाँ",
    allergies: "एलर्जी",
    familyHistory: "परिवार का इतिहास",
    personalHistory: "व्यक्तिगत इतिहास",
    reviewOfSystems: "सिस्टम की समीक्षा",
    complete: "पूर्ण",
  },
  "en-IN": {
    welcome: "Welcome",
    selectLanguage: "Select your language",
    startInterview: "Start",
    speak: "Speak",
    tapToAnswer: "Tap to answer",
    next: "Next",
    back: "Back",
    submit: "Submit",
    consent: "I Agree",
    decline: "I Decline",
    scanDocument: "Scan Document",
    uploadDocument: "Upload Document",
    viewSummary: "View Summary",
    emergency: "Emergency",
    listening: "Listening...",
    processing: "Processing...",
    chiefComplaint: "Chief Complaint",
    pastHistory: "Past History",
    medications: "Medications",
    allergies: "Allergies",
    familyHistory: "Family History",
    personalHistory: "Personal History",
    reviewOfSystems: "Review of Systems",
    complete: "Complete",
  },
};

/**
 * Get translation for a key, falling back to English
 */
export function t(langCode, key) {
  const translations = UI_TRANSLATIONS[langCode] || UI_TRANSLATIONS["en-IN"];
  return translations[key] || UI_TRANSLATIONS["en-IN"][key] || key;
}

/**
 * Speak text using Web Speech Synthesis API
 */
export function speakText(text, langCode = "en-IN") {
  try {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCode;
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    // Try to find a matching voice if available
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      const matchedVoice = voices.find(
        (v) => v.lang === langCode || v.lang.startsWith(langCode.split("-")[0])
      );
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }
    }

    window.speechSynthesis.speak(utterance);
    return utterance;
  } catch (e) {
    console.warn("Speech synthesis error:", e);
  }
}
