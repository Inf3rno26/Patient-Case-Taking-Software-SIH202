"use client";

import { useState } from "react";
import { Shield, Volume2, Check, X } from "lucide-react";
import { speakText } from "@/lib/languages";

export default function ConsentModal({ language = "en-IN", onAccept, onDecline }) {
  const [consent, setConsent] = useState({
    dataCapture: false,
    dataSharing: false,
    abhaLinking: false,
  });

  const isHindi = language.startsWith("hi");

  const consentItems = [
    {
      key: "dataCapture",
      title: isHindi ? "डेटा संग्रहण" : "Data Capture",
      description: isHindi
        ? "मैं अपनी मेडिकल हिस्ट्री AI द्वारा रिकॉर्ड करने की अनुमति देता/देती हूँ।"
        : "I allow my medical history to be recorded by the AI system during this session.",
      icon: "📋",
    },
    {
      key: "dataSharing",
      title: isHindi ? "डेटा साझाकरण" : "Data Sharing with Doctor",
      description: isHindi
        ? "मेरी मेडिकल जानकारी मेरे डॉक्टर के साथ साझा की जा सकती है।"
        : "My medical information may be shared with my consulting physician for treatment purposes.",
      icon: "👨‍⚕️",
    },
    {
      key: "abhaLinking",
      title: isHindi ? "ABHA लिंकिंग" : "ABHA Record Linking",
      description: isHindi
        ? "मेरा रिकॉर्ड मेरी ABHA ID से जोड़ा जा सकता है। (वैकल्पिक)"
        : "My record may be linked to my ABHA ID for digital health records. (Optional)",
      icon: "🔗",
    },
  ];

  const allRequired = consent.dataCapture && consent.dataSharing;

  const handleSpeak = () => {
    const text = isHindi
      ? "कृपया नीचे दी गई सहमति पढ़ें। आपकी मेडिकल जानकारी सुरक्षित रहेगी और केवल आपके डॉक्टर के साथ साझा की जाएगी।"
      : "Please review the consent below. Your medical information will be kept secure and only shared with your consulting physician.";
    speakText(text, language);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="consent-header">
          <Shield size={32} className="text-gradient" />
          <h2>{isHindi ? "सहमति और गोपनीयता" : "Consent & Privacy"}</h2>
          <button className="btn-icon" onClick={handleSpeak} aria-label="Listen to consent" id="consent-listen-btn">
            <Volume2 size={20} />
          </button>
        </div>

        <p className="consent-intro">
          {isHindi
            ? "आपकी जानकारी Digital Personal Data Protection Act 2023 के अनुसार सुरक्षित रहेगी।"
            : "Your information is protected under the Digital Personal Data Protection Act 2023 and ABDM consent framework."}
        </p>

        <div className="consent-items">
          {consentItems.map((item) => (
            <label key={item.key} className={`consent-item ${consent[item.key] ? "checked" : ""}`}>
              <div className="consent-checkbox" onClick={() => setConsent((prev) => ({ ...prev, [item.key]: !prev[item.key] }))}>
                {consent[item.key] ? <Check size={16} color="#00d4aa" /> : null}
              </div>
              <div className="consent-text">
                <span className="consent-icon">{item.icon}</span>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.description}</p>
                </div>
              </div>
            </label>
          ))}
        </div>

        <div className="consent-actions">
          <button
            className="btn-primary btn-large btn-touch"
            disabled={!allRequired}
            onClick={() => onAccept(consent)}
            id="consent-accept-btn"
            style={{ width: "100%" }}
          >
            <Check size={22} />
            {isHindi ? "मैं सहमत हूँ" : "I Agree & Continue"}
          </button>

          <button
            className="btn-secondary"
            onClick={onDecline}
            id="consent-decline-btn"
            style={{ width: "100%", marginTop: "8px" }}
          >
            <X size={18} />
            {isHindi ? "मैं असहमत हूँ" : "I Decline"}
          </button>
        </div>

        <p className="consent-footer">
          {isHindi
            ? "सहमति कभी भी वापस ली जा सकती है। सत्र के बाद अस्थायी डेटा हटा दिया जाएगा।"
            : "Consent is revocable at any time. Temporary session data is cleared immediately after submission."}
        </p>
      </div>

      <style jsx>{`
        .consent-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .consent-header h2 {
          flex: 1;
          font-size: 1.4rem;
        }

        .consent-intro {
          color: var(--color-text-secondary);
          font-size: 0.9rem;
          margin-bottom: 20px;
          line-height: 1.6;
        }

        .consent-items {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 24px;
        }

        .consent-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 14px;
          border-radius: var(--radius-md);
          background: var(--color-bg-glass);
          border: 1px solid var(--color-border);
          cursor: pointer;
          transition: all var(--transition-base);
        }

        .consent-item:hover {
          border-color: var(--color-border-accent);
        }

        .consent-item.checked {
          border-color: rgba(0, 212, 170, 0.3);
          background: rgba(0, 212, 170, 0.05);
        }

        .consent-checkbox {
          width: 24px;
          height: 24px;
          min-width: 24px;
          border: 2px solid var(--color-border);
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 2px;
          transition: all var(--transition-fast);
        }

        .consent-item.checked .consent-checkbox {
          border-color: var(--color-accent-primary);
          background: rgba(0, 212, 170, 0.1);
        }

        .consent-text {
          display: flex;
          gap: 10px;
          flex: 1;
        }

        .consent-icon {
          font-size: 1.4rem;
          line-height: 1;
          margin-top: 2px;
        }

        .consent-text strong {
          display: block;
          margin-bottom: 4px;
          font-size: 0.95rem;
        }

        .consent-text p {
          color: var(--color-text-muted);
          font-size: 0.82rem;
          line-height: 1.5;
          margin: 0;
        }

        .consent-actions {
          margin-top: 8px;
        }

        .consent-footer {
          margin-top: 16px;
          font-size: 0.75rem;
          color: var(--color-text-muted);
          text-align: center;
          line-height: 1.5;
        }
      `}</style>
    </div>
  );
}
