/**
 * MediKiosk — Clinical Risk Scoring Engine
 * Implements validated clinical scoring frameworks:
 * - CURB-65 (Pneumonia severity / community-acquired pneumonia)
 * - Wells Score (DVT/PE probability)  
 * - CHADS₂-VASc Score (AFib stroke risk)
 * - NEWS2 Simplified (National Early Warning Score — estimated from available data)
 * - Composite MediKiosk Triage Score (0-100)
 */

/**
 * CURB-65 Score for pneumonia severity
 * Criteria: Confusion, Urea>7, RR≥30, BP<90/60, Age≥65
 * Score 0-1: Low (outpatient), 2: Moderate (ward), ≥3: Severe (ICU)
 */
export function calculateCURB65(patientData) {
  const { age, symptoms = [], chiefComplaint = "", hpiNarrative = "" } = patientData;
  const text = `${chiefComplaint} ${hpiNarrative} ${symptoms.join(" ")}`.toLowerCase();

  let score = 0;
  const factors = [];

  // Confusion
  if (text.includes("confus") || text.includes("disoriented") || text.includes("altered mental")) {
    score++;
    factors.push({ name: "Confusion / Altered mental status", points: 1 });
  }

  // Urea (can't measure without labs — skip)

  // Respiratory rate ≥30
  if (text.includes("breathless") || text.includes("difficulty breathing") || text.includes("tachypnea") || text.includes("fast breathing")) {
    score++;
    factors.push({ name: "Respiratory distress (RR≥30 suspected)", points: 1 });
  }

  // BP < 90/60 systolic
  if (text.includes("low bp") || text.includes("hypotension") || text.includes("faint") || text.includes("dizzy")) {
    score++;
    factors.push({ name: "Hypotension (BP<90 suspected)", points: 1 });
  }

  // Age ≥65
  if (age && parseInt(age) >= 65) {
    score++;
    factors.push({ name: "Age ≥ 65 years", points: 1 });
  }

  const maxScore = 4; // Excluding Urea (requires lab)
  const severity =
    score === 0 ? "Low" :
    score === 1 ? "Low-Moderate" :
    score === 2 ? "Moderate" :
    "High";

  const recommendation =
    score <= 1 ? "Outpatient management likely appropriate" :
    score === 2 ? "Short-stay or ward admission — monitor closely" :
    "Hospital admission / ICU assessment recommended";

  return {
    name: "CURB-65",
    score,
    maxScore,
    severity,
    recommendation,
    factors,
    applicable: text.includes("cough") || text.includes("pneumonia") || text.includes("chest") || text.includes("breathless"),
    color: score <= 1 ? "#00d4aa" : score === 2 ? "#ffb347" : "#ff4757",
    note: "Urea criterion excluded (requires laboratory value)",
  };
}

/**
 * Wells Score for DVT/PE probability
 * High ≥3: Likely DVT/PE, 1-2: Moderate, 0: Low
 */
export function calculateWellsScore(patientData) {
  const { symptoms = [], chiefComplaint = "", hpiNarrative = "", pastConditions = [] } = patientData;
  const text = `${chiefComplaint} ${hpiNarrative} ${symptoms.join(" ")} ${pastConditions.join(" ")}`.toLowerCase();

  let score = 0;
  const factors = [];

  // Active cancer
  if (text.includes("cancer") || text.includes("malignancy") || text.includes("chemotherapy") || text.includes("tumor")) {
    score += 1;
    factors.push({ name: "Active cancer / malignancy", points: 1 });
  }

  // Leg immobilization / paralysis
  if (text.includes("immobilized") || text.includes("paralysis") || text.includes("plaster cast") || text.includes("bed rest")) {
    score += 1;
    factors.push({ name: "Paralysis / paresis / plaster immobilization", points: 1 });
  }

  // Bedridden >3 days / surgery in 4 weeks
  if (text.includes("surgery") || text.includes("operation") || text.includes("bed-rest") || text.includes("immobile")) {
    score += 1;
    factors.push({ name: "Recent surgery / prolonged bed rest", points: 1 });
  }

  // Localized leg tenderness
  if (text.includes("leg pain") || text.includes("calf pain") || text.includes("swollen leg") || text.includes("leg swelling")) {
    score += 1;
    factors.push({ name: "Localized tenderness / leg swelling", points: 1 });
  }

  // Chest pain + breathless (PE signs)
  if ((text.includes("chest pain") || text.includes("pleuritic")) && text.includes("breathless")) {
    score += 1;
    factors.push({ name: "Signs/symptoms of PE — pleuritic pain + dyspnea", points: 1 });
  }

  // Tachycardia
  if (text.includes("palpitation") || text.includes("fast heartbeat") || text.includes("racing heart")) {
    score += 1.5;
    factors.push({ name: "Heart rate > 100 (suspected)", points: 1.5 });
  }

  // Prior DVT/PE
  if (text.includes("dvt") || text.includes("deep vein") || text.includes("pulmonary embolism") || text.includes("clot in lung")) {
    score += 1.5;
    factors.push({ name: "Prior DVT / PE", points: 1.5 });
  }

  const probability =
    score < 1 ? "Low" :
    score <= 2 ? "Moderate" :
    "High";

  return {
    name: "Wells Score (DVT/PE)",
    score: parseFloat(score.toFixed(1)),
    maxScore: 8.5,
    severity: probability,
    recommendation:
      score < 1 ? "DVT/PE unlikely — D-dimer if needed" :
      score <= 2 ? "Moderate probability — D-dimer / Doppler ultrasound recommended" :
      "High probability DVT/PE — immediate imaging (CTPA/ultrasound) + anticoagulation assessment",
    factors,
    applicable: text.includes("leg") || text.includes("chest pain") || text.includes("breathless") || text.includes("swelling"),
    color: score < 1 ? "#00d4aa" : score <= 2 ? "#ffb347" : "#ff4757",
  };
}

/**
 * CHA₂DS₂-VASc Score for stroke risk in AFib
 * Conditions: CHF, HTN, Age≥75(x2), DM, Stroke(x2), Vascular disease, Age 65-74, Sex category (Female)
 */
export function calculateCHADS2VASc(patientData) {
  const { age, gender, pastConditions = [], symptoms = [], chiefComplaint = "", hpiNarrative = "" } = patientData;
  const text = `${chiefComplaint} ${hpiNarrative} ${pastConditions.join(" ")} ${symptoms.join(" ")}`.toLowerCase();

  let score = 0;
  const factors = [];

  // CHF
  if (text.includes("heart failure") || text.includes("chf") || text.includes("cardiac failure")) {
    score += 1;
    factors.push({ name: "Congestive Heart Failure", points: 1 });
  }

  // Hypertension
  if (text.includes("hypertension") || text.includes("high bp") || text.includes("htn") || text.includes("blood pressure")) {
    score += 1;
    factors.push({ name: "Hypertension", points: 1 });
  }

  // Age ≥75
  if (age && parseInt(age) >= 75) {
    score += 2;
    factors.push({ name: "Age ≥ 75 years", points: 2 });
  } else if (age && parseInt(age) >= 65) {
    score += 1;
    factors.push({ name: "Age 65–74 years", points: 1 });
  }

  // Diabetes
  if (text.includes("diabetes") || text.includes("diabetic") || text.includes("dm") || text.includes("sugar")) {
    score += 1;
    factors.push({ name: "Diabetes Mellitus", points: 1 });
  }

  // Stroke / TIA history
  if (text.includes("stroke") || text.includes("tia") || text.includes("paralysis") || text.includes("hemiplegia")) {
    score += 2;
    factors.push({ name: "Prior Stroke / TIA", points: 2 });
  }

  // Vascular disease
  if (text.includes("mi") || text.includes("myocardial infarction") || text.includes("peripheral artery") || text.includes("pad")) {
    score += 1;
    factors.push({ name: "Vascular disease (prior MI / PAD)", points: 1 });
  }

  // Female sex
  if (gender === "female" || gender === "F" || gender === "f") {
    score += 1;
    factors.push({ name: "Female sex", points: 1 });
  }

  const riskCategory =
    score === 0 ? "Low" :
    score === 1 ? "Low-Moderate" :
    score <= 3 ? "Moderate" :
    "High";

  return {
    name: "CHA₂DS₂-VASc",
    score,
    maxScore: 9,
    severity: riskCategory,
    recommendation:
      score === 0 ? "Low risk — no antithrombotic therapy required" :
      score === 1 ? "Consider anticoagulation based on clinical judgment" :
      "Anticoagulation therapy recommended — cardiology referral advised",
    factors,
    applicable: text.includes("palpitation") || text.includes("afib") || text.includes("atrial fibrillation") || text.includes("irregular heartbeat"),
    color: score <= 1 ? "#00d4aa" : score <= 3 ? "#ffb347" : "#ff4757",
  };
}

/**
 * NEWS2 Simplified Estimation
 * National Early Warning Score — estimated from conversational data
 * (Cannot get exact vitals — estimates based on symptoms)
 */
export function calculateNEWS2Estimated(patientData) {
  const { age, symptoms = [], chiefComplaint = "", hpiNarrative = "", redFlags = [] } = patientData;
  const text = `${chiefComplaint} ${hpiNarrative} ${symptoms.join(" ")}`.toLowerCase();

  let score = 0;
  const factors = [];

  // Respiratory distress → RR >20 (estimated)
  if (text.includes("breathless") || text.includes("difficulty breathing") || text.includes("shortness of breath")) {
    score += 2;
    factors.push({ name: "Respiratory distress (RR likely elevated)", points: 2 });
  }

  // O2 saturation concern (if mentioned SpO2 issues)
  if (text.includes("oxygen") || text.includes("bluish") || text.includes("cyanosis") || text.includes("desaturation")) {
    score += 3;
    factors.push({ name: "Possible oxygen desaturation", points: 3 });
  }

  // Hypotension / shock signs
  if (text.includes("faint") || text.includes("dizziness") || text.includes("weak") || text.includes("low bp")) {
    score += 2;
    factors.push({ name: "Possible hypotension / cardiovascular compromise", points: 2 });
  }

  // Altered consciousness
  if (text.includes("confusion") || text.includes("disoriented") || text.includes("drowsy") || text.includes("unconscious")) {
    score += 3;
    factors.push({ name: "Altered consciousness (AVPU scale concern)", points: 3 });
  }

  // Red flags already detected
  if (redFlags && redFlags.length > 0) {
    score += 2;
    factors.push({ name: `${redFlags.length} red flag(s) detected during interview`, points: 2 });
  }

  // High temperature / fever
  if (text.includes("high fever") || text.includes("104") || text.includes("103") || text.includes("very high temperature")) {
    score += 1;
    factors.push({ name: "High fever (temperature likely >38.5°C)", points: 1 });
  }

  // Cap at reasonable estimate
  score = Math.min(score, 12);

  const riskLevel =
    score === 0 ? "Low" :
    score <= 4 ? "Low-Medium" :
    score <= 6 ? "Medium" :
    "High";

  return {
    name: "NEWS2 (Estimated)",
    score,
    maxScore: 12,
    severity: riskLevel,
    recommendation:
      score === 0 ? "Standard monitoring — routine assessment" :
      score <= 4 ? "Increased monitoring frequency recommended" :
      score <= 6 ? "Urgent clinical review required — alert senior staff" :
      "EMERGENCY — continuous monitoring, senior review, possible ICU",
    factors,
    applicable: true,
    color: score === 0 ? "#00d4aa" : score <= 4 ? "#ffb347" : "#ff4757",
    note: "Estimated from conversational data — confirm with actual vitals",
  };
}

/**
 * Composite MediKiosk Triage Score (0-100)
 * Combines all applicable scores + red flags into a single triage number
 */
export function calculateCompositeTriageScore(patientData) {
  const scores = [
    calculateCURB65(patientData),
    calculateWellsScore(patientData),
    calculateCHADS2VASc(patientData),
    calculateNEWS2Estimated(patientData),
  ];

  const applicableScores = scores.filter((s) => s.applicable);
  const news2 = scores.find((s) => s.name === "NEWS2 (Estimated)");

  // Base score from NEWS2 (most general)
  let composite = news2 ? (news2.score / news2.maxScore) * 50 : 0;

  // Add contributions from other applicable scores
  applicableScores.forEach((s) => {
    if (s.name !== "NEWS2 (Estimated)") {
      composite += (s.score / s.maxScore) * 15;
    }
  });

  // Red flag bonus
  const redFlags = patientData.redFlags || [];
  composite += redFlags.length * 10;

  composite = Math.min(Math.round(composite), 100);

  const triageLevel =
    composite < 20 ? "Routine" :
    composite < 45 ? "Priority" :
    composite < 70 ? "Urgent" :
    "Emergency";

  const triageColor =
    composite < 20 ? "#00d4aa" :
    composite < 45 ? "#4db8ff" :
    composite < 70 ? "#ffb347" :
    "#ff4757";

  return {
    composite,
    triageLevel,
    triageColor,
    applicableScores,
    allScores: scores,
    redFlagCount: redFlags.length,
  };
}

/**
 * Extract patient data object from MediKiosk session for scoring
 */
export function extractPatientDataForScoring(session) {
  const s = session?.summary?.summary;
  const extracted = session?.extractedHistory || {};

  return {
    age: session?.patient?.age,
    gender: session?.patient?.gender,
    chiefComplaint: s?.chiefComplaint || extracted.chiefComplaint || "",
    hpiNarrative: s?.hpiNarrative || "",
    symptoms: s?.reviewOfSystems?.positive || [],
    pastConditions: s?.pastMedicalHistory?.conditions || [],
    redFlags: session?.redFlags || [],
  };
}

/**
 * Extract scoring data from physician demo patient
 */
export function extractFromPhysicianPatient(patient) {
  const s = patient.summary;
  return {
    age: patient.age,
    gender: patient.gender === "F" ? "female" : "male",
    chiefComplaint: s?.chiefComplaint || patient.chiefComplaint || "",
    hpiNarrative: s?.hpi || "",
    symptoms: [],
    pastConditions: s?.pastHistory ? [s.pastHistory] : [],
    redFlags: patient.priority === "emergency" ? [{ reason: "Emergency priority" }] : [],
  };
}
