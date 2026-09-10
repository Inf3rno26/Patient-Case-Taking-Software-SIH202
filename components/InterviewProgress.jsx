"use client";

import { Check } from "lucide-react";
import { HISTORY_SECTIONS } from "@/lib/clinical-schema";

export default function InterviewProgress({ currentSection, progress = 0 }) {
  const currentIndex = HISTORY_SECTIONS.findIndex((s) => s.id === currentSection);

  return (
    <div className="interview-progress">
      {/* Linear progress bar */}
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Step indicators */}
      <div className="steps-row">
        {HISTORY_SECTIONS.map((section, index) => {
          const isCompleted = index < currentIndex;
          const isActive = index === currentIndex;
          const status = isCompleted ? "completed" : isActive ? "active" : "";

          return (
            <div key={section.id} className={`step-chip ${status}`}>
              <span className="step-icon">
                {isCompleted ? <Check size={12} /> : section.icon}
              </span>
              <span className="step-text">{section.shortLabel}</span>
            </div>
          );
        })}
      </div>

      {/* Current section label */}
      <p className="current-section-label">
        {currentSection === "complete"
          ? "✅ Interview Complete"
          : `${HISTORY_SECTIONS[currentIndex]?.icon || ""} ${HISTORY_SECTIONS[currentIndex]?.label || ""}`}
      </p>

      <style jsx>{`
        .interview-progress {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 16px 0;
        }

        .steps-row {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          justify-content: center;
        }

        .step-chip {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 500;
          background: var(--color-bg-glass);
          border: 1px solid var(--color-border);
          color: var(--color-text-muted);
          transition: all var(--transition-base);
        }

        .step-chip.active {
          background: rgba(0, 212, 170, 0.1);
          border-color: var(--color-accent-primary);
          color: var(--color-accent-primary);
          box-shadow: 0 0 12px rgba(0, 212, 170, 0.2);
        }

        .step-chip.completed {
          background: rgba(0, 212, 170, 0.05);
          border-color: rgba(0, 212, 170, 0.2);
          color: var(--color-accent-primary);
          opacity: 0.7;
        }

        .step-icon {
          display: flex;
          align-items: center;
          font-size: 0.85rem;
        }

        .step-text {
          display: none;
        }

        .current-section-label {
          text-align: center;
          font-size: 0.85rem;
          color: var(--color-text-secondary);
          font-weight: 500;
        }

        @media (min-width: 768px) {
          .step-text {
            display: inline;
          }
        }
      `}</style>
    </div>
  );
}
