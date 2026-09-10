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
} from "lucide-react";
import Navbar from "@/components/ui/Navbar";
import GlassCard from "@/components/ui/GlassCard";

// Demo patient queue (baseline — always shown)
const DEMO_PATIENTS = [
  {
    id: "MK-001",
    name: "Rajesh Kumar",
    age: 45,
    gender: "M",
    department: "General Medicine",
    priority: "routine",
    chiefComplaint: "Fever and body pain for 3 days",
    status: "waiting",
    time: "09:15 AM",
    isDemo: true,
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
    department: "Cardiology",
    priority: "urgent",
    chiefComplaint: "Chest pain on exertion for 1 week",
    status: "waiting",
    time: "09:22 AM",
    isDemo: true,
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
    department: "General Medicine",
    priority: "routine",
    chiefComplaint: "Persistent cough for 2 weeks",
    status: "completed",
    time: "08:50 AM",
    isDemo: true,
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
  { key: "chiefComplaint", label: "Chief Complaint", icon: "🎯" },
  { key: "hpi", label: "History of Present Illness", icon: "📋", multiline: true },
  { key: "pastHistory", label: "Past Medical / Surgical History", icon: "📁", multiline: true },
  { key: "drugs", label: "Current Medications", icon: "💊", multiline: true },
  { key: "allergies", label: "Allergy History", icon: "⚠️" },
  { key: "family", label: "Family History", icon: "👨‍👩‍👧‍👦", multiline: true },
  { key: "personal", label: "Personal History", icon: "🧑", multiline: true },
  { key: "ros", label: "Review of Systems", icon: "🔍", multiline: true },
];

export default function PhysicianPage() {
  const router = useRouter();
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patients, setPatients] = useState(DEMO_PATIENTS);
  const [mounted, setMounted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editDraft, setEditDraft] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);

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

  const getPriorityBadge = (priority) => {
    const classes = {
      routine: "badge",
      urgent: "badge badge-warning",
      emergency: "badge badge-danger",
    };
    const icons = { routine: "🟢", urgent: "🟡", emergency: "🔴" };
    return (
      <span className={classes[priority] || "badge"}>
        {icons[priority]} {priority?.toUpperCase()}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    if (status === "completed" || status === "accepted")
      return <span className="badge badge-success">✓ Done</span>;
    if (status === "rejected") return <span className="badge badge-danger">✗ Rejected</span>;
    return <span className="badge badge-warning">⏳ Waiting</span>;
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
                          <span className="edited-badge">✏️ Edited</span>
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
                          {selectedPatient.department} • ID: {selectedPatient.id}
                        </p>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                        {getPriorityBadge(selectedPatient.priority)}
                        {selectedPatient.isEdited && (
                          <span className="edited-badge">✏️ Amended by Physician</span>
                        )}
                      </div>
                    </div>

                    {/* --- VIEW MODE --- */}
                    {!isEditing && (
                      <>
                        {SUMMARY_FIELDS.map(({ key, label, icon }) => (
                          <div key={key} className="summary-section" style={{ marginTop: 12 }}>
                            <div className="summary-section-header">
                              <Stethoscope size={14} />
                              <h3>
                                {icon} {label}
                              </h3>
                            </div>
                            <p style={{ fontSize: "0.88rem", lineHeight: 1.75, whiteSpace: "pre-wrap" }}>
                              {selectedPatient.summary[key] || "—"}
                            </p>
                          </div>
                        ))}

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
                        </div>
                      </>
                    )}

                    {/* --- EDIT MODE --- */}
                    {isEditing && editDraft && (
                      <>
                        <div className="edit-mode-banner">
                          <Edit3 size={16} />
                          <span>Physician Amendment Mode — Edit any field below</span>
                        </div>

                        {SUMMARY_FIELDS.map(({ key, label, icon, multiline }) => (
                          <div key={key} className="edit-field-group">
                            <label className="edit-label">
                              {icon} {label}
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
                      }}
                    >
                      ⚕️ AI-generated draft. Physician retains full control to accept, amend, or
                      reject.
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
                    💡 Click{" "}
                    <strong style={{ color: "var(--color-accent-primary)" }}>Refresh Queue</strong>{" "}
                    to load new patients from the kiosk
                  </p>
                </GlassCard>
              )}
            </div>
          </div>
        </div>
      </div>

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
