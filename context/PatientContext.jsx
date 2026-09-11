"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { createEmptySession } from "@/lib/clinical-schema";
import { v4 as uuidv4 } from "uuid";

// Realistic demo patient for hackathon presentations
const DEMO_SESSION = {
  id: "MK-DEMO-001",
  createdAt: new Date().toISOString(),
  language: "en-IN",
  status: "completed",
  isDemo: true,
  patient: {
    name: "Sunita Sharma",
    age: 52,
    gender: "female",
    phone: "9876543210",
    email: "sunita.sharma@example.com",
    abhaId: "91-2345-6789-0123",
  },
  consent: {
    given: true,
    timestamp: new Date().toISOString(),
    dataUsage: true,
    aiProcessing: true,
  },
  conversation: [
    { role: "ai", text: "Hello! I am MediKiosk AI. What brings you to the hospital today?", timestamp: new Date().toISOString() },
    { role: "patient", text: "I have been having chest pain on and off for the past week.", timestamp: new Date().toISOString() },
    { role: "ai", text: "I understand. Can you describe the chest pain — where exactly do you feel it, and does it spread anywhere?", timestamp: new Date().toISOString() },
    { role: "patient", text: "It's in the centre of my chest, and sometimes it goes to my left arm. It gets worse when I climb stairs.", timestamp: new Date().toISOString() },
    { role: "ai", text: "Do you have any known heart conditions, blood pressure, or diabetes?", timestamp: new Date().toISOString() },
    { role: "patient", text: "Yes, I have high blood pressure for 8 years. I take Amlodipine. My mother had a heart attack.", timestamp: new Date().toISOString() },
  ],
  extractedHistory: {
    chiefComplaint: "Exertional chest pain for 1 week",
    pastMedical: { conditions: ["Hypertension × 8 years"], surgeries: [] },
    drugHistory: { current: [{ name: "Amlodipine", dosage: "5mg OD", since: "2018" }], past: [] },
    allergyHistory: { drugs: [], food: [], noKnownAllergies: true },
    familyHistory: { conditions: ["Mother — Myocardial Infarction (age 60)"] },
    personalHistory: { smoking: "Non-smoker", alcohol: "None", diet: "Vegetarian" },
    reviewOfSystems: {
      positive: ["Exertional dyspnea (NYHA II)", "Chest pain on climbing stairs"],
      negative: ["No fever", "No cough", "No palpitations", "No syncope"],
    },
  },
  documents: [],
  redFlags: [
    { reason: "Exertional chest pain with radiation to left arm", severity: "urgent", timestamp: new Date().toISOString() },
    { reason: "Positive family history of MI", severity: "urgent", timestamp: new Date().toISOString() },
  ],
  summary: {
    summary: {
      chiefComplaint: "Exertional retrosternal chest pain × 1 week, radiating to left arm",
      hpiNarrative: "52-year-old female presents with squeezing retrosternal chest pain on exertion (climbing stairs) for 1 week, radiating to the left arm. Pain is relieved by rest within 5–10 minutes. Severity 7/10 at peak. No resting pain. Associated with exertional dyspnea (NYHA Class II). No diaphoresis, palpitations, or syncope reported.",
      pastMedicalHistory: { conditions: ["Hypertension × 8 years"], surgeries: [] },
      drugHistory: { current: [{ name: "Amlodipine", dosage: "5mg OD", since: "2018" }], past: [] },
      allergyHistory: { drugs: [], food: [], noKnownAllergies: true },
      familyHistory: { conditions: ["Mother — Myocardial Infarction (age 60)"] },
      personalHistory: { smoking: "Non-smoker", alcohol: "None", diet: "Vegetarian", occupation: "Homemaker" },
      reviewOfSystems: {
        positive: ["Exertional dyspnea NYHA II", "Chest pain on exertion"],
        negative: ["No fever", "No cough", "No palpitations", "No syncope", "No orthopnea"],
      },
      redFlags: [
        { reason: "Exertional chest pain radiating to left arm", severity: "urgent" },
        { reason: "Strong family history of MI", severity: "urgent" },
      ],
    },
    summaryNarrative: "52F with 8-year history of hypertension presenting with 1-week history of exertional retrosternal chest pain radiating to the left arm, relieved by rest. Positive family history of MI. Currently on Amlodipine 5mg OD. NKDA. Exertional dyspnoea NYHA class II. High clinical suspicion for stable angina / ACS — urgent cardiology evaluation and ECG/Troponin warranted.",
    priorityLevel: "urgent",
    suggestedDepartment: "Cardiology",
  },
};

const PatientContext = createContext(null);

export function PatientProvider({ children }) {
  const [session, setSession] = useState(null);
  const [language, setLanguage] = useState("en-IN");
  const [isLoading, setIsLoading] = useState(false);

  // Initialize or restore session from localStorage
  useEffect(() => {
    const savedSession = localStorage.getItem("medikiosk_session");
    const savedLang = localStorage.getItem("medikiosk_language");
    if (savedSession) {
      try {
        setSession(JSON.parse(savedSession));
      } catch (e) {
        console.error("Failed to restore session:", e);
      }
    }
    if (savedLang) {
      setLanguage(savedLang);
    }
  }, []);

  // Persist session changes
  useEffect(() => {
    if (session) {
      localStorage.setItem("medikiosk_session", JSON.stringify(session));
    }
  }, [session]);

  useEffect(() => {
    if (language) {
      localStorage.setItem("medikiosk_language", language);
    }
  }, [language]);

  const startNewSession = useCallback((lang = null) => {
    const activeLang =
      lang ||
      (typeof window !== "undefined" ? localStorage.getItem("medikiosk_language") : null) ||
      language ||
      "en-IN";
    const newSession = createEmptySession();
    newSession.language = activeLang;
    setLanguage(activeLang);
    setSession(newSession);
    if (typeof window !== "undefined") {
      localStorage.setItem("medikiosk_session", JSON.stringify(newSession));
      localStorage.setItem("medikiosk_language", activeLang);
    }
    return newSession;
  }, [language]);

  const updateSession = useCallback((updates) => {
    setSession((prev) => {
      if (!prev) return prev;
      return { ...prev, ...updates };
    });
  }, []);

  const updatePatient = useCallback((patientData) => {
    setSession((prev) => {
      if (!prev) return prev;
      return { ...prev, patient: { ...prev.patient, ...patientData } };
    });
  }, []);

  const updateConsent = useCallback((consentData) => {
    setSession((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        consent: { ...prev.consent, ...consentData, timestamp: new Date().toISOString() },
      };
    });
  }, []);

  const addConversationMessage = useCallback((role, text) => {
    setSession((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        conversation: [
          ...prev.conversation,
          { role, text, timestamp: new Date().toISOString() },
        ],
      };
    });
  }, []);

  const updateExtractedHistory = useCallback((historyUpdates) => {
    setSession((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        extractedHistory: { ...prev.extractedHistory, ...historyUpdates },
      };
    });
  }, []);

  const addDocument = useCallback((document) => {
    setSession((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        documents: [...prev.documents, document],
      };
    });
  }, []);

  const setSummary = useCallback((summary) => {
    setSession((prev) => {
      if (!prev) return prev;
      return { ...prev, summary, status: "completed" };
    });
  }, []);

  const addRedFlag = useCallback((flag) => {
    setSession((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        redFlags: [...prev.redFlags, { ...flag, timestamp: new Date().toISOString() }],
      };
    });
  }, []);

  const clearSession = useCallback(() => {
    setSession(null);
    localStorage.removeItem("medikiosk_session");
  }, []);

  /** Seed a complete realistic demo session for hackathon presentations */
  const loadDemoSession = useCallback((lang = "en-IN") => {
    const demo = { ...DEMO_SESSION, id: `MK-DEMO-${uuidv4().slice(0, 6).toUpperCase()}`, language: lang };
    setSession(demo);
    setLanguage(lang);
    localStorage.setItem("medikiosk_session", JSON.stringify(demo));
    localStorage.setItem("medikiosk_language", lang);
    return demo;
  }, []);

  const value = {
    session,
    language,
    isLoading,
    setLanguage,
    setIsLoading,
    startNewSession,
    updateSession,
    updatePatient,
    updateConsent,
    addConversationMessage,
    updateExtractedHistory,
    addDocument,
    setSummary,
    addRedFlag,
    clearSession,
    loadDemoSession,
  };

  return (
    <PatientContext.Provider value={value}>{children}</PatientContext.Provider>
  );
}

export function usePatient() {
  const context = useContext(PatientContext);
  if (!context) {
    throw new Error("usePatient must be used within a PatientProvider");
  }
  return context;
}
