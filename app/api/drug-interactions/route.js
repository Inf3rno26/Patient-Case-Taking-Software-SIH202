import { NextResponse } from "next/server";
import { getConversationModel } from "@/lib/gemini";

export async function POST(request) {
  try {
    const body = await request.json();
    const { medications = [] } = body;

    if (!medications || medications.length < 2) {
      return NextResponse.json({
        interactions: [],
        safe: true,
        checkedAt: new Date().toISOString(),
        message: "Less than 2 medications — no interaction check needed",
      });
    }

    const medList = medications
      .map((m, i) =>
        typeof m === "string" ? m : `${m.name || "Unknown"} ${m.dosage || ""}`.trim()
      )
      .join(", ");

    try {
      const model = getConversationModel();

      const prompt = `You are a clinical pharmacology AI. Analyze the following medication list for drug-drug interactions. Be precise and clinically relevant.

MEDICATIONS: ${medList}

For each significant interaction found, classify severity as:
- SEVERE: Contraindicated / avoid combination (life-threatening)
- MODERATE: Use with caution / monitor closely
- MILD: Minor interaction / generally safe

Respond ONLY in this exact JSON format:
{
  "interactions": [
    {
      "drug1": "Drug name 1",
      "drug2": "Drug name 2",
      "severity": "SEVERE|MODERATE|MILD",
      "mechanism": "Brief pharmacological mechanism",
      "effect": "Clinical effect / what can happen",
      "management": "What to do — monitor, adjust dose, avoid, alternative",
      "clinicalSignificance": "Brief 1-sentence clinical note"
    }
  ],
  "safe": true or false (false if any SEVERE or MODERATE interactions),
  "overallRisk": "LOW|MODERATE|HIGH",
  "summary": "One sentence overall assessment",
  "disclaimer": "AI-generated — verify with clinical pharmacist"
}

If no significant interactions found, return empty interactions array with safe: true.
Only include clinically meaningful interactions — skip trivial ones.`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();

      let parsed;
      try {
        // Extract JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text);
      } catch {
        parsed = {
          interactions: [],
          safe: true,
          overallRisk: "LOW",
          summary: "Unable to parse interaction data — manual verification recommended",
          disclaimer: "AI-generated — verify with clinical pharmacist",
        };
      }

      return NextResponse.json({
        ...parsed,
        checkedAt: new Date().toISOString(),
        medicationsChecked: medications,
      });
    } catch (modelError) {
      console.warn("Drug interaction check using fallback:", modelError.message);
      
      // Smart fallback — known high-priority interactions
      const interactions = generateFallbackInteractions(medications);
      return NextResponse.json({
        interactions,
        safe: interactions.filter(i => i.severity === "SEVERE" || i.severity === "MODERATE").length === 0,
        overallRisk: interactions.length === 0 ? "LOW" : interactions.some(i => i.severity === "SEVERE") ? "HIGH" : "MODERATE",
        summary: interactions.length === 0
          ? "No major known interactions detected in offline mode"
          : `${interactions.length} potential interaction(s) identified — verify with pharmacist`,
        disclaimer: "Offline mode — limited interaction database. Always verify with clinical pharmacist.",
        checkedAt: new Date().toISOString(),
        medicationsChecked: medications,
        offlineMode: true,
      });
    }
  } catch (error) {
    console.error("Drug interaction API error:", error);
    return NextResponse.json(
      { error: "Interaction check failed", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Fallback interaction database for common Indian OPD medications
 */
function generateFallbackInteractions(medications) {
  const medNames = medications.map(m =>
    (typeof m === "string" ? m : m.name || "").toLowerCase()
  );

  const KNOWN_INTERACTIONS = [
    {
      drug1Pattern: /warfarin|acitrom/,
      drug2Pattern: /aspirin|ecosprin|ibuprofen|nsaid|diclofenac/,
      severity: "SEVERE",
      effect: "Significantly increased bleeding risk",
      mechanism: "Additive anticoagulant + antiplatelet effect",
      management: "Avoid combination if possible; if necessary, monitor INR closely and watch for bleeding signs",
    },
    {
      drug1Pattern: /metformin/,
      drug2Pattern: /contrast|iodine|biguanide/,
      severity: "MODERATE",
      effect: "Risk of lactic acidosis with iodine contrast",
      mechanism: "Metformin accumulation due to contrast-induced nephropathy",
      management: "Hold metformin 48h before and after contrast administration",
    },
    {
      drug1Pattern: /amlodipine|nifedipine|diltiazem|verapamil/,
      drug2Pattern: /simvastatin|atorvastatin/,
      severity: "MODERATE",
      effect: "Increased statin plasma levels — myopathy risk",
      mechanism: "CYP3A4 inhibition by calcium channel blocker",
      management: "Limit simvastatin to 20mg/day; prefer rosuvastatin/pravastatin",
    },
    {
      drug1Pattern: /ssri|fluoxetine|sertraline|escitalopram|paroxetine/,
      drug2Pattern: /tramadol|tramacip/,
      severity: "SEVERE",
      effect: "Serotonin syndrome — potentially fatal",
      mechanism: "Additive serotonergic effect",
      management: "Contraindicated combination — use alternative analgesic (e.g., paracetamol)",
    },
    {
      drug1Pattern: /ace inhibitor|ramipril|enalapril|lisinopril|captopril/,
      drug2Pattern: /potassium|k-lor|spirono|spironolactone/,
      severity: "MODERATE",
      effect: "Hyperkalemia — dangerous cardiac arrhythmia risk",
      mechanism: "Additive potassium retention",
      management: "Monitor serum potassium regularly; avoid in renal impairment",
    },
    {
      drug1Pattern: /sildenafil|tadalafil|vardenafil/,
      drug2Pattern: /nitrate|isosorbide|nitroglycerine|sorbitrate/,
      severity: "SEVERE",
      effect: "Severe hypotension — potentially fatal",
      mechanism: "Additive vasodilation through different pathways",
      management: "Absolutely contraindicated — do not co-administer under any circumstances",
    },
    {
      drug1Pattern: /ciprofloxacin|levofloxacin|ofloxacin/,
      drug2Pattern: /antacid|aluminum|magnesium|sucralfate/,
      severity: "MODERATE",
      effect: "Reduced antibiotic absorption — treatment failure",
      mechanism: "Chelation of quinolone by divalent cations",
      management: "Separate administration by at least 2 hours",
    },
    {
      drug1Pattern: /methotrexate/,
      drug2Pattern: /ibuprofen|diclofenac|nsaid|aspirin/,
      severity: "SEVERE",
      effect: "Methotrexate toxicity — bone marrow suppression, hepatotoxicity",
      mechanism: "NSAIDs reduce methotrexate renal excretion",
      management: "Avoid combination; if essential use paracetamol with close monitoring",
    },
  ];

  const found = [];

  KNOWN_INTERACTIONS.forEach(({ drug1Pattern, drug2Pattern, severity, effect, mechanism, management }) => {
    const drug1Match = medNames.find(m => drug1Pattern.test(m));
    const drug2Match = medNames.find(m => drug2Pattern.test(m));

    if (drug1Match && drug2Match && drug1Match !== drug2Match) {
      found.push({
        drug1: drug1Match,
        drug2: drug2Match,
        severity,
        mechanism,
        effect,
        management,
        clinicalSignificance: `${severity} interaction — ${effect.toLowerCase()}`,
      });
    }
  });

  return found;
}
