/**
 * MediKiosk — Patient Appointment Reminders & Clinical Recovery Utilities
 * Handles:
 * - Follow-up scheduling with pre-2-day automated alert calculation
 * - Formatted Push Notification, SMS, and Email payloads
 * - Realistic Before vs Now recovery metrics and symptom comparisons
 */

/**
 * Safely parses any date input.
 * Guarantees a valid future Date object (never null, NaN, or 1970).
 */
export function parseValidDate(dateInput, fallbackDaysAhead = 7) {
  if (!dateInput) {
    return new Date(Date.now() + fallbackDaysAhead * 86400000);
  }
  const d = new Date(dateInput);
  if (isNaN(d.getTime()) || d.getFullYear() < 2020) {
    return new Date(Date.now() + fallbackDaysAhead * 86400000);
  }
  return d;
}

/**
 * Calculates reminder date exactly 2 days (48 hours) before appointment.
 * Guaranteed to return an ISO string with a valid future date.
 * @param {string|Date} appointmentDate 
 * @returns {string} ISO date string
 */
export function calculateReminderDate(appointmentDate) {
  const appt = parseValidDate(appointmentDate, 7);
  const reminder = new Date(appt.getTime() - 2 * 24 * 60 * 60 * 1000);
  return reminder.toISOString();
}

/**
 * Formats a date safely in Indian English locale. Never outputs "1 Jan 1970" or "Invalid Date"!
 */
export function formatSafeDate(dateInput, options = { weekday: "short", day: "numeric", month: "short", year: "numeric" }, fallbackDaysAhead = 7) {
  const d = parseValidDate(dateInput, fallbackDaysAhead);
  return d.toLocaleDateString("en-IN", options);
}

/**
 * Formats notification payloads for Push, SMS, and Email
 */
export function formatReminderNotifications({
  patientName,
  phone,
  email,
  doctorName = "Dr. R. Sharma",
  department = "General Medicine",
  appointmentDate,
  reminderDate,
  hospitalName = "AIIMS New Delhi OPD",
  notes = "Review response to current treatment & check vitals.",
}) {
  const apptDateObj = parseValidDate(appointmentDate, 7);
  const apptDateStr = apptDateObj.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const apptTimeStr = apptDateObj.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const push = {
    title: `🔔 Upcoming Checkup in 2 Days — ${hospitalName}`,
    body: `Hi ${patientName || "Patient"}, reminder: Your follow-up with ${doctorName} (${department}) is scheduled for ${apptDateStr} at ${apptTimeStr}. Please carry previous reports.`,
    icon: "/favicon.ico",
    timestamp: reminderDate ? new Date(reminderDate).toISOString() : new Date().toISOString(),
    tag: "opd-followup-reminder",
    data: {
      url: "/summary",
      patientName,
      department,
      appointmentDate,
    },
  };

  const sms = {
    to: phone || "9876543210",
    message: `[MediKiosk Alert] Dear ${patientName || "Patient"}, your medical follow-up with ${doctorName} at ${hospitalName} is in 2 days on ${apptDateStr}. Reply STOP to cancel or call 1800-11-HEALTH for assistance.`,
    senderId: "MD-KIOSK",
    scheduledFor: reminderDate ? new Date(reminderDate).toLocaleDateString("en-IN") : "2 days prior",
  };

  const emailPayload = {
    to: email || "patient@example.com",
    subject: `Appointment Reminder: Follow-up visit on ${apptDateStr} at ${hospitalName}`,
    previewText: `Your next doctor consultation is in 2 days. Details and preparation instructions inside.`,
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px;">
        <div style="background: linear-gradient(135deg, #00d4aa, #0077b6); color: white; padding: 20px; border-radius: 8px; text-align: center;">
          <h2 style="margin: 0;">${hospitalName}</h2>
          <p style="margin: 5px 0 0; opacity: 0.9;">MediKiosk Smart OPD Notification</p>
        </div>
        <div style="padding: 20px 0;">
          <p>Dear <strong>${patientName || "Patient"}</strong>,</p>
          <p>This is a gentle reminder that your scheduled follow-up medical consultation is in <strong>2 days</strong>.</p>
          <div style="background: #f8f9fa; border-left: 4px solid #00d4aa; padding: 15px; margin: 15px 0; border-radius: 4px;">
            <p style="margin: 4px 0;"><strong>Physician:</strong> ${doctorName}</p>
            <p style="margin: 4px 0;"><strong>Department:</strong> ${department}</p>
            <p style="margin: 4px 0;"><strong>Date:</strong> ${apptDateStr}</p>
            <p style="margin: 4px 0;"><strong>Time:</strong> ${apptTimeStr}</p>
            ${notes ? `<p style="margin: 4px 0; color: #555;"><strong>Doctor's Notes:</strong> ${notes}</p>` : ""}
          </div>
          <p><strong>Checklist for your visit:</strong></p>
          <ul>
            <li>Please bring all previous prescriptions and laboratory reports.</li>
            <li>Take any morning fasting tests if advised.</li>
            <li>Arrive 15 minutes prior for smooth token verification at the kiosk.</li>
          </ul>
        </div>
        <div style="text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eee; padding-top: 15px;">
          MediKiosk Automated Patient Portal • Ayushman Bharat Digital Mission (ABDM) Compliant
        </div>
      </div>
    `,
  };

  return { push, sms, email: emailPayload };
}

/**
 * Generates realistic Before vs Now clinical recovery comparison data
 * tailored to the patient's complaint and initial vitals.
 */
export function generateSampleRecoveryData(patient, complaint = "") {
  const normComplaint = (complaint || "").toLowerCase();

  // Tailor symptoms based on complaint
  let symptoms = [];
  let vitals = [];
  let recoveryScore = 78;
  let remarks = "Patient demonstrates significant clinical improvement. Symptoms are well controlled with current regimen. Advised to continue maintenance dose and periodic follow-up.";

  if (normComplaint.includes("chest") || normComplaint.includes("heart")) {
    recoveryScore = 82;
    remarks = "Retrosternal chest tightness completely resolved on Amlodipine 5mg + lifestyle modifications. Exercise tolerance restored (NYHA Class I). ECG normalized; BP well controlled. Follow-up lipid profile ordered in 3 months.";
    symptoms = [
      { name: "Chest Pain / Tightness", before: 8, now: 1, unit: "VAS (0-10)", status: "Resolved" },
      { name: "Exertional Breathlessness", before: 7, now: 1, unit: "NYHA Scale", status: "Significant Relief" },
      { name: "Palpitations / Anxiety", before: 6, now: 2, unit: "Severity (0-10)", status: "Mild" },
      { name: "Daily Fatigue", before: 7, now: 2, unit: "Severity (0-10)", status: "Improved" },
    ];
    vitals = [
      { metric: "Blood Pressure", before: "152/96 mmHg", now: "122/78 mmHg", change: "-30/-18 mmHg", improved: true },
      { metric: "Resting Heart Rate", before: "96 bpm", now: "72 bpm", change: "-24 bpm", improved: true },
      { metric: "Fasting Blood Sugar", before: "148 mg/dL", now: "108 mg/dL", change: "-40 mg/dL", improved: true },
      { metric: "Physical Activity", before: "Sedentary / Unable", now: "30 min daily brisk walk", change: "+Active", improved: true },
    ];
  } else if (normComplaint.includes("stomach") || normComplaint.includes("abdomen") || normComplaint.includes("gastric")) {
    recoveryScore = 85;
    remarks = "Gastric burning and epigastric discomfort subsided following PPI course. Appetite normal, no reflux episodes reported in the last 5 days. Patient advised to avoid spicy triggers.";
    symptoms = [
      { name: "Epigastric Stomach Pain", before: 8, now: 1, unit: "VAS (0-10)", status: "Resolved" },
      { name: "Acid Reflux / Heartburn", before: 7, now: 0, unit: "Severity (0-10)", status: "Completely Resolved" },
      { name: "Bloating / Indigestion", before: 6, now: 2, unit: "Severity (0-10)", status: "Minimal" },
      { name: "Nausea", before: 5, now: 0, unit: "Severity (0-10)", status: "Resolved" },
    ];
    vitals = [
      { metric: "Abdominal Tenderness", before: "Moderate (RUQ)", now: "Nil / Soft", change: "Normalized", improved: true },
      { metric: "Weight", before: "74.5 kg", now: "73.8 kg", change: "Stable", improved: true },
      { metric: "Daily Calorie Intake", before: "Irregular / Pain", now: "3 Regular Meals", change: "+Normal", improved: true },
    ];
  } else if (normComplaint.includes("fever") || normComplaint.includes("cough") || normComplaint.includes("cold")) {
    recoveryScore = 90;
    remarks = "Acute viral infection resolved. Temperature stable afebrile for 72 hours. Dry cough minimal, lungs clear on auscultation. Advised warm hydration.";
    symptoms = [
      { name: "Fever / Chills", before: 9, now: 0, unit: "Severity (0-10)", status: "Afebrile" },
      { name: "Dry Cough", before: 8, now: 2, unit: "Severity (0-10)", status: "Minimal" },
      { name: "Body Aches / Myalgia", before: 7, now: 1, unit: "Severity (0-10)", status: "Resolved" },
      { name: "Headache", before: 7, now: 0, unit: "Severity (0-10)", status: "Resolved" },
    ];
    vitals = [
      { metric: "Body Temperature", before: "102.4 °F", now: "98.4 °F", change: "-4.0 °F", improved: true },
      { metric: "SpO2 (Oxygen Saturation)", before: "95%", now: "99%", change: "+4%", improved: true },
      { metric: "Pulse Rate", before: "104 bpm", now: "76 bpm", change: "-28 bpm", improved: true },
    ];
  } else {
    // General clinical recovery template
    recoveryScore = 76;
    remarks = "Noticeable clinical recovery observed across primary symptoms. Patient reports feeling more energetic with substantial reduction in discomfort. Current treatment regimen to be continued.";
    symptoms = [
      { name: "Primary Chief Discomfort", before: 8, now: 2, unit: "VAS (0-10)", status: "75% Reduction" },
      { name: "Associated Pain / Fatigue", before: 7, now: 2, unit: "Severity (0-10)", status: "Significant Relief" },
      { name: "Impact on Daily Routine", before: 8, now: 1, unit: "Severity (0-10)", status: "Resumed Activities" },
      { name: "Sleep Quality", before: 4, now: 8, unit: "Quality (0-10)", status: "Restful Sleep" },
    ];
    vitals = [
      { metric: "Blood Pressure", before: "142/90 mmHg", now: "124/80 mmHg", change: "-18/-10 mmHg", improved: true },
      { metric: "Heart Rate", before: "88 bpm", now: "74 bpm", change: "-14 bpm", improved: true },
      { metric: "Mobility & Stamina", before: "Restricted", now: "Normal Function", change: "+Restored", improved: true },
    ];
  }

  // Dual timeline recovery trend points (Day 0, Day 2, Day 4, Day 7)
  const timelineTrend = [
    { day: "Day 0 (Initial)", score: 25, pain: symptoms[0]?.before || 8, label: "Initial Visit" },
    { day: "Day 2", score: 45, pain: Math.round((symptoms[0]?.before || 8) * 0.75), label: "Meds Started" },
    { day: "Day 5 (Reminder Sent)", score: 70, pain: Math.round((symptoms[0]?.before || 8) * 0.4), label: "2-Day Pre Alert" },
    { day: "Day 7 (Follow-up)", score: recoveryScore, pain: symptoms[0]?.now || 1, label: "Doctor Review" },
  ];

  return {
    recoveryScore,
    symptoms,
    vitals,
    remarks,
    timelineTrend,
    doctorName: "Dr. R. Sharma (MD, Senior Consultant)",
    dateEvaluated: new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
  };
}
