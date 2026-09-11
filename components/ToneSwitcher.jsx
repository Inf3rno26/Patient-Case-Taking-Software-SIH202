"use client";

import { useTone, TONES } from "@/context/ToneContext";
import { Palette, Check } from "lucide-react";

export default function ToneSwitcher({ compact = false, showLabel = true, className = "" }) {
  const { tone, setTone } = useTone();

  return (

    <div className={`tone-switcher-container ${compact ? "compact" : ""} ${className}`} role="region" aria-label="Color Theme Selection">
      {showLabel && !compact && (
        <div className="tone-header">
          <Palette size={15} className="tone-icon" />
          <span className="tone-title">Theme Tone / रंग टोन</span>
        </div>
      )}

      <div className="tone-toggle-pill" role="radiogroup" aria-label="Select tone">
        {/* Deep Slate Navy Button */}
        <button
          type="button"
          className={`tone-btn tone-navy ${tone === "slate" ? "active" : ""}`}
          onClick={() => setTone("slate")}
          role="radio"
          aria-checked={tone === "slate"}
          id="tone-btn-navy"
          title="Switch to Deep Slate Navy theme (#1E293B)"
        >
          <span className="swatch-indicator navy-swatch">
            {tone === "slate" && <Check size={11} className="swatch-check" />}
          </span>
          <span className="tone-btn-text">
            <span className="tone-name">Slate Navy</span>
            {!compact && <span className="tone-hex">#1E293B</span>}
          </span>
        </button>

        {/* Soft Medical Teal Button */}
        <button
          type="button"
          className={`tone-btn tone-teal ${tone === "teal" ? "active" : ""}`}
          onClick={() => setTone("teal")}
          role="radio"
          aria-checked={tone === "teal"}
          id="tone-btn-teal"
          title="Switch to Soft Medical Teal theme (#0D9488 / #00D4AA)"
        >
          <span className="swatch-indicator teal-swatch">
            {tone === "teal" && <Check size={11} className="swatch-check" />}
          </span>
          <span className="tone-btn-text">
            <span className="tone-name">Medical Teal</span>
            {!compact && <span className="tone-hex">#00D4AA</span>}
          </span>
        </button>
      </div>

      <style jsx>{`
        .tone-switcher-container {
          display: inline-flex;
          flex-direction: column;
          gap: 6px;
        }

        .tone-switcher-container.compact {
          flex-direction: row;
          align-items: center;
        }

        .tone-header {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.78rem;
          color: var(--color-text-muted);
          font-weight: 600;
        }

        .tone-icon {
          color: var(--color-accent-primary);
        }

        .tone-toggle-pill {
          display: inline-flex;
          align-items: center;
          background: rgba(15, 23, 42, 0.7);
          padding: 4px;
          border-radius: 50px;
          border: 1px solid var(--color-border);
          backdrop-filter: blur(12px);
          gap: 4px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
          transition: border-color 0.25s ease;
        }

        .tone-toggle-pill:hover {
          border-color: var(--color-border-accent);
        }

        .tone-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 6px 14px;
          border-radius: 50px;
          border: 1px solid transparent;
          background: transparent;
          color: var(--color-text-secondary);
          cursor: pointer;
          font-size: 0.8rem;
          font-weight: 600;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          white-space: nowrap;
          outline: none;
        }

        .compact .tone-btn {
          padding: 5px 11px;
          font-size: 0.76rem;
        }

        .tone-btn:hover {
          color: var(--color-text-primary);
          background: rgba(255, 255, 255, 0.05);
        }

        .tone-btn.active.tone-navy {
          background: #1e293b;
          color: #f8fafc;
          border-color: rgba(56, 189, 248, 0.5);
          box-shadow: 0 0 14px rgba(56, 189, 248, 0.35);
        }

        .tone-btn.active.tone-teal {
          background: rgba(13, 148, 136, 0.3);
          color: #f0fdfa;
          border-color: rgba(0, 212, 170, 0.5);
          box-shadow: 0 0 14px rgba(0, 212, 170, 0.35);
        }

        .swatch-indicator {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: transform 0.2s ease;
        }

        .navy-swatch {
          background: linear-gradient(135deg, #1e293b 0%, #38bdf8 100%);
          box-shadow: 0 0 6px rgba(56, 189, 248, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .teal-swatch {
          background: linear-gradient(135deg, #0d9488 0%, #00d4aa 100%);
          box-shadow: 0 0 6px rgba(0, 212, 170, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .tone-btn.active .swatch-indicator {
          transform: scale(1.15);
        }

        .swatch-check {
          color: #ffffff;
          stroke-width: 3.5;
        }

        .tone-btn-text {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .tone-name {
          letter-spacing: 0.01em;
        }

        .tone-hex {
          font-size: 0.68rem;
          opacity: 0.7;
          font-family: monospace;
          background: rgba(0, 0, 0, 0.3);
          padding: 1px 5px;
          border-radius: 4px;
        }

        .skeleton-pill {
          width: 220px;
          height: 36px;
          border-radius: 50px;
          background: rgba(255, 255, 255, 0.05);
        }
      `}</style>
    </div>
  );
}
