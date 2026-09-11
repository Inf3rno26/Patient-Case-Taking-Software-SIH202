/**
 * MediKiosk -- Clinical Interview Training Data
 * Curated few-shot examples for grounding the LLM as a specialized
 * clinical history-taking model for Indian OPD settings.
 *
 * Coverage: Fever, Chest Pain, Abdominal Pain, Cough, Diabetes Follow-up,
 *           Injury, Past Medical, Drug History, Allergy, Personal History
 *           English + Hindi bilingual
 */

export const CLINICAL_TRAINING_EXAMPLES = [
  {
    section: "chief_complaint",
    language: "en",
    complaint: "fever",
    conversation: [
      {
        user: "I have fever since 3 days",
        assistant: {
          response: "I understand you have had fever for 3 days. Can you describe the fever pattern -- is it continuous throughout the day, or does it come and go? Does it go up in the evening?",
          response_english: "Fever for 3 days -- is it continuous or intermittent? Higher in the evening?",
          options: [
            { text: "Continuous throughout the day", text_english: "Continuous throughout the day" },
            { text: "Comes and goes, higher in evening", text_english: "Comes and goes, higher in evening" },
            { text: "Only at night", text_english: "Only at night" },
            { text: "I am not sure", text_english: "Not sure" },
            { text: "Other", text_english: "Other" }
          ],
          section: "hpi",
          progress: 12,
          isRedFlag: false,
          redFlagReason: null,
          extractedData: { chiefComplaint: "Fever", duration: "3 days" }
        }
      },
      {
        user: "Fever comes and goes, higher in the evening. I also have chills and body ache.",
        assistant: {
          response: "Thank you. Chills and body ache along with high evening fever can be important clues. Have you had any rash on the skin, joint pain, or been to a new area recently? Also, has anyone around you had similar symptoms?",
          response_english: "Any rash, joint pain, recent travel, or contact with similar illness?",
          options: [
            { text: "Yes, skin rash", text_english: "Yes, skin rash" },
            { text: "Yes, joint pain", text_english: "Yes, joint pain" },
            { text: "Recent travel or exposure", text_english: "Recent travel" },
            { text: "Someone nearby has similar illness", text_english: "Contact with similar illness" },
            { text: "None of these", text_english: "None of these" },
            { text: "Other", text_english: "Other" }
          ],
          section: "hpi",
          progress: 20,
          isRedFlag: false,
          redFlagReason: null,
          extractedData: { feverPattern: "intermittent, higher evening", associatedSymptoms: "chills, body ache" }
        }
      }
    ]
  },
  {
    section: "chief_complaint",
    language: "hi",
    complaint: "fever",
    conversation: [
      {
        user: "3 din se bukhar hai",
        assistant: {
          response: "Samjha. 3 din se bukhar hai. Kya bukhar dinbhar rehta hai ya kabhi aata-jaata hai? Shaam ko badhta hai?",
          response_english: "Fever for 3 days -- continuous or intermittent? Worse in the evening?",
          options: [
            { text: "Dinbhar rehta hai", text_english: "Continuous throughout the day" },
            { text: "Aata-jaata hai, shaam ko zyada", text_english: "Intermittent, higher in evening" },
            { text: "Raat mein zyada hota hai", text_english: "Worse at night" },
            { text: "Pata nahi", text_english: "Not sure" },
            { text: "Anya", text_english: "Other" }
          ],
          section: "hpi",
          progress: 12,
          isRedFlag: false,
          redFlagReason: null,
          extractedData: { chiefComplaint: "Bukhar", duration: "3 din" }
        }
      }
    ]
  },
  {
    section: "chief_complaint",
    language: "en",
    complaint: "chest_pain",
    conversation: [
      {
        user: "I have severe chest pain since 30 minutes, radiating to my left arm, and I am sweating",
        assistant: {
          response: "This is very concerning. Severe chest pain radiating to the left arm with sweating can be a sign of a serious cardiac condition. Please alert hospital staff immediately. Are you feeling breathless or dizzy right now?",
          response_english: "Possible cardiac emergency. Please alert staff. Are you breathless or dizzy?",
          options: [
            { text: "Yes, I am breathless", text_english: "Yes, breathless" },
            { text: "Yes, I feel dizzy", text_english: "Yes, dizzy" },
            { text: "No breathlessness, only pain", text_english: "No breathlessness, only pain" }
          ],
          section: "hpi",
          progress: 15,
          isRedFlag: true,
          redFlagReason: "Severe chest pain with left arm radiation and diaphoresis -- possible acute myocardial infarction. Immediate triage required.",
          extractedData: { chiefComplaint: "Severe chest pain", duration: "30 minutes", radiation: "left arm", associatedSymptoms: "sweating" }
        }
      },
      {
        user: "I have mild chest discomfort when I climb stairs, no pain at rest",
        assistant: {
          response: "Chest discomfort on exertion that goes away at rest is an important symptom to evaluate. How long have you been experiencing this? Does it feel like pressure, tightness, or a burning sensation?",
          response_english: "How long? Does it feel like pressure, tightness, or burning?",
          options: [
            { text: "Pressure or heaviness", text_english: "Pressure or heaviness" },
            { text: "Tightness", text_english: "Tightness" },
            { text: "Burning sensation", text_english: "Burning sensation" },
            { text: "Since a few days", text_english: "Since a few days" },
            { text: "Since a few weeks", text_english: "Since a few weeks" },
            { text: "Other", text_english: "Other" }
          ],
          section: "hpi",
          progress: 14,
          isRedFlag: false,
          redFlagReason: null,
          extractedData: { chiefComplaint: "Chest discomfort on exertion", character: "on exertion, relieved at rest" }
        }
      }
    ]
  },
  {
    section: "chief_complaint",
    language: "en",
    complaint: "abdominal_pain",
    conversation: [
      {
        user: "I have stomach pain since yesterday",
        assistant: {
          response: "I understand you have had stomach pain since yesterday. Can you point to where exactly the pain is -- upper stomach, lower stomach, right side, left side, or around the belly button?",
          response_english: "Where exactly is the pain? Upper, lower, right, left, or around the navel?",
          options: [
            { text: "Upper stomach", text_english: "Upper stomach" },
            { text: "Lower stomach", text_english: "Lower stomach" },
            { text: "Right side", text_english: "Right side" },
            { text: "Left side", text_english: "Left side" },
            { text: "Around the belly button", text_english: "Around belly button" },
            { text: "Whole stomach", text_english: "Whole stomach" },
            { text: "Other", text_english: "Other" }
          ],
          section: "hpi",
          progress: 12,
          isRedFlag: false,
          redFlagReason: null,
          extractedData: { chiefComplaint: "Abdominal pain", duration: "1 day" }
        }
      },
      {
        user: "Upper stomach pain, worse after eating, burning and acidity",
        assistant: {
          response: "Upper stomach pain that worsens after eating along with burning suggests a possible gastric issue. Have you been taking painkillers like aspirin or ibuprofen? Any vomiting or blood in vomit or stool?",
          response_english: "Any painkillers recently? Vomiting or blood in vomit or stool?",
          options: [
            { text: "Yes, taking painkillers regularly", text_english: "Regular painkillers" },
            { text: "Yes, vomiting", text_english: "Vomiting" },
            { text: "Blood in vomit or stool", text_english: "Blood in vomit or stool" },
            { text: "No, none of these", text_english: "None of these" },
            { text: "Other", text_english: "Other" }
          ],
          section: "hpi",
          progress: 22,
          isRedFlag: false,
          redFlagReason: null,
          extractedData: { site: "epigastric", exacerbation: "after eating", associatedSymptoms: "burning, acidity" }
        }
      }
    ]
  },
  {
    section: "chief_complaint",
    language: "en",
    complaint: "cough",
    conversation: [
      {
        user: "I have cough for 2 weeks with blood in phlegm and weight loss",
        assistant: {
          response: "Blood in phlegm along with weight loss and a 2-week cough needs careful evaluation. Have you had contact with a tuberculosis patient, or do you have night sweats or prolonged fever?",
          response_english: "Any TB contact, night sweats, or prolonged fever?",
          options: [
            { text: "Yes, contact with TB patient", text_english: "TB contact" },
            { text: "Yes, night sweats", text_english: "Night sweats" },
            { text: "Yes, prolonged fever", text_english: "Prolonged fever" },
            { text: "No, none of these", text_english: "None of these" },
            { text: "Other", text_english: "Other" }
          ],
          section: "hpi",
          progress: 20,
          isRedFlag: true,
          redFlagReason: "Haemoptysis with weight loss -- possible pulmonary tuberculosis or malignancy. Urgent evaluation required.",
          extractedData: { chiefComplaint: "Cough", duration: "2 weeks", character: "productive with haemoptysis", associatedSymptoms: "weight loss" }
        }
      }
    ]
  },
  {
    section: "chief_complaint",
    language: "en",
    complaint: "diabetes_followup",
    conversation: [
      {
        user: "I am a diabetic patient on Metformin 500mg and Glimepiride. Last fasting sugar was 220.",
        assistant: {
          response: "Noted. Your fasting blood sugar of 220 mg/dL is above the normal range. Are you experiencing increased thirst, frequent urination, or blurred vision? Have you had any low blood sugar episodes -- shakiness, sweating, or confusion?",
          response_english: "Any symptoms of high sugar or low sugar episodes?",
          options: [
            { text: "Increased thirst and urination", text_english: "Increased thirst and urination" },
            { text: "Blurred vision", text_english: "Blurred vision" },
            { text: "Low sugar episodes", text_english: "Low sugar episodes" },
            { text: "No specific symptoms", text_english: "No specific symptoms" },
            { text: "Other", text_english: "Other" }
          ],
          section: "hpi",
          progress: 20,
          isRedFlag: false,
          redFlagReason: null,
          extractedData: { currentMedications: ["Metformin 500mg BD", "Glimepiride 1mg OD"], lastFastingGlucose: "220 mg/dL" }
        }
      }
    ]
  },
  {
    section: "past_medical",
    language: "en",
    complaint: "general",
    conversation: [
      {
        user: "I have diabetes and high blood pressure since 5 years",
        assistant: {
          response: "Thank you for sharing that. Do you have any other significant medical conditions such as kidney disease, thyroid problems, heart disease, or asthma? Have you ever had a surgery or hospital admission?",
          response_english: "Any other conditions -- kidney, thyroid, heart, asthma? Any past surgeries or hospitalizations?",
          options: [
            { text: "Kidney disease", text_english: "Kidney disease" },
            { text: "Thyroid disorder", text_english: "Thyroid" },
            { text: "Heart disease or heart attack", text_english: "Heart disease" },
            { text: "Asthma or breathing problem", text_english: "Asthma" },
            { text: "Past surgery", text_english: "Past surgery" },
            { text: "No other conditions", text_english: "No other conditions" },
            { text: "Other", text_english: "Other" }
          ],
          section: "past_medical",
          progress: 35,
          isRedFlag: false,
          redFlagReason: null,
          extractedData: { pastConditions: ["Diabetes Mellitus - 5 years", "Hypertension - 5 years"] }
        }
      }
    ]
  },
  {
    section: "drug_history",
    language: "en",
    complaint: "general",
    conversation: [
      {
        user: "I take Metformin, Amlodipine and Atorvastatin daily",
        assistant: {
          response: "Noted. You are on Metformin, Amlodipine, and Atorvastatin. Are there any other medications -- including painkillers, antacids, vitamins, or Ayurvedic medicines? Are you regular with your medications?",
          response_english: "Any other medications -- OTC drugs, vitamins, Ayurvedic? Regular with medications?",
          options: [
            { text: "Also taking painkillers", text_english: "Painkillers" },
            { text: "Taking antacids", text_english: "Antacids" },
            { text: "Vitamins or supplements", text_english: "Vitamins" },
            { text: "Ayurvedic or herbal medicine", text_english: "Ayurvedic" },
            { text: "Regular with medications", text_english: "Regular" },
            { text: "Sometimes miss doses", text_english: "Irregular" },
            { text: "No other medications", text_english: "No other medications" }
          ],
          section: "drug_history",
          progress: 45,
          isRedFlag: false,
          redFlagReason: null,
          extractedData: { currentMedications: ["Metformin", "Amlodipine", "Atorvastatin"] }
        }
      }
    ]
  },
  {
    section: "allergy_history",
    language: "en",
    complaint: "general",
    conversation: [
      {
        user: "I am allergic to Penicillin, I got a rash last time",
        assistant: {
          response: "Important -- Penicillin allergy with rash reaction is noted and will be recorded. Do you have any other drug, food, or environmental allergies?",
          response_english: "Any other allergies -- sulfa drugs, aspirin, food, or dust?",
          options: [
            { text: "Sulfa drug allergy", text_english: "Sulfa allergy" },
            { text: "Aspirin or NSAID allergy", text_english: "Aspirin allergy" },
            { text: "Food allergy", text_english: "Food allergy" },
            { text: "Dust or pollen allergy", text_english: "Environmental allergy" },
            { text: "No other allergies", text_english: "No other allergies" }
          ],
          section: "allergy_history",
          progress: 58,
          isRedFlag: false,
          redFlagReason: null,
          extractedData: { drugAllergies: [{ drug: "Penicillin", reaction: "Rash" }] }
        }
      }
    ]
  },
  {
    section: "personal_history",
    language: "en",
    complaint: "general",
    conversation: [
      {
        user: "I am a farmer, I smoke about 10 cigarettes a day, no alcohol",
        assistant: {
          response: "You are a farmer, smoke about 10 cigarettes per day, and do not drink alcohol. How is your diet -- vegetarian or non-vegetarian? And how many hours of sleep do you get at night?",
          response_english: "Diet type and sleep pattern?",
          options: [
            { text: "Vegetarian diet", text_english: "Vegetarian" },
            { text: "Non-vegetarian diet", text_english: "Non-vegetarian" },
            { text: "6 to 8 hours sleep", text_english: "6-8 hours sleep" },
            { text: "Less than 6 hours sleep", text_english: "Less than 6 hours sleep" },
            { text: "Disturbed sleep", text_english: "Disturbed sleep" },
            { text: "Other", text_english: "Other" }
          ],
          section: "personal_history",
          progress: 82,
          isRedFlag: false,
          redFlagReason: null,
          extractedData: { occupation: "Farmer", smoking: "10 cigarettes/day", alcohol: "None" }
        }
      }
    ]
  }
];

/**
 * Get relevant training examples for few-shot injection into the system prompt.
 * Selects up to 3 Q/A pairs most relevant to the current section and language.
 *
 * @param {string} currentSection - e.g. 'chief_complaint', 'hpi', 'past_medical'
 * @param {string} language - BCP-47 code e.g. 'en-IN', 'hi-IN'
 * @param {string} complaint - optional hint from the chief complaint keyword
 * @param {number} maxPairs - max Q/A pairs to include (default: 3)
 * @returns {string} formatted few-shot text block
 */
export function getRelevantExamples(currentSection, language = "en-IN", complaint = "", maxPairs = 3) {
  const langPrefix = language.startsWith("hi") ? "hi" : "en";

  const scored = CLINICAL_TRAINING_EXAMPLES.map((example) => {
    let score = 0;
    if (example.section === currentSection) score += 3;
    if (example.language === langPrefix) score += 2;
    const complaintKey = complaint.toLowerCase().replace(/\s+/g, "_");
    if (complaintKey && example.complaint.includes(complaintKey)) score += 2;
    return { example, score };
  });

  const sorted = scored.sort((a, b) => b.score - a.score).slice(0, 2);

  let fewShotText = "";
  let pairsUsed = 0;

  for (const { example } of sorted) {
    if (pairsUsed >= maxPairs) break;
    fewShotText += `\n--- CLINICAL EXAMPLE (${example.complaint}, section: ${example.section}) ---\n`;
    for (const turn of example.conversation) {
      if (pairsUsed >= maxPairs) break;
      fewShotText += `PATIENT: "${turn.user}"\n`;
      fewShotText += `ASSISTANT: ${JSON.stringify(turn.assistant)}\n\n`;
      pairsUsed++;
    }
  }

  return fewShotText.trim();
}
