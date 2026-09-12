"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  Edit3,
  Eye,
  AlertTriangle,
  Activity,
  Stethoscope,
  Save,
  X,
  RefreshCw,
  Sparkles,
  Download,
  FileCode,
  Target,
  ClipboardList,
  FolderOpen,
  Pill,
  User,
  Search,
  Info,
  Calendar,
  Bell,
  TrendingUp,
  Check,
} from "lucide-react";
import Navbar from "@/components/ui/Navbar";
import GlassCard from "@/components/ui/GlassCard";
import DrugInteractionPanel from "@/components/DrugInteractionPanel";
import RiskScoreCard from "@/components/RiskScoreCard";
import PatientRecoveryGraph from "@/components/PatientRecoveryGraph";
import AppointmentReminderModal from "@/components/AppointmentReminderModal";
import { generateSampleRecoveryData, calculateReminderDate, formatSafeDate } from "@/lib/reminders";

// Demo patient queue (baseline — always shown)
const DEMO_PATIENTS = [
  {
    id: "MK-001",
    name: "Rajesh Kumar",
    age: 45,
    gender: "M",
    phone: "+91 98765 43210",
    email: "rajesh.kumar@example.com",
    department: "General Medicine",
    priority: "routine",
    chiefComplaint: "Fever and body pain for 3 days",
    status: "waiting",
    time: "09:15 AM",
    isDemo: true,
    followUp: {
      appointmentDate: new Date(Date.now() + 7 * 86400000).toISOString(),
      reminderDate: calculateReminderDate(new Date(Date.now() + 7 * 86400000).toISOString()),
      department: "General Medicine",
      doctorName: "Dr. Sharma, MD",
      remarks: "Patient showing substantial defervescence. Continue hydration and finish antibiotic regimen. Repeat CBC if fever recurs.",
      reminderStatus: "scheduled_2_days_prior",
      channels: {
        sms: true,
        email: true,
        push: true,
      },
    },
    summary: {
      chiefComplaint: "High-grade fever with body aches for 3 days",
      hpi: "Patient reports continuous fever (100-102°F), generalized body pain, mild headache, and decreased appetite. No rash, no joint swelling. Took Paracetamol with partial relief.",
      pastHistory: "Known case of Type 2 DM on Metformin 500mg BD. No surgical history.",
      drugs: "Metformin 500mg BD (since 2020)",
      allergies: "NKDA",
      family: "Father — DM, HTN",
      personal: "Non-smoker, non-alcoholic, sedentary lifestyle",
      ros: "Positive: Myalgia, anorexia. Negative: No cough, no rash, no bleeding",
    },
  },
  {
    id: "MK-002",
    name: "Sunita Devi",
    age: 62,
    gender: "F",
    phone: "+91 94123 89012",
    email: "sunita.devi62@gmail.com",
    department: "Cardiology",
    priority: "urgent",
    chiefComplaint: "Chest pain on exertion for 1 week",
    status: "waiting",
    time: "09:22 AM",
    isDemo: true,
    followUp: {
      appointmentDate: new Date(Date.now() + 5 * 86400000).toISOString(),
      reminderDate: calculateReminderDate(new Date(Date.now() + 5 * 86400000).toISOString()),
      department: "Cardiology",
      doctorName: "Dr. A. K. Sen, DM",
      remarks: "Follow-up for post-angina treadmill stress test review. BP well controlled. Discontinue NSAIDs, continue statin.",
      reminderStatus: "scheduled_2_days_prior",
      channels: {
        sms: true,
        email: true,
        push: true,
      },
    },
    summary: {
      chiefComplaint: "Retrosternal chest pain on exertion × 1 week",
      hpi: "Patient reports squeezing chest pain on climbing stairs, radiating to left arm, relieved by rest (5-10 min). No associated breathlessness at rest. Severity 6/10. No sweating or syncope.",
      pastHistory: "HTN × 10 years on Amlodipine 5mg OD. Known dyslipidemia on Atorvastatin 20mg.",
      drugs: "Amlodipine 5mg OD, Atorvastatin 20mg HS, Ecosprin 75mg OD",
      allergies: "NKDA",
      family: "Father died of MI at age 55. Mother — HTN.",
      personal: "Ex-smoker (quit 5 years ago), vegetarian diet, walks 15 min/day",
      ros: "Positive: Exertional dyspnea NYHA II. Negative: No orthopnea, no PND, no palpitations",
    },
  },
  {
    id: "MK-003",
    name: "Mohammed Irfan",
    age: 28,
    gender: "M",
    phone: "+91 97654 32109",
    email: "irfan.md28@outlook.com",
    department: "General Medicine",
    priority: "routine",
    chiefComplaint: "Persistent cough for 2 weeks",
    status: "completed",
    time: "08:50 AM",
    isDemo: true,
    followUp: {
      appointmentDate: new Date(Date.now() + 14 * 86400000).toISOString(),
      reminderDate: calculateReminderDate(new Date(Date.now() + 14 * 86400000).toISOString()),
      department: "General Medicine / Pulmonology",
      doctorName: "Dr. Sharma, MD",
      remarks: "Sputum smear negative for AFB. Cough improved by 85%. Advised tobacco cessation counselling and SOS bronchodilator.",
      reminderStatus: "scheduled_2_days_prior",
      channels: {
        sms: true,
        email: true,
        push: true,
      },
    },
    summary: {
      chiefComplaint: "Productive cough with yellowish sputum × 2 weeks",
      hpi: "Patient reports cough with thick yellow sputum, worse in morning. Associated low-grade fever. No hemoptysis, no breathlessness, no weight loss, no night sweats. No TB contacts.",
      pastHistory: "No significant past history. No surgeries.",
      drugs: "None",
      allergies: "Penicillin — skin rash",
      family: "No significant family history",
      personal: "Smoker (5 beedis/day × 10 years), occasional alcohol, construction worker",
      ros: "Positive: Productive cough, mild fatigue. Negative: No hemoptysis, no weight loss",
    },
  },
  {
    id: "MK-004",
    name: "Lakshmi Narayanan",
    age: 54,
    gender: "F",
    phone: "+91 98401 23456",
    email: "lakshmi.narayanan54@gmail.com",
    department: "Orthopedics",
    priority: "routine",
    chiefComplaint: "Severe bilateral knee pain on walking × 6 months",
    status: "waiting",
    time: "09:30 AM",
    isDemo: true,
    followUp: {
      appointmentDate: new Date(Date.now() + 10 * 86400000).toISOString(),
      reminderDate: calculateReminderDate(new Date(Date.now() + 10 * 86400000).toISOString()),
      department: "Orthopedics",
      doctorName: "Dr. Vikram Malhotra, MS (Ortho)",
      remarks: "Bilateral Osteoarthritis (Grade 3 KL). Quadriceps isometric exercises advised. Glucosamine + Diacerein trial initiated. Plan intra-articular hyaluronic acid if no relief in 4 weeks.",
      reminderStatus: "scheduled_2_days_prior",
      channels: { sms: true, email: true, push: true },
    },
    summary: {
      chiefComplaint: "Bilateral knee joint pain aggravated by squatting and climbing stairs × 6 months",
      hpi: "Patient has dull aching pain in both knees, worse right > left. Associated coarse crepitus and morning stiffness lasting ~20 minutes. No joint effusion or erythema. Weight: 74 kg (BMI 29.2).",
      pastHistory: "Primary Hypothyroidism on Levothyroxine 50mcg OD. Menopause at age 49.",
      drugs: "Levothyroxine 50mcg OD, Tab Calcium carbonate 500mg OD, SOS Paracetamol",
      allergies: "Sulfa drugs — urticaria",
      family: "Mother had severe OA knee and underwent total knee replacement at age 65.",
      personal: "Vegetarian diet, homemaker, sedentary activity level",
      ros: "Positive: Crepitus, joint stiffness. Negative: No fever, no weight loss, no other joint involvement",
    },
  },
  {
    id: "MK-005",
    name: "Master Aarav Sharma",
    age: 7,
    gender: "M",
    phone: "+91 98112 34567",
    email: "sharma.family.delhi@gmail.com",
    department: "Pediatrics",
    priority: "urgent",
    chiefComplaint: "Nocturnal dry cough and wheezing × 4 days",
    status: "waiting",
    time: "09:38 AM",
    isDemo: true,
    followUp: {
      appointmentDate: new Date(Date.now() + 7 * 86400000).toISOString(),
      reminderDate: calculateReminderDate(new Date(Date.now() + 7 * 86400000).toISOString()),
      department: "Pediatrics / Pulmonology",
      doctorName: "Dr. Priya Nair, MD (Pediatrics)",
      remarks: "Childhood Reactive Airway Disease (Asthma flare). SpO2 97% on room air. Continue Budesonide MDI via spacer twice daily and Levosalbutamol SOS. Review inhaler technique at follow-up.",
      reminderStatus: "scheduled_2_days_prior",
      channels: { sms: true, email: true, push: true },
    },
    summary: {
      chiefComplaint: "Dry spasmodic cough worse at night with audible expiratory wheeze × 4 days",
      hpi: "7-year-old boy with episodic nighttime cough triggered by cold weather and urban air quality. Mother reports mild chest indrawing during coughing fits. Relieved partially by warm water and salbutamol syrup.",
      pastHistory: "History of atopic dermatitis in infancy. Frequent seasonal allergic rhinitis.",
      drugs: "Syrup Montair-LC (Montelukast + Levocetirizine) 5ml HS",
      allergies: "Dust mites, pollen. No known drug allergies.",
      family: "Father has allergic rhinitis and asthma.",
      personal: "School student, fully immunized according to National Immunization Schedule.",
      ros: "Positive: Expiratory wheeze, nocturnal cough. Negative: No fever, no stridor, no cyanosis",
    },
  },
  {
    id: "MK-006",
    name: "Harpreet Kaur",
    age: 34,
    gender: "F",
    phone: "+91 98721 98765",
    email: "harpreet.kaur34@outlook.com",
    department: "Obstetrics & Gynecology",
    priority: "routine",
    chiefComplaint: "Routine Antenatal Checkup at 28 weeks gestation",
    status: "waiting",
    time: "09:45 AM",
    isDemo: true,
    followUp: {
      appointmentDate: new Date(Date.now() + 14 * 86400000).toISOString(),
      reminderDate: calculateReminderDate(new Date(Date.now() + 14 * 86400000).toISOString()),
      department: "Obstetrics & Gynecology",
      doctorName: "Dr. Sunita Mehra, MD, DGO",
      remarks: "ANC-3 visit. Blood pressure 114/72 mmHg. Fetal heart rate 142 bpm regular. Hemoglobin 10.2 g/dL indicates mild gestational anemia. Continue Tab Ferrous Ascorbate + Folic Acid and repeat hemogram at next visit.",
      reminderStatus: "scheduled_2_days_prior",
      channels: { sms: true, email: true, push: true },
    },
    summary: {
      chiefComplaint: "28 weeks gestational age primigravida for routine ANC review and screening",
      hpi: "Primigravida at 28 weeks 3 days gestation by accurate LMP. Good fetal movements perceived. Reports mild fatigue and occasional pedal edema in evenings relieved by elevation. No bleeding, no leaking per vaginam.",
      pastHistory: "No prior medical illnesses. Conceived spontaneously.",
      drugs: "Tab Iron-Folic Acid 100mg elemental Fe OD, Tab Calcium 500mg BD",
      allergies: "NKDA",
      family: "No history of gestational diabetes or pregnancy-induced hypertension in family.",
      personal: "Non-smoker, IT consultant working from home, balanced vegetarian diet.",
      ros: "Positive: Active fetal kicks, mild pedal edema. Negative: No headache, no visual blur, no epigastric pain",
    },
  },
  {
    id: "MK-007",
    name: "Rameshwar Prasad",
    age: 58,
    gender: "M",
    phone: "+91 94501 77654",
    email: "rameshwar.prasad.ayush@gmail.com",
    department: "Ayurveda (AYUSH)",
    priority: "routine",
    chiefComplaint: "Chronic Sandhivata (Joint Pain) and Amlapitta (Hyperacidity) × 1 year",
    status: "waiting",
    time: "09:52 AM",
    isDemo: true,
    followUp: {
      appointmentDate: new Date(Date.now() + 7 * 86400000).toISOString(),
      reminderDate: calculateReminderDate(new Date(Date.now() + 7 * 86400000).toISOString()),
      department: "Ayurveda (AYUSH)",
      doctorName: "Vaidya Harish Joshi, BAMS, MD (Ayu)",
      remarks: "Prakriti: Vata-Kapha dominant. Agni: Vishamagni. Prescribed Yogaraja Guggulu 2 tabs BD with warm water, Avipattikar Churna 3g HS, and scheduled for 7-day Panchakarma Janu Basti local snehana-swedana therapy.",
      reminderStatus: "scheduled_2_days_prior",
      channels: { sms: true, email: true, push: true },
    },
    summary: {
      chiefComplaint: "Sandhigata Vata affecting both knees and Vidagdha Amlapitta with sour eructations × 1 year",
      hpi: "Patient reports stiffness, shoola (pain), and sandhisphutana (crepitus) aggravated in cold and dry weather. Also suffers from Tikta-amla udgara (acid regurgitation) and burning retrosternal sensation after spicy food.",
      pastHistory: "Chronic functional dyspepsia × 3 years. Mild dyslipidemia.",
      drugs: "Occasionally takes Tab Pantoprazole 40mg with temporary relief",
      allergies: "NKDA",
      family: "Father had joint disorders and vata vyadhi.",
      personal: "Retired railway clerk. Habit of late dinners and sedentary routine. Vata-Kapha deha prakriti.",
      ros: "Positive: Sandhi shoola, Amla udgara, Mandagni. Negative: No fever, no bleeding, no neuro deficits",
    },
  },
  {
    id: "MK-008",
    name: "Ananya Sen",
    age: 23,
    gender: "F",
    phone: "+91 99031 44556",
    email: "ananya.sen23@gmail.com",
    department: "General Medicine / Dermatology",
    priority: "urgent",
    chiefComplaint: "Generalized itchy red hives (urticaria) all over body × 6 hours",
    status: "waiting",
    time: "10:02 AM",
    isDemo: true,
    followUp: {
      appointmentDate: new Date(Date.now() + 3 * 86400000).toISOString(),
      reminderDate: calculateReminderDate(new Date(Date.now() + 3 * 86400000).toISOString()),
      department: "Dermatology",
      doctorName: "Dr. Ananya Roy, MD (Dermatology)",
      remarks: "Acute allergic urticaria following seafood (prawn) ingestion. No angioedema or airway involvement (lips/tongue clear, no wheezing). Prescribed Tab Bilastine 20mg OD × 5 days and Calamine lotion topically. Strict dietary avoidance.",
      reminderStatus: "scheduled_2_days_prior",
      channels: { sms: true, email: true, push: true },
    },
    summary: {
      chiefComplaint: "Sudden onset pruritic erythematous edematous wheals on arms, abdomen, and thighs × 6 hours",
      hpi: "23-year-old student developed acute severe generalized itching and raised pink hives 2 hours after consuming prawn curry at dinner. No difficulty breathing, no throat tightness, no facial or lip swelling.",
      pastHistory: "History of mild allergic eczema in childhood. No chronic medical disorders.",
      drugs: "Took one tablet of Cetirizine 10mg from local pharmacy 3 hours ago with mild itch reduction",
      allergies: "Shellfish / Crustaceans — acute urticaria. NKDA.",
      family: "Brother has peanut allergy.",
      personal: "Postgraduate university student. Non-smoker, non-alcoholic.",
      ros: "Positive: Generalized urticarial wheals, intense pruritus. Negative: No stridor, no facial angioedema, no hypotension",
    },
  },
];

/** Convert a MediKiosk session object into a physician queue patient */
function sessionToPatient(session) {
  if (!session?.patient?.name) return null;

  const s = session.summary?.summary;
  const arriveTime = new Date(session.createdAt || Date.now()).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return {
    id: session.id || "MK-LIVE",
    name: session.patient.name,
    age: session.patient.age || "—",
    gender: session.patient.gender ? session.patient.gender[0].toUpperCase() : "—",
    phone: session.patient.phone || "—",
    email: session.patient.email || "—",
    department: session.summary?.suggestedDepartment || "General Medicine",
    priority: session.summary?.priorityLevel || "routine",
    chiefComplaint:
      s?.chiefComplaint ||
      session.extractedHistory?.chiefComplaint ||
      session.conversation?.find((m) => m.role === "patient")?.text ||
      "As recorded during interview",
    status: "waiting",
    time: arriveTime,
    isLive: true,
    followUp: session.followUp || null,
    summary: {
      chiefComplaint:
        s?.chiefComplaint ||
        session.extractedHistory?.chiefComplaint ||
        "As recorded during interview",
      hpi:
        s?.hpiNarrative ||
        session.summary?.summaryNarrative ||
        "History elicited via MediKiosk conversational interview.",
      pastHistory: (() => {
        const pmh = s?.pastMedicalHistory;
        if (!pmh) return "Not recorded";
        const parts = [];
        if (pmh.conditions?.length) parts.push("Conditions: " + pmh.conditions.join(", "));
        if (pmh.surgeries?.length) parts.push("Surgeries: " + pmh.surgeries.join(", "));
        return parts.join(". ") || "No significant past history";
      })(),
      drugs: (() => {
        const dh = s?.drugHistory;
        if (!dh) return "Not recorded";
        const meds = dh.current || [];
        return (
          meds
            .map((d) => (typeof d === "string" ? d : `${d.name} ${d.dosage || ""}`.trim()))
            .join(", ") || "None"
        );
      })(),
      allergies: (() => {
        const ah = s?.allergyHistory;
        if (!ah) return "Not recorded";
        if (ah.noKnownAllergies) return "NKDA";
        return [...(ah.drugs || []), ...(ah.food || [])].join(", ") || "NKDA";
      })(),
      family: (() => {
        const fh = s?.familyHistory;
        if (!fh?.conditions?.length) return "No significant family history";
        return fh.conditions.join("; ");
      })(),
      personal: (() => {
        const ph = s?.personalHistory;
        if (!ph || !Object.keys(ph).length) return "Not recorded";
        return Object.entries(ph)
          .map(([k, v]) => `${k.charAt(0).toUpperCase() + k.slice(1)}: ${v}`)
          .join(", ");
      })(),
      ros: (() => {
        const ros = s?.reviewOfSystems;
        if (!ros) return "Not recorded";
        const pos = ros.positive?.join(", ") || "";
        const neg = ros.negative?.join(", ") || "";
        return [pos ? `Positive: ${pos}` : "", neg ? `Negative: ${neg}` : ""]
          .filter(Boolean)
          .join(". ") || "Not recorded";
      })(),
    },
  };
}

/** The editable clinical fields displayed in the detail panel */
const SUMMARY_FIELDS = [
  { key: "chiefComplaint", label: "Chief Complaint", icon: Target },
  { key: "hpi", label: "History of Present Illness", icon: ClipboardList, multiline: true },
  { key: "pastHistory", label: "Past Medical / Surgical History", icon: FolderOpen, multiline: true },
  { key: "drugs", label: "Current Medications", icon: Pill, multiline: true },
  { key: "allergies", label: "Allergy History", icon: AlertTriangle },
  { key: "family", label: "Family History", icon: Users, multiline: true },
  { key: "personal", label: "Personal History", icon: User, multiline: true },
  { key: "ros", label: "Review of Systems", icon: Search, multiline: true },
];

export default function PhysicianPage() {
  const router = useRouter();
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patients, setPatients] = useState(DEMO_PATIENTS);
  const [mounted, setMounted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editDraft, setEditDraft] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);

  // Tab navigation in patient detail: "summary" | "recovery"
  const [activeTab, setActiveTab] = useState("summary");
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [followUpSuccessMsg, setFollowUpSuccessMsg] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  /** Load live session patient from localStorage and merge into queue */
  const loadLivePatient = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem("medikiosk_session");
      if (!raw) return;
      const session = JSON.parse(raw);
      const livePatient = sessionToPatient(session);
      if (!livePatient) return;

      setPatients((prev) => {
        // Replace existing live entry or prepend
        const withoutLive = prev.filter((p) => !p.isLive);
        return [livePatient, ...withoutLive];
      });

      // Auto-select the live patient if nothing else is selected
      setSelectedPatient((prev) => {
        if (!prev || prev.isLive) return livePatient;
        return prev;
      });

      setLastRefresh(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }));
    } catch (e) {
      console.error("Failed to load live patient:", e);
    }
  }, []);

  // Load on mount + auto-poll every 5s for live patients from the kiosk
  useEffect(() => {
    if (!mounted) return;
    loadLivePatient();
    const interval = setInterval(loadLivePatient, 5000);
    return () => clearInterval(interval);
  }, [mounted, loadLivePatient]);

  const handleAction = (patientId, action) => {
    setPatients((prev) =>
      prev.map((p) =>
        p.id === patientId
          ? {
              ...p,
              status:
                action === "accept" ? "accepted" : action === "reject" ? "rejected" : p.status,
            }
          : p
      )
    );
    setSelectedPatient((prev) =>
      prev?.id === patientId
        ? { ...prev, status: action === "accept" ? "accepted" : "rejected" }
        : prev
    );
    setIsEditing(false);
  };

  /** Start editing — create a mutable draft of the current summary */
  const startEdit = () => {
    if (!selectedPatient) return;
    setEditDraft({ ...selectedPatient.summary });
    setIsEditing(true);
  };

  /** Save edited draft back to the patients list */
  const saveEdit = () => {
    if (!selectedPatient || !editDraft) return;
    const updated = { ...selectedPatient, summary: editDraft, isEdited: true };
    setPatients((prev) => prev.map((p) => (p.id === selectedPatient.id ? updated : p)));
    setSelectedPatient(updated);
    setIsEditing(false);
    setEditDraft(null);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditDraft(null);
  };

  /** Update physician remarks for the patient */
  const handleUpdateRemarks = (patientId, remarks) => {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id !== patientId) return p;
        const updatedFollowUp = { ...(p.followUp || {}), remarks };
        return { ...p, followUp: updatedFollowUp };
      })
    );
    setSelectedPatient((prev) => {
      if (prev?.id !== patientId) return prev;
      return { ...prev, followUp: { ...(prev.followUp || {}), remarks } };
    });

    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("medikiosk_session");
        if (raw) {
          const session = JSON.parse(raw);
          if (session.id === patientId || patientId === "MK-LIVE") {
            session.followUp = { ...(session.followUp || {}), remarks };
            localStorage.setItem("medikiosk_session", JSON.stringify(session));
          }
        }
      } catch (e) {
        console.error("Failed to sync remarks to session", e);
      }
    }
  };

  /** Schedule follow-up with automated 2-day pre-appointment alert */
  const handleScheduleFollowUp = (followUpData) => {
    if (!selectedPatient) return;
    setPatients((prev) =>
      prev.map((p) => (p.id === selectedPatient.id ? { ...p, followUp: followUpData } : p))
    );
    setSelectedPatient((prev) => ({ ...prev, followUp: followUpData }));
    const reminderFormatted = formatSafeDate(followUpData.reminderDate, {
      day: "numeric",
      month: "short",
      year: "numeric",
    }, 5);
    setFollowUpSuccessMsg(
      `Checkup scheduled for ${formatSafeDate(followUpData.appointmentDate, { weekday: "short", day: "numeric", month: "short", year: "numeric" }, 7)}. 2-Day Pre-Alert will be sent on ${reminderFormatted} via SMS, Email & Push!`
    );
    setTimeout(() => setFollowUpSuccessMsg(""), 7000);

    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("medikiosk_session");
        if (raw) {
          const session = JSON.parse(raw);
          if (session.id === selectedPatient.id || selectedPatient.id === "MK-LIVE") {
            session.followUp = followUpData;
            localStorage.setItem("medikiosk_session", JSON.stringify(session));
          }
        }
      } catch (e) {
        console.error("Failed to sync follow-up to session", e);
      }
    }
  };

  /** Extract medication list from patient summary for drug interaction check */
  const getPatientMedications = (patient) => {
    if (!patient?.summary?.drugs) return [];
    const drugStr = patient.summary.drugs;
    if (typeof drugStr === "string" && drugStr !== "None" && drugStr !== "Not recorded") {
      // Parse comma/newline separated drug list
      return drugStr
        .split(/[,\n;]+/)
        .map((d) => d.trim())
        .filter((d) => d.length > 2 && d !== "None" && d !== "Not recorded");
    }
    return [];
  };

  /** Extract risk scoring data from physician patient */
  const getPatientRiskData = (patient) => {
    if (!patient) return null;
    return {
      age: patient.age,
      gender: patient.gender === "F" ? "female" : "male",
      chiefComplaint: patient.chiefComplaint || patient.summary?.chiefComplaint || "",
      hpiNarrative: patient.summary?.hpi || "",
      symptoms: [],
      pastConditions: patient.summary?.pastHistory ? [patient.summary.pastHistory] : [],
      redFlags: patient.priority === "emergency" ? [{ reason: "Emergency priority" }] : [],
    };
  };

  /** FHIR Export — build session from physician patient and download */
  const handleFHIRExport = async (patient) => {
    try {
      const { downloadFHIRBundle } = await import("@/lib/fhir-export");
      // Build a minimal session-like object from physician patient data
      const fakeSession = {
        id: patient.id,
        patient: {
          name: patient.name,
          age: patient.age,
          gender: patient.gender === "M" ? "male" : "female",
          abhaId: null,
        },
        summary: {
          summary: {
            chiefComplaint: patient.summary?.chiefComplaint || patient.chiefComplaint,
            hpiNarrative: patient.summary?.hpi,
            pastMedicalHistory: { conditions: patient.summary?.pastHistory ? [patient.summary.pastHistory] : [] },
            drugHistory: {
              current: getPatientMedications(patient).map((d) => (typeof d === "string" ? { name: d } : d)),
            },
            allergyHistory: patient.summary?.allergies === "NKDA"
              ? { noKnownAllergies: true }
              : { drugs: patient.summary?.allergies ? [patient.summary.allergies] : [] },
            familyHistory: { conditions: patient.summary?.family ? [patient.summary.family] : [] },
            personalHistory: { lifestyle: patient.summary?.personal || "" },
            reviewOfSystems: { positive: [], negative: [] },
            priorInvestigations: [],
          },
          summaryNarrative: patient.summary?.hpi || "AI-generated clinical summary",
          priorityLevel: patient.priority,
          suggestedDepartment: patient.department,
        },
      };
      downloadFHIRBundle(fakeSession);
    } catch (e) {
      console.error("FHIR export error:", e);
      alert("FHIR export failed — please try again");
    }
  };

  const getPriorityBadge = (priority) => {
    const classes = {
      routine: "badge",
      urgent: "badge badge-warning",
      emergency: "badge badge-danger",
    };
    return (
      <span className={classes[priority] || "badge"} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
        <span style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          display: "inline-block",
          background: priority === "emergency" ? "#ff4757" : priority === "urgent" ? "#ffb347" : "#00d4aa"
        }} />
        {priority?.toUpperCase()}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    if (status === "completed" || status === "accepted")
      return <span className="badge badge-success">Done</span>;
    if (status === "rejected") return <span className="badge badge-danger">Rejected</span>;
    return <span className="badge badge-warning">Waiting</span>;
  };

  if (!mounted) return null;

  return (
    <>
      <Navbar />
      <div className="page-wrapper">
        <div className="container container-wide" style={{ padding: "24px 16px" }}>
          <div className="phys-top animate-fade-in">
            <div className="section-header" style={{ marginBottom: 0 }}>
              <h1>
                <span className="text-gradient">Physician</span> Dashboard
              </h1>
              <p>Review AI-generated patient histories before consultation</p>
            </div>

            <button
              className="btn-secondary refresh-btn"
              onClick={loadLivePatient}
              id="physician-refresh-btn"
              title="Refresh queue for new patients"
            >
              <RefreshCw size={16} />
              Refresh Queue
              {lastRefresh && (
                <span style={{ fontSize: "0.72rem", opacity: 0.7, marginLeft: 4 }}>
                  ({lastRefresh})
                </span>
              )}
            </button>
          </div>

          {/* Stats */}
          <div className="stats-row animate-fade-in-up delay-1">
            <GlassCard hoverable={false} className="stat-card">
              <Users size={24} style={{ color: "var(--color-accent-primary)" }} />
              <div>
                <span className="stat-value">
                  {patients.filter((p) => p.status === "waiting").length}
                </span>
                <span className="stat-label">Waiting</span>
              </div>
            </GlassCard>
            <GlassCard hoverable={false} className="stat-card">
              <CheckCircle2 size={24} style={{ color: "var(--color-accent-success)" }} />
              <div>
                <span className="stat-value">
                  {patients.filter((p) => ["completed", "accepted"].includes(p.status)).length}
                </span>
                <span className="stat-label">Completed</span>
              </div>
            </GlassCard>
            <GlassCard hoverable={false} className="stat-card">
              <AlertTriangle size={24} style={{ color: "var(--color-accent-warning)" }} />
              <div>
                <span className="stat-value">
                  {
                    patients.filter(
                      (p) => p.priority === "urgent" || p.priority === "emergency"
                    ).length
                  }
                </span>
                <span className="stat-label">Urgent</span>
              </div>
            </GlassCard>
          </div>

          <div className="dashboard-layout animate-fade-in-up delay-2">
            {/* Patient Queue */}
            <div className="queue-panel">
              <h2 style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <Users size={20} /> Patient Queue
              </h2>
              {patients.map((patient) => (
                <GlassCard
                  key={patient.id}
                  className={`queue-card ${selectedPatient?.id === patient.id ? "active" : ""} ${patient.isLive ? "live-card" : ""}`}
                  onClick={() => {
                    setSelectedPatient(patient);
                    setIsEditing(false);
                    setEditDraft(null);
                  }}
                >
                  <div className="queue-card-header">
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <h4>{patient.name}</h4>
                        {patient.isLive && (
                          <span className="live-badge">
                            <Sparkles size={10} /> LIVE
                          </span>
                        )}
                        {patient.isEdited && (
                          <span className="edited-badge">Edited</span>
                        )}
                      </div>
                      <p>
                        {patient.age}y / {patient.gender} • {patient.department}
                      </p>
                    </div>
                    <div className="queue-card-meta">
                      {getPriorityBadge(patient.priority)}
                      {getStatusBadge(patient.status)}
                    </div>
                  </div>
                  <div className="queue-card-body">
                    <span className="queue-time">
                      <Clock size={12} /> {patient.time}
                    </span>
                    <span className="queue-cc">{patient.chiefComplaint}</span>
                  </div>
                </GlassCard>
              ))}
            </div>

            {/* Detail / Edit Panel */}
            <div className="detail-panel">
              {selectedPatient ? (
                <div className="patient-detail animate-fade-in">
                  <GlassCard hoverable={false}>
                    {/* Patient header */}
                    <div className="detail-header">
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <h2>{selectedPatient.name}</h2>
                          {selectedPatient.isLive && (
                            <span className="live-badge">
                              <Sparkles size={10} /> Current Patient
                            </span>
                          )}
                        </div>
                        <p>
                          {selectedPatient.age}y / {selectedPatient.gender} •{" "}
                          {selectedPatient.phone && selectedPatient.phone !== "—" ? `Ph: ${selectedPatient.phone} • ` : ""}
                          {selectedPatient.email && selectedPatient.email !== "—" ? `${selectedPatient.email} • ` : ""}
                          {selectedPatient.department} • ID: {selectedPatient.id}
                        </p>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                        {getPriorityBadge(selectedPatient.priority)}
                        {selectedPatient.isEdited && (
                          <span className="edited-badge">Amended by Physician</span>
                        )}
                      </div>
                    </div>

                    {/* Follow-up / Action notification alert banner */}
                    {followUpSuccessMsg && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "10px 14px",
                          marginBottom: 16,
                          borderRadius: "var(--radius-md)",
                          background: "rgba(0, 212, 170, 0.12)",
                          border: "1px solid rgba(0, 212, 170, 0.35)",
                          color: "var(--color-accent-primary)",
                          fontSize: "0.85rem",
                          fontWeight: 600,
                        }}
                      >
                        <Check size={18} />
                        <span>{followUpSuccessMsg}</span>
                      </div>
                    )}

                    {/* Navigation Tabs between Case Summary and Recovery Tracking */}
                    {!isEditing && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          borderBottom: "1px solid var(--color-border)",
                          paddingBottom: 12,
                          marginBottom: 16,
                          gap: 12,
                          flexWrap: "wrap",
                        }}
                      >
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            onClick={() => setActiveTab("summary")}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                              padding: "8px 16px",
                              borderRadius: "var(--radius-full)",
                              fontSize: "0.82rem",
                              fontWeight: 600,
                              cursor: "pointer",
                              transition: "all 0.2s ease",
                              background:
                                activeTab === "summary"
                                  ? "var(--color-accent-primary)"
                                  : "rgba(255, 255, 255, 0.05)",
                              color: activeTab === "summary" ? "#000" : "var(--color-text-secondary)",
                              border:
                                activeTab === "summary"
                                  ? "1px solid var(--color-accent-primary)"
                                  : "1px solid var(--color-border)",
                            }}
                          >
                            <Stethoscope size={14} /> Clinical Summary
                          </button>
                          <button
                            onClick={() => setActiveTab("recovery")}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                              padding: "8px 16px",
                              borderRadius: "var(--radius-full)",
                              fontSize: "0.82rem",
                              fontWeight: 600,
                              cursor: "pointer",
                              transition: "all 0.2s ease",
                              background:
                                activeTab === "recovery"
                                  ? "rgba(124, 92, 252, 0.2)"
                                  : "rgba(255, 255, 255, 0.05)",
                              color: activeTab === "recovery" ? "#bda5ff" : "var(--color-text-secondary)",
                              border:
                                activeTab === "recovery"
                                  ? "1px solid rgba(124, 92, 252, 0.5)"
                                  : "1px solid var(--color-border)",
                            }}
                          >
                            <TrendingUp size={14} /> Recovery Trajectory &amp; Remarks
                            <span
                              style={{
                                fontSize: "0.68rem",
                                padding: "1px 6px",
                                borderRadius: 10,
                                background: "rgba(0, 212, 170, 0.2)",
                                color: "var(--color-accent-primary)",
                                marginLeft: 4,
                              }}
                            >
                              Before vs Now
                            </span>
                          </button>
                        </div>

                        {/* Top quick schedule button */}
                        <button
                          onClick={() => setIsReminderModalOpen(true)}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "8px 14px",
                            borderRadius: "var(--radius-full)",
                            background: "rgba(0, 212, 170, 0.1)",
                            border: "1px solid rgba(0, 212, 170, 0.35)",
                            color: "var(--color-accent-primary)",
                            fontSize: "0.8rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                          }}
                        >
                          <Calendar size={14} />
                          {selectedPatient.followUp ? "Reschedule / 2-Day Alert" : "Schedule Follow-up"}
                        </button>
                      </div>
                    )}

                    {/* --- VIEW MODE: SUMMARY TAB --- */}
                    {!isEditing && activeTab === "summary" && (
                      <>
                        {SUMMARY_FIELDS.map(({ key, label, icon: IconComponent }) => (
                          <div key={key} className="summary-section" style={{ marginTop: 12 }}>
                            <div className="summary-section-header">
                              {IconComponent ? <IconComponent size={14} /> : <Stethoscope size={14} />}
                              <h3>{label}</h3>
                            </div>
                            <p style={{ fontSize: "0.88rem", lineHeight: 1.75, whiteSpace: "pre-wrap" }}>
                              {selectedPatient.summary[key] || "—"}
                            </p>
                          </div>
                        ))}

                        {/* Drug Interaction Panel */}
                        <DrugInteractionPanel
                          medications={getPatientMedications(selectedPatient)}
                          patientName={selectedPatient.name}
                        />

                        {/* Risk Score Card */}
                        <RiskScoreCard
                          patientData={getPatientRiskData(selectedPatient)}
                        />

                        {/* Actions */}
                        <div className="detail-actions">
                          <button
                            className="btn-primary btn-large"
                            onClick={() => handleAction(selectedPatient.id, "accept")}
                            id="physician-accept-btn"
                            disabled={selectedPatient.status !== "waiting"}
                          >
                            <CheckCircle2 size={20} />
                            Accept Summary
                          </button>
                          <button
                            className="btn-secondary btn-large"
                            onClick={startEdit}
                            id="physician-edit-btn"
                          >
                            <Edit3 size={20} />
                            Edit &amp; Amend
                          </button>
                          <button
                            className="btn-danger"
                            onClick={() => handleAction(selectedPatient.id, "reject")}
                            id="physician-reject-btn"
                            disabled={selectedPatient.status !== "waiting"}
                          >
                            <XCircle size={18} />
                            Reject
                          </button>
                          <button
                            className="btn-touch"
                            onClick={() => setIsReminderModalOpen(true)}
                            style={{
                              background: "rgba(0, 212, 170, 0.12)",
                              border: "1px solid rgba(0, 212, 170, 0.4)",
                              color: "var(--color-accent-primary)",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 8,
                              padding: "10px 18px",
                              borderRadius: "var(--radius-md)",
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                            id="physician-schedule-followup-btn"
                          >
                            <Bell size={18} />
                            Schedule Follow-up (2-Day Alert)
                          </button>
                          <button
                            className="fhir-export-btn"
                            onClick={() => handleFHIRExport(selectedPatient)}
                            id="physician-fhir-export-btn"
                            title="Export as HL7 FHIR R4 Bundle (international EHR standard)"
                          >
                            <FileCode size={16} />
                            Export FHIR R4
                          </button>
                        </div>
                      </>
                    )}

                    {/* --- VIEW MODE: RECOVERY & REMARKS TAB --- */}
                    {!isEditing && activeTab === "recovery" && (
                      <div className="recovery-tab-content animate-fade-in" style={{ marginTop: 16 }}>
                        {selectedPatient.followUp && (
                          <div
                            style={{
                              background: "rgba(255, 255, 255, 0.03)",
                              border: "1px solid rgba(0, 212, 170, 0.3)",
                              borderRadius: "var(--radius-lg)",
                              padding: "16px 20px",
                              marginBottom: 20,
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              flexWrap: "wrap",
                              gap: 14,
                            }}
                          >
                            <div>
                              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                                <Calendar size={18} style={{ color: "var(--color-accent-primary)" }} />
                                <strong style={{ color: "var(--color-text-primary)", fontSize: "0.95rem" }}>
                                  Next Checkup: {formatSafeDate(selectedPatient.followUp.appointmentDate, {
                                    weekday: "short",
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  }, 7)}
                                </strong>
                                <span
                                  style={{
                                    fontSize: "0.7rem",
                                    padding: "2px 8px",
                                    borderRadius: 12,
                                    background: "rgba(0, 212, 170, 0.15)",
                                    color: "var(--color-accent-primary)",
                                    border: "1px solid rgba(0, 212, 170, 0.3)",
                                    fontWeight: 600,
                                  }}
                                >
                                  2-Day Alert Armed
                                </span>
                              </div>
                              <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--color-text-muted)" }}>
                                Automated alert sent 2 days prior (
                                <strong style={{ color: "var(--color-accent-warning)" }}>
                                  {formatSafeDate(selectedPatient.followUp.reminderDate, {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  }, 5)}
                                </strong>
                                ) to {selectedPatient.phone || "phone"} &amp; {selectedPatient.email || "email"}.
                              </p>
                            </div>
                            <button
                              onClick={() => setIsReminderModalOpen(true)}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                                padding: "8px 16px",
                                borderRadius: "var(--radius-md)",
                                background: "rgba(124, 92, 252, 0.15)",
                                border: "1px solid rgba(124, 92, 252, 0.4)",
                                color: "#bda5ff",
                                fontSize: "0.8rem",
                                fontWeight: 600,
                                cursor: "pointer",
                              }}
                            >
                              <Bell size={14} /> Reconfigure &amp; Test Alert
                            </button>
                          </div>
                        )}

                        <PatientRecoveryGraph
                          patient={selectedPatient}
                          complaint={selectedPatient.chiefComplaint}
                          onUpdateRemarks={(newRemarks) =>
                            handleUpdateRemarks(selectedPatient.id, newRemarks)
                          }
                        />
                      </div>
                    )}

                    {/* --- EDIT MODE --- */}
                    {isEditing && editDraft && (
                      <>
                        <div className="edit-mode-banner">
                          <Edit3 size={16} />
                          <span>Physician Amendment Mode — Edit any field below</span>
                        </div>

                        {SUMMARY_FIELDS.map(({ key, label, icon: IconComponent, multiline }) => (
                          <div key={key} className="edit-field-group">
                            <label className="edit-label" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                              {IconComponent && <IconComponent size={14} />} {label}
                            </label>
                            {multiline ? (
                              <textarea
                                className="edit-textarea"
                                value={editDraft[key] || ""}
                                onChange={(e) =>
                                   setEditDraft((prev) => ({ ...prev, [key]: e.target.value }))
                                }
                                rows={key === "hpi" ? 5 : 3}
                                id={`edit-${key}`}
                              />
                            ) : (
                              <input
                                type="text"
                                className="input-field"
                                value={editDraft[key] || ""}
                                onChange={(e) =>
                                   setEditDraft((prev) => ({ ...prev, [key]: e.target.value }))
                                }
                                id={`edit-${key}`}
                              />
                            )}
                          </div>
                        ))}

                        {/* Save / Cancel */}
                        <div className="detail-actions">
                          <button
                            className="btn-primary btn-large"
                            onClick={saveEdit}
                            id="physician-save-edit-btn"
                          >
                            <Save size={20} />
                            Save Amendment
                          </button>
                          <button
                            className="btn-secondary"
                            onClick={cancelEdit}
                            id="physician-cancel-edit-btn"
                          >
                            <X size={18} />
                            Cancel
                          </button>
                        </div>
                      </>
                    )}

                    <p
                      style={{
                        fontSize: "0.72rem",
                        color: "var(--color-text-muted)",
                        textAlign: "center",
                        marginTop: 12,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 5,
                      }}
                    >
                      <Info size={12} /> AI-generated draft. Physician retains full control to accept, amend, or reject.
                    </p>
                  </GlassCard>
                </div>
              ) : (
                <GlassCard hoverable={false} style={{ textAlign: "center", padding: "80px 20px" }}>
                  <Eye size={48} style={{ color: "var(--color-text-muted)", marginBottom: 16 }} />
                  <h3 style={{ color: "var(--color-text-muted)" }}>Select a patient</h3>
                  <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>
                    Click a patient from the queue to view their AI-generated clinical summary
                  </p>
                  <p
                    style={{
                      color: "var(--color-text-muted)",
                      fontSize: "0.8rem",
                      marginTop: 12,
                    }}
                  >
                    Click{" "}
                    <strong style={{ color: "var(--color-accent-primary)" }}>Refresh Queue</strong>{" "}
                    to load new patients from the kiosk
                  </p>
                </GlassCard>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Appointment Follow-up & 2-Day Pre-Appointment Reminder Modal */}
      {selectedPatient && (
        <AppointmentReminderModal
          isOpen={isReminderModalOpen}
          onClose={() => setIsReminderModalOpen(false)}
          patient={selectedPatient}
          onSchedule={handleScheduleFollowUp}
        />
      )}

      <style jsx>{`
        .phys-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 24px;
        }

        .refresh-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .stats-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px !important;
        }

        .stat-value {
          display: block;
          font-size: 1.8rem;
          font-weight: 800;
          font-family: var(--font-display);
          color: var(--color-text-primary);
        }

        .stat-label {
          font-size: 0.8rem;
          color: var(--color-text-muted);
        }

        .dashboard-layout {
          display: grid;
          grid-template-columns: 360px 1fr;
          gap: 20px;
          align-items: start;
        }

        .queue-panel {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .queue-card {
          cursor: pointer;
          padding: 16px !important;
          transition: all var(--transition-base) !important;
        }

        .queue-card.active {
          border-color: var(--color-accent-primary) !important;
          box-shadow: var(--shadow-glow) !important;
        }

        .queue-card.live-card {
          border-color: rgba(124, 92, 252, 0.4) !important;
          background: rgba(124, 92, 252, 0.04) !important;
        }

        .queue-card.live-card.active {
          border-color: var(--color-accent-tertiary) !important;
          box-shadow: 0 0 30px rgba(124, 92, 252, 0.2) !important;
        }

        .live-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 2px 8px;
          border-radius: 20px;
          background: linear-gradient(135deg, rgba(124, 92, 252, 0.2), rgba(0, 153, 255, 0.2));
          border: 1px solid rgba(124, 92, 252, 0.4);
          color: #9b7ffc;
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .edited-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 2px 8px;
          border-radius: 20px;
          background: rgba(255, 179, 71, 0.12);
          border: 1px solid rgba(255, 179, 71, 0.3);
          color: var(--color-accent-warning);
          font-size: 0.65rem;
          font-weight: 600;
        }

        .queue-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 10px;
        }

        .queue-card-header h4 {
          font-size: 1rem;
          margin-bottom: 2px;
        }

        .queue-card-header p {
          font-size: 0.78rem;
          color: var(--color-text-muted);
          margin: 0;
        }

        .queue-card-meta {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;
        }

        .queue-card-body {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px solid var(--color-border);
        }

        .queue-time {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.75rem;
          color: var(--color-text-muted);
          white-space: nowrap;
        }

        .queue-cc {
          font-size: 0.82rem;
          color: var(--color-text-secondary);
        }

        .detail-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--color-border);
        }

        .detail-header h2 {
          font-size: 1.3rem;
          margin-bottom: 4px;
        }

        .detail-header p {
          font-size: 0.82rem;
          color: var(--color-text-muted);
          margin: 0;
        }

        .detail-actions {
          display: flex;
          gap: 12px;
          margin-top: 24px;
          padding-top: 16px;
          border-top: 1px solid var(--color-border);
          flex-wrap: wrap;
        }

        /* Edit mode */
        .edit-mode-banner {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          background: rgba(124, 92, 252, 0.08);
          border: 1px solid rgba(124, 92, 252, 0.25);
          border-radius: var(--radius-md);
          color: #9b7ffc;
          font-size: 0.85rem;
          font-weight: 500;
          margin-bottom: 16px;
        }

        .edit-field-group {
          margin-bottom: 16px;
        }

        .edit-label {
          display: block;
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--color-text-secondary);
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .edit-textarea {
          width: 100%;
          padding: 12px 14px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          color: var(--color-text-primary);
          font-family: var(--font-primary);
          font-size: 0.88rem;
          line-height: 1.7;
          resize: vertical;
          transition: border-color var(--transition-fast);
          box-sizing: border-box;
        }

        .edit-textarea:focus {
          outline: none;
          border-color: var(--color-accent-primary);
          box-shadow: 0 0 0 2px rgba(0, 212, 170, 0.12);
        }

        @media (max-width: 960px) {
          .dashboard-layout {
            grid-template-columns: 1fr;
          }

          .stats-row {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        /* FHIR Export Button */
        .fhir-export-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          border-radius: var(--radius-md);
          border: 1px solid rgba(77, 184, 255, 0.35);
          background: rgba(77, 184, 255, 0.06);
          color: #4db8ff;
          font-size: 0.82rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s ease;
          letter-spacing: 0.02em;
          white-space: nowrap;
        }

        .fhir-export-btn:hover {
          background: rgba(77, 184, 255, 0.14);
          border-color: rgba(77, 184, 255, 0.6);
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(77, 184, 255, 0.2);
        }

        @media (max-width: 600px) {
          .stats-row {
            grid-template-columns: 1fr;
          }

          .detail-actions {
            flex-direction: column;
          }

          .detail-actions button {
            width: 100%;
            justify-content: center;
          }

          .phys-top {
            flex-direction: column;
          }
        }
      `}</style>
    </>
  );
}
