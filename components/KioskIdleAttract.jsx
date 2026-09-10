"use client";

import { useState, useEffect } from "react";
import { Activity, Sparkles, ShieldCheck, HeartPulse, Hand } from "lucide-react";

const GREETINGS = [
  { lang: "Hindi", text: "आरंभ करने के लिए स्क्रीन छुएं", sub: "अपनी भाषा में बोलकर समस्या बताएं" },
  { lang: "English", text: "Touch screen to begin your OPD history", sub: "Speak naturally in your preferred language" },
  { lang: "Bengali", text: "শুরু করতে স্ক্রিনে স্পর্শ করুন", sub: "আপনার ভাষায় কথা বলুন" },
  { lang: "Marathi", text: "सुरू करण्यासाठी स्क्रीनला स्पर्श करा", sub: "आपल्या भाषेत बोला" },
  { lang: "Tamil", text: "தொடங்க திரையைத் தொடவும்", sub: "உங்கள் மொழியில் பேசுங்கள்" },
  { lang: "Telugu", text: "ప్రారంభించడానికి స్క్రీన్‌ను తాకండి", sub: "మీ భాషలో మాట్లాడండి" },
  { lang: "Gujarati", text: "શરૂ કરવા માટે સ્ક્રીનને ટચ કરો", sub: "તમારી ભાષામાં બોલો" },
];

export default function KioskIdleAttract({ idleTimeoutSeconds = 45, onDismiss }) {
  const [isIdle, setIsIdle] = useState(false);
  const [greetingIndex, setGreetingIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Inactivity detection
  useEffect(() => {
    let timeoutId;

    const resetTimer = () => {
      if (isIdle) return; // If already idle, user click will dismiss
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsIdle(true);
      }, idleTimeoutSeconds * 1000);
    };

    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"];
    events.forEach((event) => window.addEventListener(event, resetTimer, { passive: true }));

    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [idleTimeoutSeconds, isIdle]);

  // Greeting carousel & clock
  useEffect(() => {
    if (!isIdle) return;

    const clockInterval = setInterval(() => setCurrentTime(new Date()), 1000);
    const greetingInterval = setInterval(() => {
      setGreetingIndex((prev) => (prev + 1) % GREETINGS.length);
    }, 3200);

    return () => {
      clearInterval(clockInterval);
      clearInterval(greetingInterval);
    };
  }, [isIdle]);

  const handleWakeUp = () => {
    setIsIdle(false);
    if (onDismiss) onDismiss();
  };

  // Expose a window function so parent or demo button can trigger attract mode manually
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.__triggerKioskAttract = () => setIsIdle(true);
    }
  }, []);

  if (!isIdle) return null;

  const currentGreeting = GREETINGS[greetingIndex];

  return (
    <div className="attract-overlay animate-fade-in" onClick={handleWakeUp} role="button" tabIndex={0}>
      {/* Background Animated Gradient Mesh */}
      <div className="attract-mesh-bg" />

      {/* Top Bar with Hospital Emblem & Clock */}
      <div className="attract-topbar">
        <div className="attract-brand">
          <div className="attract-logo-icon">
            <Activity size={24} />
          </div>
          <div>
            <h3 className="attract-title">MediKiosk OPD Portal</h3>
            <span className="attract-dept">Ministry of AYUSH • ABDM Compliant</span>
          </div>
        </div>

        <div className="attract-time-display">
          <span className="attract-clock">
            {currentTime.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </span>
          <span className="attract-date">
            {currentTime.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
          </span>
        </div>
      </div>

      {/* Center Interactive Pulse */}
      <div className="attract-center">
        <div className="pulse-ripple-ring outer" />
        <div className="pulse-ripple-ring mid" />
        <div className="pulse-ripple-ring inner" />

        <div className="attract-touch-target animate-pulse">
          <div className="touch-target-glow" />
          <Hand size={56} className="hand-icon animate-bounce" />
          <span className="touch-hint-label">TOUCH SCREEN</span>
        </div>

        {/* Dynamic Multilingual Text */}
        <div className="attract-text-fader animate-fade-in-up" key={greetingIndex}>
          <h2 className="greeting-main">{currentGreeting.text}</h2>
          <p className="greeting-sub">{currentGreeting.sub}</p>
          <span className="greeting-lang-badge">{currentGreeting.lang}</span>
        </div>
      </div>

      {/* Bottom Feature Badges */}
      <div className="attract-bottom">
        <div className="attract-pill">
          <HeartPulse size={18} style={{ color: "#00d4aa" }} />
          <span>Voice History Taking in 10 Languages</span>
        </div>
        <div className="attract-pill">
          <ShieldCheck size={18} style={{ color: "#4db8ff" }} />
          <span>ABHA / ABDM Instant FHIR Export</span>
        </div>
        <div className="attract-pill">
          <Sparkles size={18} style={{ color: "#ff9933" }} />
          <span>AYUSH Dashavidha Pariksha Supported</span>
        </div>
      </div>

      <style jsx>{`
        .attract-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: #040816;
          z-index: 10000;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: center;
          padding: 36px 40px;
          cursor: pointer;
          user-select: none;
          overflow: hidden;
        }

        .attract-mesh-bg {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% 50%, rgba(0, 212, 170, 0.15), transparent 60%),
                      radial-gradient(circle at 20% 80%, rgba(77, 184, 255, 0.12), transparent 50%),
                      radial-gradient(circle at 80% 20%, rgba(255, 153, 51, 0.1), transparent 50%);
          pointer-events: none;
        }

        .attract-topbar {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 1200px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding-bottom: 20px;
        }

        .attract-brand {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .attract-logo-icon {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          background: var(--gradient-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #060a1a;
          box-shadow: 0 0 24px rgba(0, 212, 170, 0.4);
        }

        .attract-title {
          font-size: 1.35rem;
          font-weight: 800;
          color: #ffffff;
          margin: 0;
          letter-spacing: -0.01em;
        }

        .attract-dept {
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.6);
        }

        .attract-time-display {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }

        .attract-clock {
          font-size: 1.4rem;
          font-weight: 700;
          color: var(--color-accent-primary);
          font-family: monospace;
          letter-spacing: 0.05em;
        }

        .attract-date {
          font-size: 0.78rem;
          color: rgba(255, 255, 255, 0.5);
        }

        .attract-center {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          margin: auto 0;
        }

        .pulse-ripple-ring {
          position: absolute;
          border-radius: 50%;
          border: 1px solid rgba(0, 212, 170, 0.25);
          pointer-events: none;
          top: 30px;
        }

        .pulse-ripple-ring.inner {
          width: 220px;
          height: 220px;
          animation: ringPulse 3s infinite ease-out;
        }

        .pulse-ripple-ring.mid {
          width: 340px;
          height: 340px;
          animation: ringPulse 3s infinite 1s ease-out;
        }

        .pulse-ripple-ring.outer {
          width: 480px;
          height: 480px;
          animation: ringPulse 3s infinite 2s ease-out;
        }

        @keyframes ringPulse {
          0% {
            transform: scale(0.6);
            opacity: 0.8;
          }
          100% {
            transform: scale(1.4);
            opacity: 0;
          }
        }

        .attract-touch-target {
          position: relative;
          width: 140px;
          height: 140px;
          border-radius: 50%;
          background: rgba(0, 212, 170, 0.12);
          border: 2px solid rgba(0, 212, 170, 0.5);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          margin-bottom: 32px;
          box-shadow: 0 0 50px rgba(0, 212, 170, 0.35);
        }

        .touch-target-glow {
          position: absolute;
          inset: -10px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(0, 212, 170, 0.3), transparent 70%);
        }

        .hand-icon {
          color: var(--color-accent-primary);
          margin-bottom: 6px;
        }

        .touch-hint-label {
          font-size: 0.65rem;
          font-weight: 800;
          letter-spacing: 0.1em;
          color: #ffffff;
        }

        .attract-text-fader {
          min-height: 110px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .greeting-main {
          font-size: clamp(1.8rem, 4vw, 2.6rem);
          font-weight: 800;
          color: #ffffff;
          margin: 0 0 10px;
          text-shadow: 0 2px 20px rgba(0, 0, 0, 0.8);
        }

        .greeting-sub {
          font-size: clamp(1rem, 2vw, 1.25rem);
          color: rgba(255, 255, 255, 0.7);
          margin: 0 0 12px;
        }

        .greeting-lang-badge {
          display: inline-block;
          font-size: 0.75rem;
          padding: 3px 12px;
          border-radius: 50px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: var(--color-accent-primary);
          font-weight: 600;
        }

        .attract-bottom {
          position: relative;
          z-index: 2;
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
          justify-content: center;
          width: 100%;
          max-width: 900px;
          padding-top: 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        .attract-pill {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 18px;
          border-radius: var(--radius-full);
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          font-size: 0.84rem;
          color: rgba(255, 255, 255, 0.8);
        }

        @media (max-width: 600px) {
          .attract-overlay {
            padding: 24px 20px;
          }
          .attract-bottom {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
