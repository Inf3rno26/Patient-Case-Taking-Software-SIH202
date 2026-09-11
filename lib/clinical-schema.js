/**
 * MediKiosk — Clinical Data Schemas
 * Defines the data structures for patient records, history sections, and FHIR-compatible output
 */

/**
 * Clinical history sections in interview order
 */
export const HISTORY_SECTIONS = [
  {
    id: "chief_complaint",
    label: "Chief Complaint",
    labelHi: "मुख्य शिकायत",
    icon: "Target",
    shortLabel: "CC",
  },
  {
    id: "hpi",
    label: "History of Present Illness",
    labelHi: "वर्तमान बीमारी",
    icon: "ClipboardList",
    shortLabel: "HPI",
  },
  {
    id: "past_medical",
    label: "Past Medical History",
    labelHi: "पिछला इतिहास",
    icon: "FolderOpen",
    shortLabel: "PMH",
  },
  {
    id: "drug_history",
    label: "Drug History",
    labelHi: "दवाइयाँ",
    icon: "Pill",
    shortLabel: "Drugs",
  },
  {
    id: "allergy",
    label: "Allergy History",
    labelHi: "एलर्जी",
    icon: "AlertTriangle",
    shortLabel: "Allergy",
  },
  {
    id: "family_history",
    label: "Family History",
    labelHi: "परिवार का इतिहास",
    icon: "Users",
    shortLabel: "FHx",
  },
  {
    id: "personal_history",
    label: "Personal History",
    labelHi: "व्यक्तिगत",
    icon: "User",
    shortLabel: "PHx",
  },
  {
    id: "review_of_systems",
    label: "Review of Systems",
    labelHi: "समीक्षा",
    icon: "Search",
    shortLabel: "ROS",
  },
];

/**
 * AYUSH Dashavidha Pariksha parameters
 */
export const AYUSH_PARAMETERS = [
  { id: "prakriti", label: "Prakriti (Constitution)", labelHi: "प्रकृति" },
  { id: "vikriti", label: "Vikriti (Imbalance)", labelHi: "विकृति" },
  { id: "sara", label: "Sara (Tissue Quality)", labelHi: "सार" },
  { id: "samhanana", label: "Samhanana (Body Build)", labelHi: "संहनन" },
  { id: "pramana", label: "Pramana (Proportions)", labelHi: "प्रमाण" },
  { id: "satmya", label: "Satmya (Adaptability)", labelHi: "सात्म्य" },
  { id: "sattva", label: "Sattva (Mental Strength)", labelHi: "सत्त्व" },
  {
    id: "ahara_shakti",
    label: "Ahara Shakti (Digestive Capacity)",
    labelHi: "आहार शक्ति",
  },
  {
    id: "vyayama_shakti",
    label: "Vyayama Shakti (Exercise Tolerance)",
    labelHi: "व्यायाम शक्ति",
  },
  { id: "vaya", label: "Vaya (Age Assessment)", labelHi: "वय" },
];

/**
 * Create an empty patient session
 */
export function createEmptySession() {
  return {
    id: generateId(),
    createdAt: new Date().toISOString(),
    status: "in_progress", // in_progress | completed | submitted
    patient: {
      abhaId: null,
      name: "",
      age: null,
      gender: "",
      phone: "",
      address: "",
    },
    language: "en-IN",
    isAyush: false,
    consent: {
      dataCapture: false,
      dataSharing: false,
      abhaLinking: false,
      timestamp: null,
    },
    conversation: [], // Array of {role: 'ai'|'patient', text: '', timestamp: ''}
    extractedHistory: {
      chiefComplaint: "",
      hpi: {},
      pastMedical: { conditions: [], surgeries: [], hospitalizations: [] },
      drugHistory: { current: [], past: [] },
      allergyHistory: { drugs: [], food: [], environmental: [] },
      familyHistory: { conditions: [] },
      personalHistory: {},
      reviewOfSystems: { positive: [], negative: [] },
    },
    documents: [], // Array of scanned document results
    summary: null, // Generated clinical summary
    redFlags: [],
    currentSection: "chief_complaint",
    progress: 0,
    ayushAssessment: null,
  };
}

/**
 * Hospital departments for routing
 */
export const DEPARTMENTS = [
  "General Medicine",
  "General Surgery",
  "Orthopedics",
  "Cardiology",
  "Neurology",
  "Pulmonology",
  "Gastroenterology",
  "Dermatology",
  "Ophthalmology",
  "ENT",
  "Obstetrics & Gynecology",
  "Pediatrics",
  "Psychiatry",
  "Urology",
  "Nephrology",
  "Oncology",
  "Endocrinology",
  "Ayurveda (AYUSH)",
  "Emergency",
];

/**
 * Priority levels for triage
 */
export const PRIORITY_LEVELS = {
  routine: {
    label: "Routine",
    color: "#00d4aa",
    description: "Standard consultation queue",
  },
  urgent: {
    label: "Urgent",
    color: "#ffb347",
    description: "Priority review needed",
  },
  emergency: {
    label: "Emergency",
    color: "#ff4757",
    description: "Immediate medical attention required",
  },
};

/**
 * Generate a simple unique ID (for demo purposes)
 */
function generateId() {
  return "MK-" + Date.now().toString(36).toUpperCase() + "-" + Math.random().toString(36).substr(2, 4).toUpperCase();
}

/**
 * Get the section index for progress tracking
 */
export function getSectionIndex(sectionId) {
  return HISTORY_SECTIONS.findIndex((s) => s.id === sectionId);
}

/**
 * Get section by ID
 */
export function getSection(sectionId) {
  return HISTORY_SECTIONS.find((s) => s.id === sectionId);
}
