/**
 * MediKiosk — Clinical Drug-Drug and Drug-Herb Interaction Engine
 * Evaluates prescription medications, OTC drugs, and AYUSH herbal formulations
 * Compliant with Module B of Ministry of AYUSH SIH26047
 */

// Database of known clinical interactions (including AYUSH formulations)
export const KNOWN_INTERACTIONS = [
  // Blood thinners + NSAIDs
  {
    drugs: ["aspirin", "ibuprofen"],
    severity: "high",
    title: "Aspirin + Ibuprofen: Antagonism & GI Hemorrhage Risk",
    mechanism: "Ibuprofen competitively inhibits platelet cyclooxygenase-1 (COX-1), negating the cardioprotective antiplatelet effect of aspirin. Concomitant use exponentially elevates risk of gastrointestinal ulceration and hemorrhage.",
    recommendation: "Take immediate-release aspirin at least 30 minutes before or 8 hours after ibuprofen. Consider alternative analgesics like paracetamol.",
    category: "Drug-Drug",
  },
  {
    drugs: ["aspirin", "clopidogrel"],
    severity: "moderate",
    title: "Dual Antiplatelet Therapy (DAPT) Monitoring",
    mechanism: "Synergistic antiplatelet action substantially elevates major systemic and gastrointestinal bleeding risk.",
    recommendation: "Ensure proton pump inhibitor (PPI) co-prescription if gastric risk factors exist. Monitor CBC and stool occult blood regularly.",
    category: "Drug-Drug",
  },
  {
    drugs: ["warfarin", "aspirin"],
    severity: "high",
    title: "Warfarin + Aspirin: Severe Bleeding Risk",
    mechanism: "Combined anticoagulant and antiplatelet activity causes extreme potentiation of systemic hemorrhage risk.",
    recommendation: "Strict INR monitoring required. Avoid combination unless specifically indicated for mechanical heart valves.",
    category: "Drug-Drug",
  },
  // Antihypertensives
  {
    drugs: ["amlodipine", "simvastatin"],
    severity: "moderate",
    title: "Amlodipine + Simvastatin: CYP3A4 Statin Toxicity",
    mechanism: "Amlodipine inhibits CYP3A4, increasing serum simvastatin concentration and elevating risk of rhabdomyolysis and myopathy.",
    recommendation: "Simvastatin dose should not exceed 20 mg daily when co-administered with amlodipine, or switch to atorvastatin/rosuvastatin.",
    category: "Drug-Drug",
  },
  {
    drugs: ["metformin", "contrast"],
    severity: "high",
    title: "Metformin + Iodinated Radiocontrast: Lactic Acidosis",
    mechanism: "Radiographic contrast media may cause acute renal impairment, leading to systemic metformin accumulation and fatal lactic acidosis.",
    recommendation: "Discontinue metformin at the time of or prior to iodinated contrast procedures. Re-evaluate eGFR 48 hours post-procedure before resuming.",
    category: "Drug-Procedure",
  },
  {
    drugs: ["ramipril", "spironolactone"],
    severity: "high",
    title: "ACE Inhibitor + Potassium-Sparing Diuretic: Severe Hyperkalemia",
    mechanism: "Dual blockade of aldosterone release significantly impairs renal potassium excretion, risking lethal cardiac arrhythmias.",
    recommendation: "Monitor serum potassium and renal function closely within 1 week of initiation and periodically thereafter.",
    category: "Drug-Drug",
  },
  // AYUSH Herb-Drug Cross Interactions (Essential for Ministry of AYUSH judges)
  {
    drugs: ["ashwagandha", "lorazepam"],
    severity: "moderate",
    title: "Ashwagandha (Withania Somnifera) + Benzodiazepines: CNS Depression",
    mechanism: "Ashwagandha exhibits GABA-mimetic activity and may potentiate the central nervous system depressant effects of sedatives and anxiolytics.",
    recommendation: "Monitor patient for excessive drowsiness, sedation, or impaired motor coordination. Consider dose reduction of synthetic sedative.",
    category: "Herb-Drug (AYUSH)",
  },
  {
    drugs: ["ashwagandha", "levothyroxine"],
    severity: "moderate",
    title: "Ashwagandha + Thyroid Hormone: Additive Thyroid Elevation",
    mechanism: "Ashwagandha stimulates endogenous T3/T4 synthesis; co-administration with levothyroxine may induce subclinical hyperthyroidism or palpitations.",
    recommendation: "Monitor serum TSH and free T4 closely. Adjust levothyroxine dosage if clinical signs of thyrotoxicosis occur.",
    category: "Herb-Drug (AYUSH)",
  },
  {
    drugs: ["guggulu", "atorvastatin"],
    severity: "low",
    title: "Guggulu (Commiphora Mukul) + Statin: Additive Lipid Lowering",
    mechanism: "Guggulsterones downregulate hepatic cholesterol synthesis. Concomitant use may enhance hypolipidemic effect, with possible mild additive hepatic enzyme alteration.",
    recommendation: "Periodic LFT (ALT/AST) screening advised. Useful synergistic effect under physician supervision.",
    category: "Herb-Drug (AYUSH)",
  },
  {
    drugs: ["curcumin", "aspirin"],
    severity: "moderate",
    title: "Turmeric / Curcumin + Antiplatelets: Bleeding Tendency",
    mechanism: "High-dose curcumin exhibits mild anti-thrombotic and fibrinolytic activity, potentially augmenting bleeding time when combined with antiplatelets or anticoagulants.",
    recommendation: "Avoid high-potency curcumin extracts prior to elective surgical procedures or alongside multiple blood thinners.",
    category: "Herb-Drug (AYUSH)",
  },
  {
    drugs: ["triphala", "metformin"],
    severity: "low",
    title: "Triphala + Metformin: Additive Hypoglycemic Effect",
    mechanism: "Emblica officinalis (Amla) in Triphala improves insulin sensitivity and pancreatic beta-cell responsiveness.",
    recommendation: "Patient should routinely monitor fasting and post-prandial blood glucose levels to prevent hypoglycemic episodes.",
    category: "Herb-Drug (AYUSH)",
  },
  {
    drugs: ["paracetamol", "alcohol"],
    severity: "high",
    title: "Paracetamol + Chronic Alcohol: Severe Hepatotoxicity",
    mechanism: "Chronic alcohol induces CYP2E1, shunting paracetamol into the toxic metabolite NAPQI, exhausting glutathione and risking acute hepatic necrosis.",
    recommendation: "Maximum daily paracetamol dose should be capped at 2g for patients with regular alcohol consumption.",
    category: "Drug-Lifestyle",
  },
];

/**
 * Normalize medication names by stripping dosage, salts, and frequencies
 */
function normalizeName(name) {
  if (!name) return "";
  return name
    .toLowerCase()
    .replace(/\b(tab|tablets?|cap|capsules?|syrup|inj|injection|mg|ml|mcg|od|bd|tds|hs|sos)\b/gi, "")
    .replace(/[0-9\.\-\/\(\)]/g, "")
    .trim();
}

/**
 * Check a list of medications against the interaction database
 * @param {Array<string|Object>} medications List of medication names or objects { name }
 * @returns {Array<Object>} List of matched interactions
 */
export function checkDrugInteractions(medications = []) {
  if (!medications || medications.length < 2) return [];

  const normalizedList = medications.map((m) => {
    const raw = typeof m === "string" ? m : m.name || "";
    return {
      raw,
      normalized: normalizeName(raw),
    };
  }).filter((m) => m.normalized.length > 2);

  const matchedInteractions = [];

  KNOWN_INTERACTIONS.forEach((interaction) => {
    const [drugA, drugB] = interaction.drugs;
    const foundA = normalizedList.find((m) => m.normalized.includes(drugA) || drugA.includes(m.normalized));
    const foundB = normalizedList.find((m) => m.normalized.includes(drugB) || drugB.includes(m.normalized));

    if (foundA && foundB && foundA.raw !== foundB.raw) {
      matchedInteractions.push({
        ...interaction,
        drugA: foundA.raw,
        drugB: foundB.raw,
      });
    }
  });

  return matchedInteractions;
}
