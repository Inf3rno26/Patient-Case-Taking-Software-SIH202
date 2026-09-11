"use client";

import { useState, useEffect, useCallback } from "react";
import { AlertTriangle, CheckCircle2, Pill, Loader2, ChevronDown, ChevronUp, Shield, AlertCircle, Info, Stethoscope } from "lucide-react";

/**
 * DrugInteractionPanel — Auto-checks medications for interactions via Gemini AI
 */
export default function DrugInteractionPanel({ medications = [], patientName }) {
  const [result, setResult] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(true);

  const checkInteractions = useCallback(async () => {
    if (!medications || medications.length < 2) {
      setResult({ interactions: [], safe: true, overallRisk: "LOW", message: "Only one medication — no interaction check needed" });
      return;
    }

    setIsChecking(true);
    setError(null);

    try {
      const response = await fetch("/api/drug-interactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ medications }),
      });

      if (!response.ok) throw new Error("Interaction check failed");
      const data = await response.json();
      setResult(data);
    } catch (e) {
      setError("Could not check interactions — verify manually");
      console.error("Drug interaction check error:", e);
    } finally {
      setIsChecking(false);
    }
  }, [medications]);

  useEffect(() => {
    if (medications?.length >= 2) {
      checkInteractions();
    } else {
      setResult(null);
    }
  }, [medications, checkInteractions]);

  const severityConfig = {
    SEVERE: { color: "#ff4757", bg: "rgba(255,71,87,0.08)", border: "rgba(255,71,87,0.3)", icon: AlertCircle, label: "SEVERE" },
    MODERATE: { color: "#ffb347", bg: "rgba(255,179,71,0.08)", border: "rgba(255,179,71,0.3)", icon: AlertTriangle, label: "MODERATE" },
    MILD: { color: "#4db8ff", bg: "rgba(77,184,255,0.08)", border: "rgba(77,184,255,0.3)", icon: Info, label: "MILD" },
  };

  const riskColor = result?.overallRisk === "HIGH" ? "#ff4757" : result?.overallRisk === "MODERATE" ? "#ffb347" : "#00d4aa";

  if (medications?.length < 2) return null;

  return (
    <div className="di-panel">
      {/* Header */}
      <div className="di-header" onClick={() => setExpanded(!expanded)} style={{ cursor: "pointer" }}>
        <div className="di-title">
          <Shield size={15} style={{ color: riskColor }} />
          <span>AI Drug Interaction Check</span>
          {isChecking && <Loader2 size={13} className="spin" />}
          {result && !isChecking && (
            <span
              className="risk-pill"
              style={{ background: `${riskColor}18`, color: riskColor, borderColor: `${riskColor}40` }}
            >
              {result.overallRisk || "LOW"} RISK
            </span>
          )}
        </div>
        <button className="di-expand-btn" id="di-expand-btn">
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {expanded && (
        <div className="di-body animate-fade-in">
          {/* Medications listed */}
          <div className="meds-list">
            {medications.map((med, i) => {
              const name = typeof med === "string" ? med : `${med.name || ""} ${med.dosage || ""}`.trim();
              return (
                <span key={i} className="med-chip">
                  <Pill size={10} /> {name}
                </span>
              );
            })}
          </div>

          {/* Loading */}
          {isChecking && (
            <div className="di-loading">
              <Loader2 size={16} className="spin" />
              <span>Analyzing {medications.length} medications with Gemini AI...</span>
            </div>
          )}

          {/* Error */}
          {error && !isChecking && (
            <div className="di-error">
              <AlertTriangle size={14} />
              <span>{error}</span>
            </div>
          )}

          {/* Results */}
          {result && !isChecking && (
            <>
              {result.interactions?.length === 0 ? (
                <div className="di-safe">
                  <CheckCircle2 size={16} style={{ color: "#00d4aa" }} />
                  <div>
                    <p className="di-safe-title">No significant interactions detected</p>
                    <p className="di-safe-sub">{result.summary || "Medication combination appears safe based on AI analysis"}</p>
                  </div>
                </div>
              ) : (
                <div className="interactions-list">
                  <p className="interactions-summary">
                    {result.summary}
                  </p>
                  {result.interactions.map((interaction, i) => {
                    const cfg = severityConfig[interaction.severity] || severityConfig.MILD;
                    return (
                      <div
                        key={i}
                        className="interaction-card"
                        style={{
                          background: cfg.bg,
                          borderColor: cfg.border,
                        }}
                      >
                        <div className="interaction-header">
                          <span className="severity-badge" style={{ color: cfg.color, display: "inline-flex", alignItems: "center", gap: 4 }}>
                            {cfg.icon && <cfg.icon size={13} />} {cfg.label}
                          </span>
                          <div className="drug-pair">
                            <span className="drug-name">{interaction.drug1}</span>
                            <span className="drug-plus">⟷</span>
                            <span className="drug-name">{interaction.drug2}</span>
                          </div>
                        </div>

                        <p className="interaction-effect" style={{ color: cfg.color, display: "flex", alignItems: "center", gap: 6 }}>
                          <AlertTriangle size={14} /> {interaction.effect}
                        </p>

                        {interaction.mechanism && (
                          <p className="interaction-detail">
                            <strong>Mechanism:</strong> {interaction.mechanism}
                          </p>
                        )}

                        <div className="interaction-management">
                          <strong style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                            <Stethoscope size={13} /> Management:
                          </strong>{" "}
                          {interaction.management}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {result.disclaimer && (
                <p className="di-disclaimer">{result.disclaimer}</p>
              )}
            </>
          )}
        </div>
      )}

      <style jsx>{`
        .di-panel {
          background: rgba(0,0,0,0.2);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: var(--radius-md);
          margin-top: 16px;
          overflow: hidden;
        }

        .di-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .di-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--color-text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .risk-pill {
          padding: 2px 8px;
          border-radius: var(--radius-full);
          border: 1px solid;
          font-size: 0.65rem;
          font-weight: 800;
          letter-spacing: 0.05em;
        }

        .di-expand-btn {
          background: transparent;
          border: none;
          color: var(--color-text-muted);
          cursor: pointer;
          padding: 4px;
          display: flex;
        }

        .di-body {
          padding: 12px 16px 16px;
        }

        .meds-list {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 12px;
        }

        .med-chip {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 10px;
          border-radius: var(--radius-full);
          background: rgba(0, 212, 170, 0.06);
          border: 1px solid rgba(0, 212, 170, 0.2);
          color: var(--color-accent-primary);
          font-size: 0.72rem;
          font-weight: 500;
        }

        .di-loading {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px;
          color: var(--color-text-muted);
          font-size: 0.82rem;
        }

        .di-error {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          background: rgba(255,71,87,0.06);
          border-radius: var(--radius-sm);
          color: #ff6b7a;
          font-size: 0.78rem;
        }

        .di-safe {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 12px;
          background: rgba(0,212,170,0.06);
          border-radius: var(--radius-sm);
          border: 1px solid rgba(0,212,170,0.15);
        }

        .di-safe-title {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--color-accent-primary);
          margin-bottom: 2px;
        }

        .di-safe-sub {
          font-size: 0.75rem;
          color: var(--color-text-muted);
        }

        .interactions-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .interactions-summary {
          font-size: 0.78rem;
          color: var(--color-text-muted);
          margin-bottom: 8px;
          line-height: 1.5;
        }

        .interaction-card {
          padding: 12px;
          border-radius: var(--radius-sm);
          border: 1px solid;
        }

        .interaction-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 6px;
          flex-wrap: wrap;
        }

        .severity-badge {
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.04em;
          white-space: nowrap;
        }

        .drug-pair {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        .drug-name {
          font-size: 0.78rem;
          font-weight: 700;
          color: var(--color-text-primary);
          text-transform: capitalize;
        }

        .drug-plus {
          font-size: 0.8rem;
          color: var(--color-text-muted);
        }

        .interaction-effect {
          font-size: 0.78rem;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .interaction-detail {
          font-size: 0.73rem;
          color: var(--color-text-muted);
          margin-bottom: 4px;
          line-height: 1.4;
        }

        .interaction-management {
          font-size: 0.73rem;
          color: var(--color-text-secondary);
          padding: 6px 8px;
          background: rgba(255,255,255,0.04);
          border-radius: 4px;
          margin-top: 4px;
          line-height: 1.5;
        }

        .di-disclaimer {
          font-size: 0.65rem;
          color: rgba(255,255,255,0.3);
          text-align: center;
          margin-top: 10px;
          font-style: italic;
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
