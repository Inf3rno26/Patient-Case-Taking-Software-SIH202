"use client";

import { useState } from "react";
import {
  TrendingUp,
  Activity,
  CheckCircle2,
  Calendar,
  UserCheck,
  Stethoscope,
  Heart,
  ArrowDownRight,
  ArrowUpRight,
  Sparkles,
  BarChart3,
  LineChart,
  Edit3,
  Save,
  X,
} from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import { generateSampleRecoveryData } from "@/lib/reminders";

/**
 * PatientRecoveryGraph — Visualizes clinical recovery progress
 * Comparing Initial Visit (Before) vs Follow-up Visit (Now)
 */
export default function PatientRecoveryGraph({
  recoveryData = null,
  patient = null,
  complaint = "",
  patientName = "Patient",
  customRemarks = null,
  onUpdateRemarks = null,
}) {
  const [activeTab, setActiveTab] = useState("symptoms"); // 'symptoms' | 'trajectory' | 'vitals'
  const [isEditingRemarks, setIsEditingRemarks] = useState(false);

  // Auto-resolve patient name & sample recovery data
  const resolvedPatientName = patient?.name || patientName || "Patient";
  const activeData =
    recoveryData ||
    generateSampleRecoveryData(patient || { name: resolvedPatientName }, complaint);

  const {
    recoveryScore = 78,
    symptoms = [],
    vitals = [],
    remarks = "",
    timelineTrend = [],
    doctorName = "Dr. R. Sharma (MD)",
    dateEvaluated = new Date().toLocaleDateString("en-IN"),
  } = activeData || {};

  const [remarksText, setRemarksText] = useState(customRemarks || remarks);

  const handleSaveRemarks = () => {
    setIsEditingRemarks(false);
    if (onUpdateRemarks) {
      onUpdateRemarks(remarksText);
    }
  };

  const handleCancelRemarks = () => {
    setIsEditingRemarks(false);
    setRemarksText(customRemarks || remarks);
  };

  // SVG dimensions for trajectory graph
  const svgWidth = 520;
  const svgHeight = 160;
  const paddingX = 45;
  const paddingY = 25;

  const points = timelineTrend.map((t, idx) => {
    const x = paddingX + (idx / Math.max(1, timelineTrend.length - 1)) * (svgWidth - 2 * paddingX);
    const y = svgHeight - paddingY - (t.score / 100) * (svgHeight - 2 * paddingY);
    return { x, y, ...t };
  });

  const pathD = points.reduce((acc, p, idx) => {
    return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, "");

  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${svgHeight - paddingY} L ${points[0].x} ${svgHeight - paddingY} Z`
    : "";

  return (
    <div className="recovery-graph-card animate-fade-in">
      <GlassCard hoverable={false} className="recovery-inner-card">
        {/* Header with Recovery Index Badge */}
        <div className="recovery-header">
          <div className="recovery-title-group">
            <div className="recovery-icon-circle">
              <TrendingUp size={22} color="#00d4aa" />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <h3 style={{ margin: 0, fontSize: "1.15rem" }}>
                  Clinical Recovery &amp; Symptom Trajectory
                </h3>
                <span className="badge badge-success" style={{ fontSize: "0.7rem" }}>
                  Follow-up Comparative Analysis
                </span>
              </div>
              <p style={{ margin: "3px 0 0", fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
                Evaluating {patientName}&apos;s response since baseline visit
              </p>
            </div>
          </div>

          {/* Recovery Score Dial Pill */}
          <div className="score-dial-pill">
            <div className="score-value">
              <span>{recoveryScore}%</span>
            </div>
            <div className="score-meta">
              <span className="score-label">Recovery Index</span>
              <span className="score-sub">Clinical Relief</span>
            </div>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="recovery-nav-tabs">
          <button
            type="button"
            className={`recovery-tab-btn ${activeTab === "symptoms" ? "active" : ""}`}
            onClick={() => setActiveTab("symptoms")}
          >
            <BarChart3 size={14} /> Symptom Severity (Before vs Now)
          </button>
          <button
            type="button"
            className={`recovery-tab-btn ${activeTab === "trajectory" ? "active" : ""}`}
            onClick={() => setActiveTab("trajectory")}
          >
            <LineChart size={14} /> Recovery Trajectory
          </button>
          <button
            type="button"
            className={`recovery-tab-btn ${activeTab === "vitals" ? "active" : ""}`}
            onClick={() => setActiveTab("vitals")}
          >
            <Activity size={14} /> Biomarkers &amp; Vitals Delta
          </button>
        </div>

        {/* TAB 1: Symptom Severity Comparison (Before vs Now Bars) */}
        {activeTab === "symptoms" && (
          <div className="symptom-comparison-section animate-fade-in">
            <div className="legend-row">
              <div className="legend-item">
                <span className="legend-dot before" />
                <span>Initial Visit (Baseline Severity)</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot now" />
                <span>Current Follow-up Status</span>
              </div>
            </div>

            <div className="symptoms-list">
              {symptoms.map((s, idx) => {
                const reduction = Math.round(((s.before - s.now) / Math.max(1, s.before)) * 100);
                return (
                  <div key={idx} className="symptom-bar-group">
                    <div className="symptom-bar-header">
                      <span className="symptom-name">{s.name}</span>
                      <div className="symptom-tags">
                        <span className="status-pill">{s.status}</span>
                        <span className="reduction-pill">
                          <ArrowDownRight size={12} /> {reduction}% reduction
                        </span>
                      </div>
                    </div>

                    {/* Dual Comparative Progress Bar */}
                    <div className="dual-progress-track">
                      {/* Before bar (red/orange) */}
                      <div className="progress-row">
                        <span className="row-tag">Before: {s.before}/10</span>
                        <div className="bar-wrapper">
                          <div
                            className="bar-fill before-bar"
                            style={{ width: `${(s.before / 10) * 100}%` }}
                          />
                        </div>
                      </div>
                      {/* Now bar (teal/cyan) */}
                      <div className="progress-row">
                        <span className="row-tag">Now: {s.now}/10</span>
                        <div className="bar-wrapper">
                          <div
                            className="bar-fill now-bar"
                            style={{ width: `${Math.max(4, (s.now / 10) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: Recovery Trajectory Curve (SVG) */}
        {activeTab === "trajectory" && (
          <div className="trajectory-section animate-fade-in">
            <div className="trajectory-chart-wrap">
              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="trajectory-svg"
                preserveAspectRatio="xMidYMid meet"
              >
                <defs>
                  <linearGradient id="recoveryGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#00d4aa" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#00d4aa" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid lines */}
                {[25, 50, 75, 100].map((val) => {
                  const y = svgHeight - paddingY - (val / 100) * (svgHeight - 2 * paddingY);
                  return (
                    <g key={val}>
                      <line
                        x1={paddingX}
                        y1={y}
                        x2={svgWidth - paddingX}
                        y2={y}
                        stroke="rgba(255,255,255,0.08)"
                        strokeDasharray="4 4"
                      />
                      <text x={paddingX - 8} y={y + 3} fill="var(--color-text-muted)" fontSize="10" textAnchor="end">
                        {val}%
                      </text>
                    </g>
                  );
                })}

                {/* Shaded Area */}
                {areaD && <path d={areaD} fill="url(#recoveryGrad)" />}

                {/* Trend Line */}
                {pathD && (
                  <path
                    d={pathD}
                    fill="none"
                    stroke="#00d4aa"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Data Points */}
                {points.map((p, idx) => (
                  <g key={idx} className="chart-point">
                    <circle cx={p.x} cy={p.y} r="5.5" fill="#060a1a" stroke="#00d4aa" strokeWidth="2.5" />
                    <circle cx={p.x} cy={p.y} r="2.5" fill="#00d4aa" />
                    <text
                      x={p.x}
                      y={p.y - 10}
                      fill="#00d4aa"
                      fontSize="11"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {p.score}%
                    </text>
                    <text
                      x={p.x}
                      y={svgHeight - paddingY + 16}
                      fill="var(--color-text-muted)"
                      fontSize="10"
                      textAnchor="middle"
                    >
                      {p.day}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
            <div className="trajectory-caption">
              <Sparkles size={14} color="#00d4aa" />
              <span>
                Continuous clinical tracking reflects positive therapeutic recovery response following initial treatment initiation.
              </span>
            </div>
          </div>
        )}

        {/* TAB 3: Biomarkers & Vitals Delta */}
        {activeTab === "vitals" && (
          <div className="vitals-delta-grid animate-fade-in">
            {vitals.map((v, idx) => (
              <div key={idx} className="vital-delta-card">
                <div className="vital-header">
                  <span className="vital-name">{v.metric}</span>
                  <span className="vital-tag improved">
                    <ArrowUpRight size={12} /> {v.change}
                  </span>
                </div>
                <div className="vital-values-row">
                  <div className="vital-sub-val before">
                    <span className="lbl">Before</span>
                    <span className="val">{v.before}</span>
                  </div>
                  <div className="vital-arrow">➔</div>
                  <div className="vital-sub-val now">
                    <span className="lbl">Now (Follow-up)</span>
                    <span className="val">{v.now}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Physician Remarks Banner */}
        <div className="physician-remarks-banner">
          <div className="remarks-header">
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--color-accent-primary)" }}>
              <Stethoscope size={15} /> <strong>Doctor&apos;s Follow-up Remarks &amp; Assessment</strong>
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span className="remarks-date">
                <Calendar size={12} /> Evaluated: {dateEvaluated}
              </span>
              {onUpdateRemarks && !isEditingRemarks && (
                <button
                  type="button"
                  onClick={() => setIsEditingRemarks(true)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "3px 8px",
                    borderRadius: "6px",
                    background: "rgba(0, 212, 170, 0.15)",
                    border: "1px solid rgba(0, 212, 170, 0.4)",
                    color: "var(--color-accent-primary)",
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  <Edit3 size={11} /> Edit Remarks
                </button>
              )}
            </div>
          </div>

          {isEditingRemarks ? (
            <div style={{ marginTop: 10 }}>
              <textarea
                value={remarksText}
                onChange={(e) => setRemarksText(e.target.value)}
                rows={3}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                  background: "rgba(0, 0, 0, 0.3)",
                  border: "1px solid var(--color-accent-primary)",
                  color: "#fff",
                  fontSize: "0.85rem",
                  lineHeight: 1.5,
                  boxSizing: "border-box",
                }}
              />
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={handleSaveRemarks}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "6px 12px",
                    borderRadius: "6px",
                    background: "var(--color-accent-primary)",
                    color: "#000",
                    fontWeight: 700,
                    fontSize: "0.78rem",
                    cursor: "pointer",
                    border: "none",
                  }}
                >
                  <Save size={13} /> Save Remarks
                </button>
                <button
                  type="button"
                  onClick={handleCancelRemarks}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "6px 12px",
                    borderRadius: "6px",
                    background: "rgba(255, 255, 255, 0.08)",
                    color: "var(--color-text-secondary)",
                    fontWeight: 600,
                    fontSize: "0.78rem",
                    cursor: "pointer",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  <X size={13} /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="remarks-body">{remarksText || displayRemarks}</p>
          )}

          <div className="remarks-footer">
            <span>Verified By: <strong>{doctorName}</strong></span>
            <span className="verified-badge">
              <CheckCircle2 size={12} /> Clinical Assessment Completed
            </span>
          </div>
        </div>
      </GlassCard>

      <style jsx>{`
        .recovery-graph-card {
          margin: 16px 0;
        }

        :global(.recovery-inner-card) {
          padding: 20px;
          border: 1px solid rgba(0, 212, 170, 0.22) !important;
          background: rgba(6, 15, 30, 0.72) !important;
        }

        .recovery-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 14px;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .recovery-title-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .recovery-icon-circle {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: rgba(0, 212, 170, 0.12);
          border: 1px solid rgba(0, 212, 170, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .score-dial-pill {
          display: flex;
          align-items: center;
          gap: 10px;
          background: linear-gradient(135deg, rgba(0, 212, 170, 0.15), rgba(77, 184, 255, 0.1));
          border: 1px solid rgba(0, 212, 170, 0.35);
          padding: 6px 14px;
          border-radius: var(--radius-full);
        }

        .score-value {
          font-size: 1.4rem;
          font-weight: 800;
          color: #00d4aa;
          letter-spacing: -0.02em;
        }

        .score-meta {
          display: flex;
          flex-direction: column;
          line-height: 1.15;
        }

        .score-label {
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--color-text-primary);
        }

        .score-sub {
          font-size: 0.65rem;
          color: var(--color-text-muted);
        }

        .recovery-nav-tabs {
          display: flex;
          gap: 8px;
          margin: 14px 0 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          padding-bottom: 8px;
          overflow-x: auto;
        }

        .recovery-tab-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: transparent;
          border: 1px solid transparent;
          color: var(--color-text-muted);
          font-size: 0.8rem;
          font-weight: 600;
          padding: 6px 12px;
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .recovery-tab-btn:hover {
          color: var(--color-text-primary);
          background: rgba(255, 255, 255, 0.04);
        }

        .recovery-tab-btn.active {
          color: #00d4aa;
          background: rgba(0, 212, 170, 0.1);
          border-color: rgba(0, 212, 170, 0.3);
        }

        .legend-row {
          display: flex;
          gap: 18px;
          font-size: 0.75rem;
          margin-bottom: 14px;
          color: var(--color-text-muted);
        }

        .legend-item {
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .legend-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .legend-dot.before {
          background: #ff6b81;
        }

        .legend-dot.now {
          background: #00d4aa;
        }

        .symptoms-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .symptom-bar-group {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          padding: 12px 14px;
          border-radius: var(--radius-md);
        }

        .symptom-bar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          flex-wrap: wrap;
          gap: 6px;
        }

        .symptom-name {
          font-size: 0.86rem;
          font-weight: 600;
          color: var(--color-text-primary);
        }

        .symptom-tags {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .status-pill {
          font-size: 0.7rem;
          padding: 2px 8px;
          border-radius: 6px;
          background: rgba(0, 212, 170, 0.1);
          color: #00d4aa;
          border: 1px solid rgba(0, 212, 170, 0.25);
        }

        .reduction-pill {
          font-size: 0.7rem;
          font-weight: 700;
          color: #4db8ff;
          display: inline-flex;
          align-items: center;
          gap: 2px;
        }

        .dual-progress-track {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .progress-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .row-tag {
          font-size: 0.72rem;
          color: var(--color-text-muted);
          width: 80px;
          flex-shrink: 0;
        }

        .bar-wrapper {
          flex: 1;
          height: 8px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
          overflow: hidden;
        }

        .bar-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .before-bar {
          background: linear-gradient(90deg, #ff4757, #ff6b81);
        }

        .now-bar {
          background: linear-gradient(90deg, #00d4aa, #00b894);
        }

        .trajectory-section {
          padding: 8px 0;
        }

        .trajectory-chart-wrap {
          background: rgba(0, 0, 0, 0.25);
          border-radius: var(--radius-md);
          padding: 12px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .trajectory-svg {
          width: 100%;
          height: 170px;
        }

        .trajectory-caption {
          margin-top: 10px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.78rem;
          color: var(--color-text-secondary);
        }

        .vitals-delta-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 12px;
        }

        .vital-delta-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.07);
          padding: 12px;
          border-radius: var(--radius-md);
        }

        .vital-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .vital-name {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--color-text-secondary);
        }

        .vital-tag.improved {
          font-size: 0.72rem;
          font-weight: 700;
          color: #00d4aa;
          display: inline-flex;
          align-items: center;
          gap: 2px;
        }

        .vital-values-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .vital-sub-val {
          display: flex;
          flex-direction: column;
        }

        .vital-sub-val .lbl {
          font-size: 0.65rem;
          color: var(--color-text-muted);
          text-transform: uppercase;
        }

        .vital-sub-val.before .val {
          font-size: 0.92rem;
          color: #ff6b81;
          font-weight: 600;
        }

        .vital-sub-val.now .val {
          font-size: 0.95rem;
          color: #00d4aa;
          font-weight: 700;
        }

        .vital-arrow {
          color: var(--color-text-muted);
          font-size: 0.85rem;
        }

        .physician-remarks-banner {
          margin-top: 18px;
          background: rgba(0, 212, 170, 0.04);
          border: 1px solid rgba(0, 212, 170, 0.2);
          border-radius: var(--radius-md);
          padding: 14px 16px;
        }

        .remarks-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.82rem;
          margin-bottom: 8px;
          flex-wrap: wrap;
          gap: 6px;
        }

        .remarks-date {
          font-size: 0.72rem;
          color: var(--color-text-muted);
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .remarks-body {
          font-size: 0.84rem;
          line-height: 1.6;
          color: var(--color-text-primary);
          margin: 0 0 10px;
        }

        .remarks-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.74rem;
          color: var(--color-text-muted);
          border-top: 1px dashed rgba(255, 255, 255, 0.08);
          padding-top: 8px;
          flex-wrap: wrap;
          gap: 6px;
        }

        .verified-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          color: #00d4aa;
          font-weight: 600;
        }

        @media (max-width: 600px) {
          .recovery-header {
            flex-direction: column;
            align-items: flex-start;
          }
          .score-dial-pill {
            align-self: flex-start;
          }
        }
      `}</style>
    </div>
  );
}
