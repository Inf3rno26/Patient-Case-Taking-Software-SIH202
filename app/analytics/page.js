"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart2, Users, Clock, Activity, AlertTriangle,
  TrendingUp, Stethoscope, ArrowLeft, RefreshCw, Download,
  Heart, Leaf, Bone, Flower2, Baby, Brain, Building2,
  Globe, Calendar, Bot, Check
} from "lucide-react";
import Navbar from "@/components/ui/Navbar";
import GlassCard from "@/components/ui/GlassCard";

const DEPT_ICONS = {
  "General Medicine": Stethoscope,
  "Ayurveda (AYUSH)": Leaf,
  "Orthopedics": Bone,
  "Cardiology": Heart,
  "Gynecology": Flower2,
  "Pediatrics": Baby,
  "Neurology": Brain,
  "Others": Building2,
};

// ─── Simulated live OPD data ────────────────────────────────────────────────
function generateLiveData() {
  const base = {
    todayPatients: 847 + Math.floor(Math.random() * 30),
    avgInterviewMin: (4.2 + Math.random() * 0.6).toFixed(1),
    avgWaitMin: (18 + Math.random() * 5).toFixed(0),
    redFlagsToday: 12 + Math.floor(Math.random() * 3),
    abhaLinked: 634 + Math.floor(Math.random() * 15),
    documentsScanned: 1241 + Math.floor(Math.random() * 40),
    sessionsCompleted: 798 + Math.floor(Math.random() * 20),
    ayushPatients: 203 + Math.floor(Math.random() * 10),

    // Hourly throughput (6 AM – 6 PM)
    hourlyData: [
      { hour: "6 AM", patients: 28, target: 40 },
      { hour: "7 AM", patients: 67, target: 70 },
      { hour: "8 AM", patients: 124, target: 110 },
      { hour: "9 AM", patients: 158, target: 130 },
      { hour: "10 AM", patients: 143, target: 130 },
      { hour: "11 AM", patients: 112, target: 120 },
      { hour: "12 PM", patients: 89, target: 100 },
      { hour: "1 PM", patients: 47, target: 60 },
      { hour: "2 PM", patients: 34, target: 70 },
      { hour: "3 PM", patients: 26, target: 70 },
      { hour: "4 PM", patients: 12, target: 50 },
      { hour: "5 PM", patients: 5, target: 30 },
    ].map(h => ({ ...h, patients: h.patients + Math.floor(Math.random() * 8 - 4) })),

    // Department distribution
    departments: [
      { name: "General Medicine", count: 234, color: "#00d4aa" },
      { name: "Ayurveda (AYUSH)", count: 203, color: "#ff9933" },
      { name: "Orthopedics", count: 98, color: "#4db8ff" },
      { name: "Cardiology", count: 87, color: "#ff4757" },
      { name: "Gynecology", count: 76, color: "#ff6b81" },
      { name: "Pediatrics", count: 69, color: "#ffd93d" },
      { name: "Neurology", count: 45, color: "#a29bfe" },
      { name: "Others", count: 35, color: "#636e72" },
    ],

    // Language distribution
    languages: [
      { lang: "Hindi", pct: 42, color: "#ff9933" },
      { lang: "English", pct: 24, color: "#4db8ff" },
      { lang: "Marathi", pct: 14, color: "#00d4aa" },
      { lang: "Telugu", pct: 8, color: "#a29bfe" },
      { lang: "Others", pct: 12, color: "#636e72" },
    ],

    // Priority breakdown
    priorities: [
      { level: "Routine", count: 721, pct: 85, color: "#00d4aa" },
      { level: "Urgent", count: 114, pct: 13, color: "#ffb347" },
      { level: "Emergency", count: 12, pct: 2, color: "#ff4757" },
    ],

    // AI performance
    aiStats: {
      accuracy: "94.3%",
      redFlagPrecision: "98.1%",
      avgConfidence: "91.7%",
      ocrAccuracy: "89.4%",
    },

    // Weekly trend
    weekTrend: [
      { day: "Mon", patients: 712 },
      { day: "Tue", patients: 834 },
      { day: "Wed", patients: 798 },
      { day: "Thu", patients: 921 },
      { day: "Fri", patients: 847 },
      { day: "Sat", patients: 1043 },
      { day: "Sun", patients: 312 },
    ],
  };
  return base;
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [data, setData] = useState(generateLiveData());
  const [mounted, setMounted] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [animatedBars, setAnimatedBars] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    setTimeout(() => setAnimatedBars(true), 300);

    // Live refresh every 8 seconds
    intervalRef.current = setInterval(() => {
      setData(generateLiveData());
      setLastUpdate(new Date());
    }, 8000);

    return () => clearInterval(intervalRef.current);
  }, []);

  if (!mounted) return null;

  const maxHourly = Math.max(...data.hourlyData.map(h => Math.max(h.patients, h.target)));
  const maxWeekly = Math.max(...data.weekTrend.map(d => d.patients));
  const totalDepts = data.departments.reduce((a, d) => a + d.count, 0);

  return (
    <>
      <Navbar />
      <div className="page-wrapper">
        <div className="container container-wide" style={{ padding: "24px 16px 60px" }}>

          {/* Header */}
          <div className="analytics-header animate-fade-in">
            <div className="header-left">
              <button className="back-btn" onClick={() => router.back()} id="analytics-back-btn">
                <ArrowLeft size={18} /> Back
              </button>
              <div>
                <h1>OPD Analytics <span className="live-dot" /></h1>
                <p className="header-sub">
                  <RefreshCw size={12} /> Live data · Updated {lastUpdate.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </p>
              </div>
            </div>
            <div className="header-right">
              <span className="date-badge">
                {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </span>
              <button className="btn-secondary" id="analytics-export-btn" onClick={() => window.print()}>
                <Download size={14} /> Export Report
              </button>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="kpi-grid animate-fade-in-up">
            {[
              { icon: <Users size={22} />, value: data.todayPatients, label: "Patients Today", color: "#00d4aa", sub: "↑ 6% vs yesterday" },
              { icon: <Clock size={22} />, value: `${data.avgInterviewMin} min`, label: "Avg. Interview Time", color: "#4db8ff", sub: "↓ 68% vs manual" },
              { icon: <AlertTriangle size={22} />, value: data.redFlagsToday, label: "Red Flags Triggered", color: "#ff4757", sub: "All routed to triage" },
              { icon: <Activity size={22} />, value: `${data.abhaLinked}`, label: "ABHA Linked", color: "#a29bfe", sub: `${Math.round(data.abhaLinked / data.todayPatients * 100)}% of today's patients` },
              { icon: <BarChart2 size={22} />, value: data.documentsScanned, label: "Docs Scanned (AI OCR)", color: "#ffb347", sub: `Acc: ${data.aiStats.ocrAccuracy}` },
              { icon: <Stethoscope size={22} />, value: data.ayushPatients, label: "AYUSH Patients", color: "#ff9933", sub: "Dashavidha Pariksha done" },
            ].map((kpi, i) => (
              <GlassCard key={i} hoverable={false} className="kpi-card animate-fade-in-up" style={{ animationDelay: `${i * 0.07}s` }}>
                <div className="kpi-icon" style={{ color: kpi.color, background: `${kpi.color}14` }}>
                  {kpi.icon}
                </div>
                <div className="kpi-value" style={{ color: kpi.color }}>{kpi.value}</div>
                <div className="kpi-label">{kpi.label}</div>
                <div className="kpi-sub">{kpi.sub}</div>
              </GlassCard>
            ))}
          </div>

          <div className="analytics-grid">

            {/* Hourly Throughput Bar Chart */}
            <GlassCard hoverable={false} className="chart-card wide animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              <div className="chart-header">
                <h2 style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Clock size={18} /> Hourly Patient Throughput
                </h2>
                <div className="chart-legend">
                  <span className="legend-dot" style={{ background: "#00d4aa" }} /> Actual
                  <span className="legend-dot" style={{ background: "rgba(255,255,255,0.15)" }} /> Target
                </div>
              </div>
              <div className="bar-chart">
                {data.hourlyData.map((h, i) => (
                  <div key={h.hour} className="bar-col">
                    <div className="bar-pair">
                      {/* Target bar */}
                      <div
                        className="bar target-bar"
                        style={{ height: animatedBars ? `${(h.target / maxHourly) * 100}%` : "0%" }}
                      />
                      {/* Actual bar */}
                      <div
                        className="bar actual-bar"
                        style={{
                          height: animatedBars ? `${(h.patients / maxHourly) * 100}%` : "0%",
                          background: h.patients > h.target
                            ? "linear-gradient(to top, #ff4757, #ff6b7a)"
                            : "linear-gradient(to top, #00d4aa, #00b894)",
                          animationDelay: `${i * 0.06}s`,
                        }}
                        title={`${h.hour}: ${h.patients} patients`}
                      />
                    </div>
                    <div className="bar-label">{h.hour.replace(" ", "\n")}</div>
                  </div>
                ))}
              </div>
              <div className="chart-note">
                Peak hour: <strong>9 AM — 158 patients</strong> · Kiosk throughput: <strong>{Math.round(data.todayPatients / 12)} patients/hour avg</strong>
              </div>
            </GlassCard>

            {/* Department Distribution */}
            <GlassCard hoverable={false} className="chart-card animate-fade-in-up" style={{ animationDelay: "0.25s" }}>
              <div className="chart-header">
                <h2 style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Building2 size={18} /> Department Distribution
                </h2>
              </div>
              <div className="dept-list">
                {data.departments.map((dept) => {
                  const pct = Math.round(dept.count / totalDepts * 100);
                  const IconComponent = DEPT_ICONS[dept.name] || Building2;
                  return (
                    <div key={dept.name} className="dept-row">
                      <div className="dept-info">
                        <span className="dept-icon" style={{ display: "inline-flex", alignItems: "center" }}>
                          <IconComponent size={15} style={{ color: dept.color }} />
                        </span>
                        <span className="dept-name">{dept.name}</span>
                        <span className="dept-count" style={{ color: dept.color }}>{dept.count}</span>
                      </div>
                      <div className="dept-bar-bg">
                        <div
                          className="dept-bar-fill"
                          style={{
                            width: animatedBars ? `${pct}%` : "0%",
                            background: dept.color,
                            transition: "width 1s cubic-bezier(0.34,1.56,0.64,1)",
                            transitionDelay: "0.3s",
                          }}
                        />
                      </div>
                      <span className="dept-pct" style={{ color: dept.color }}>{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </GlassCard>

            {/* Priority Triage Breakdown */}
            <GlassCard hoverable={false} className="chart-card animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
              <div className="chart-header">
                <h2 style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Activity size={18} /> Triage Priority Breakdown
                </h2>
              </div>
              <div className="priority-list">
                {data.priorities.map((p) => (
                  <div key={p.level} className="priority-row">
                    <div className="priority-header">
                      <span className="priority-label" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                        <span style={{ width: 7, height: 7, borderRadius: "50%", background: p.color, display: "inline-block" }} />
                        {p.level}
                      </span>
                      <span className="priority-count" style={{ color: p.color }}>{p.count}</span>
                    </div>
                    <div className="priority-bar-bg">
                      <div
                        className="priority-bar-fill"
                        style={{
                          width: animatedBars ? `${p.pct}%` : "0%",
                          background: `linear-gradient(90deg, ${p.color}cc, ${p.color})`,
                          transition: "width 1.2s cubic-bezier(0.34,1.56,0.64,1)",
                          transitionDelay: "0.5s",
                        }}
                      />
                    </div>
                    <span className="priority-pct" style={{ color: p.color }}>{p.pct}%</span>
                  </div>
                ))}
                <div className="triage-note">
                  <AlertTriangle size={12} /> All Emergency cases instantly notified to triage staff via red-flag alert
                </div>
              </div>

              {/* AI Stats */}
              <div className="ai-stats">
                <div className="ai-stats-title" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Bot size={15} /> AI Performance Metrics
                </div>
                {Object.entries(data.aiStats).map(([k, v]) => (
                  <div key={k} className="ai-stat-row">
                    <span className="ai-stat-label">
                      {k === "accuracy" ? "History Accuracy" :
                        k === "redFlagPrecision" ? "Red Flag Precision" :
                          k === "avgConfidence" ? "Avg. Confidence" : "OCR Accuracy"}
                    </span>
                    <span className="ai-stat-val">{v}</span>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Language Distribution */}
            <GlassCard hoverable={false} className="chart-card animate-fade-in-up" style={{ animationDelay: "0.35s" }}>
              <div className="chart-header">
                <h2 style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Globe size={18} /> Language Distribution
                </h2>
              </div>

              {/* Simple donut chart via SVG */}
              <div className="donut-wrapper">
                <svg viewBox="0 0 120 120" className="donut-svg">
                  {(() => {
                    let cumulative = 0;
                    return data.languages.map((lang, i) => {
                      const radius = 45;
                      const circumference = 2 * Math.PI * radius;
                      const offset = circumference - (lang.pct / 100) * circumference;
                      const rotation = (cumulative / 100) * 360 - 90;
                      cumulative += lang.pct;
                      return (
                        <circle
                          key={lang.lang}
                          cx="60" cy="60" r={radius}
                          fill="none"
                          stroke={lang.color}
                          strokeWidth="18"
                          strokeDasharray={`${(lang.pct / 100) * circumference} ${circumference}`}
                          transform={`rotate(${rotation} 60 60)`}
                          style={{ transition: "stroke-dasharray 1.2s ease", opacity: 0.9 }}
                        />
                      );
                    });
                  })()}
                  <text x="60" y="57" textAnchor="middle" fontSize="11" fontWeight="700" fill="white">
                    {data.languages[0].lang}
                  </text>
                  <text x="60" y="70" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.6)">
                    {data.languages[0].pct}%
                  </text>
                </svg>
                <div className="donut-legend">
                  {data.languages.map((lang) => (
                    <div key={lang.lang} className="donut-legend-item">
                      <span className="legend-dot" style={{ background: lang.color }} />
                      <span className="legend-lang">{lang.lang}</span>
                      <span className="legend-pct" style={{ color: lang.color }}>{lang.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>

            {/* Weekly Trend */}
            <GlassCard hoverable={false} className="chart-card animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
              <div className="chart-header">
                <h2 style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Calendar size={18} /> Weekly Patient Trend
                </h2>
              </div>
              <div className="weekly-chart">
                {data.weekTrend.map((d, i) => {
                  const isToday = d.day === ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][new Date().getDay()];
                  return (
                    <div key={d.day} className={`weekly-col ${isToday ? "today" : ""}`}>
                      <div className="weekly-count" style={{ color: isToday ? "#00d4aa" : "rgba(255,255,255,0.5)" }}>
                        {d.patients}
                      </div>
                      <div className="weekly-bar-bg">
                        <div
                          className="weekly-bar-fill"
                          style={{
                            height: animatedBars ? `${(d.patients / maxWeekly) * 100}%` : "0%",
                            background: isToday
                              ? "linear-gradient(to top, #00d4aa, #00b894)"
                              : "linear-gradient(to top, rgba(255,255,255,0.15), rgba(255,255,255,0.25))",
                            transition: "height 1s cubic-bezier(0.34,1.56,0.64,1)",
                            transitionDelay: `${i * 0.08}s`,
                          }}
                        />
                      </div>
                      <div className="weekly-day" style={{ color: isToday ? "#00d4aa" : "rgba(255,255,255,0.4)", fontWeight: isToday ? 700 : 400 }}>
                        {d.day}
                        {isToday && <span className="today-dot" />}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="chart-note">
                Saturday peak: <strong>1,043 patients</strong> · MediKiosk handled all without additional staff
              </div>
            </GlassCard>

            {/* Impact Summary */}
            <GlassCard hoverable={false} className="chart-card impact-card animate-fade-in-up" style={{ animationDelay: "0.45s" }}>
              <div className="chart-header">
                <h2 style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <TrendingUp size={18} /> Impact vs Manual Process
                </h2>
              </div>
              <div className="impact-list">
                {[
                  { metric: "Avg. consultation time saved", before: "3.8 min", after: "0.4 min review", saving: "90%", color: "#00d4aa" },
                  { metric: "History completeness", before: "60–70%", after: "94.3%", saving: "+34%", color: "#4db8ff" },
                  { metric: "Drug interaction detection", before: "Missed", after: "AI-flagged", saving: "∞", color: "#ff9933" },
                  { metric: "ABHA record linkage", before: "Manual clerk", after: "Automated", saving: "100%", color: "#a29bfe" },
                  { metric: "Red flag triage speed", before: "~5 min delay", after: "Instant", saving: "Instant", color: "#ff4757" },
                  { metric: "Documents organized", before: "0 (paper)", after: `${data.documentsScanned} digitized`, saving: `+${data.documentsScanned}`, color: "#ffd93d" },
                ].map((item, i) => (
                  <div key={i} className="impact-row">
                    <div className="impact-metric">{item.metric}</div>
                    <div className="impact-comparison">
                      <span className="impact-before">{item.before}</span>
                      <span className="impact-arrow">→</span>
                      <span className="impact-after" style={{ color: item.color, display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <Check size={13} /> {item.after}
                      </span>
                    </div>
                    <span className="impact-saving" style={{ color: item.color }}>{item.saving}</span>
                  </div>
                ))}
              </div>
            </GlassCard>

          </div>
        </div>
      </div>

      <style jsx>{`
        .analytics-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 12px;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .back-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border-radius: var(--radius-full);
          border: 1px solid rgba(255,255,255,0.12);
          background: transparent;
          color: var(--color-text-muted);
          font-size: 0.82rem;
          cursor: pointer;
          transition: all 0.15s;
        }

        .back-btn:hover {
          background: rgba(255,255,255,0.06);
          color: var(--color-text-secondary);
        }

        h1 {
          font-size: 1.6rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 4px;
        }

        .live-dot {
          display: inline-block;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #ff4757;
          animation: pulse-red 1.2s ease-in-out infinite;
        }

        @keyframes pulse-red {
          0%, 100% { transform: scale(1); opacity: 1; box-shadow: 0 0 0 0 rgba(255,71,87,0.4); }
          50% { transform: scale(1.3); opacity: 0.7; box-shadow: 0 0 0 6px rgba(255,71,87,0); }
        }

        .header-sub {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.78rem;
          color: var(--color-text-muted);
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .date-badge {
          font-size: 0.8rem;
          color: var(--color-text-muted);
          padding: 6px 14px;
          border-radius: var(--radius-full);
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.03);
        }

        /* KPI Grid */
        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 14px;
          margin-bottom: 20px;
        }

        .kpi-card {
          padding: 16px !important;
          text-align: center;
        }

        .kpi-icon {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 10px;
        }

        .kpi-value {
          font-size: 1.5rem;
          font-weight: 800;
          font-family: var(--font-display);
          line-height: 1.1;
          margin-bottom: 4px;
        }

        .kpi-label {
          font-size: 0.73rem;
          color: var(--color-text-secondary);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          margin-bottom: 4px;
        }

        .kpi-sub {
          font-size: 0.68rem;
          color: var(--color-text-muted);
        }

        /* Analytics grid */
        .analytics-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .chart-card {
          padding: 20px !important;
        }

        .chart-card.wide {
          grid-column: span 2;
        }

        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .chart-header h2 {
          font-size: 0.95rem;
          font-weight: 700;
          margin: 0;
        }

        .chart-legend {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 0.72rem;
          color: var(--color-text-muted);
        }

        .legend-dot {
          display: inline-block;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          margin-right: 4px;
        }

        /* Hourly Bar Chart */
        .bar-chart {
          display: flex;
          align-items: flex-end;
          gap: 6px;
          height: 140px;
          padding-bottom: 8px;
        }

        .bar-col {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          height: 100%;
        }

        .bar-pair {
          flex: 1;
          width: 100%;
          display: flex;
          align-items: flex-end;
          gap: 2px;
        }

        .bar {
          flex: 1;
          border-radius: 3px 3px 0 0;
          transition: height 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
          min-height: 4px;
        }

        .target-bar {
          background: rgba(255,255,255,0.1);
        }

        .actual-bar {
          transition-delay: var(--delay, 0s);
        }

        .bar-label {
          font-size: 0.6rem;
          color: var(--color-text-muted);
          text-align: center;
          margin-top: 4px;
          white-space: pre;
          line-height: 1.2;
        }

        .chart-note {
          font-size: 0.73rem;
          color: var(--color-text-muted);
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px solid rgba(255,255,255,0.06);
        }

        /* Department list */
        .dept-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .dept-row {
          display: grid;
          grid-template-columns: 1fr auto auto;
          align-items: center;
          gap: 8px;
        }

        .dept-info {
          display: flex;
          align-items: center;
          gap: 6px;
          min-width: 0;
        }

        .dept-icon { font-size: 0.9rem; flex-shrink: 0; }

        .dept-name {
          font-size: 0.75rem;
          color: var(--color-text-secondary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .dept-count {
          font-size: 0.75rem;
          font-weight: 700;
          flex-shrink: 0;
        }

        .dept-bar-bg {
          width: 80px;
          height: 6px;
          background: rgba(255,255,255,0.06);
          border-radius: 3px;
          overflow: hidden;
          flex-shrink: 0;
        }

        .dept-bar-fill {
          height: 100%;
          border-radius: 3px;
        }

        .dept-pct {
          font-size: 0.7rem;
          font-weight: 700;
          width: 32px;
          text-align: right;
          flex-shrink: 0;
        }

        /* Priority breakdown */
        .priority-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 16px;
        }

        .priority-row {
          display: grid;
          grid-template-columns: 1fr auto auto;
          align-items: center;
          gap: 8px;
        }

        .priority-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          grid-column: 1 / -1;
          margin-bottom: -4px;
        }

        .priority-label {
          font-size: 0.8rem;
          font-weight: 600;
        }

        .priority-count {
          font-size: 0.82rem;
          font-weight: 800;
        }

        .priority-bar-bg {
          height: 8px;
          background: rgba(255,255,255,0.06);
          border-radius: 4px;
          overflow: hidden;
          grid-column: 1 / 3;
        }

        .priority-bar-fill {
          height: 100%;
          border-radius: 4px;
        }

        .priority-pct {
          font-size: 0.72rem;
          font-weight: 700;
          text-align: right;
        }

        .triage-note {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.7rem;
          color: var(--color-text-muted);
          padding: 8px 10px;
          background: rgba(255,71,87,0.06);
          border-radius: var(--radius-sm);
          margin-top: 4px;
        }

        /* AI stats */
        .ai-stats {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid rgba(255,255,255,0.06);
        }

        .ai-stats-title {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--color-text-secondary);
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .ai-stat-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
        }

        .ai-stat-label {
          font-size: 0.73rem;
          color: var(--color-text-muted);
        }

        .ai-stat-val {
          font-size: 0.78rem;
          font-weight: 800;
          color: var(--color-accent-primary);
        }

        /* Donut chart */
        .donut-wrapper {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .donut-svg {
          width: 130px;
          height: 130px;
          flex-shrink: 0;
        }

        .donut-legend {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .donut-legend-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.78rem;
        }

        .legend-lang {
          flex: 1;
          color: var(--color-text-secondary);
        }

        .legend-pct {
          font-weight: 700;
          font-size: 0.8rem;
        }

        /* Weekly chart */
        .weekly-chart {
          display: flex;
          align-items: flex-end;
          gap: 8px;
          height: 120px;
          padding-bottom: 8px;
        }

        .weekly-col {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          height: 100%;
        }

        .weekly-count {
          font-size: 0.65rem;
          font-weight: 600;
        }

        .weekly-bar-bg {
          flex: 1;
          width: 100%;
          display: flex;
          align-items: flex-end;
          background: rgba(255,255,255,0.04);
          border-radius: 4px;
          overflow: hidden;
        }

        .weekly-bar-fill {
          width: 100%;
          border-radius: 4px;
          transition: height 0.9s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .weekly-day {
          font-size: 0.67rem;
          text-align: center;
          position: relative;
        }

        .today-dot {
          display: block;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #00d4aa;
          margin: 2px auto 0;
        }

        /* Impact card */
        .impact-card .chart-header h2 { font-size: 0.9rem; }

        .impact-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .impact-row {
          display: grid;
          grid-template-columns: 1fr auto auto;
          align-items: center;
          gap: 10px;
          padding: 8px 10px;
          background: rgba(255,255,255,0.03);
          border-radius: var(--radius-sm);
        }

        .impact-metric {
          font-size: 0.75rem;
          color: var(--color-text-secondary);
        }

        .impact-comparison {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.7rem;
        }

        .impact-before {
          color: rgba(255,255,255,0.3);
          text-decoration: line-through;
          text-decoration-color: rgba(255,71,87,0.5);
        }

        .impact-arrow {
          color: rgba(255,255,255,0.2);
        }

        .impact-after {
          font-weight: 600;
        }

        .impact-saving {
          font-size: 0.75rem;
          font-weight: 800;
          text-align: right;
          white-space: nowrap;
        }

        /* Responsive */
        @media (max-width: 1100px) {
          .kpi-grid { grid-template-columns: repeat(3, 1fr); }
          .analytics-grid { grid-template-columns: 1fr; }
          .chart-card.wide { grid-column: span 1; }
        }

        @media (max-width: 640px) {
          .kpi-grid { grid-template-columns: repeat(2, 1fr); }
          .analytics-header { flex-direction: column; }
        }

        @media print {
          .back-btn, .btn-secondary { display: none; }
        }
      `}</style>
    </>
  );
}
