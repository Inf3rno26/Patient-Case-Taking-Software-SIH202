"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Activity, Mic, FileText, ClipboardList, Shield, ArrowRight, Volume2, Zap } from "lucide-react";
import { LANGUAGES, speakText } from "@/lib/languages";
import { usePatient } from "@/context/PatientContext";

function WelcomeContent() {
  const router = useRouter();
  const { setLanguage, language, loadDemoSession } = usePatient();
  const [selectedLang, setSelectedLang] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [isNavigating, setIsNavigating] = useState(false);

  const handleLanguageSelect = (lang) => {
    setSelectedLang(lang.code);
    setLanguage(lang.code);
    setIsNavigating(true);
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("medikiosk_language", lang.code);
      }
      speakText(lang.greeting, lang.code);
    } catch (e) {
      console.warn("TTS unavailable:", e);
    }
    
    // Immediate smooth transition to registration page
    setTimeout(() => {
      router.push("/register");
    }, 450);
  };

  const handleContinue = () => {
    setIsNavigating(true);
    router.push("/register");
  };

  const handleDemoMode = () => {
    setIsDemoMode(true);
    loadDemoSession("en-IN");
    setTimeout(() => {
      router.push("/summary");
    }, 400);
  };

  if (!mounted) return null;

  const features = [
    { icon: <Mic size={28} />, title: "Voice Interview", desc: "Speak naturally in your language" },
    { icon: <FileText size={28} />, title: "Document Scan", desc: "Upload prescriptions & reports" },
    { icon: <ClipboardList size={28} />, title: "AI Summary", desc: "Structured history for doctors" },
    { icon: <Shield size={28} />, title: "Secure & Private", desc: "DPDPA 2023 compliant" },
  ];

  return (
    <div className="welcome-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-badge animate-fade-in">
          <Activity size={16} />
          <span>AI-Powered Clinical History</span>
        </div>

        <h1 className="hero-title animate-fade-in delay-1">
          <span className="text-gradient">MediKiosk</span>
        </h1>

        <p className="hero-subtitle animate-fade-in delay-2">
          Record your complete medical history through simple voice conversation — before you see the doctor.
        </p>

        {/* Features row */}
        <div className="features-row animate-fade-in delay-3">
          {features.map((f, i) => (
            <div key={i} className="feature-chip">
              <div className="feature-icon">{f.icon}</div>
              <div>
                <strong>{f.title}</strong>
                <span>{f.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Language Selection */}
      <section className="language-section animate-fade-in-up delay-4">
        <h2>Select Your Language / अपनी भाषा चुनें</h2>
        <p style={{ color: "var(--color-text-muted)", marginBottom: 20 }}>
          <Volume2 size={14} style={{ display: "inline", verticalAlign: "middle" }} /> Tap any language to begin / शुरू करने के लिए भाषा चुनें
        </p>

        <div className="language-grid">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              type="button"
              className={`language-card ${selectedLang === lang.code ? "selected" : ""}`}
              onClick={() => handleLanguageSelect(lang)}
              id={`lang-${lang.code}`}
            >
              <span className="lang-native">{lang.native}</span>
              <span className="lang-english">{lang.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Action Buttons */}
      <section className="continue-section" style={{ marginTop: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <button
            className="btn-primary btn-large btn-touch"
            onClick={handleContinue}
            id="welcome-continue-btn"
            style={{ minWidth: "300px" }}
            disabled={isNavigating || isDemoMode}
          >
            <ArrowRight size={22} />
            {isNavigating ? "Opening Registration..." : "Continue / आगे बढ़ें"}
          </button>
          <button
            className="demo-mode-btn btn-touch"
            onClick={handleDemoMode}
            id="welcome-demo-btn"
            disabled={isNavigating || isDemoMode}
            title="Load a pre-filled patient demo to skip to the summary"
          >
            <Zap size={16} />
            {isDemoMode ? "Loading Demo..." : "⚡ Demo / Judge Mode"}
          </button>
        </div>
      </section>

      <style jsx>{`
        .welcome-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 60px 20px 40px;
          position: relative;
          z-index: 1;
        }

        .hero {
          text-align: center;
          max-width: 800px;
          margin-bottom: 40px;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 18px;
          border-radius: 50px;
          background: rgba(0, 212, 170, 0.08);
          border: 1px solid rgba(0, 212, 170, 0.2);
          color: var(--color-accent-primary);
          font-size: 0.85rem;
          font-weight: 500;
          margin-bottom: 24px;
        }

        .hero-title {
          font-family: var(--font-display);
          font-size: clamp(3rem, 8vw, 5rem);
          font-weight: 900;
          margin-bottom: 16px;
          letter-spacing: -0.02em;
        }

        .hero-subtitle {
          font-size: clamp(1rem, 2.5vw, 1.25rem);
          color: var(--color-text-secondary);
          max-width: 600px;
          margin: 0 auto 32px;
          line-height: 1.7;
        }

        .features-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          width: 100%;
          max-width: 900px;
        }

        .feature-chip {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          border-radius: var(--radius-md);
          background: var(--color-bg-glass);
          border: 1px solid var(--color-border);
          text-align: left;
        }

        .feature-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: rgba(0, 212, 170, 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-accent-primary);
          flex-shrink: 0;
        }

        .feature-chip strong {
          display: block;
          font-size: 0.9rem;
          margin-bottom: 2px;
        }

        .feature-chip span {
          font-size: 0.78rem;
          color: var(--color-text-muted);
        }

        .language-section {
          text-align: center;
          width: 100%;
          max-width: 900px;
          margin-bottom: 32px;
        }

        .language-section h2 {
          font-size: 1.5rem;
          margin-bottom: 8px;
        }

        .continue-section {
          position: sticky;
          bottom: 24px;
          z-index: 10;
        }

        .demo-mode-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 24px;
          border-radius: var(--radius-full);
          background: rgba(255, 179, 71, 0.06);
          border: 1px solid rgba(255, 179, 71, 0.25);
          color: var(--color-accent-warning);
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
          letter-spacing: 0.02em;
        }

        .demo-mode-btn:hover:not(:disabled) {
          background: rgba(255, 179, 71, 0.12);
          border-color: rgba(255, 179, 71, 0.45);
          transform: translateY(-1px);
        }

        .demo-mode-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .welcome-page {
            padding: 40px 16px 100px;
          }

          .features-row {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 480px) {
          .features-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

export default function WelcomePage() {
  return <WelcomeContent />;
}
