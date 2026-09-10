"use client";

import { usePathname, useRouter } from "next/navigation";
import { Activity, AlertTriangle, ArrowLeft, Home } from "lucide-react";

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
            <span className="navbar-title">MediKiosk</span>
            <span className="badge" style={{ fontSize: "0.65rem" }}>AI</span>
          </div>
        </div>

        <div className="navbar-right">
          <button
            className="btn-danger btn-touch"
            onClick={() => {
              if (confirm("Trigger emergency alert?")) {
                alert("🚨 Emergency alert sent to triage staff!");
              }
            }}
            id="nav-emergency-btn"
            style={{ padding: "8px 16px", minHeight: "42px", fontSize: "0.85rem" }}
          >
            <AlertTriangle size={16} />
            Emergency
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
          background: rgba(6, 10, 26, 0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          z-index: 100;
          display: flex;
          align-items: center;
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

        @media (max-width: 480px) {
          .navbar-title {
            display: none;
          }
        }
      `}</style>
    </nav>
  );
}
