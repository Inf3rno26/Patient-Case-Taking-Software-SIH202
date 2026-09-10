"use client";

import { useState, useEffect } from "react";
import { Activity, ChevronDown, ChevronUp, Info, TrendingUp } from "lucide-react";

/**
 * RiskScoreCard — Visual gauge displaying clinical risk scores
 * Shows composite score + individual validated framework scores
 */
export default function RiskScoreCard({ patientData, compact = false }) {
  const [scores, setScores] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !patientData) return;

    // Dynamic import to avoid SSR issues
    import("@/lib/risk-scoring").then(
      ({ calculateCompositeTriageScore }) => {
        try {
          const result = calculateCompositeTriageScore(patientData);
          setScores(result);
        } catch (e) {
          console.warn("Risk scoring error:", e);
        }
      }
    );
  }, [mounted, patientData]);

  if (!mounted || !scores) return null;

  const { composite, triageLevel, triageColor, allScores } = scores;

  // Gauge arc calculation
  const radius = 54;
  const circumference = Math.PI * radius; // Half circle
  const dashOffset = circumference - (composite / 100) * circumference;

  const triageEmoji =
    triageLevel === "Routine" ? "🟢" :
    triageLevel === "Priority" ? "🔵" :
    triageLevel === "Urgent" ? "🟡" :
    "🔴";

  const applicableScores = allScores.filter(s => s.applicable);

  return (
    <div className="risk-card">
      {/* Header */}
      <div className="risk-card-header">
        <div className="risk-title">
          <Activity size={16} style={{ color: triageColor }} />
          <span>AI Clinical Risk Score</span>
        </div>
        {!compact && applicableScores.length > 0 && (
          <button
            className="risk-expand-btn"
            onClick={() => setExpanded(!expanded)}
            id="risk-expand-btn"
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {expanded ? "Less" : "Details"}
          </button>
        )}
      </div>

      {/* Gauge + Score */}
      <div className="risk-gauge-row">
        {/* Semi-circle gauge */}
        <div className="gauge-wrapper">
          <svg width="130" height="72" viewBox="0 0 130 72">
            <defs>
              <linearGradient id={`gaugeGrad-${triageLevel}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00d4aa" />
                <stop offset="45%" stopColor="#ffb347" />
                <stop offset="100%" stopColor="#ff4757" />
              </linearGradient>
            </defs>

            {/* Background arc */}
            <path
              d="M 10 70 A 55 55 0 0 1 120 70"
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="12"
              strokeLinecap="round"
            />

            {/* Animated fill arc */}
            <path
              d="M 10 70 A 55 55 0 0 1 120 70"
              fill="none"
              stroke={`url(#gaugeGrad-${triageLevel})`}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${(composite / 100) * 173} 173`}
              style={{
                transition: "stroke-dasharray 1s cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}
            />

            {/* Score text */}
            <text
              x="65"
              y="62"
              textAnchor="middle"
              fontSize="22"
              fontWeight="800"
              fill="white"
              fontFamily="var(--font-display, sans-serif)"
            >
              {composite}
            </text>
            <text
              x="65"
              y="73"
              textAnchor="middle"
              fontSize="7"
              fill="rgba(255,255,255,0.5)"
            >
              / 100
            </text>
          </svg>
        </div>

        {/* Triage level */}
        <div className="triage-info">
          <div className="triage-badge" style={{ borderColor: triageColor, color: triageColor }}>
            {triageEmoji} {triageLevel}
          </div>
          <div className="triage-frameworks">
            {applicableScores.map((s) => (
              <div key={s.name} className="framework-mini" style={{ "--fc": s.color }}>
                <span className="fw-name">{s.name.split(" ")[0]}</span>
                <span className="fw-score" style={{ color: s.color }}>
                  {s.score}/{s.maxScore}
                </span>
              </div>
            ))}
            {applicableScores.length === 0 && (
              <p className="no-score-note">
                <Info size={10} /> Based on conversational data
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && applicableScores.length > 0 && (
        <div className="risk-detail animate-fade-in">
          {applicableScores.map((score) => (
            <div key={score.name} className="score-row">
              <div className="score-row-header">
                <span className="score-name">{score.name}</span>
                <span
                  className="score-severity"
                  style={{ color: score.color }}
                >
                  {score.severity}
                </span>
                <span className="score-num" style={{ color: score.color }}>
                  {score.score}/{score.maxScore}
                </span>
              </div>

              {/* Mini progress bar */}
              <div className="score-bar-bg">
                <div
                  className="score-bar-fill"
                  style={{
                    width: `${(score.score / score.maxScore) * 100}%`,
                    background: score.color,
                  }}
                />
              </div>

              <p className="score-recommendation">
                <TrendingUp size={10} /> {score.recommendation}
              </p>

              {/* Contributing factors */}
              {score.factors?.length > 0 && (
                <div className="score-factors">
                  {score.factors.map((f, i) => (
                    <span key={i} className="factor-chip">
                      +{f.points} {f.name}
                    </span>
                  ))}
                </div>
              )}

              {score.note && (
                <p className="score-note">
                  <Info size={10} /> {score.note}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Disclaimer */}
      <p className="risk-disclaimer">
        ⚕️ AI-estimated from conversational data — verify with clinical assessment
      </p>

      <style jsx>{`
        .risk-card {
          background: rgba(0,0,0,0.25);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: var(--radius-md);
          padding: 16px;
          margin-top: 12px;
        }

        .risk-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .risk-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--color-text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .risk-expand-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          border-radius: var(--radius-full);
          border: 1px solid rgba(255,255,255,0.12);
          background: transparent;
          color: var(--color-text-muted);
          font-size: 0.72rem;
          cursor: pointer;
          transition: all 0.15s;
        }

        .risk-expand-btn:hover {
          background: rgba(255,255,255,0.06);
          color: var(--color-text-secondary);
        }

        .risk-gauge-row {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .gauge-wrapper {
          flex-shrink: 0;
        }

        .triage-info {
          flex: 1;
        }

        .triage-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 14px;
          border-radius: var(--radius-full);
          border: 1.5px solid;
          font-size: 0.85rem;
          font-weight: 800;
          letter-spacing: 0.02em;
          margin-bottom: 8px;
        }

        .triage-frameworks {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .framework-mini {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.72rem;
        }

        .fw-name {
          color: var(--color-text-muted);
        }

        .fw-score {
          font-weight: 700;
          font-size: 0.75rem;
        }

        .no-score-note {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.72rem;
          color: var(--color-text-muted);
        }

        .risk-detail {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid rgba(255,255,255,0.06);
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .score-row {
          padding: 12px;
          background: rgba(255,255,255,0.03);
          border-radius: var(--radius-sm);
          border: 1px solid rgba(255,255,255,0.06);
        }

        .score-row-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 6px;
        }

        .score-name {
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--color-text-secondary);
          flex: 1;
        }

        .score-severity {
          font-size: 0.72rem;
          font-weight: 600;
        }

        .score-num {
          font-size: 0.8rem;
          font-weight: 800;
          font-family: var(--font-display);
        }

        .score-bar-bg {
          height: 5px;
          background: rgba(255,255,255,0.08);
          border-radius: 3px;
          margin-bottom: 6px;
          overflow: hidden;
        }

        .score-bar-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .score-recommendation {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.72rem;
          color: var(--color-text-muted);
          line-height: 1.4;
          margin-bottom: 6px;
        }

        .score-factors {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          margin-top: 4px;
        }

        .factor-chip {
          padding: 2px 8px;
          border-radius: var(--radius-full);
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          font-size: 0.67rem;
          color: var(--color-text-muted);
        }

        .score-note {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.67rem;
          color: rgba(255,255,255,0.3);
          margin-top: 4px;
          font-style: italic;
        }

        .risk-disclaimer {
          font-size: 0.67rem;
          color: var(--color-text-muted);
          text-align: center;
          margin-top: 12px;
          padding-top: 8px;
          border-top: 1px solid rgba(255,255,255,0.04);
        }
      `}</style>
    </div>
  );
}
