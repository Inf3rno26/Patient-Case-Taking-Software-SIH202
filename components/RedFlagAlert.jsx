"use client";

import { AlertTriangle, Phone, X } from "lucide-react";

export default function RedFlagAlert({ reason, onDismiss, onTriage }) {
  return (
    <div className="red-flag-overlay" role="alertdialog" aria-label="Emergency Alert">
      <div className="red-flag-card">
        <div className="red-flag-icon">
          <AlertTriangle size={64} color="#ff4757" />
        </div>

        <h2>EMERGENCY DETECTED</h2>
        <p className="red-flag-reason">{reason || "Potential emergency symptoms detected"}</p>

        <div className="red-flag-actions">
          <button className="btn-danger btn-large btn-touch" onClick={onTriage} id="red-flag-triage-btn">
            <Phone size={22} />
            PRIORITY TRIAGE — Alert Staff Now
          </button>

          <button
            className="btn-secondary"
            onClick={onDismiss}
            id="red-flag-dismiss-btn"
            style={{ marginTop: "12px" }}
          >
            <X size={18} />
            Continue Interview (Not Emergency)
          </button>
        </div>

        <p className="red-flag-note">
          If this is a real emergency, please alert nearby hospital staff immediately.
        </p>
      </div>

      <style jsx>{`
        .red-flag-icon {
          margin-bottom: 16px;
          animation: heartbeat 1.5s ease-in-out infinite;
        }

        .red-flag-reason {
          color: var(--color-text-secondary);
          font-size: 1.1rem;
          margin-bottom: 24px;
          line-height: 1.6;
        }

        .red-flag-actions {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          width: 100%;
        }

        .red-flag-note {
          margin-top: 20px;
          font-size: 0.8rem;
          color: var(--color-text-muted);
          text-align: center;
        }
      `}</style>
    </div>
  );
}
