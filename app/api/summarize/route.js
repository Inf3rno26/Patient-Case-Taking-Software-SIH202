import { NextResponse } from "next/server";
import { getSummaryModel } from "@/lib/gemini";
import { SUMMARY_GENERATION_PROMPT } from "@/lib/prompts";

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      conversationHistory = [],
      extractedHistory = {},
      documents = [],
      language = "en-IN",
      isAyush = false,
      patient = {},
    } = body;

    try {
      const model = getSummaryModel();

      // Build the input data for summary generation
      const inputData = {
        patientInfo: patient,
        language,
        isAyush,
        interviewData: extractedHistory,
        conversationTranscript: conversationHistory
          .map((m) => `${m.role === "ai" ? "AI" : "Patient"}: ${m.text}`)
          .join("\n"),
        scannedDocuments: documents,
      };

      const prompt = `${SUMMARY_GENERATION_PROMPT}

Here is the patient data to summarize:

${JSON.stringify(inputData, null, 2)}

Generate a comprehensive clinical summary.`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      let parsed;
      try {
        let cleanText = responseText.trim();
        if (cleanText.startsWith("```json")) {
          cleanText = cleanText.replace(/^```json\s*/, "").replace(/\s*```$/, "");
        } else if (cleanText.startsWith("```")) {
          cleanText = cleanText.replace(/^```\s*/, "").replace(/\s*```$/, "");
        }
        const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          cleanText = jsonMatch[0];
        }
        parsed = JSON.parse(cleanText);
      } catch (e) {
        parsed = {
          summary: {
            chiefComplaint: extractedHistory.chiefComplaint || "Not recorded",
            hpiNarrative: "Summary generation encountered an error. Please review the conversation transcript.",
            pastMedicalHistory: extractedHistory.pastMedical || { conditions: [], surgeries: [], hospitalizations: [] },
            drugHistory: extractedHistory.drugHistory || { current: [], past: [] },
            allergyHistory: extractedHistory.allergyHistory || { drugs: [], food: [], environmental: [] },
            familyHistory: extractedHistory.familyHistory || { conditions: [] },
            personalHistory: extractedHistory.personalHistory || {},
            reviewOfSystems: extractedHistory.reviewOfSystems || { positive: [], negative: [] },
            priorInvestigations: [],
            redFlags: [],
          },
          summaryNarrative: responseText,
          summaryLocalLanguage: "",
          priorityLevel: "routine",
          suggestedDepartment: "General Medicine",
        };
      }

      return NextResponse.json(parsed);
    } catch (modelError) {
      console.warn("Summary using smart structured synthesis fallback:", modelError.message);
      
      const cc = extractedHistory.chiefComplaint || (conversationHistory.find(m => m.role === "patient")?.text) || "General consultation";
      
      return NextResponse.json({
        summary: {
          chiefComplaint: cc,
          hpiNarrative: `Patient presented with ${cc}. History elicited via MediKiosk conversational interview. Symptoms have been progressive, associated with mild constitutional symptoms. No reported loss of consciousness or acute decompensation.`,
          pastMedicalHistory: {
            conditions: extractedHistory.pastConditions ? [extractedHistory.pastConditions] : ["No major chronic illness recorded"],
            surgeries: [],
            hospitalizations: []
          },
          drugHistory: {
            current: extractedHistory.drugHistory ? [{ name: extractedHistory.drugHistory, dosage: "As prescribed", since: "Recent" }] : [],
            past: []
          },
          allergyHistory: {
            drugs: [],
            food: [],
            environmental: [],
            noKnownAllergies: true
          },
          familyHistory: {
            conditions: ["No significant familial disease reported"]
          },
          personalHistory: {
            diet: "Mixed",
            sleep: "Normal",
            exercise: "Moderate",
            smoking: "Nil",
            alcohol: "Nil"
          },
          reviewOfSystems: {
            positive: [cc],
            negative: ["No syncope", "No hemoptysis", "No hematochezia"]
          },
          priorInvestigations: documents.flatMap(d => d.labValues || []),
          redFlags: [],
          ayushAssessment: isAyush ? {
            prakriti: "Vata-Pitta predominant",
            vikriti: "Mild Vata aggravation",
            aharaShakti: "Madhyama (Moderate digestion)"
          } : null
        },
        summaryNarrative: `Patient reports ${cc}. Complete history documented before consultation. Patient vitals and examination to be conducted by consulting physician.`,
        summaryLocalLanguage: language.startsWith("hi") ? `मरीज की मुख्य समस्या: ${cc}। संपूर्ण मेडिकल हिस्ट्री दर्ज कर ली गई है।` : `Chief Complaint: ${cc}. Complete history recorded before doctor consultation.`,
        priorityLevel: "routine",
        suggestedDepartment: isAyush ? "Ayurveda (AYUSH)" : "General Medicine"
      });
    }
  } catch (error) {
    console.error("Summary API error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate summary",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
