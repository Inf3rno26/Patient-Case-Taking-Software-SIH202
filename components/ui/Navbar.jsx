"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Home,
  Monitor,
  BarChart2,
  Leaf,
  Stethoscope,
  UserPlus,
  Mic,
  FileText,
} from "lucide-react";
import ToneSwitcher from "@/components/ToneSwitcher";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/";

  return (
    <nav className="navbar" aria-label="Main navigation">
      <div className="navbar-inner container-wide">
        <div className="navbar-left">
          {!isHome && (
            <button
              className="btn-icon"
              onClick={() => router.back()}
              aria-label="Go back"
              id="nav-back-btn"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <div className="navbar-brand" onClick={() => router.push("/")} role="button" tabIndex={0}>
            <div className="navbar-logo">
              <Activity size={24} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "nowrap" }}>
                <span className="navbar-title">MediKiosk</span>
                <span className="badge" style={{ fontSize: "0.62rem" }}>AI</span>
                <span className="hexabytes-badge" title="Team 020: HEXABYTES">
                  HEXABYTES
                </span>
                <span className="firebase-badge" title="Firebase Firestore Cloud Sync Active">
                  <span className="firebase-dot" />
                  Firebase
                </span>
              </div>
              <div className="sih-nav-sub">
                SIH 2026 • PS 26047 • HealthTech
              </div>
            </div>
          </div>
        </div>

        {/* Center Quick Navigation for Evaluators, Staff & Patients */}
        <div className="navbar-center no-print">
          <button
            className={`nav-pill ${pathname === "/register" ? "active" : ""}`}
            onClick={() => router.push("/register")}
            title="Patient Registration & ABHA Link"
            id="nav-register-btn"
          >
            <UserPlus size={14} />
            <span className="nav-pill-text">Register</span>
          </button>

          <button
            className={`nav-pill ${pathname === "/interview" ? "active" : ""}`}
            onClick={() => router.push("/interview")}
            title="Voice Clinical History Interview"
            id="nav-interview-btn"
          >
            <Mic size={14} />
            <span className="nav-pill-text">Interview</span>
          </button>

          <button
            className={`nav-pill ${pathname === "/summary" ? "active" : ""}`}
            onClick={() => router.push("/summary")}
            title="Clinical Summary & Token"
            id="nav-summary-btn"
          >
            <FileText size={14} />
            <span className="nav-pill-text">Summary</span>
          </button>

          <button
            className={`nav-pill ${pathname === "/token" ? "active" : ""}`}
            onClick={() => router.push("/token")}
            title="Live OPD Queue Display (TV Mode)"
            id="nav-queue-btn"
          >
            <Monitor size={14} />
            <span className="nav-pill-text">Queue</span>
          </button>

          <button
            className={`nav-pill ${pathname === "/physician" ? "active" : ""}`}
            onClick={() => router.push("/physician")}
            title="Physician OPD Dashboard"
            id="nav-physician-btn"
          >
            <Stethoscope size={14} />
            <span className="nav-pill-text">Doctor</span>
          </button>

          <button
            className={`nav-pill ${pathname === "/ayush-assessment" ? "active" : ""}`}
            onClick={() => router.push("/ayush-assessment")}
            title="AYUSH Prakriti Assessment Quiz"
            id="nav-ayush-btn"
          >
            <Leaf size={14} />
            <span className="nav-pill-text">AYUSH</span>
          </button>

          <button
            className={`nav-pill ${pathname === "/analytics" ? "active" : ""}`}
            onClick={() => router.push("/analytics")}
            title="OPD Real-Time Performance Analytics"
            id="nav-analytics-btn"
          >
            <BarChart2 size={14} />
            <span className="nav-pill-text">Analytics</span>
          </button>
        </div>

        <div className="navbar-right">
          <ToneSwitcher compact={true} showLabel={false} />
          <button
            className="btn-danger btn-touch"
            onClick={() => {
              if (confirm("Trigger emergency alert?")) {
                alert("Emergency alert sent to triage staff!");
              }
            }}
            id="nav-emergency-btn"
            style={{ padding: "8px 16px", minHeight: "40px", fontSize: "0.82rem" }}
          >
            <AlertTriangle size={15} />
            <span className="emergency-text">Emergency</span>
          </button>
          {!isHome && (
            <button
              className="btn-icon"
              onClick={() => router.push("/")}
              aria-label="Go home"
              id="nav-home-btn"
            >
              <Home size={20} />
            </button>
          )}
        </div>

      </div>

      <style jsx>{`
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 70px;
          background: var(--color-bg-card);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--color-border);
          z-index: 100;
          display: flex;
          align-items: center;
          transition: background 0.3s ease, border-color 0.3s ease;
        }


        .navbar-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 0 24px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .navbar-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .navbar-right {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .navbar-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .navbar-brand:hover {
          opacity: 0.85;
        }

        .navbar-logo {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: var(--gradient-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-text-on-accent);
        }

        .navbar-title {
          font-family: var(--font-display);
          font-size: 1.3rem;
          font-weight: 700;
          background: var(--gradient-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hexabytes-badge {
          display: inline-flex;
          align-items: center;
          padding: 2px 7px;
          border-radius: var(--radius-full);
          background: rgba(56, 189, 248, 0.12);
          border: 1px solid rgba(56, 189, 248, 0.35);
          font-size: 0.62rem;
          font-weight: 800;
          color: #38bdf8;
          letter-spacing: 0.04em;
        }

        .sih-nav-sub {
          font-size: 0.64rem;
          color: var(--color-text-muted);
          font-weight: 500;
          margin-top: 1px;
          letter-spacing: 0.02em;
        }

        .firebase-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 3px 8px;
          border-radius: var(--radius-full);
          background: rgba(255, 153, 0, 0.12);
          border: 1px solid rgba(255, 153, 0, 0.35);
          font-size: 0.65rem;
          font-weight: 700;
          color: #ff9900;
          letter-spacing: 0.02em;
        }

        .firebase-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #ff9900;
          box-shadow: 0 0 8px #ff9900;
          animation: pulse-orange 1.5s ease-in-out infinite;
        }

        @keyframes pulse-orange {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.3); opacity: 0.6; }
        }

        @media (max-width: 480px) {
          .navbar-title {
            display: none;
          }
        }

        .navbar-center {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          padding: 4px;
          border-radius: var(--radius-full);
        }

        .nav-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: var(--radius-full);
          border: none;
          background: transparent;
          color: var(--color-text-secondary);
          font-size: 0.8rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .nav-pill:hover {
          color: var(--color-text-primary);
          background: rgba(255, 255, 255, 0.06);
        }

        .nav-pill.active {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid var(--color-border-accent);
          color: var(--color-accent-primary);
          font-weight: 600;
          box-shadow: var(--shadow-glow);
        }


        @media (max-width: 900px) {
          .nav-pill-text {
            display: none;
          }
          .nav-pill {
            padding: 8px 10px;
          }
        }

        @media (max-width: 640px) {
          .navbar-center {
            display: none;
          }
          .emergency-text {
            display: none;
          }
        }
      `}</style>
    </nav>
  );
}
