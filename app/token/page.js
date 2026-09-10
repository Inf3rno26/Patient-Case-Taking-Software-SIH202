"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Monitor, ArrowLeft, Volume2, RefreshCw, Tv } from "lucide-react";

/**
 * MediKiosk Token Queue — Live OPD Queue Display
 * Designed for TV/Monitor display in hospital waiting area
 * Also shown to patient after interview completion
 */

function generateQueue() {
  const depts = [
    { dept: "General Medicine", color: "#00d4aa", icon: "🩺", room: "OPD-1" },
    { dept: "Cardiology", color: "#ff4757", icon: "❤️", room: "OPD-4" },
    { dept: "Orthopedics", color: "#4db8ff", icon: "🦴", room: "OPD-7" },
    { dept: "Ayurveda (AYUSH)", color: "#ff9933", icon: "🌿", room: "OPD-12" },
    { dept: "Gynecology", color: "#ff6b81", icon: "🌸", room: "OPD-9" },
    { dept: "Pediatrics", color: "#ffd93d", icon: "👶", room: "OPD-6" },
    { dept: "Neurology", color: "#a29bfe", icon: "🧠", room: "OPD-3" },
  ];

  return depts.map((d) => ({
    ...d,
    now: `MK-${Math.floor(Math.random() * 300 + 100)}`,
    next: [`MK-${Math.floor(Math.random() * 300 + 100)}`, `MK-${Math.floor(Math.random() * 300 + 100)}`],
    waiting: Math.floor(Math.random() * 25 + 3),
    avgWait: Math.floor(Math.random() * 15 + 8),
    doctor: ["Dr. R. Sharma", "Dr. A. Mehta", "Dr. S. Patel", "Dr. K. Singh", "Dr. N. Joshi"][Math.floor(Math.random() * 5)],
  }));
}

export default function TokenQueuePage() {
  const router = useRouter();
  const [queue, setQueue] = useState(generateQueue());
  const [currentTime, setCurrentTime] = useState(new Date());
  const [tvMode, setTvMode] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [tickerIndex, setTickerIndex] = useState(0);
  const [myToken, setMyToken] = useState(null);

  const ANNOUNCEMENTS = [
    "🎙️ Token MK-187 — Please proceed to OPD-1 (General Medicine)",
    "⚠️ Red Flag Alert: Token MK-203 redirected to Emergency Department",
    "📋 ABHA linking saves time — register at the MediKiosk terminal",
    "🌿 Ayurveda (AYUSH) OPD now open — Token MK-251 onwards",
    "💊 Please carry all prescriptions and reports to your consultation",
    "📞 Token SMS alerts enabled — check your registered mobile number",
  ];

  useEffect(() => {
    setMounted(true);
    // Try to load patient's token from session
    try {
      const session = JSON.parse(localStorage.getItem("medikiosk_session") || "{}");
      if (session?.id) setMyToken(session.id);
    } catch { }

    const timeTimer = setInterval(() => setCurrentTime(new Date()), 1000);
    const queueTimer = setInterval(() => setQueue(generateQueue()), 12000);
    const tickerTimer = setInterval(() => setTickerIndex(i => (i + 1) % ANNOUNCEMENTS.length), 5000);

    return () => {
      clearInterval(timeTimer);
      clearInterval(queueTimer);
      clearInterval(tickerTimer);
    };
  }, []);

  if (!mounted) return null;

  return (
    <div className={`token-page ${tvMode ? "tv-mode" : ""}`}>
      {/* Header bar */}
      <div className="token-header">
        <div className="header-left">
          {!tvMode && (
            <button className="back-btn" onClick={() => router.back()} id="token-back-btn">
              <ArrowLeft size={16} />
            </button>
          )}
          <div className="hospital-brand">
            <div className="brand-icon">🏥</div>
            <div>
              <div className="brand-name">MediKiosk OPD Queue</div>
              <div className="brand-sub">Live Token Display System</div>
            </div>
          </div>
        </div>

        <div className="header-center">
          <div className="live-clock">
            {currentTime.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </div>
          <div className="live-date">
            {currentTime.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
          </div>
        </div>

        <div className="header-right">
          <div className="live-badge">
            <div className="live-pulse" />
            LIVE
          </div>
          <button
            className="tv-mode-btn"
            onClick={() => setTvMode(!tvMode)}
            id="token-tv-mode-btn"
            title={tvMode ? "Exit TV mode" : "Enter TV display mode"}
          >
            {tvMode ? <Monitor size={16} /> : <Tv size={16} />}
            {tvMode ? "Exit" : "TV Mode"}
          </button>
        </div>
      </div>

      {/* My Token Alert */}
      {myToken && (
        <div className="my-token-banner">
          <div className="my-token-left">
            <span className="my-token-label">🎫 Your Token:</span>
            <span className="my-token-number">{myToken}</span>
          </div>
          <div className="my-token-right">
            <Volume2 size={14} />
            <span>You&apos;ll be notified via SMS when your turn approaches</span>
          </div>
        </div>
      )}

      {/* Token ticker */}
      <div className="announcement-ticker">
        <div className="ticker-icon">📢</div>
        <div className="ticker-text" key={tickerIndex}>
          {ANNOUNCEMENTS[tickerIndex]}
        </div>
      </div>

      {/* Queue Grid */}
      <div className={`queue-grid ${tvMode ? "tv-grid" : ""}`}>
        {queue.map((dept) => (
          <div
            key={dept.dept}
            className="dept-queue-card"
            style={{ "--dept-color": dept.color }}
          >
            {/* Card header */}
            <div className="dept-card-header" style={{ borderBottomColor: `${dept.color}30` }}>
              <div className="dept-identity">
                <span className="dept-card-icon">{dept.icon}</span>
                <div>
                  <div className="dept-card-name">{dept.dept}</div>
                  <div className="dept-room">{dept.room} · {dept.doctor}</div>
                </div>
              </div>
              <div className="dept-wait-info">
                <span className="wait-badge" style={{ color: dept.color, borderColor: `${dept.color}40` }}>
                  ~{dept.avgWait} min wait
                </span>
              </div>
            </div>

            {/* Now serving */}
            <div className="now-serving" style={{ background: `${dept.color}12` }}>
              <div className="now-label">🔔 NOW SERVING</div>
              <div className="now-token" style={{ color: dept.color }}>{dept.now}</div>
            </div>

            {/* Next tokens */}
            <div className="next-tokens">
              <div className="next-label">NEXT UP</div>
              <div className="next-list">
                {dept.next.map((t, i) => (
                  <span key={i} className="next-token" style={{ borderColor: `${dept.color}30`, color: `${dept.color}cc` }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Waiting count */}
            <div className="waiting-count">
              <span style={{ color: dept.color }}>{dept.waiting}</span>
              <span className="waiting-label">patients waiting</span>
              <div className="waiting-bar-bg">
                <div
                  className="waiting-bar-fill"
                  style={{
                    width: `${Math.min(dept.waiting / 30, 1) * 100}%`,
                    background: dept.waiting > 20 ? "#ff4757" : dept.color,
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer stats */}
      <div className="queue-footer">
        <div className="footer-stat">
          <span className="footer-num" style={{ color: "#00d4aa" }}>
            {queue.reduce((s, d) => s + d.waiting, 0)}
          </span>
          <span>Total Waiting</span>
        </div>
        <div className="footer-stat">
          <span className="footer-num" style={{ color: "#4db8ff" }}>
            {queue.length}
          </span>
          <span>Departments Active</span>
        </div>
        <div className="footer-stat">
          <span className="footer-num" style={{ color: "#ff9933" }}>847</span>
          <span>Seen Today</span>
        </div>
        <div className="footer-stat">
          <span className="footer-num" style={{ color: "#a29bfe" }}>4.2 min</span>
          <span>Avg. History Time</span>
        </div>
        <div className="footer-note">
          <RefreshCw size={10} />
          Auto-refreshes every 12 seconds · Powered by MediKiosk AI
        </div>
      </div>

      <style jsx>{`
        .token-page {
          min-height: 100vh;
          background: var(--color-bg-base);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .tv-mode {
          background: #000;
          font-size: 1.1em;
        }

        .token-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 20px;
          background: rgba(0,0,0,0.4);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          flex-wrap: wrap;
          gap: 10px;
        }

        .header-left { display: flex; align-items: center; gap: 12px; }

        .back-btn {
          padding: 6px;
          border-radius: var(--radius-full);
          border: 1px solid rgba(255,255,255,0.1);
          background: transparent;
          color: var(--color-text-muted);
          cursor: pointer;
          display: flex;
        }

        .hospital-brand { display: flex; align-items: center; gap: 10px; }
        .brand-icon { font-size: 1.6rem; }
        .brand-name { font-size: 0.95rem; font-weight: 800; color: white; }
        .brand-sub { font-size: 0.67rem; color: rgba(255,255,255,0.4); }

        .header-center { text-align: center; }

        .live-clock {
          font-size: 1.6rem;
          font-weight: 800;
          font-family: monospace;
          color: #00d4aa;
          letter-spacing: 0.04em;
        }

        .live-date { font-size: 0.72rem; color: rgba(255,255,255,0.4); }

        .header-right { display: flex; align-items: center; gap: 12px; }

        .live-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border-radius: var(--radius-full);
          background: rgba(255,71,87,0.12);
          border: 1px solid rgba(255,71,87,0.3);
          color: #ff4757;
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.08em;
        }

        .live-pulse {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #ff4757;
          animation: pulse-live 1s ease-in-out infinite;
        }

        @keyframes pulse-live {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.7); }
        }

        .tv-mode-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: var(--radius-full);
          border: 1px solid rgba(255,255,255,0.15);
          background: transparent;
          color: rgba(255,255,255,0.6);
          font-size: 0.75rem;
          cursor: pointer;
          transition: all 0.15s;
        }

        .tv-mode-btn:hover { background: rgba(255,255,255,0.08); color: white; }

        /* My token banner */
        .my-token-banner {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 20px;
          background: linear-gradient(135deg, rgba(0,212,170,0.1), rgba(0,184,148,0.08));
          border-bottom: 1px solid rgba(0,212,170,0.2);
          flex-wrap: wrap;
          gap: 8px;
        }

        .my-token-left { display: flex; align-items: center; gap: 10px; }
        .my-token-label { font-size: 0.82rem; color: rgba(255,255,255,0.6); }
        .my-token-number {
          font-size: 1.1rem;
          font-weight: 900;
          color: #00d4aa;
          letter-spacing: 0.05em;
        }

        .my-token-right {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
          color: rgba(255,255,255,0.5);
        }

        /* Ticker */
        .announcement-ticker {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 20px;
          background: rgba(255,179,71,0.06);
          border-bottom: 1px solid rgba(255,179,71,0.15);
          overflow: hidden;
        }

        .ticker-icon { font-size: 1rem; flex-shrink: 0; }

        .ticker-text {
          font-size: 0.82rem;
          color: #ffb347;
          font-weight: 500;
          animation: ticker-in 0.5s ease-out;
        }

        @keyframes ticker-in {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }

        /* Queue grid */
        .queue-grid {
          flex: 1;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          padding: 14px 16px;
          overflow-y: auto;
        }

        .tv-grid {
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          padding: 16px 20px;
        }

        /* Dept card */
        .dept-queue-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: var(--radius-md);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: border-color 0.3s;
        }

        .dept-queue-card:hover {
          border-color: color-mix(in srgb, var(--dept-color) 30%, transparent);
        }

        .dept-card-header {
          padding: 10px 12px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 1px solid;
          gap: 6px;
        }

        .dept-identity { display: flex; align-items: center; gap: 8px; }
        .dept-card-icon { font-size: 1.4rem; flex-shrink: 0; }
        .dept-card-name { font-size: 0.78rem; font-weight: 700; color: white; }
        .dept-room { font-size: 0.67rem; color: rgba(255,255,255,0.4); margin-top: 1px; }

        .wait-badge {
          font-size: 0.65rem;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: var(--radius-full);
          border: 1px solid;
          white-space: nowrap;
        }

        /* Now serving */
        .now-serving {
          padding: 12px;
          text-align: center;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .now-label {
          font-size: 0.6rem;
          font-weight: 800;
          color: rgba(255,255,255,0.4);
          letter-spacing: 0.1em;
          margin-bottom: 4px;
        }

        .now-token {
          font-size: 1.5rem;
          font-weight: 900;
          letter-spacing: 0.05em;
          font-family: monospace;
          animation: token-flash 2s ease-in-out infinite;
        }

        @keyframes token-flash {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.75; }
        }

        /* Next tokens */
        .next-tokens {
          padding: 8px 12px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .next-label {
          font-size: 0.58rem;
          font-weight: 700;
          color: rgba(255,255,255,0.3);
          letter-spacing: 0.08em;
          margin-bottom: 5px;
        }

        .next-list { display: flex; gap: 6px; flex-wrap: wrap; }

        .next-token {
          padding: 2px 8px;
          border-radius: var(--radius-full);
          border: 1px solid;
          font-size: 0.7rem;
          font-weight: 700;
          font-family: monospace;
        }

        /* Waiting count */
        .waiting-count {
          padding: 8px 12px;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 1rem;
          font-weight: 800;
        }

        .waiting-label { font-size: 0.67rem; color: rgba(255,255,255,0.35); flex: 1; }

        .waiting-bar-bg {
          width: 50px;
          height: 4px;
          background: rgba(255,255,255,0.06);
          border-radius: 2px;
          overflow: hidden;
        }

        .waiting-bar-fill {
          height: 100%;
          border-radius: 2px;
          transition: width 0.5s ease;
        }

        /* Footer */
        .queue-footer {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 32px;
          padding: 10px 20px;
          background: rgba(0,0,0,0.3);
          border-top: 1px solid rgba(255,255,255,0.05);
          flex-wrap: wrap;
        }

        .footer-stat {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
          color: rgba(255,255,255,0.4);
        }

        .footer-num {
          font-size: 1rem;
          font-weight: 800;
        }

        .footer-note {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 0.65rem;
          color: rgba(255,255,255,0.25);
        }

        @media (max-width: 1100px) { .queue-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 600px) { .queue-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
