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

export const INITIAL_GREETINGS = {
  "en-IN": "Hello! I am MediKiosk AI. What brings you to the hospital today? You can speak or tap an option below.",
  "hi-IN": "नमस्ते! मैं MediKiosk AI हूँ। आज आप अस्पताल क्यों आए हैं? आप बोलकर या नीचे दिए विकल्पों से बता सकते हैं।",
  "bn-IN": "নমস্কার! আমি MediKiosk AI। আজ আপনি হাসপাতালে কেন এসেছেন? আপনি মুখে বলতে পারেন অথবা নিচের বিকল্পগুলি থেকে বেছে নিতে পারেন।",
  "ta-IN": "வணக்கம்! நான் MediKiosk AI. இன்று நீங்கள் மருத்துவமனைக்கு ஏன் வந்துள்ளீர்கள்? நீங்கள் பேசலாம் அல்லது கீழே உள்ள விருப்பங்களைத் தேர்ந்தெடுக்கலாம்.",
  "te-IN": "నమస్కారం! నేను MediKiosk AI. ఈరోజు మీరు ఆసుపత్రికి ఎందుకు వచ్చారు? మీరు మాట్లాడవచ్చు లేదా క్రింది ఎంపికలను ఎంచుకోవచ్చు.",
  "mr-IN": "नमस्कार! मी MediKiosk AI आहे. आज आपण रुग्णालयात का आला आहात? आपण बोलून किंवा खालील पर्यायांमधून सांगू शकता.",
  "gu-IN": "નમસ્તે! હું MediKiosk AI છું. આજે તમે હોસ્પિટલમાં કેમ આવ્યા છો? તમે બોલીને અથવા નીચે આપેલા વિકલ્પોમાંથી જણાવી શકો છો.",
  "kn-IN": "ನಮಸ್ಕಾರ! ನಾನು MediKiosk AI. ಇಂದು ನೀವು ಆಸ್ಪತ್ರೆಗೆ ಏಕೆ ಬಂದಿದ್ದೀರಿ? ನೀವು ಮಾತನಾಡಬಹುದು ಅಥವಾ ಕೆಳಗಿನ ಆಯ್ಕೆಗಳನ್ನು ಆರಿಸಿಕೊಳ್ಳಬಹುದು.",
  "ml-IN": "നമസ്കാരം! ഞാൻ MediKiosk AI ആണ്. ഇന്ന് നിങ്ങൾ എന്തിനാണ് ആശുപത്രിയിൽ വന്നത്? നിങ്ങൾക്ക് സംസാരിക്കുകയോ താഴെയുള്ള ഓപ്ഷനുകൾ തിരഞ്ഞെടുക്കുകയോ ചെയ്യാം.",
  "pa-IN": "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ MediKiosk AI ਹਾਂ। ਅੱਜ ਤੁਸੀਂ ਹਸਪਤਾਲ ਕਿਉਂ ਆਏ ਹੋ? ਤੁਸੀਂ ਬੋਲ ਕੇ ਜਾਂ ਹੇਠਾਂ ਦਿੱਤੇ ਵਿਕਲਪਾਂ ਵਿੱਚੋਂ ਦੱਸ ਸਕਦੇ ਹੋ।",
  "or-IN": "ନମସ୍କାର! ମୁଁ MediKiosk AI। ଆଜି ଆପଣ ଡାକ୍ତରଖାନାକୁ କାହିଁକି ଆସିଛନ୍ତି? ଆପଣ କହିପାରିବେ କିମ୍ବା ତଳେ ଥିବା ବିକଳ୍ପଗୁଡ଼ିକରୁ ବାଛିପାରିବେ।",
  "as-IN": "নমস্কাৰ! মই MediKiosk AI। আজি আপুনি চিকিৎসালয়লৈ কিয় আহিছে? আপুনি কথা ক'ব পাৰে বা তলৰ বিকল্পসমূহৰ পৰা বাছনি কৰিব পাৰে।",
};

export const INITIAL_OPTIONS = {
  "en-IN": [
    { text: "Fever", text_english: "Fever" },
    { text: "Headache", text_english: "Headache" },
    { text: "Stomach pain", text_english: "Stomach pain" },
    { text: "Cough / Cold", text_english: "Cough / Cold" },
    { text: "Chest pain", text_english: "Chest pain" },
    { text: "Body pain", text_english: "Body pain" },
    { text: "Injury", text_english: "Injury" },
    { text: "General checkup", text_english: "General checkup" },
    { text: "Other", text_english: "Other" },
  ],
  "hi-IN": [
    { text: "बुखार", text_english: "Fever" },
    { text: "सिर दर्द", text_english: "Headache" },
    { text: "पेट दर्द", text_english: "Stomach pain" },
    { text: "खांसी / जुकाम", text_english: "Cough / Cold" },
    { text: "सीने में दर्द", text_english: "Chest pain" },
    { text: "शरीर में दर्द", text_english: "Body pain" },
    { text: "चोट", text_english: "Injury" },
    { text: "सामान्य जांच", text_english: "General checkup" },
    { text: "अन्य", text_english: "Other" },
  ],
  "bn-IN": [
    { text: "জ্বর", text_english: "Fever" },
    { text: "মাথা ব্যথা", text_english: "Headache" },
    { text: "পেটে ব্যথা", text_english: "Stomach pain" },
    { text: "সর্দি / কাশি", text_english: "Cough / Cold" },
    { text: "বুকে ব্যথা", text_english: "Chest pain" },
    { text: "শরীরে ব্যথা", text_english: "Body pain" },
    { text: "আঘাত", text_english: "Injury" },
    { text: "সাধারণ পরীক্ষা", text_english: "General checkup" },
    { text: "অন্যান্য", text_english: "Other" },
  ],
  "ta-IN": [
    { text: "காய்ச்சல்", text_english: "Fever" },
    { text: "தலைவலி", text_english: "Headache" },
    { text: "வயிற்று வலி", text_english: "Stomach pain" },
    { text: "இருமல் / சளி", text_english: "Cough / Cold" },
    { text: "நெஞ்சு வலி", text_english: "Chest pain" },
    { text: "உடல் வலி", text_english: "Body pain" },
    { text: "காயம்", text_english: "Injury" },
    { text: "பொது பரிசோதனை", text_english: "General checkup" },
    { text: "மற்றவை", text_english: "Other" },
  ],
  "te-IN": [
    { text: "జ్వరం", text_english: "Fever" },
    { text: "తలనొప్పి", text_english: "Headache" },
    { text: "కడుపు నొప్పి", text_english: "Stomach pain" },
    { text: "దగ్గు / జలుబు", text_english: "Cough / Cold" },
    { text: "ఛాతీ నొప్పి", text_english: "Chest pain" },
    { text: "ఒళ్ళు నొప్పులు", text_english: "Body pain" },
    { text: "గాయం", text_english: "Injury" },
    { text: "సాధారణ తనిఖీ", text_english: "General checkup" },
    { text: "ఇతర", text_english: "Other" },
  ],
  "mr-IN": [
    { text: "ताप", text_english: "Fever" },
    { text: "डोकेदुखी", text_english: "Headache" },
    { text: "पोटदुखी", text_english: "Stomach pain" },
    { text: "खोकला / सर्दी", text_english: "Cough / Cold" },
    { text: "छातीत दुखणे", text_english: "Chest pain" },
    { text: "अंगदुखी", text_english: "Body pain" },
    { text: "जखम", text_english: "Injury" },
    { text: "सामान्य तपासणी", text_english: "General checkup" },
    { text: "इतर", text_english: "Other" },
  ],
  "gu-IN": [
    { text: "તાવ", text_english: "Fever" },
    { text: "માથાનો દુખાવો", text_english: "Headache" },
    { text: "પેટમાં દુખાવો", text_english: "Stomach pain" },
    { text: "ઉધરસ / શરદી", text_english: "Cough / Cold" },
    { text: "છાતીમાં દુખાવો", text_english: "Chest pain" },
    { text: "શરીરનો દુખાવો", text_english: "Body pain" },
    { text: "ઈજા", text_english: "Injury" },
    { text: "સામાન્ય તપાસ", text_english: "General checkup" },
    { text: "અન્ય", text_english: "Other" },
  ],
  "kn-IN": [
    { text: "ಜ್ವರ", text_english: "Fever" },
    { text: "ತಲೆನೋವು", text_english: "Headache" },
    { text: "ಹೊಟ್ಟೆ ನೋವು", text_english: "Stomach pain" },
    { text: "ಕೆಮ್ಮು / ಶೀತ", text_english: "Cough / Cold" },
    { text: "ಎದೆ ನೋವು", text_english: "Chest pain" },
    { text: "ಮೈ ಕೈ ನೋವು", text_english: "Body pain" },
    { text: "ಗಾಯ", text_english: "Injury" },
    { text: "ಸಾಮಾನ್ಯ ತಪಾಸಣೆ", text_english: "General checkup" },
    { text: "ಇತರೆ", text_english: "Other" },
  ],
  "ml-IN": [
    { text: "പനി", text_english: "Fever" },
    { text: "തലവേദന", text_english: "Headache" },
    { text: "വയറുവേദന", text_english: "Stomach pain" },
    { text: "ചുമ / ജലദോഷം", text_english: "Cough / Cold" },
    { text: "നെഞ്ചുവേദന", text_english: "Chest pain" },
    { text: "ശരീരവേദന", text_english: "Body pain" },
    { text: "പരിക്ക്", text_english: "Injury" },
    { text: "പൊതുവായ പരിശോധന", text_english: "General checkup" },
    { text: "മറ്റ്", text_english: "Other" },
  ],
  "pa-IN": [
    { text: "ਬੁਖਾਰ", text_english: "Fever" },
    { text: "ਸਿਰ ਦਰਦ", text_english: "Headache" },
    { text: "ਪੇਟ ਦਰਦ", text_english: "Stomach pain" },
    { text: "ਖੰਘ / ਜ਼ੁਕਾਮ", text_english: "Cough / Cold" },
    { text: "ਛਾਤੀ ਵਿੱਚ ਦਰਦ", text_english: "Chest pain" },
    { text: "ਸਰੀਰ ਵਿੱਚ ਦਰਦ", text_english: "Body pain" },
    { text: "ਸੱਟ", text_english: "Injury" },
    { text: "ਆਮ ਜਾਂਚ", text_english: "General checkup" },
    { text: "ਹੋਰ", text_english: "Other" },
  ],
  "or-IN": [
    { text: "ଜ୍ୱର", text_english: "Fever" },
    { text: "ମୁଣ୍ଡ ବିନ୍ଧା", text_english: "Headache" },
    { text: "ପେଟ ଯନ୍ତ୍ରଣା", text_english: "Stomach pain" },
    { text: "କାଶ / ଥଣ୍ଡା", text_english: "Cough / Cold" },
    { text: "ଛାତି ଯନ୍ତ୍ରଣା", text_english: "Chest pain" },
    { text: "ଦେହ ହାତ ବିନ୍ଧା", text_english: "Body pain" },
    { text: "ଆଘାତ", text_english: "Injury" },
    { text: "ସାଧାରଣ ପରୀକ୍ଷା", text_english: "General checkup" },
    { text: "ଅନ୍ୟାନ୍ୟ", text_english: "Other" },
  ],
  "as-IN": [
    { text: "জ্বৰ", text_english: "Fever" },
    { text: "মূৰৰ বিষ", text_english: "Headache" },
    { text: "পেটৰ বিষ", text_english: "Stomach pain" },
    { text: "কাহ / চৰ্দী", text_english: "Cough / Cold" },
    { text: "বুকুত বিষ", text_english: "Chest pain" },
    { text: "গাৰ বিষ", text_english: "Body pain" },
    { text: "আঘাত", text_english: "Injury" },
    { text: "সাধাৰণ পৰীক্ষা", text_english: "General checkup" },
    { text: "অন্যান্য", text_english: "Other" },
  ],
};

/**
 * Get language config by BCP-47 code
 */
export function getLanguage(code) {
  return LANGUAGES.find((l) => l.code === code) || LANGUAGES[1]; // default English
}

/**
 * Get initial interview greeting in patient's preferred language
 */
export function getInitialGreeting(code = "en-IN") {
  const norm = code || "en-IN";
  return INITIAL_GREETINGS[norm] || INITIAL_GREETINGS[norm.split("-")[0] + "-IN"] || INITIAL_GREETINGS["en-IN"];
}

/**
 * Get initial chief complaint touch options in patient's preferred language
 */
export function getInitialOptions(code = "en-IN") {
  const norm = code || "en-IN";
  return INITIAL_OPTIONS[norm] || INITIAL_OPTIONS[norm.split("-")[0] + "-IN"] || INITIAL_OPTIONS["en-IN"];
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
 * Clean text for Text-to-Speech: remove markdown symbols, emojis, URLs, and asterisks
 */
export function cleanTextForTTS(text) {
  if (!text) return "";
  return text
    // Remove code blocks and backticks
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`([^`]+)`/g, "$1")
    // Remove markdown bold/italic/strikethrough (**text**, *text*, _text_, ~~text~~)
    .replace(/[*_~#]/g, "")
    // Remove markdown links [text](url) -> text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    // Remove emojis and miscellaneous symbols
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F000}-\u{1F02F}]/gu, "")
    // Remove list bullets / numbers
    .replace(/^\s*[-•*]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    // Replace multiple spaces and newlines with a single pause
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Play subtle auditory cues for kiosk interaction using Web Audio API
 * @param {'start' | 'stop' | 'success' | 'tap'} type
 */
export function playAudioCue(type = "tap") {
  if (typeof window === "undefined") return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === "start") {
      // Pleasant rising chime (mic open)
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (type === "stop") {
      // Gentle descending tone (mic closed)
      osc.frequency.setValueAtTime(660, now);
      osc.frequency.exponentialRampToValueAtTime(330, now + 0.1);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
    } else if (type === "success") {
      // Positive dual chord
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.start(now);
      osc.stop(now + 0.22);
    } else {
      // Soft click
      osc.frequency.setValueAtTime(800, now);
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.start(now);
      osc.stop(now + 0.04);
    }
  } catch (e) {
    // Ignore audio context auto-play restrictions gracefully
  }
}

/**
 * Cache of available SpeechSynthesis voices
 */
let cachedVoices = [];
if (typeof window !== "undefined" && window.speechSynthesis) {
  const loadVoices = () => {
    cachedVoices = window.speechSynthesis.getVoices();
  };
  loadVoices();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }
}

/**
 * Find best matching natural voice for an Indian language
 */
export function findBestVoice(langCode = "en-IN") {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const voices = cachedVoices.length > 0 ? cachedVoices : window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  const prefix = langCode.split("-")[0]; // e.g. 'hi', 'en', 'ta'

  // Exact lang match candidates
  const exactMatches = voices.filter(
    (v) => v.lang === langCode || v.lang.replace("_", "-") === langCode
  );

  // Preference for high-quality natural/online voices
  const highQualityExact = exactMatches.find(
    (v) =>
      v.name.includes("Natural") ||
      v.name.includes("Online") ||
      v.name.includes("Google") ||
      v.name.includes("Swara") ||
      v.name.includes("Madhur") ||
      v.name.includes("Neerja")
  );
  if (highQualityExact) return highQualityExact;
  if (exactMatches.length > 0) return exactMatches[0];

  // Prefix match candidates (e.g. any Hindi voice)
  const prefixMatches = voices.filter(
    (v) => v.lang.startsWith(prefix) || v.lang.replace("_", "-").startsWith(prefix)
  );
  const highQualityPrefix = prefixMatches.find(
    (v) =>
      v.name.includes("Natural") ||
      v.name.includes("Online") ||
      v.name.includes("Google")
  );
  if (highQualityPrefix) return highQualityPrefix;
  if (prefixMatches.length > 0) return prefixMatches[0];

  // If language is English, allow any English or system default
  if (prefix === "en") {
    return (
      voices.find((v) => v.lang.startsWith("en-IN") || v.name.includes("India")) ||
      voices.find((v) => v.lang.startsWith("en")) ||
      voices.find((v) => v.default) ||
      voices[0] ||
      null
    );
  }

  // For non-English languages (Hindi, Tamil, etc.), NEVER force an English voice.
  // Returning null allows the browser's engine to dispatch to its native or cloud synthesizer for utterance.lang
  return null;
}

/**
 * Stop any ongoing speech synthesis immediately
 */
export function stopSpeech() {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  try {
    window.speechSynthesis.cancel();
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  } catch (e) {
    console.warn("Error stopping speech:", e);
  }
}

/**
 * Check if speech is currently speaking
 */
export function isSpeechSpeaking() {
  if (typeof window === "undefined" || !window.speechSynthesis) return false;
  return window.speechSynthesis.speaking;
}

/**
 * Speak text using enhanced Web Speech Synthesis API
 * @param {string} text Raw text (will be sanitized)
 * @param {string} langCode BCP-47 language code
 * @param {object} options { onStart, onEnd, onError, rate, pitch, volume }
 */
export function speakText(text, langCode = "en-IN", options = {}) {
  try {
    if (typeof window === "undefined" || !window.speechSynthesis) return null;

    // Stop previous utterance & unpause if stalled
    stopSpeech();

    const sanitized = cleanTextForTTS(text);
    if (!sanitized) return null;

    // Use requested language; fallback to Hindi only if language is English but text is Devanagari
    let effectiveLang = langCode || "en-IN";
    if (effectiveLang === "en-IN" && /[\u0900-\u097F]/.test(sanitized)) {
      effectiveLang = "hi-IN";
    }

    const utterance = new SpeechSynthesisUtterance(sanitized);
    utterance.lang = effectiveLang;
    utterance.rate = options.rate || 0.92;
    utterance.pitch = options.pitch || 1.0;
    utterance.volume = options.volume !== undefined ? options.volume : 1.0;

    const voice = findBestVoice(effectiveLang);
    if (voice) {
      utterance.voice = voice;
    }

    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    // Chromium keepalive heartbeat to prevent speech synthesis from freezing on longer text
    let heartbeat = null;

    utterance.onstart = (e) => {
      if (heartbeat) clearInterval(heartbeat);
      heartbeat = setInterval(() => {
        if (window.speechSynthesis && window.speechSynthesis.speaking) {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        } else {
          clearInterval(heartbeat);
          heartbeat = null;
        }
      }, 5000);

      if (options.onStart) options.onStart(e);
    };

    utterance.onend = (e) => {
      if (heartbeat) {
        clearInterval(heartbeat);
        heartbeat = null;
      }
      if (options.onEnd) options.onEnd(e);
    };

    utterance.onerror = (e) => {
      if (heartbeat) {
        clearInterval(heartbeat);
        heartbeat = null;
      }
      console.warn("Speech synthesis error event:", e);
      if (options.onError) options.onError(e);
    };

    window.speechSynthesis.speak(utterance);
    return utterance;
  } catch (e) {
    console.warn("Speech synthesis error:", e);
    if (options.onError) options.onError(e);
    return null;
  }
}

