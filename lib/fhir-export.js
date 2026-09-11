/**
 * MediKiosk — HL7 FHIR R4 Bundle Export
 * Converts a MediKiosk session into a standards-compliant FHIR R4 Bundle
 * Spec: https://hl7.org/fhir/R4/bundle.html
 */

const FHIR_VERSION = "4.0.1";
const SYSTEM_BASE = "https://medikiosk.gov.in/fhir";

function uuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function nowISO() {
  return new Date().toISOString();
}

/**
 * Build Patient resource
 */
function buildPatientResource(patient, sessionId) {
  const patientId = uuid();
  return {
    id: patientId,
    resource: {
      resourceType: "Patient",
      id: patientId,
      meta: {
        profile: ["http://hl7.org/fhir/StructureDefinition/Patient"],
        lastUpdated: nowISO(),
      },
      identifier: [
        {
          system: `${SYSTEM_BASE}/patient-id`,
          value: sessionId || "MK-UNKNOWN",
        },
        ...(patient.abhaId
          ? [
              {
                system: "https://healthid.ndhm.gov.in",
                value: patient.abhaId,
              },
            ]
          : []),
      ],
      name: [
        {
          use: "official",
          text: patient.name || "Unknown",
          family: patient.name?.split(" ").slice(-1)[0] || "",
          given: [patient.name?.split(" ")[0] || ""],
        },
      ],
      telecom: [
        ...(patient.phone ? [{ system: "phone", value: patient.phone, use: "mobile" }] : []),
        ...(patient.email ? [{ system: "email", value: patient.email, use: "home" }] : []),
      ],
      gender:
        patient.gender === "male"
          ? "male"
          : patient.gender === "female"
          ? "female"
          : "other",
      birthDate: patient.age
        ? `${new Date().getFullYear() - parseInt(patient.age)}-01-01`
        : undefined,
      address: patient.address
        ? [{ text: patient.address, country: "IN" }]
        : [],
      extension: [
        {
          url: "http://hl7.org/fhir/StructureDefinition/patient-nationality",
          valueCodeableConcept: {
            coding: [{ system: "urn:iso:std:iso:3166", code: "IN" }],
          },
        },
      ],
    },
  };
}

/**
 * Build Condition resources (chief complaint + past conditions)
 */
function buildConditionResources(summary, patientRef) {
  const conditions = [];

  // Chief complaint
  if (summary?.chiefComplaint) {
    const id = uuid();
    conditions.push({
      id,
      resource: {
        resourceType: "Condition",
        id,
        meta: { lastUpdated: nowISO() },
        clinicalStatus: {
          coding: [
            {
              system: "http://terminology.hl7.org/CodeSystem/condition-clinical",
              code: "active",
            },
          ],
        },
        category: [
          {
            coding: [
              {
                system: "http://terminology.hl7.org/CodeSystem/condition-category",
                code: "encounter-diagnosis",
                display: "Encounter Diagnosis",
              },
            ],
          },
        ],
        code: {
          text: summary.chiefComplaint,
        },
        subject: { reference: patientRef },
        recordedDate: nowISO(),
        note: summary.hpiNarrative
          ? [{ text: summary.hpiNarrative }]
          : [],
      },
    });
  }

  // Past medical conditions
  const pastConditions =
    summary?.pastMedicalHistory?.conditions || [];
  pastConditions.forEach((condition) => {
    const id = uuid();
    conditions.push({
      id,
      resource: {
        resourceType: "Condition",
        id,
        clinicalStatus: {
          coding: [
            {
              system: "http://terminology.hl7.org/CodeSystem/condition-clinical",
              code: "active",
            },
          ],
        },
        category: [
          {
            coding: [
              {
                system: "http://terminology.hl7.org/CodeSystem/condition-category",
                code: "problem-list-item",
                display: "Problem List Item",
              },
            ],
          },
        ],
        code: { text: condition },
        subject: { reference: patientRef },
        recordedDate: nowISO(),
      },
    });
  });

  return conditions;
}

/**
 * Build MedicationStatement resources
 */
function buildMedicationResources(summary, patientRef) {
  const meds = summary?.drugHistory?.current || [];
  return meds.map((med) => {
    const id = uuid();
    const medName = typeof med === "string" ? med : `${med.name || ""} ${med.dosage || ""}`.trim();
    return {
      id,
      resource: {
        resourceType: "MedicationStatement",
        id,
        meta: { lastUpdated: nowISO() },
        status: "active",
        medicationCodeableConcept: { text: medName },
        subject: { reference: patientRef },
        dateAsserted: nowISO(),
        dosage: typeof med === "object" && med.dosage
          ? [{ text: `${med.dosage} ${med.frequency || ""}`.trim() }]
          : [],
      },
    };
  });
}

/**
 * Build AllergyIntolerance resources
 */
function buildAllergyResources(summary, patientRef) {
  const allergyHistory = summary?.allergyHistory;
  if (!allergyHistory) return [];

  if (allergyHistory.noKnownAllergies) {
    const id = uuid();
    return [
      {
        id,
        resource: {
          resourceType: "AllergyIntolerance",
          id,
          clinicalStatus: {
            coding: [
              {
                system: "http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical",
                code: "active",
              },
            ],
          },
          code: {
            coding: [
              {
                system: "http://terminology.hl7.org/CodeSystem/v3-NullFlavor",
                code: "NKDA",
                display: "No Known Drug Allergies",
              },
            ],
          },
          patient: { reference: patientRef },
          recordedDate: nowISO(),
        },
      },
    ];
  }

  const allAllergies = [
    ...(allergyHistory.drugs || []),
    ...(allergyHistory.food || []),
    ...(allergyHistory.environmental || []),
  ];

  return allAllergies.map((allergen) => {
    const id = uuid();
    return {
      id,
      resource: {
        resourceType: "AllergyIntolerance",
        id,
        clinicalStatus: {
          coding: [
            {
              system: "http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical",
              code: "active",
            },
          ],
        },
        category: ["medication"],
        code: { text: allergen },
        patient: { reference: patientRef },
        recordedDate: nowISO(),
      },
    };
  });
}

/**
 * Build FamilyMemberHistory resource
 */
function buildFamilyHistoryResources(summary, patientRef) {
  const conditions = summary?.familyHistory?.conditions || [];
  return conditions.map((cond) => {
    const id = uuid();
    return {
      id,
      resource: {
        resourceType: "FamilyMemberHistory",
        id,
        status: "completed",
        patient: { reference: patientRef },
        relationship: {
          coding: [
            {
              system: "http://terminology.hl7.org/CodeSystem/v3-RoleCode",
              code: "FAMMEMB",
              display: "Family Member",
            },
          ],
        },
        condition: [{ code: { text: cond } }],
        note: [{ text: cond }],
      },
    };
  });
}

/**
 * Build Observation resources for ROS / social history
 */
function buildObservationResources(summary, patientRef) {
  const observations = [];
  const personal = summary?.personalHistory || {};

  const smokingStatus =
    personal.smoking ||
    (personal.tobacco === "never" ? "Never smoker" : null);
  if (smokingStatus) {
    const id = uuid();
    observations.push({
      id,
      resource: {
        resourceType: "Observation",
        id,
        status: "final",
        category: [
          {
            coding: [
              {
                system: "http://terminology.hl7.org/CodeSystem/observation-category",
                code: "social-history",
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              system: "http://loinc.org",
              code: "72166-2",
              display: "Tobacco smoking status NHIS",
            },
          ],
        },
        subject: { reference: patientRef },
        valueString: smokingStatus,
        effectiveDateTime: nowISO(),
      },
    });
  }

  // Prior investigations as Observations
  const investigations = summary?.priorInvestigations || [];
  investigations.forEach((inv) => {
    const id = uuid();
    observations.push({
      id,
      resource: {
        resourceType: "Observation",
        id,
        status: "final",
        category: [
          {
            coding: [
              {
                system: "http://terminology.hl7.org/CodeSystem/observation-category",
                code: "laboratory",
              },
            ],
          },
        ],
        code: { text: inv.test },
        subject: { reference: patientRef },
        valueString: `${inv.value}${inv.unit ? " " + inv.unit : ""}`,
        effectiveDateTime: inv.date || nowISO(),
        interpretation: inv.isAbnormal
          ? [
              {
                coding: [
                  {
                    system: "http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation",
                    code: "A",
                    display: "Abnormal",
                  },
                ],
              },
            ]
          : [],
      },
    });
  });

  return observations;
}

/**
 * Build Composition resource (the clinical document header)
 */
function buildCompositionResource(patientRef, sessionId, summary, sectionRefs) {
  const id = uuid();
  return {
    id,
    resource: {
      resourceType: "Composition",
      id,
      meta: {
        profile: ["http://hl7.org/fhir/StructureDefinition/Composition"],
        lastUpdated: nowISO(),
      },
      status: "final",
      type: {
        coding: [
          {
            system: "http://loinc.org",
            code: "34117-2",
            display: "History and physical note",
          },
        ],
        text: "Clinical History — MediKiosk",
      },
      subject: { reference: patientRef },
      date: nowISO(),
      author: [
        {
          display: "MediKiosk AI — Autonomous Clinical History System",
          reference: `${SYSTEM_BASE}/Device/medikiosk-ai-v1`,
        },
      ],
      title: "MediKiosk AI Clinical History Summary",
      confidentiality: "N",
      attester: [
        {
          mode: "professional",
          time: nowISO(),
          party: { display: "AI-generated — Pending Physician Verification" },
        },
      ],
      section: [
        {
          title: "Chief Complaint",
          code: { coding: [{ system: "http://loinc.org", code: "46239-0" }] },
          text: {
            status: "generated",
            div: `<div xmlns="http://www.w3.org/1999/xhtml">${summary?.chiefComplaint || "Not recorded"}</div>`,
          },
        },
        {
          title: "History of Present Illness",
          code: { coding: [{ system: "http://loinc.org", code: "10164-2" }] },
          text: {
            status: "generated",
            div: `<div xmlns="http://www.w3.org/1999/xhtml">${summary?.hpiNarrative || "Not recorded"}</div>`,
          },
        },
        {
          title: "Clinical Summary Narrative",
          code: { coding: [{ system: "http://loinc.org", code: "34117-2" }] },
          text: {
            status: "generated",
            div: `<div xmlns="http://www.w3.org/1999/xhtml">${sectionRefs.narrative || "AI-generated clinical summary"}</div>`,
          },
        },
      ],
    },
  };
}

/**
 * Main export function — generates a complete FHIR R4 Bundle
 * @param {Object} session - MediKiosk session object
 * @returns {Object} FHIR R4 Bundle JSON
 */
export function exportToFHIR(session) {
  const bundleId = uuid();
  const { patient = {}, summary: sessionSummary, id: sessionId } = session || {};
  const s = sessionSummary?.summary;

  // Build Patient
  const patientEntry = buildPatientResource(patient, sessionId);
  const patientRef = `Patient/${patientEntry.id}`;

  // Build all resource entries
  const conditionEntries = buildConditionResources(s, patientRef);
  const medicationEntries = buildMedicationResources(s, patientRef);
  const allergyEntries = buildAllergyResources(s, patientRef);
  const familyHistoryEntries = buildFamilyHistoryResources(s, patientRef);
  const observationEntries = buildObservationResources(s, patientRef);

  // Build Composition
  const compositionEntry = buildCompositionResource(
    patientRef,
    sessionId,
    s,
    { narrative: sessionSummary?.summaryNarrative }
  );

  const allEntries = [
    compositionEntry,
    patientEntry,
    ...conditionEntries,
    ...medicationEntries,
    ...allergyEntries,
    ...familyHistoryEntries,
    ...observationEntries,
  ];

  // Wrap in FHIR Bundle
  const bundle = {
    resourceType: "Bundle",
    id: bundleId,
    meta: {
      lastUpdated: nowISO(),
      profile: ["http://hl7.org/fhir/StructureDefinition/Bundle"],
      tag: [
        {
          system: `${SYSTEM_BASE}/tags`,
          code: "medikiosk-generated",
          display: "Generated by MediKiosk AI",
        },
      ],
    },
    identifier: {
      system: `${SYSTEM_BASE}/bundle-id`,
      value: bundleId,
    },
    type: "document",
    timestamp: nowISO(),
    total: allEntries.length,
    entry: allEntries.map((entry) => ({
      fullUrl: `${SYSTEM_BASE}/${entry.resource.resourceType}/${entry.id}`,
      resource: entry.resource,
      request: {
        method: "PUT",
        url: `${entry.resource.resourceType}/${entry.id}`,
      },
    })),
    // FHIR version tag
    _fhirVersion: FHIR_VERSION,
  };

  return bundle;
}

/**
 * Download FHIR bundle as a JSON file
 */
export function downloadFHIRBundle(session, filename) {
  const bundle = exportToFHIR(session);
  const json = JSON.stringify(bundle, null, 2);
  const blob = new Blob([json], { type: "application/fhir+json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || `medikiosk-fhir-${session?.patient?.name?.replace(/\s+/g, "-") || "patient"}-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return bundle;
}
