"use client";

import { useState, useEffect } from "react";
import { Eye, Type, Volume2, Sparkles, X, SlidersHorizontal, Palette } from "lucide-react";
import { speakText } from "@/lib/languages";
import ToneSwitcher from "@/components/ToneSwitcher";


export default function AccessibilityBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [fontSize, setFontSize] = useState("normal"); // 'normal' | 'large' | 'xlarge'
  const [highContrast, setHighContrast] = useState(false);
  const [slowSpeech, setSlowSpeech] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedFont = localStorage.getItem("medikiosk_a11y_font") || "normal";
    const savedContrast = localStorage.getItem("medikiosk_a11y_contrast") === "true";
    const savedSlow = localStorage.getItem("medikiosk_a11y_slow") === "true";

    setFontSize(savedFont);
    setHighContrast(savedContrast);
    setSlowSpeech(savedSlow);

    applyStyles(savedFont, savedContrast);
  }, []);

  const applyStyles = (font, contrast) => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-font-size", font);
      if (contrast) {
        document.documentElement.setAttribute("data-contrast", "high");
      } else {
        document.documentElement.removeAttribute("data-contrast");
      }
    }
  };

  const handleFontChange = (size) => {
    setFontSize(size);
    localStorage.setItem("medikiosk_a11y_font", size);
    applyStyles(size, highContrast);
  };

  const toggleContrast = () => {
    const next = !highContrast;
    setHighContrast(next);
    localStorage.setItem("medikiosk_a11y_contrast", String(next));
    applyStyles(fontSize, next);
  };

  const toggleSlowSpeech = () => {
    const next = !slowSpeech;
    setSlowSpeech(next);
    localStorage.setItem("medikiosk_a11y_slow", String(next));
    if (next) {
      speakText("Slow and clear voice mode activated. Speak slowly into the kiosk.", "en-IN");
    }
  };

  if (!mounted) return null;

  return (
    <div className="a11y-container no-print">
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          className="a11y-fab"
          onClick={() => setIsOpen(true)}
          title="Elderly Accessibility & Visual Settings (सुगमता सेटिंग्स)"
          aria-label="Accessibility settings"
          id="a11y-trigger-btn"
        >
          <SlidersHorizontal size={18} />
          <span className="a11y-fab-text">Accessibility (सुगमता)</span>
        </button>
      )}

      {/* Slide-out Accessibility Drawer */}
      {isOpen && (
        <div className="a11y-drawer animate-scale-in">
          <div className="a11y-header">
            <div className="a11y-title-group">
              <Eye size={18} style={{ color: "var(--color-accent-primary)" }} />
              <h4>Elderly & Accessibility Mode / सुगमता</h4>
            </div>
            <button className="a11y-close-btn" onClick={() => setIsOpen(false)} aria-label="Close">
              <X size={16} />
            </button>
          </div>

          <div className="a11y-body">
            {/* Font Size Option */}
            <div className="a11y-option">
              <div className="option-label">
                <Type size={16} />
                <span>Text Size / अक्षर का आकार</span>
              </div>
              <div className="font-buttons">
                <button
                  className={`size-btn ${fontSize === "normal" ? "active" : ""}`}
                  onClick={() => handleFontChange("normal")}
                >
                  A
                </button>
                <button
                  className={`size-btn ${fontSize === "large" ? "active" : ""}`}
                  onClick={() => handleFontChange("large")}
                  style={{ fontSize: "1.1rem" }}
                >
                  A+
                </button>
                <button
                  className={`size-btn ${fontSize === "xlarge" ? "active" : ""}`}
                  onClick={() => handleFontChange("xlarge")}
                  style={{ fontSize: "1.25rem", fontWeight: "bold" }}
                >
                  A++
                </button>
              </div>
            </div>

            {/* High Contrast Mode */}
            <div className="a11y-option">
              <div className="option-label">
                <Sparkles size={16} />
                <span>High Contrast / स्पष्ट दृश्य</span>
              </div>
              <button
                className={`toggle-switch-btn ${highContrast ? "active" : ""}`}
                onClick={toggleContrast}
                id="a11y-contrast-toggle"
              >
                {highContrast ? "ON (सक्रिय)" : "OFF (सामान्य)"}
              </button>
            </div>

            {/* Slow Voice TTS */}
            <div className="a11y-option">
              <div className="option-label">
                <Volume2 size={16} />
                <span>Slow & Clear Voice / धीमी आवाज़</span>
              </div>
              <button
                className={`toggle-switch-btn ${slowSpeech ? "active" : ""}`}
                onClick={toggleSlowSpeech}
                id="a11y-speech-toggle"
              >
                {slowSpeech ? "0.75x (Slow)" : "1.0x (Normal)"}
              </button>
            </div>

            {/* Two-Tone Color Theme Selection */}
            <div className="a11y-option" style={{ flexDirection: "column", alignItems: "flex-start", gap: "10px" }}>
              <div className="option-label">
                <Palette size={16} />
                <span>Two-Tone Theme / रंग टोन</span>
              </div>
              <ToneSwitcher compact={false} showLabel={false} />
            </div>
          </div>


          <div className="a11y-footer">
            <span className="a11y-footer-note">Designed for non-tech-savvy & elderly patients</span>
          </div>
        </div>
      )}

      <style jsx>{`
        .a11y-container {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 999;
          font-family: var(--font-primary);
        }

        .a11y-fab {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          background: rgba(13, 20, 42, 0.92);
          border: 1px solid rgba(0, 212, 170, 0.4);
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4), 0 0 16px rgba(0, 212, 170, 0.2);
          border-radius: var(--radius-full);
          color: var(--color-accent-primary);
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          backdrop-filter: blur(16px);
          transition: all 0.2s ease;
        }

        .a11y-fab:hover {
          transform: translateY(-2px);
          border-color: var(--color-accent-primary);
          box-shadow: 0 6px 28px rgba(0, 212, 170, 0.35);
        }

        .a11y-drawer {
          width: 320px;
          background: rgba(10, 16, 36, 0.96);
          border: 1px solid rgba(0, 212, 170, 0.35);
          border-radius: 16px;
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6), 0 0 30px rgba(0, 212, 170, 0.15);
          backdrop-filter: blur(24px);
          overflow: hidden;
        }

        .a11y-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.02);
        }

        .a11y-title-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .a11y-title-group h4 {
          margin: 0;
          font-size: 0.88rem;
          font-weight: 700;
          color: var(--color-text-primary);
        }

        .a11y-close-btn {
          background: transparent;
          border: none;
          color: var(--color-text-muted);
          cursor: pointer;
          padding: 4px;
          display: flex;
          border-radius: 4px;
        }

        .a11y-close-btn:hover {
          color: var(--color-text-primary);
        }

        .a11y-body {
          padding: 14px 16px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .a11y-option {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .option-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.82rem;
          color: var(--color-text-secondary);
        }

        .font-buttons {
          display: flex;
          background: rgba(255, 255, 255, 0.06);
          border-radius: 8px;
          padding: 2px;
          border: 1px solid var(--color-border);
        }

        .size-btn {
          padding: 4px 10px;
          background: transparent;
          border: none;
          color: var(--color-text-muted);
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.85rem;
          transition: all 0.15s;
        }

        .size-btn.active {
          background: var(--color-accent-primary);
          color: #060a1a;
          font-weight: 700;
        }

        .toggle-switch-btn {
          padding: 6px 12px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid var(--color-border);
          border-radius: 8px;
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--color-text-muted);
          cursor: pointer;
          transition: all 0.2s;
        }

        .toggle-switch-btn.active {
          background: rgba(0, 212, 170, 0.2);
          border-color: var(--color-accent-primary);
          color: var(--color-accent-primary);
        }

        .a11y-footer {
          padding: 8px 16px 12px;
          text-align: center;
          border-top: 1px solid rgba(255, 255, 255, 0.04);
        }

        .a11y-footer-note {
          font-size: 0.7rem;
          color: var(--color-text-muted);
        }

        @media (max-width: 480px) {
          .a11y-container {
            bottom: 16px;
            right: 16px;
          }
          .a11y-drawer {
            width: calc(100vw - 32px);
          }
        }
      `}</style>
    </div>
  );
}
