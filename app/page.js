"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  ArrowRight,
  ArrowLeft,
  Zap,
  Mic,
  Clock,
  ShieldCheck,
  Stethoscope,
  Sparkles,
  Volume2,
  Monitor,
  BarChart2,
  Leaf,
  ChevronRight,
  Users,
  FileText,
} from "lucide-react";
import { LANGUAGES, speakText } from "@/lib/languages";
import { usePatient } from "@/context/PatientContext";
import KioskIdleAttract from "@/components/KioskIdleAttract";
import ToneSwitcher from "@/components/ToneSwitcher";


const MULTILINGUAL_GREETINGS = [
  "नमस्ते",
  "Welcome",
  "வணக்கம்",
  "నమస్కారం",
  "স্বাগতম",
  "നമസ്കാരം",
  "नमस्कार",
  "ਸਤਿ ਸ਼੍ਰੀ ਅਕਾਲ",
  "નમસ્તે",
  "নমস্কাৰ",
  "مرحبا",
];

function WelcomeContent() {
  const router = useRouter();
  const { setLanguage, language, loadDemoSession } = usePatient();
  const [step, setStep] = useState("welcome"); // 'welcome' | 'languages'
  const [selectedLang, setSelectedLang] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [greetingIdx, setGreetingIdx] = useState(0);

  useEffect(() => {
    setMounted(true);

    // Support direct query param ?step=languages
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("step") === "languages") {
        setStep("languages");
      }

      const handlePopState = () => {
        const p = new URLSearchParams(window.location.search);
        if (p.get("step") === "languages") {
          setStep("languages");
        } else {
          setStep("welcome");
        }
      };
      window.addEventListener("popstate", handlePopState);
      return () => window.removeEventListener("popstate", handlePopState);
    }
  }, []);

  // Multi-lingual rotating greeting ticker for welcome screen
  useEffect(() => {
    if (step !== "welcome") return;
    const interval = setInterval(() => {
      setGreetingIdx((prev) => (prev + 1) % MULTILINGUAL_GREETINGS.length);
    }, 2400);
    return () => clearInterval(interval);
  }, [step]);

  const handleStart = () => {
    setStep("languages");
    if (typeof window !== "undefined") {
      window.history.pushState({ step: "languages" }, "", "?step=languages");
    }
  };

  const handleBackToWelcome = () => {
    setStep("welcome");
    if (typeof window !== "undefined") {
      window.history.pushState({ step: "welcome" }, "", "/");
    }
  };

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

    // Smooth transition to registration page
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

  return (
    <div className="welcome-page">
      {/* Kiosk Inactivity Attract Loop (Auto-activates after 45s of idle time) */}
      <KioskIdleAttract idleTimeoutSeconds={45} />

      {step === "welcome" ? (
        /* ================= STEP 1: WELCOME SCREEN (NO LANGUAGES) ================= */
        <div className="welcome-step-container animate-fade-in">
          {/* Top Navigation Bar / SIH 2026 Header Banner */}
          <header className="sih-top-navbar animate-fade-in">
            <div className="sih-nav-left">
              <div className="team-badge-cluster">
                <span className="hexabytes-pill">HEXABYTES</span>
                <span className="team-badge-pill">TEAM 020</span>
              </div>
            </div>

            <div className="sih-nav-center">
              <div className="sih-title-badge">
                <span className="sih-event-tag">SMART INDIA HACKATHON 2026</span>
              </div>
              <div className="sih-sub-meta">
                <span>Problem Statement ID: <strong>26047</strong></span>
                <span className="meta-bullet">•</span>
                <span>Theme: <strong>HealthTech</strong></span>
              </div>
            </div>

            <div className="sih-nav-right">
              <ToneSwitcher compact={true} showLabel={false} />
            </div>
          </header>

          {/* Hero Branding */}
          <section className="hero">
            <h1 className="hero-title">
              <span className="text-gradient">MediKiosk</span>
            </h1>
            <p className="hero-official-sub">
              An AI-Powered, Multilingual, Multimodal Clinical Pre-Consultation &amp; Triage Kiosk for Indian Hospital OPDs
            </p>

            {/* Rotating Multilingual Greeting Chip */}
            <div className="ticker-container">
              <span className="greeting-label">Welcome</span>
              <span className="ticker-divider">•</span>
              <span className="ticker-text" key={greetingIdx}>
                {MULTILINGUAL_GREETINGS[greetingIdx]}
              </span>
            </div>
          </section>

          {/* Proposed Solution: 5-Step Clinical Handoff Pipeline (Matches Slide 2) */}
          <div className="workflow-section">
            <div className="workflow-section-title">
              <Sparkles size={16} />
              <span>Proposed Solution • 5-Step Clinical Triage Pipeline</span>
            </div>
            <div className="workflow-cards-grid">
              <div className="wf-card step-1">
                <div className="wf-step-num">1</div>
                <div className="wf-icon-wrap" style={{ background: "rgba(56, 189, 248, 0.15)", color: "#38bdf8" }}>
                  <Users size={20} />
                </div>
                <h4>1. OPD Waiting Lobby</h4>
                <p>Kiosk in waiting area. Patient selects native language with one touch &amp; gives consent.</p>
              </div>

              <div className="wf-card step-2">
                <div className="wf-step-num">2</div>
                <div className="wf-icon-wrap" style={{ background: "rgba(0, 212, 170, 0.15)", color: "#00d4aa" }}>
                  <Mic size={20} />
                </div>
                <h4>2. Vernacular Voice Interview</h4>
                <p>Speaks in Hindi, Tamil, Bengali, etc. SOCRATES-based inquiry with emoji touch-chip fallback.</p>
              </div>

              <div className="wf-card step-3">
                <div className="wf-step-num">3</div>
                <div className="wf-icon-wrap" style={{ background: "rgba(124, 92, 252, 0.15)", color: "#a29bfe" }}>
                  <Activity size={20} />
                </div>
                <h4>3. Paper &amp; Report Digitization</h4>
                <p>Scans prescriptions &amp; reports on camera. Multi-pass OCR cross-checks Indian pharmacopeia.</p>
              </div>

              <div className="wf-card step-4">
                <div className="wf-step-num">4</div>
                <div className="wf-icon-wrap" style={{ background: "rgba(46, 213, 115, 0.15)", color: "#2ed573" }}>
                  <FileText size={20} />
                </div>
                <h4>4. Physician-Ready Summary</h4>
                <p>Structured FHIR/SOAP dossier with ESI triage scoring. Cuts intake from 3 min to 30 sec.</p>
              </div>

              <div className="wf-card step-5">
                <div className="wf-step-num">5</div>
                <div className="wf-icon-wrap" style={{ background: "rgba(255, 179, 71, 0.15)", color: "#ffb347" }}>
                  <Stethoscope size={20} />
                </div>
                <h4>5. Doctor&apos;s Dashboard</h4>
                <p>Doctor receives summary before patient enters for an informed, focused consultation.</p>
              </div>
            </div>
          </div>

          {/* Primary Call To Action - START BUTTON */}
          <div className="start-cta-section">
            <button
              className="kiosk-start-btn"
              onClick={handleStart}
              id="kiosk-start-btn"
              aria-label="Start consultation"
            >
              <span className="start-btn-glow"></span>
              <span className="start-btn-content">
                <span className="start-main-text">START / शुरू करें</span>
                <span className="start-sub-text">Touch here to select language &amp; begin</span>
              </span>
              <div className="start-btn-icon">
                <ArrowRight size={32} />
              </div>
            </button>
          </div>

          {/* Secondary Actions / Judge Mode / Quick Modules */}
          <div className="bottom-secondary-bar">
            <button
              className="demo-mode-btn btn-touch"
              onClick={handleDemoMode}
              id="welcome-demo-btn"
              disabled={isNavigating || isDemoMode}
              title="Load a pre-filled patient demo to skip to the summary"
            >
              <Zap size={16} />
              {isDemoMode ? "Loading Demo..." : "Demo / Judge Mode"}
            </button>

            <div className="quick-nav-links">
              <button
                className="quick-link-btn"
                onClick={() => router.push("/token")}
                title="Live OPD Queue Display"
              >
                <Monitor size={14} />
                <span>OPD Queue</span>
              </button>
              <button
                className="quick-link-btn"
                onClick={() => router.push("/ayush-assessment")}
                title="AYUSH Prakriti Assessment"
              >
                <Leaf size={14} />
                <span>AYUSH</span>
              </button>
              <button
                className="quick-link-btn"
                onClick={() => router.push("/analytics")}
                title="Hospital Analytics"
              >
                <BarChart2 size={14} />
                <span>Analytics</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ================= STEP 2: LANGUAGE SELECTION SCREEN ================= */
        <div className="language-step-container animate-fade-in-up">
          {/* Header Navigation Bar */}
          <div className="language-header-bar">
            <button
              className="back-btn btn-touch"
              onClick={handleBackToWelcome}
              id="language-back-btn"
              aria-label="Back to welcome screen"
            >
              <ArrowLeft size={20} />
              <span>Back / वापस</span>
            </button>

            <div className="language-header-right">
              <div className="bhashini-mission-pill">
                <Sparkles size={14} style={{ color: "#ff9933" }} />
                <span>Digital India BHASHINI &amp; AI4Bharat Speech Engine</span>
                <span className="bhashini-verified">12 Languages Active</span>
              </div>
              <ToneSwitcher compact={true} showLabel={false} />
            </div>
          </div>

          {/* Heading */}
          <section className="language-title-section">
            <h2 className="language-heading">Select Your Language / अपनी भाषा चुनें</h2>
            <p className="language-instruction">
              Tap your preferred language to begin voice consultation / शुरू करने के लिए अपनी भाषा पर स्पर्श करें
            </p>
          </section>

          {/* 12 Indian Languages Grid */}
          <div className="language-grid" role="group" aria-label="Language selection">
            {LANGUAGES.map((lang) => {
              const isSelected = selectedLang === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  className={`language-card ${isSelected ? "selected" : ""}`}
                  onClick={() => handleLanguageSelect(lang)}
                  id={`lang-${lang.code}`}
                  aria-pressed={isSelected}
                >
                  <div className="lang-code-badge">{lang.code.split("-")[0].toUpperCase()}</div>
                  <span className="lang-native">{lang.native}</span>
                  <span className="lang-english">{lang.name}</span>
                  {isSelected && (
                    <span className="lang-selected-pill">
                      <Volume2 size={12} />
                      Selected
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Bottom Action / Fallback Continue */}
          <div className="language-footer-section">
            <button
              className="btn-primary btn-large btn-touch"
              onClick={handleContinue}
              id="welcome-continue-btn"
              style={{ minWidth: "280px" }}
              disabled={isNavigating || isDemoMode}
            >
              <ArrowRight size={20} />
              {isNavigating ? "Opening Registration..." : "Continue / आगे बढ़ें"}
            </button>

            <button
              className="demo-mode-btn btn-touch"
              onClick={handleDemoMode}
              id="language-demo-btn"
              disabled={isNavigating || isDemoMode}
              title="Load pre-filled patient demo"
            >
              <Zap size={16} />
              {isDemoMode ? "Loading Demo..." : "Demo Mode"}
            </button>
          </div>
        </div>
      )}

      {/* Styled JSX Scoped & Component Styles */}
      <style jsx>{`
        .welcome-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 20px 60px;
          position: relative;
          z-index: 1;
        }

        /* Container wrappers */
        .welcome-step-container,
        .language-step-container {
          width: 100%;
          max-width: 1060px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        /* Top Navigation Bar */
        .sih-top-navbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          margin: 0 auto 30px;
          padding: 10px 20px;
          border-radius: 16px;
          background: rgba(15, 23, 42, 0.75);
          border: 1px solid rgba(56, 189, 248, 0.22);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          box-shadow: 0 8px 32px -4px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.04) inset;
          gap: 16px;
          position: relative;
          z-index: 10;
        }

        .sih-nav-left {
          display: flex;
          align-items: center;
          flex: 1;
          justify-content: flex-start;
          min-width: 180px;
        }

        .team-badge-cluster {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 4px 7px;
          background: rgba(255, 255, 255, 0.04);
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.06);
        }

        .hexabytes-pill {
          padding: 4px 11px;
          border-radius: 7px;
          background: linear-gradient(135deg, rgba(56, 189, 248, 0.22), rgba(0, 212, 170, 0.18));
          border: 1px solid rgba(56, 189, 248, 0.5);
          color: #38bdf8;
          font-weight: 800;
          font-size: 0.74rem;
          letter-spacing: 0.08em;
          text-shadow: 0 0 12px rgba(56, 189, 248, 0.4);
        }

        .team-badge-pill {
          font-size: 0.70rem;
          font-weight: 700;
          color: var(--color-text-secondary);
          background: rgba(255, 255, 255, 0.08);
          padding: 3px 8px;
          border-radius: 6px;
          letter-spacing: 0.04em;
        }

        .sih-nav-center {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          flex: 2;
          gap: 3px;
        }

        .sih-title-badge {
          display: inline-flex;
          align-items: center;
        }

        .sih-event-tag {
          font-size: 0.84rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          color: #ffffff;
          text-transform: uppercase;
          background: linear-gradient(90deg, #38bdf8, #00d4aa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .sih-sub-meta {
          font-size: 0.70rem;
          color: var(--color-text-muted);
          display: flex;
          align-items: center;
          gap: 8px;
          white-space: nowrap;
        }

        .sih-sub-meta strong {
          color: var(--color-text-primary);
          font-weight: 600;
        }

        .meta-bullet {
          color: var(--color-accent-primary);
          opacity: 0.6;
        }

        .sih-nav-right {
          display: flex;
          align-items: center;
          flex: 1;
          justify-content: flex-end;
          min-width: 180px;
        }

        /* Hero */
        .hero {
          text-align: center;
          max-width: 860px;
          margin-bottom: 28px;
        }

        .hero-official-sub {
          font-size: clamp(0.85rem, 1.8vw, 1rem);
          font-weight: 600;
          color: var(--color-accent-primary);
          margin-top: -6px;
          margin-bottom: 14px;
          letter-spacing: 0.01em;
          max-width: 720px;
          margin-left: auto;
          margin-right: auto;
          line-height: 1.4;
        }

        /* 5-Step Proposed Solution Workflow */
        .workflow-section {
          width: 100%;
          max-width: 940px;
          margin-bottom: 28px;
        }

        .workflow-section-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: var(--color-accent-primary);
          margin-bottom: 12px;
          justify-content: center;
        }

        .workflow-cards-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 10px;
        }

        .wf-card {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 16px 12px 14px;
          border-radius: var(--radius-lg);
          background: rgba(15, 23, 42, 0.55);
          border: 1px solid rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(12px);
          transition: all 0.25s ease;
        }

        .wf-card:hover {
          transform: translateY(-3px);
          border-color: rgba(56, 189, 248, 0.4);
          background: rgba(30, 41, 59, 0.75);
        }

        .wf-step-num {
          position: absolute;
          top: 8px;
          left: 10px;
          font-size: 0.65rem;
          font-weight: 800;
          color: var(--color-text-muted);
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.06);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .wf-icon-wrap {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 8px;
        }

        .wf-card h4 {
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--color-text-primary);
          margin-bottom: 5px;
          line-height: 1.25;
          min-height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .wf-card p {
          font-size: 0.7rem;
          color: var(--color-text-muted);
          line-height: 1.35;
          margin: 0;
        }

        @media (max-width: 960px) {
          .workflow-cards-grid {
            grid-template-columns: repeat(3, 1fr);
          }
          .sih-top-navbar {
            flex-wrap: wrap;
            padding: 12px 16px;
            gap: 12px;
          }
        }

        @media (max-width: 820px) {
          .sih-top-navbar {
            flex-direction: column;
            align-items: center;
            text-align: center;
            gap: 12px;
            border-radius: var(--radius-lg);
          }
          .sih-nav-left, .sih-nav-center, .sih-nav-right {
            width: 100%;
            justify-content: center;
            min-width: unset;
          }
          .sih-sub-meta {
            flex-wrap: wrap;
            justify-content: center;
          }
        }

        @media (max-width: 600px) {
          .workflow-cards-grid {
            grid-template-columns: 1fr;
          }
        }

        .hero-title {
          font-family: var(--font-display);
          font-size: clamp(3.2rem, 8vw, 5.2rem);
          font-weight: 900;
          margin-bottom: 12px;
          letter-spacing: -0.03em;
          line-height: 1.05;
        }

        /* Multilingual Greeting Ticker */
        .ticker-container {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 6px 18px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 50px;
          margin-bottom: 18px;
        }

        .greeting-label {
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--color-text-muted);
          font-weight: 700;
        }

        .ticker-divider {
          color: var(--color-border-accent);
        }

        .ticker-text {
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--color-accent-primary);
          animation: fadeInText 0.35s ease-out;
        }

        @keyframes fadeInText {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .hero-subtitle {
          font-size: clamp(1.05rem, 2.2vw, 1.25rem);
          color: var(--color-text-secondary);
          max-width: 680px;
          margin: 0 auto;
          line-height: 1.65;
        }

        /* Feature Highlights Grid */
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
          gap: 16px;
          width: 100%;
          margin-bottom: 40px;
        }

        .feature-card {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 18px;
          border-radius: var(--radius-lg);
          background: rgba(15, 23, 62, 0.45);
          border: 1px solid rgba(255, 255, 255, 0.07);
          backdrop-filter: blur(12px);
          transition: all 0.25s ease;
        }

        .feature-card:hover {
          background: rgba(20, 30, 75, 0.7);
          border-color: rgba(0, 212, 170, 0.3);
          transform: translateY(-2px);
        }

        .feature-icon-wrapper {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .feature-icon-wrapper.voice {
          background: rgba(0, 212, 170, 0.12);
          color: #00d4aa;
        }

        .feature-icon-wrapper.speed {
          background: rgba(0, 153, 255, 0.12);
          color: #0099ff;
        }

        .feature-icon-wrapper.secure {
          background: rgba(124, 92, 252, 0.12);
          color: #7c5cfc;
        }

        .feature-icon-wrapper.doctor {
          background: rgba(255, 179, 71, 0.12);
          color: #ffb347;
        }

        .feature-content h4 {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--color-text-primary);
          margin-bottom: 4px;
        }

        .feature-content p {
          font-size: 0.8rem;
          color: var(--color-text-muted);
          line-height: 1.4;
          margin: 0;
        }

        /* Big Kiosk START CTA Button */
        .start-cta-section {
          width: 100%;
          display: flex;
          justify-content: center;
          margin-bottom: 36px;
        }

        .kiosk-start-btn {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          max-width: 460px;
          padding: 20px 28px;
          border-radius: 24px;
          border: none;
          background: linear-gradient(135deg, #00d4aa 0%, #0099ff 100%);
          color: #060a1a;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 10px 40px rgba(0, 212, 170, 0.35);
          text-align: left;
          overflow: hidden;
        }

        .kiosk-start-btn:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 16px 50px rgba(0, 212, 170, 0.5);
        }

        .kiosk-start-btn:active {
          transform: scale(0.98);
        }

        .start-btn-glow {
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          transform: translateX(-100%);
          animation: btnShimmer 3s infinite;
        }

        @keyframes btnShimmer {
          0% {
            transform: translateX(-100%);
          }
          40%, 100% {
            transform: translateX(100%);
          }
        }

        .start-btn-content {
          display: flex;
          flex-direction: column;
          z-index: 1;
        }

        .start-main-text {
          font-family: var(--font-display);
          font-size: 1.7rem;
          font-weight: 900;
          letter-spacing: 0.02em;
          color: #060a1a;
          line-height: 1.1;
        }

        .start-sub-text {
          font-size: 0.85rem;
          font-weight: 600;
          color: rgba(6, 10, 26, 0.8);
          margin-top: 4px;
        }

        .start-btn-icon {
          width: 54px;
          height: 54px;
          border-radius: 50%;
          background: #060a1a;
          color: #00d4aa;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: transform 0.25s ease;
          z-index: 1;
        }

        .kiosk-start-btn:hover .start-btn-icon {
          transform: translateX(6px);
        }

        /* Bottom Secondary Bar */
        .bottom-secondary-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          max-width: 900px;
          gap: 16px;
          flex-wrap: wrap;
          padding-top: 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }

        .quick-nav-links {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .quick-link-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border-radius: var(--radius-full);
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: var(--color-text-secondary);
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .quick-link-btn:hover {
          background: rgba(255, 255, 255, 0.08);
          color: var(--color-text-primary);
          border-color: rgba(0, 212, 170, 0.3);
        }

        /* ================= STEP 2 STYLES ================= */
        .language-header-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 12px;
        }

        .back-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: var(--radius-full);
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid var(--color-border);
          color: var(--color-text-primary);
          font-size: 0.88rem;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .back-btn:hover {
          background: rgba(255, 255, 255, 0.12);
          border-color: var(--color-border-accent);
          transform: translateX(-2px);
        }

        .language-title-section {
          text-align: center;
          margin-bottom: 28px;
        }

        .language-heading {
          font-size: clamp(1.6rem, 3.5vw, 2.2rem);
          font-weight: 800;
          margin-bottom: 8px;
          color: var(--color-text-primary);
        }

        .language-instruction {
          font-size: 0.95rem;
          color: var(--color-text-muted);
        }

        .lang-code-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid var(--color-border);
          font-size: 0.72rem;
          font-weight: 800;
          color: var(--color-accent-primary);
          margin-bottom: 6px;
          letter-spacing: 0.05em;
        }

        .lang-selected-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          margin-top: 6px;
          padding: 2px 10px;
          border-radius: 50px;
          background: rgba(0, 212, 170, 0.2);
          color: var(--color-accent-primary);
          font-size: 0.72rem;
          font-weight: 700;
        }

        .language-footer-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          margin-top: 32px;
          width: 100%;
        }

        .bhashini-mission-pill {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 8px 18px;
          background: rgba(255, 153, 51, 0.08);
          border: 1px solid rgba(255, 153, 51, 0.3);
          border-radius: var(--radius-full);
          font-size: 0.82rem;
          color: var(--color-text-secondary);
          flex-wrap: wrap;
          justify-content: center;
        }

        .bhashini-verified {
          font-size: 0.7rem;
          padding: 2px 8px;
          border-radius: 50px;
          background: rgba(0, 212, 170, 0.15);
          color: var(--color-accent-primary);
          border: 1px solid rgba(0, 212, 170, 0.3);
          font-weight: 700;
        }

        .demo-mode-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 22px;
          border-radius: var(--radius-full);
          background: rgba(255, 179, 71, 0.08);
          border: 1px solid rgba(255, 179, 71, 0.25);
          color: var(--color-accent-warning);
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
          letter-spacing: 0.02em;
        }

        .demo-mode-btn:hover:not(:disabled) {
          background: rgba(255, 179, 71, 0.15);
          border-color: rgba(255, 179, 71, 0.45);
          transform: translateY(-1px);
        }

        .demo-mode-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .welcome-page {
            padding: 30px 16px 60px;
          }

          .features-grid {
            grid-template-columns: 1fr;
          }

          .bottom-secondary-bar {
            flex-direction: column;
            align-items: stretch;
            text-align: center;
          }

          .quick-nav-links {
            justify-content: center;
          }

          .language-header-bar {
            flex-direction: column;
            align-items: stretch;
          }
        }
      `}</style>
    </div>
  );
}

export default function WelcomePage() {
  return <WelcomeContent />;
}
