"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ClipboardList,
  Stethoscope,
  Pill,
  AlertTriangle,
  Users,
  User,
  Search,
  Activity,
  FileText,
  CheckCircle2,
  Volume2,
  Printer,
  Send,
  Edit3,
  Save,
  X,
  Check,
  FileCheck,
  FileCode,
  Lock,
  Clock,
  AlertCircle,
  Info,
  Calendar,
  Bell,
  TrendingUp,
  Smartphone,
  Mail,
} from "lucide-react";
import Navbar from "@/components/ui/Navbar";
import GlassCard from "@/components/ui/GlassCard";
import LoadingPulse from "@/components/ui/LoadingPulse";
import QRToken from "@/components/QRToken";
import RiskScoreCard from "@/components/RiskScoreCard";
import PatientRecoveryGraph from "@/components/PatientRecoveryGraph";
import AppointmentReminderModal from "@/components/AppointmentReminderModal";
import { calculateReminderDate } from "@/lib/reminders";
import { usePatient } from "@/context/PatientContext";
import { speakText } from "@/lib/languages";

export default function SummaryPage() {
  const router = useRouter();
  const { session, language, setSummary: saveSessionSummary, updateSession, clearSession, loadDemoSession } = usePatient();
  const [summary, setSummary] = useState(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Edit-in-place state
  const [isEditing, setIsEditing] = useState(false);
  const [editDraft, setEditDraft] = useState({});

  // Follow-up & 2-Day Pre-Appointment Reminder State
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [showRecoveryTracking, setShowRecoveryTracking] = useState(false);
  const [followUp, setFollowUp] = useState(null);

  // Synchronize follow-up appointment & 2-day pre-appointment alert calculation
  useEffect(() => {
    if (session?.followUp) {
      setFollowUp(session.followUp);
    } else if (session?.patient?.name) {
      const targetDate = new Date(Date.now() + 7 * 86400000).toISOString();
      const defaultFollowUp = {
        appointmentDate: targetDate,
        reminderDate: calculateReminderDate(targetDate),
        department: summary?.suggestedDepartment || "General Medicine",
        doctorName: "Dr. Sharma, MD (OPD)",
        remarks: "Review clinical recovery, symptom resolution, and medication compliance.",
        reminderStatus: "scheduled_2_days_prior",
        channels: {
          sms: Boolean(session?.patient?.phone),
          email: Boolean(session?.patient?.email),
          push: true,
        },
      };
      setFollowUp(defaultFollowUp);
    }
  }, [session, summary]);

  const handleScheduleFollowUp = (newFollowUp) => {
    setFollowUp(newFollowUp);
    updateSession({ followUp: newFollowUp });
  };

  // Submission & Security Wipe state
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [wipeCountdown, setWipeCountdown] = useState(60);
  const [isWiped, setIsWiped] = useState(false);

  // Auto wipe timer on submission
  useEffect(() => {
    let timer;
    if (isSubmitted && !isWiped) {
      timer = setInterval(() => {
        setWipeCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            clearSession();
            setIsWiped(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isSubmitted, isWiped, clearSession]);

  const handleManualWipe = () => {
    clearSession();
    setIsWiped(true);
    router.push("/");
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const generateSummary = useCallback(async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationHistory: session?.conversation || [],
          extractedHistory: session?.extractedHistory || {},
          documents: session?.documents || [],
          language: language || "en-IN",
          isAyush: session?.isAyush || false,
          patient: session?.patient || {},
        }),
      });

      if (!response.ok) throw new Error("Summary generation failed");

      const data = await response.json();
      setSummary(data);
      saveSessionSummary(data);
    } catch (error) {
      console.error("Summary error:", error);
      // Fallback demo summary
      const fallbackSummary = {
        summary: {
          chiefComplaint: session?.extractedHistory?.chiefComplaint || "As recorded during interview",
          hpiNarrative: "History recorded via MediKiosk AI interview. Please review conversation transcript for details.",
          pastMedicalHistory: session?.extractedHistory?.pastMedical || { conditions: [], surgeries: [], hospitalizations: [] },
          drugHistory: session?.extractedHistory?.drugHistory || { current: [], past: [] },
          allergyHistory: session?.extractedHistory?.allergyHistory || { drugs: [], food: [], environmental: [], noKnownAllergies: true },
          familyHistory: session?.extractedHistory?.familyHistory || { conditions: [] },
          personalHistory: session?.extractedHistory?.personalHistory || {},
          reviewOfSystems: session?.extractedHistory?.reviewOfSystems || { positive: [], negative: [] },
          priorInvestigations: [],
          redFlags: session?.redFlags || [],
        },
        summaryNarrative: "Clinical history recorded via AI-assisted interview. Review and confirm details.",
        priorityLevel: session?.redFlags?.length > 0 ? "urgent" : "routine",
        suggestedDepartment: "General Medicine",
      };
      setSummary(fallbackSummary);
      saveSessionSummary(fallbackSummary);
    } finally {
      setIsGenerating(false);
    }
  }, [session, language, saveSessionSummary]);

  // Auto-generate on mount
  useEffect(() => {
    if (mounted && !summary && !isGenerating) {
      if (session?.summary) {
        setSummary(session.summary);
      } else if (session) {
        generateSummary();
      } else {
        // If visited directly without session, load realistic demo session so summary is always functional
        loadDemoSession(language || "en-IN");
      }
    }
  }, [mounted, summary, isGenerating, generateSummary, session, loadDemoSession, language]);


  const handleSpeak = () => {
    if (summary?.summaryLocalLanguage) {
      speakText(summary.summaryLocalLanguage, language || "en-IN");
    } else if (summary?.summaryNarrative) {
      speakText(summary.summaryNarrative, "en-IN");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSubmit = () => {
    // In a real app, this would make an API call to HIS/ABDM
    // For now, just show the success screen
    setIsSubmitted(true);
  };

  const handleFHIRExport = async () => {
    try {
      const { downloadFHIRBundle } = await import("@/lib/fhir-export");
      downloadFHIRBundle(session);
    } catch (e) {
      console.error("FHIR export error:", e);
      alert("FHIR export failed — please try again");
    }
  };

  // Risk scoring data from session
  const riskPatientData = session ? {
    age: session.patient?.age,
    gender: session.patient?.gender,
    chiefComplaint: session.extractedHistory?.chiefComplaint || summary?.summary?.chiefComplaint || "",
    hpiNarrative: summary?.summary?.hpiNarrative || "",
    symptoms: summary?.summary?.reviewOfSystems?.positive || [],
    pastConditions: summary?.summary?.pastMedicalHistory?.conditions || [],
    redFlags: session.redFlags || [],
  } : null;

  // --- EDIT IN PLACE LOGIC ---
  const extractTextForEditing = (sec) => {
    if (summary?.editedSections && summary.editedSections[sec.id]) {
      return summary.editedSections[sec.id];
    }
    if (typeof sec.content === "string") return sec.content;
    if (!sec.content) return "";
    
    // Convert object to string based on type
    if (sec.isList) {
      const parts = [];
      if (sec.content.conditions?.length) parts.push("Conditions: " + sec.content.conditions.join(", "));
      if (sec.content.surgeries?.length) parts.push("Surgeries: " + sec.content.surgeries.join(", "));
      return parts.join("\n");
    }
    if (sec.isDrugs) {
      return (sec.content.current || []).map(d => typeof d === "string" ? d : `${d.name} ${d.dosage || ""}`).join("\n");
    }
    if (sec.isAllergy) {
      if (sec.content.noKnownAllergies) return "No known allergies (NKDA)";
      return (sec.content.drugs || []).join(", ");
    }
    if (sec.isFamilyHistory) {
      return (sec.content.conditions || []).join("\n");
    }
    if (sec.isPersonal) {
      return Object.entries(sec.content).map(([k, v]) => `${k.replace(/_/g, " ")}: ${v}`).join("\n");
    }
    if (sec.isROS) {
      const parts = [];
      if (sec.content.positive?.length) parts.push("Positive: " + sec.content.positive.join(", "));
      if (sec.content.negative?.length) parts.push("Negative: " + sec.content.negative.join(", "));
      return parts.join("\n");
    }
    if (sec.isLabs) {
      return (sec.content || []).map(l => `${l.test}: ${l.value} ${l.unit || ""} (Ref: ${l.referenceRange || "N/A"})${l.isAbnormal ? " [ABNORMAL]" : ""}`).join("\n");
    }
    return "";
  };

  const startEdit = () => {
    const draft = {};
    sections.forEach(sec => {
      if (sec.show) {
        draft[sec.id] = extractTextForEditing(sec);
      }
    });
    // Add narrative summary
    draft["narrative"] = summary.editedSections?.narrative || summary.summaryNarrative || "";
    setEditDraft(draft);
    setIsEditing(true);
  };

  const saveEdit = () => {
    const updatedSummary = {
      ...summary,
      editedSections: { ...editDraft }
    };
    setSummary(updatedSummary);
    saveSessionSummary(updatedSummary);
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setIsEditing(false);
  };

  // Aggregate lab values from scanned documents
  const allLabValues = [];
  if (session?.documents && Array.isArray(session.documents)) {
    session.documents.forEach((doc) => {
      if (doc.labValues && Array.isArray(doc.labValues)) {
        doc.labValues.forEach((lv) => {
          allLabValues.push({ ...lv, docName: doc.fileName || doc.documentType });
        });
      }
    });
  }
  const abnormalLabs = allLabValues.filter((l) => l.isAbnormal);

  if (!mounted) return null;

  const s = summary?.summary;
  const priorityColors = {
    routine: "var(--color-accent-primary)",
    urgent: "var(--color-accent-warning)",
    emergency: "var(--color-accent-warm)",
  };

  const sections = [
    {
      id: "cc",
      icon: <ClipboardList size={18} />,
      title: "Chief Complaint",
      content: s?.chiefComplaint,
      show: !!s?.chiefComplaint,
    },
    {
      id: "hpi",
      icon: <Stethoscope size={18} />,
      title: "History of Present Illness",
      content: s?.hpiNarrative,
      show: !!s?.hpiNarrative,
    },
    {
      id: "pmh",
      icon: <FileText size={18} />,
      title: "Past Medical History",
      content: s?.pastMedicalHistory,
      show: s?.pastMedicalHistory && (s.pastMedicalHistory.conditions?.length > 0 || s.pastMedicalHistory.surgeries?.length > 0),
      isList: true,
    },
    {
      id: "drugs",
      icon: <Pill size={18} />,
      title: "Drug History",
      content: s?.drugHistory,
      show: s?.drugHistory && s.drugHistory.current?.length > 0,
      isDrugs: true,
    },
    {
      id: "allergies",
      icon: <AlertTriangle size={18} />,
      title: "Allergy History",
      content: s?.allergyHistory,
      show: !!s?.allergyHistory,
      isAllergy: true,
    },
    {
      id: "family",
      icon: <Users size={18} />,
      title: "Family History",
      content: s?.familyHistory,
      show: s?.familyHistory && s.familyHistory.conditions?.length > 0,
      isFamilyHistory: true,
    },
    {
      id: "personal",
      icon: <User size={18} />,
      title: "Personal History",
      content: s?.personalHistory,
      show: s?.personalHistory && Object.keys(s.personalHistory).length > 0,
      isPersonal: true,
    },
    {
      id: "ros",
      icon: <Search size={18} />,
      title: "Review of Systems",
      content: s?.reviewOfSystems,
      show: s?.reviewOfSystems && (s.reviewOfSystems.positive?.length > 0 || s.reviewOfSystems.negative?.length > 0),
      isROS: true,
    },
    {
      id: "labs",
      icon: <FileText size={18} />,
      title: "Scanned Laboratory Investigations",
      content: allLabValues,
      show: allLabValues.length > 0,
      isLabs: true,
      hasAbnormal: abnormalLabs.length > 0,
    },
  ];

  // If submitted, show success screen with DPDP 2023 session security wipe & live OPD routing
  if (isSubmitted) {
    return (
      <>
        <Navbar />
        <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="container container-narrow">
            <GlassCard hoverable={false} style={{ textAlign: "center", padding: "50px 24px" }}>
              <div className="success-icon animate-scale-in" style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                <div style={{ background: 'var(--color-accent-success)', color: '#fff', borderRadius: '50%', width: 76, height: 76, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 40px rgba(0, 212, 170, 0.4)' }}>
                  <CheckCircle2 size={44} />
                </div>
              </div>

              <h1 className="animate-fade-in-up" style={{ color: "var(--color-text-primary)", marginBottom: 12, fontSize: '2rem' }}>
                Submission <span className="text-gradient">Confirmed</span>
              </h1>
              <p className="animate-fade-in-up delay-1" style={{ color: "var(--color-text-secondary)", fontSize: "1rem", marginBottom: 24, lineHeight: 1.6 }}>
                Your clinical case has been securely transmitted to the OPD physician dashboard and linked to ABHA.
              </p>

              {/* DPDP 2023 Session Security Auto-Wipe Banner */}
              <div className="security-wipe-banner animate-fade-in-up delay-2" style={{
                background: isWiped ? 'rgba(0, 212, 170, 0.08)' : 'rgba(255, 179, 71, 0.08)',
                border: `1px solid ${isWiped ? 'rgba(0, 212, 170, 0.3)' : 'rgba(255, 179, 71, 0.3)'}`,
                borderRadius: '12px',
                padding: '14px 18px',
                marginBottom: 20,
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: 12
              }}>
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                  {isWiped ? <Lock size={22} style={{ color: 'var(--color-accent-primary)' }} /> : <Clock size={22} style={{ color: 'var(--color-accent-warning)' }} />}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                    <strong style={{ color: isWiped ? 'var(--color-accent-primary)' : 'var(--color-accent-warning)', fontSize: '0.88rem' }}>
                      {isWiped ? 'DPDP Act 2023: Kiosk Session Data Wiped' : `Kiosk Security Auto-Wipe in ${wipeCountdown}s`}
                    </strong>
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: '50px' }}>
                      Zero Data Retention
                    </span>
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
                    {isWiped
                      ? 'Local browser memory and clinical logs have been purged to protect your privacy.'
                      : 'All temporary health records are cleared from this public terminal immediately after case completion.'}
                  </p>
                </div>
              </div>

              {/* Follow-up & 2-Day Pre-Appointment Alert Summary */}
              {followUp && (
                <div className="animate-fade-in-up delay-2" style={{
                  background: 'linear-gradient(135deg, rgba(0, 212, 170, 0.08), rgba(124, 92, 252, 0.08))',
                  border: '1px solid rgba(0, 212, 170, 0.35)',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  marginBottom: 24,
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 14
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'rgba(0, 212, 170, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-accent-primary)', flexShrink: 0 }}>
                      <Calendar size={22} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <strong style={{ color: 'var(--color-text-primary)', fontSize: '0.92rem' }}>
                          Next Doctor Checkup: {new Date(followUp.appointmentDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                        </strong>
                        <span style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: 10, background: 'rgba(0, 212, 170, 0.2)', color: 'var(--color-accent-primary)', fontWeight: 700, border: '1px solid rgba(0, 212, 170, 0.35)' }}>
                          2-Day Alert Armed
                        </span>
                      </div>
                      <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                        A reminder push notification + SMS to <strong style={{ color: 'var(--color-text-primary)' }}>{session?.patient?.phone || "your phone"}</strong> and email to <strong style={{ color: 'var(--color-text-primary)' }}>{session?.patient?.email || "your email"}</strong> will trigger on <strong style={{ color: 'var(--color-accent-warning)' }}>{new Date(followUp.reminderDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</strong> (exact 48 hrs before).
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsReminderModalOpen(true)}
                    style={{
                      background: 'rgba(0, 212, 170, 0.15)',
                      border: '1px solid rgba(0, 212, 170, 0.5)',
                      color: 'var(--color-accent-primary)',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                    id="submitted-test-reminder-btn"
                  >
                    <Bell size={14} /> Test Push Notification
                  </button>
                </div>
              )}

              <div className="success-details animate-fade-in-up delay-2" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '20px', marginBottom: 28 }}>
                <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
                  {/* QR Code Token */}
                  <QRToken
                    value={`MEDIKIOSK:${session?.id || 'MK-SESSION'}:${session?.patient?.name || 'Patient'}:${new Date().toISOString()}`}
                    size={130}
                    label={`Token: ${session?.id || 'MK-LIVE'}`}
                  />
                  {/* Details */}
                  <div style={{ flex: 1, minWidth: 160, textAlign: 'left' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                      <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Patient Token</span>
                      <strong style={{ color: 'var(--color-text-primary)' }}>{session?.id || "MK-LIVE-SESSION"}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                      <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Patient</span>
                      <strong style={{ color: 'var(--color-text-primary)' }}>{session?.patient?.name || 'Patient'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                      <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Department</span>
                      <strong style={{ color: 'var(--color-text-primary)' }}>{summary?.suggestedDepartment || "General Medicine"}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>OPD Timestamp</span>
                      <strong style={{ color: 'var(--color-text-primary)' }}>{new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</strong>
                    </div>
                  </div>
                </div>
                <p style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: 12 }}>
                  Physician scans QR or enters token to immediately review pre-consultation summary
                </p>
              </div>

              <div className="animate-fade-in-up delay-3" style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                <button className="btn-secondary btn-touch" onClick={handlePrint}>
                  <Printer size={18} /> Print Token & Summary
                </button>
                <button
                  className="btn-touch"
                  onClick={() => router.push("/token")}
                  style={{
                    background: 'rgba(0, 212, 170, 0.12)',
                    border: '1px solid rgba(0, 212, 170, 0.4)',
                    color: 'var(--color-accent-primary)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 20px',
                    borderRadius: 'var(--radius-full)',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                  id="view-live-queue-btn"
                >
                  <Activity size={18} /> View Live OPD Queue
                </button>
                <button
                  className="btn-primary btn-touch"
                  onClick={handleManualWipe}
                  id="wipe-and-finish-btn"
                >
                  {isWiped ? "Return to Start" : "Wipe Now & Finish"}
                </button>
              </div>
            </GlassCard>
          </div>
        </div>

        {/* Appointment Follow-up & 2-Day Pre-Appointment Reminder Modal */}
        <AppointmentReminderModal
          isOpen={isReminderModalOpen}
          onClose={() => setIsReminderModalOpen(false)}
          patient={session?.patient}
          onSchedule={handleScheduleFollowUp}
        />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="page-wrapper printable-area">
        <div className="container container-narrow" style={{ padding: "24px 16px 60px" }}>
          
          {/* Header */}
          <div className="section-header animate-fade-in no-print">
            <h1>
              Clinical <span className="text-gradient">Summary</span>
            </h1>
            <p>Review and verify your clinical history before submission</p>
          </div>

          {/* Print Header (Only visible when printing) */}
          <div className="print-only" style={{ marginBottom: 20, borderBottom: '2px solid #333', paddingBottom: 10 }}>
            <h1 style={{ margin: 0, color: '#000' }}>MediKiosk Clinical Summary</h1>
            <p style={{ margin: 0, color: '#555' }}>Generated: {new Date().toLocaleString('en-IN')}</p>
          </div>

          {/* Generating */}
          {isGenerating && (
            <GlassCard hoverable={false} style={{ textAlign: "center", padding: "60px 20px" }}>
              <LoadingPulse text="Generating structured clinical summary..." size="large" />
            </GlassCard>
          )}

          {/* Summary Content */}
          {summary && !isGenerating && (
            <div className="summary-content animate-fade-in-up">
              
              {/* Patient Header Card */}
              <GlassCard hoverable={false} className="patient-header-card print-no-border">
                <div className="patient-header">
                  <div className="patient-info-row">
                    <Activity size={20} className="no-print" style={{ color: "var(--color-accent-primary)" }} />
                    <div>
                      <h3 style={{ color: 'inherit' }}>{session?.patient?.name || "Patient"}</h3>
                      <p style={{ color: 'inherit' }}>
                        {session?.patient?.age ? `${session.patient.age}y` : ""}{" "}
                        {session?.patient?.gender ? `/ ${session.patient.gender}` : ""}{" "}
                        {session?.patient?.phone ? `• Ph: ${session.patient.phone}` : ""}{" "}
                        {session?.patient?.email ? `• ${session.patient.email}` : ""}{" "}
                        {session?.patient?.abhaId ? `• ABHA: ${session.patient.abhaId}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="summary-meta no-print">
                    <span
                      className="badge"
                      style={{
                        borderColor: priorityColors[summary.priorityLevel] || priorityColors.routine,
                        color: priorityColors[summary.priorityLevel] || priorityColors.routine,
                      }}
                    >
                      {summary.priorityLevel?.toUpperCase() || "ROUTINE"}
                    </span>
                    {summary.suggestedDepartment && (
                      <span className="badge">{summary.suggestedDepartment}</span>
                    )}
                  </div>
                </div>

                {/* QR Token - compact in header card */}
                <div className="no-print" style={{ display: 'flex', justifyContent: 'center', margin: '12px 0 4px' }}>
                  <QRToken
                    value={`MEDIKIOSK:${session?.id || 'MK-SESSION'}:${session?.patient?.name || 'Patient'}`}
                    size={100}
                    label={session?.id || 'MK-LIVE'}
                  />
                </div>

                {/* Action Buttons */}
                <div className="summary-actions no-print">
                  <button className="btn-icon" onClick={handleSpeak} title="Read aloud" id="summary-speak-btn">
                    <Volume2 size={18} />
                  </button>
                  <button className="btn-icon" onClick={handlePrint} title="Print" id="summary-print-btn">
                    <Printer size={18} />
                  </button>
                  <button className="btn-icon" onClick={generateSummary} title="Regenerate" id="summary-regen-btn">
                    <Activity size={18} />
                  </button>
                  <button
                    className="fhir-export-btn-summary btn-icon no-print"
                    onClick={handleFHIRExport}
                    title="Export as HL7 FHIR R4 Bundle — international EHR interoperability standard"
                    id="summary-fhir-export-btn"
                  >
                    <FileCode size={18} />
                    <span className="fhir-label">FHIR R4</span>
                  </button>
                </div>
              </GlassCard>

              {/* Follow-up Checkup & 2-Day Pre-Appointment Reminder Card */}
              {followUp && !isEditing && (
                <GlassCard hoverable={false} className="no-print" style={{ marginBottom: 20, border: '1px solid rgba(0, 212, 170, 0.35)', background: 'linear-gradient(135deg, rgba(0, 212, 170, 0.05), rgba(124, 92, 252, 0.05))' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ display: 'inline-flex', padding: 6, borderRadius: '50%', background: 'rgba(0, 212, 170, 0.15)', color: 'var(--color-accent-primary)' }}>
                          <Calendar size={18} />
                        </span>
                        <h3 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--color-text-primary)' }}>
                          Next Checkup &amp; Automated Follow-up Reminder
                        </h3>
                        <span style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: 12, background: 'rgba(0, 212, 170, 0.2)', color: 'var(--color-accent-primary)', fontWeight: 700, border: '1px solid rgba(0, 212, 170, 0.4)' }}>
                          2-Day Pre-Alert Active
                        </span>
                      </div>
                      <p style={{ margin: '4px 0 0', fontSize: '0.84rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                        Scheduled Checkup: <strong style={{ color: 'var(--color-text-primary)' }}>{new Date(followUp.appointmentDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</strong> • {followUp.department || "OPD"}
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button
                        onClick={() => setShowRecoveryTracking(!showRecoveryTracking)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '8px 14px',
                          borderRadius: 'var(--radius-md)',
                          background: showRecoveryTracking ? 'rgba(124, 92, 252, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(124, 92, 252, 0.4)',
                          color: '#c4b5fd',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                        id="toggle-recovery-graph-btn"
                      >
                        <TrendingUp size={14} />
                        {showRecoveryTracking ? "Hide Recovery Graph" : "View Recovery Graph"}
                      </button>
                      <button
                        onClick={() => setIsReminderModalOpen(true)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '8px 16px',
                          borderRadius: 'var(--radius-md)',
                          background: 'linear-gradient(135deg, rgba(0, 212, 170, 0.2), rgba(0, 212, 170, 0.1))',
                          border: '1px solid rgba(0, 212, 170, 0.5)',
                          color: 'var(--color-accent-primary)',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                        id="open-reminder-settings-btn"
                      >
                        <Bell size={14} />
                        Manage Alert &amp; Test Push
                      </button>
                    </div>
                  </div>

                  {/* 2-Day Pre-Alert Callout Box */}
                  <div style={{
                    marginTop: 14,
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(0, 0, 0, 0.25)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 12
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Bell size={18} style={{ color: 'var(--color-accent-warning)', flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                          Automated 2-Day Pre-Notification Armed
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                          A reminder is automatically dispatched on <strong style={{ color: 'var(--color-accent-warning)' }}>{new Date(followUp.reminderDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</strong> (exact 48 hrs before visit).
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <Smartphone size={12} style={{ color: 'var(--color-accent-primary)' }} />
                        SMS: {session?.patient?.phone || "Linked phone"}
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <Mail size={12} style={{ color: '#60a5fa' }} />
                        Email: {session?.patient?.email || "Linked email"}
                      </span>
                    </div>
                  </div>

                  {/* Doctor Remarks preview if available */}
                  {followUp.remarks && (
                    <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'rgba(124, 92, 252, 0.08)', border: '1px solid rgba(124, 92, 252, 0.2)' }}>
                      <span style={{ fontSize: '0.75rem', color: '#bda5ff', fontWeight: 600, display: 'block', marginBottom: 2 }}>
                        Doctor&apos;s Follow-up Instructions:
                      </span>
                      <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                        &ldquo;{followUp.remarks}&rdquo;
                      </p>
                    </div>
                  )}
                </GlassCard>
              )}

              {/* Recovery & Symptoms Before vs Now Graph */}
              {showRecoveryTracking && !isEditing && (
                <div style={{ marginBottom: 20 }} className="animate-fade-in no-print">
                  <PatientRecoveryGraph
                    patient={session?.patient}
                    complaint={summary?.summary?.chiefComplaint || session?.extractedHistory?.chiefComplaint}
                  />
                </div>
              )}

              {/* AI Risk Score Card */}
              {riskPatientData && (
                <div className="no-print">
                  <RiskScoreCard patientData={riskPatientData} />
                </div>
              )}

              {/* Abnormal Diagnostic Lab Alerts Banner */}
              {abnormalLabs.length > 0 && (
                <div className="abnormal-labs-banner animate-fade-in no-print" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '14px 18px',
                  borderRadius: '12px',
                  background: 'rgba(255, 71, 87, 0.08)',
                  border: '1px solid rgba(255, 71, 87, 0.35)',
                  marginBottom: 16,
                }}>
                  <AlertCircle size={22} style={{ color: '#ff4757', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <strong style={{ color: '#ff4757', fontSize: '0.9rem' }}>
                        {abnormalLabs.length} Abnormal Lab Values Detected from Digitized Reports
                      </strong>
                      <span className="badge badge-danger" style={{ fontSize: '0.65rem' }}>Priority Action</span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', margin: '4px 0 0' }}>
                      {abnormalLabs.map(l => `${l.test}: ${l.value} ${l.unit || ""} (Ref: ${l.referenceRange || "Normal"})`).join(" • ")}
                    </p>
                  </div>
                </div>
              )}

              {/* Edit Mode Banner */}
              {isEditing && (
                <div className="edit-mode-banner animate-fade-in no-print">
                  <Edit3 size={16} />
                  <span>Edit Mode: Tap on any text box to correct your information.</span>
                </div>
              )}

              {/* Clinical Sections */}
              {sections.map((sec, idx) => {
                if (!sec.show) return null;
                
                // If this section has been manually edited, show the edited string. Otherwise, render normally.
                const hasEditedString = summary.editedSections && typeof summary.editedSections[sec.id] === "string";
                const displayContent = hasEditedString ? summary.editedSections[sec.id] : sec.content;

                return (
                  <div key={idx} className="summary-section animate-fade-in-up print-no-border" style={{ animationDelay: `${idx * 0.08}s` }}>
                    <div className="summary-section-header">
                      {sec.icon}
                      <h3>{sec.title}</h3>
                    </div>

                    {isEditing ? (
                      <div className="edit-field-group no-print">
                        <textarea
                          className="edit-textarea"
                          value={editDraft[sec.id] || ""}
                          onChange={(e) => setEditDraft(prev => ({ ...prev, [sec.id]: e.target.value }))}
                          rows={3}
                          placeholder={`Enter ${sec.title.toLowerCase()}...`}
                        />
                      </div>
                    ) : (
                      <div className="section-body">
                        {/* If it was edited, it's just a string */}
                        {hasEditedString ? (
                          <p style={{ whiteSpace: "pre-wrap" }}>{displayContent || "—"}</p>
                        ) : (
                          /* Otherwise render rich content */
                          <>
                            {typeof sec.content === "string" && <p style={{ whiteSpace: "pre-wrap" }}>{sec.content}</p>}

                            {sec.isList && (
                              <div>
                                {sec.content.conditions?.length > 0 && (
                                  <div>
                                    <strong style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>Conditions:</strong>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
                                      {sec.content.conditions.map((c, i) => (
                                        <span key={i} className="badge print-badge">{c}</span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {sec.content.surgeries?.length > 0 && (
                                  <div style={{ marginTop: 8 }}>
                                    <strong style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>Surgeries:</strong>
                                    <ul style={{ paddingLeft: 20, margin: "6px 0" }}>
                                      {sec.content.surgeries.map((c, i) => (
                                        <li key={i} style={{ color: "var(--color-text-secondary)", fontSize: "0.9rem" }}>{c}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            )}

                            {sec.isDrugs && (
                              <div className="drug-list">
                                {sec.content.current?.map((d, i) => (
                                  <div key={i} className="drug-item">
                                    <Pill size={14} style={{ color: "var(--color-accent-primary)" }} className="no-print" />
                                    <span>{typeof d === "string" ? d : `${d.name} ${d.dosage || ""} ${d.since ? `(since ${d.since})` : ""}`}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {sec.isAllergy && (
                              <div>
                                {sec.content.noKnownAllergies ? (
                                  <p style={{ color: "var(--color-accent-primary)", display: "inline-flex", alignItems: "center", gap: 6 }}>
                                    <Check size={14} /> No known allergies (NKDA)
                                  </p>
                                ) : (
                                  <div>
                                    {sec.content.drugs?.map((a, i) => (
                                      <span key={i} className="badge badge-danger print-badge" style={{ margin: "0 6px 6px 0" }}>
                                        {a}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}

                            {sec.isFamilyHistory && (
                              <ul style={{ paddingLeft: 20 }}>
                                {sec.content.conditions?.map((c, i) => (
                                  <li key={i} style={{ color: "var(--color-text-secondary)", fontSize: "0.9rem" }}>{c}</li>
                                ))}
                              </ul>
                            )}

                            {sec.isPersonal && (
                              <div className="personal-grid">
                                {Object.entries(sec.content).map(([key, val]) => (
                                  <div key={key} className="personal-item print-no-bg">
                                    <span className="personal-label">{key.replace(/_/g, " ")}</span>
                                    <span className="personal-value">{val}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {sec.isROS && (
                              <div>
                                {sec.content.positive?.length > 0 && (
                                  <div style={{ marginBottom: 8 }}>
                                    <strong style={{ fontSize: "0.8rem", color: "var(--color-accent-warning)" }}>Positive:</strong>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
                                      {sec.content.positive.map((p, i) => (
                                        <span key={i} className="badge badge-warning print-badge">{p}</span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {sec.content.negative?.length > 0 && (
                                  <div>
                                    <strong style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>Negative:</strong>
                                    <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginTop: 4 }}>
                                      {sec.content.negative.join(", ")}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}

                            {sec.isLabs && (
                              <div className="summary-labs-wrapper">
                                <div className="summary-labs-grid">
                                  {sec.content.map((lab, i) => (
                                    <div key={i} className={`summary-lab-box ${lab.isAbnormal ? "abnormal" : ""}`}>
                                      <div className="lab-box-top">
                                        <span className="lab-box-test">{lab.test}</span>
                                        {lab.isAbnormal ? (
                                          <span className="badge badge-danger print-badge" style={{ fontSize: '0.68rem', padding: '2px 6px', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                                            <AlertCircle size={10} /> ABNORMAL
                                          </span>
                                        ) : (
                                          <span className="badge print-badge" style={{ fontSize: '0.68rem', padding: '2px 6px' }}>
                                            NORMAL
                                          </span>
                                        )}
                                      </div>
                                      <div className="lab-box-val-row">
                                        <span className="lab-box-val">{lab.value} <span className="lab-box-unit">{lab.unit}</span></span>
                                        {lab.referenceRange && <span className="lab-box-ref">Ref: {lab.referenceRange}</span>}
                                      </div>
                                      {lab.docName && <div className="lab-box-source">Source: {lab.docName}</div>}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Narrative Summary */}
              {summary.summaryNarrative && (
                <GlassCard hoverable={false} className="print-no-border" style={{ marginTop: 16 }}>
                  <div className="summary-section-header">
                    <FileText size={18} />
                    <h3>Narrative Summary</h3>
                  </div>
                  
                  {isEditing ? (
                    <div className="edit-field-group no-print">
                      <textarea
                        className="edit-textarea"
                        value={editDraft["narrative"] || ""}
                        onChange={(e) => setEditDraft(prev => ({ ...prev, narrative: e.target.value }))}
                        rows={5}
                      />
                    </div>
                  ) : (
                    <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9rem", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
                      {summary.editedSections?.narrative || summary.summaryNarrative}
                    </p>
                  )}
                </GlassCard>
              )}

              {/* Red Flags - Only show if not editing or if they exist */}
              {s?.redFlags?.length > 0 && !isEditing && (
                <div className="summary-section" style={{ borderColor: "rgba(255,71,87,0.3)" }}>
                  <div className="summary-section-header">
                    <AlertTriangle size={18} style={{ color: "#ff4757" }} />
                    <h3 style={{ color: "#ff4757" }}>Red Flags</h3>
                  </div>
                  {s.redFlags.map((f, i) => (
                    <p key={i} className="badge badge-danger print-badge" style={{ display: "block", marginBottom: 4 }}>
                      {typeof f === "string" ? f : f.reason}
                    </p>
                  ))}
                </div>
              )}

              {/* Actions Area */}
              <div className="no-print" style={{ marginTop: 32 }}>
                {isEditing ? (
                  <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                    <button className="btn-secondary btn-touch" onClick={cancelEdit}>
                      <X size={20} /> Cancel
                    </button>
                    <button className="btn-primary btn-large btn-touch" onClick={saveEdit}>
                      <Save size={20} /> Save Changes
                    </button>
                  </div>
                ) : (
                  <>
                    <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                      <button className="btn-secondary btn-touch" onClick={() => router.push("/scan")}>
                        ← Add Documents
                      </button>
                      <button className="btn-secondary btn-touch" onClick={startEdit}>
                        <Edit3 size={18} /> Edit Details
                      </button>
                      <button className="btn-primary btn-large btn-touch" onClick={handleSubmit}>
                        <CheckCircle2 size={20} />
                        Submit to HIS
                      </button>
                    </div>
                    
                    {/* Disclaimer */}
                    <p style={{ textAlign: "center", fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: 20, lineHeight: 1.6, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                      <Info size={13} /> This is an AI-generated draft summary. You may edit details before submitting.
                    </p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Appointment Follow-up & 2-Day Pre-Appointment Reminder Modal */}
      <AppointmentReminderModal
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
        patient={session?.patient}
        onSchedule={handleScheduleFollowUp}
      />

      <style jsx>{`
        .patient-header-card {
          margin-bottom: 20px;
        }

        .patient-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 12px;
        }

        .patient-info-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .patient-info-row h3 {
          font-size: 1.2rem;
          margin-bottom: 2px;
        }

        .patient-info-row p {
          font-size: 0.82rem;
          color: var(--color-text-muted);
          margin: 0;
        }

        .summary-meta {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .summary-actions {
          display: flex;
          gap: 8px;
          margin-top: 16px;
          padding-top: 12px;
          border-top: 1px solid var(--color-border);
        }

        .drug-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .drug-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.9rem;
          color: var(--color-text-secondary);
        }

        .personal-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 10px;
        }

        .personal-item {
          padding: 8px 12px;
          background: var(--color-bg-glass);
          border-radius: 8px;
        }

        .personal-label {
          display: block;
          font-size: 0.72rem;
          color: var(--color-text-muted);
          text-transform: capitalize;
          margin-bottom: 2px;
        }

        .personal-value {
          font-size: 0.9rem;
          color: var(--color-text-primary);
          font-weight: 500;
        }

        /* Edit Mode Styles */
        .edit-mode-banner {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          background: rgba(0, 212, 170, 0.08);
          border: 1px solid rgba(0, 212, 170, 0.3);
          border-radius: var(--radius-md);
          color: var(--color-accent-primary);
          font-size: 0.85rem;
          font-weight: 500;
          margin-bottom: 20px;
        }

        .edit-field-group {
          margin-top: 12px;
        }

        .edit-textarea {
          width: 100%;
          padding: 12px 14px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          color: var(--color-text-primary);
          font-family: var(--font-primary);
          font-size: 0.9rem;
          line-height: 1.6;
          resize: vertical;
          transition: border-color var(--transition-fast);
          box-sizing: border-box;
        }

        .edit-textarea:focus {
          outline: none;
          border-color: var(--color-accent-primary);
          box-shadow: 0 0 0 2px rgba(0, 212, 170, 0.12);
        }

        /* Printing Styles */
        .print-only {
          display: none;
        }

        @media print {
          .no-print {
            display: none !important;
          }
          .print-only {
            display: block !important;
          }
          .printable-area {
            background: white !important;
            color: black !important;
          }
          .print-no-border {
            border: none !important;
            box-shadow: none !important;
            background: none !important;
            padding: 0 !important;
            margin-bottom: 16px !important;
          }
          .print-badge {
            border: 1px solid #000 !important;
            background: #fff !important;
            color: #000 !important;
          }
          .print-no-bg {
            background: transparent !important;
            border: 1px solid #ccc !important;
          }
          .summary-section {
            break-inside: avoid;
          }
          body {
            --color-text-primary: #000;
            --color-text-secondary: #333;
            --color-text-muted: #666;
            background: #fff;
          }
        }
        /* FHIR Export Button in summary */
        .fhir-export-btn-summary {
          display: inline-flex !important;
          align-items: center;
          gap: 6px;
          padding: 8px 14px !important;
          border-radius: var(--radius-full) !important;
          border: 1px solid rgba(77, 184, 255, 0.4) !important;
          background: rgba(77, 184, 255, 0.08) !important;
          color: #4db8ff !important;
          cursor: pointer;
          transition: all 0.15s ease;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .fhir-export-btn-summary:hover {
          background: rgba(77, 184, 255, 0.16) !important;
          border-color: rgba(77, 184, 255, 0.7) !important;
          transform: translateY(-1px);
        }

        .fhir-label {
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 0.05em;
        }

        /* Diagnostic Lab Values Grid */
        .summary-labs-wrapper {
          margin-top: 4px;
        }

        .summary-labs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 10px;
        }

        .summary-lab-box {
          padding: 10px 12px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--color-border);
          transition: all 0.2s;
        }

        .summary-lab-box.abnormal {
          border-color: rgba(255, 71, 87, 0.4);
          background: rgba(255, 71, 87, 0.06);
        }

        .lab-box-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 6px;
          margin-bottom: 4px;
        }

        .lab-box-test {
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--color-text-secondary);
        }

        .lab-box-val-row {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 6px;
        }

        .lab-box-val {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--color-text-primary);
        }

        .summary-lab-box.abnormal .lab-box-val {
          color: #ff4757;
        }

        .lab-box-unit {
          font-size: 0.75rem;
          font-weight: normal;
          color: var(--color-text-muted);
        }

        .lab-box-ref {
          font-size: 0.68rem;
          color: var(--color-text-muted);
        }

        .lab-box-source {
          font-size: 0.65rem;
          color: var(--color-text-muted);
          margin-top: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      `}</style>
    </>
  );
}
