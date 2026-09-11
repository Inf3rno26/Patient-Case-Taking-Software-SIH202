"use client";

import { useState } from "react";
import { AlertTriangle, ShieldAlert, CheckCircle2, ChevronDown, ChevronUp, Leaf, Pill } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";

export default function DrugInteractionCard({ interactions = [], scannedMeds = [] }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");

  if (!scannedMeds || scannedMeds.length === 0) return null;

  const hasInteractions = interactions && interactions.length > 0;

  const filteredInteractions = selectedCategory === "all"
    ? interactions
    : interactions.filter((i) => (selectedCategory === "ayush" ? i.category.includes("AYUSH") : !i.category.includes("AYUSH")));

  const highSeverityCount = interactions.filter((i) => i.severity === "high").length;

  return (
    <GlassCard hoverable={false} className="drug-interaction-card">
      <div className="card-header" onClick={() => setIsExpanded(!isExpanded)} role="button" tabIndex={0}>
        <div className="header-left">
          <div className={`status-badge-icon ${hasInteractions ? (highSeverityCount > 0 ? "danger" : "warning") : "safe"}`}>
            {hasInteractions ? (
              highSeverityCount > 0 ? <ShieldAlert size={20} /> : <AlertTriangle size={20} />
            ) : (
              <CheckCircle2 size={20} />
            )}
          </div>
          <div>
            <div className="title-row">
              <h3 className="card-title">Drug & Herb Interaction Guard</h3>
              <span className="badge-ayush">Module B Compliant</span>
            </div>
            <p className="card-subtitle">
              {hasInteractions
                ? `Identified ${interactions.length} potential interaction${interactions.length > 1 ? "s" : ""} across ${scannedMeds.length} detected medications`
                : `Checked ${scannedMeds.length} medications — No adverse clinical interactions detected`}
            </p>
          </div>
        </div>

        <button className="toggle-btn" aria-label="Toggle details">
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {isExpanded && (
        <div className="card-body animate-fade-in">
          {/* Medication Chips */}
          <div className="meds-list">
            <span className="meds-label">Detected Regimen:</span>
            <div className="meds-chips">
              {scannedMeds.map((med, idx) => {
                const name = typeof med === "string" ? med : med.name;
                const isAyush = ["ashwagandha", "guggulu", "triphala", "curcumin", "turmeric", "tulsi", "neem", "brahmi"].some(h => name?.toLowerCase().includes(h));
                return (
                  <span key={idx} className={`med-chip ${isAyush ? "ayush" : ""}`}>
                    {isAyush ? <Leaf size={12} /> : <Pill size={12} />}
                    {name}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Category Filter if there are multiple */}
          {hasInteractions && (
            <div className="filter-pills">
              <button
                className={`filter-pill ${selectedCategory === "all" ? "active" : ""}`}
                onClick={() => setSelectedCategory("all")}
              >
                All Interactions ({interactions.length})
              </button>
              <button
                className={`filter-pill ${selectedCategory === "allopathic" ? "active" : ""}`}
                onClick={() => setSelectedCategory("allopathic")}
              >
                Allopathic ({interactions.filter(i => !i.category.includes("AYUSH")).length})
              </button>
              <button
                className={`filter-pill ayush ${selectedCategory === "ayush" ? "active" : ""}`}
                onClick={() => setSelectedCategory("ayush")}
              >
                <Leaf size={13} style={{ display: "inline-block", verticalAlign: "middle", marginRight: 4 }} />
                AYUSH Herb-Drug ({interactions.filter(i => i.category.includes("AYUSH")).length})
              </button>
            </div>
          )}

          {/* Interactions List */}
          {hasInteractions ? (
            <div className="interactions-grid">
              {filteredInteractions.map((item, idx) => (
                <div key={idx} className={`interaction-item ${item.severity}`}>
                  <div className="item-header">
                    <div className="item-tags">
                      <span className={`severity-tag ${item.severity}`}>
                        {item.severity.toUpperCase()} RISK
                      </span>
                      <span className="category-tag">{item.category}</span>
                    </div>
                    <span className="drugs-pair">
                      {item.drugA} ↔ {item.drugB}
                    </span>
                  </div>

                  <h4 className="interaction-title">{item.title}</h4>
                  <p className="interaction-mechanism">
                    <strong>Mechanism:</strong> {item.mechanism}
                  </p>
                  <div className="interaction-recommendation">
                    <strong>Clinical Guidance:</strong> {item.recommendation}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="safe-notice">
              <CheckCircle2 size={18} style={{ color: "var(--color-accent-primary)" }} />
              <span>All active medications screened against standard pharmacological and AYUSH pharmacopeia safety databases.</span>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .drug-interaction-card {
          margin-top: 24px;
          border-color: rgba(255, 179, 71, 0.25);
          background: rgba(16, 24, 48, 0.8);
          border-radius: var(--radius-lg);
          padding: 18px 22px;
        }

        .card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          user-select: none;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .status-badge-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .status-badge-icon.danger {
          background: rgba(255, 71, 87, 0.15);
          color: #ff4757;
          box-shadow: 0 0 20px rgba(255, 71, 87, 0.25);
        }

        .status-badge-icon.warning {
          background: rgba(255, 179, 71, 0.15);
          color: #ffb347;
        }

        .status-badge-icon.safe {
          background: rgba(0, 212, 170, 0.15);
          color: #00d4aa;
        }

        .title-row {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .card-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--color-text-primary);
          margin: 0;
        }

        .badge-ayush {
          font-size: 0.68rem;
          padding: 2px 8px;
          border-radius: 50px;
          background: rgba(0, 212, 170, 0.1);
          color: var(--color-accent-primary);
          border: 1px solid rgba(0, 212, 170, 0.25);
          font-weight: 600;
        }

        .card-subtitle {
          font-size: 0.82rem;
          color: var(--color-text-muted);
          margin: 3px 0 0;
        }

        .toggle-btn {
          background: transparent;
          border: none;
          color: var(--color-text-muted);
          cursor: pointer;
          padding: 6px;
          border-radius: 6px;
        }

        .card-body {
          margin-top: 18px;
          padding-top: 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }

        .meds-list {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 16px;
        }

        .meds-label {
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--color-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .meds-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .med-chip {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 0.78rem;
          padding: 4px 10px;
          border-radius: 50px;
          background: rgba(255, 255, 255, 0.05);
          color: var(--color-text-secondary);
          border: 1px solid var(--color-border);
        }

        .med-chip.ayush {
          background: rgba(255, 153, 51, 0.1);
          color: #ff9933;
          border-color: rgba(255, 153, 51, 0.3);
        }

        .filter-pills {
          display: flex;
          gap: 8px;
          margin-bottom: 14px;
        }

        .filter-pill {
          padding: 5px 12px;
          border-radius: 50px;
          font-size: 0.75rem;
          background: rgba(255, 255, 255, 0.04);
          color: var(--color-text-muted);
          border: 1px solid var(--color-border);
          cursor: pointer;
          transition: all 0.2s;
        }

        .filter-pill.active {
          background: rgba(0, 212, 170, 0.15);
          color: var(--color-accent-primary);
          border-color: rgba(0, 212, 170, 0.4);
        }

        .filter-pill.ayush.active {
          background: rgba(255, 153, 51, 0.15);
          color: #ff9933;
          border-color: rgba(255, 153, 51, 0.4);
        }

        .interactions-grid {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .interaction-item {
          padding: 14px 16px;
          border-radius: 10px;
          border: 1px solid var(--color-border);
          background: rgba(255, 255, 255, 0.02);
        }

        .interaction-item.high {
          border-color: rgba(255, 71, 87, 0.35);
          background: rgba(255, 71, 87, 0.04);
        }

        .interaction-item.moderate {
          border-color: rgba(255, 179, 71, 0.35);
          background: rgba(255, 179, 71, 0.04);
        }

        .item-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 8px;
        }

        .item-tags {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .severity-tag {
          font-size: 0.68rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 4px;
          letter-spacing: 0.04em;
        }

        .severity-tag.high {
          background: rgba(255, 71, 87, 0.2);
          color: #ff4757;
        }

        .severity-tag.moderate {
          background: rgba(255, 179, 71, 0.2);
          color: #ffb347;
        }

        .severity-tag.low {
          background: rgba(0, 212, 170, 0.2);
          color: #00d4aa;
        }

        .category-tag {
          font-size: 0.7rem;
          color: var(--color-text-muted);
        }

        .drugs-pair {
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--color-text-primary);
        }

        .interaction-title {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--color-text-primary);
          margin: 0 0 6px;
        }

        .interaction-mechanism {
          font-size: 0.8rem;
          color: var(--color-text-secondary);
          margin: 0 0 6px;
          line-height: 1.5;
        }

        .interaction-recommendation {
          font-size: 0.78rem;
          color: var(--color-accent-primary);
          background: rgba(0, 212, 170, 0.05);
          padding: 6px 10px;
          border-radius: 6px;
          border-left: 3px solid var(--color-accent-primary);
        }

        .safe-notice {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          background: rgba(0, 212, 170, 0.05);
          border-radius: 8px;
          border: 1px solid rgba(0, 212, 170, 0.2);
          font-size: 0.82rem;
          color: var(--color-text-secondary);
        }
      `}</style>
    </GlassCard>
  );
}
