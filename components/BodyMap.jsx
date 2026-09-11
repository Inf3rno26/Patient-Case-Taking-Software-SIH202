"use client";

import { useState, useCallback } from "react";
import { RotateCcw, ZoomIn, X, Check, MapPin, User } from "lucide-react";

/**
 * MediKiosk Body Map — Interactive SVG pain location selector
 * Touchscreen-optimized for hospital kiosks
 * Supports front/back view, pain severity, and radiation zones
 */

const BODY_ZONES = {
  front: [
    // Head
    { id: "head", label: "Head", cx: 100, cy: 42, r: 30 },
    // Face
    { id: "face", label: "Face", cx: 100, cy: 55, r: 16 },
    // Neck
    { id: "neck", label: "Neck", cx: 100, cy: 82, r: 12 },
    // Left shoulder
    { id: "left_shoulder", label: "Left Shoulder", cx: 62, cy: 98, r: 15 },
    // Right shoulder
    { id: "right_shoulder", label: "Right Shoulder", cx: 138, cy: 98, r: 15 },
    // Chest (center)
    { id: "chest_left", label: "Left Chest", cx: 82, cy: 125, r: 18 },
    { id: "chest_right", label: "Right Chest", cx: 118, cy: 125, r: 18 },
    // Abdomen
    { id: "epigastrium", label: "Epigastrium", cx: 100, cy: 148, r: 16 },
    { id: "umbilicus", label: "Umbilical", cx: 100, cy: 168, r: 14 },
    { id: "left_iliac", label: "Left Iliac Fossa", cx: 78, cy: 188, r: 14 },
    { id: "right_iliac", label: "Right Iliac Fossa", cx: 122, cy: 188, r: 14 },
    { id: "hypogastrium", label: "Hypogastrium", cx: 100, cy: 195, r: 14 },
    // Left arm
    { id: "left_arm", label: "Left Arm", cx: 45, cy: 145, r: 13 },
    { id: "left_forearm", label: "Left Forearm", cx: 35, cy: 175, r: 11 },
    { id: "left_hand", label: "Left Hand", cx: 28, cy: 200, r: 10 },
    // Right arm
    { id: "right_arm", label: "Right Arm", cx: 155, cy: 145, r: 13 },
    { id: "right_forearm", label: "Right Forearm", cx: 165, cy: 175, r: 11 },
    { id: "right_hand", label: "Right Hand", cx: 172, cy: 200, r: 10 },
    // Hips/Groin
    { id: "left_hip", label: "Left Hip", cx: 75, cy: 210, r: 13 },
    { id: "right_hip", label: "Right Hip", cx: 125, cy: 210, r: 13 },
    // Thighs
    { id: "left_thigh", label: "Left Thigh", cx: 80, cy: 240, r: 14 },
    { id: "right_thigh", label: "Right Thigh", cx: 120, cy: 240, r: 14 },
    // Knees
    { id: "left_knee", label: "Left Knee", cx: 80, cy: 275, r: 12 },
    { id: "right_knee", label: "Right Knee", cx: 120, cy: 275, r: 12 },
    // Leg/Ankle
    { id: "left_leg", label: "Left Leg / Calf", cx: 80, cy: 305, r: 12 },
    { id: "right_leg", label: "Right Leg / Calf", cx: 120, cy: 305, r: 12 },
    { id: "left_ankle", label: "Left Ankle / Foot", cx: 80, cy: 335, r: 12 },
    { id: "right_ankle", label: "Right Ankle / Foot", cx: 120, cy: 335, r: 12 },
  ],
  back: [
    { id: "back_head", label: "Back of Head", cx: 100, cy: 42, r: 28 },
    { id: "neck_back", label: "Back of Neck", cx: 100, cy: 80, r: 12 },
    { id: "left_shoulder_back", label: "Left Shoulder", cx: 62, cy: 98, r: 15 },
    { id: "right_shoulder_back", label: "Right Shoulder", cx: 138, cy: 98, r: 15 },
    { id: "upper_back_left", label: "Upper Back (L)", cx: 82, cy: 120, r: 16 },
    { id: "upper_back_right", label: "Upper Back (R)", cx: 118, cy: 120, r: 16 },
    { id: "mid_back", label: "Mid Back", cx: 100, cy: 148, r: 16 },
    { id: "lower_back_left", label: "Lower Back (L)", cx: 82, cy: 172, r: 15 },
    { id: "lower_back_right", label: "Lower Back (R)", cx: 118, cy: 172, r: 15 },
    { id: "sacrum", label: "Sacrum / Tailbone", cx: 100, cy: 198, r: 14 },
    { id: "left_buttock", label: "Left Buttock", cx: 78, cy: 215, r: 14 },
    { id: "right_buttock", label: "Right Buttock", cx: 122, cy: 215, r: 14 },
    { id: "left_thigh_back", label: "Left Thigh (back)", cx: 80, cy: 245, r: 14 },
    { id: "right_thigh_back", label: "Right Thigh (back)", cx: 120, cy: 245, r: 14 },
    { id: "left_calf", label: "Left Calf", cx: 80, cy: 290, r: 12 },
    { id: "right_calf", label: "Right Calf", cx: 120, cy: 290, r: 12 },
    { id: "left_heel", label: "Left Heel / Foot", cx: 80, cy: 330, r: 12 },
    { id: "right_heel", label: "Right Heel / Foot", cx: 120, cy: 330, r: 12 },
  ],
};

// Zones that often need radiation mapping
const RADIATION_MAP = {
  chest_left: ["left_arm", "left_shoulder", "neck", "epigastrium", "left_jaw"],
  chest_right: ["right_arm", "right_shoulder"],
  epigastrium: ["chest_left", "chest_right", "left_shoulder", "back_mid"],
  left_iliac: ["left_thigh", "hypogastrium"],
  right_iliac: ["right_thigh", "hypogastrium"],
  head: ["neck", "neck_back", "left_shoulder", "right_shoulder"],
  lower_back_left: ["left_buttock", "left_thigh_back", "left_calf"],
  lower_back_right: ["right_buttock", "right_thigh_back", "right_calf"],
};

const SEVERITY_COLORS = {
  1: "#ffd93d",
  2: "#ffb347",
  3: "#ff8c42",
  4: "#ff5e57",
  5: "#d62839",
};

export default function BodyMap({ onLocationSelect, language = "en-IN" }) {
  const [view, setView] = useState("front"); // 'front' | 'back'
  const [selectedZones, setSelectedZones] = useState([]);
  const [severity, setSeverity] = useState(5);
  const [hoveredZone, setHoveredZone] = useState(null);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const isHi = language?.startsWith("hi");
  const zones = BODY_ZONES[view];

  const handleZoneTap = useCallback(
    (zone) => {
      setSelectedZones((prev) => {
        const existing = prev.find((z) => z.id === zone.id);
        if (existing) {
          // De-select
          return prev.filter((z) => z.id !== zone.id);
        }
        return [...prev, { ...zone, severity, view }];
      });
      setIsConfirmed(false);
    },
    [severity, view]
  );

  const handleConfirm = () => {
    if (selectedZones.length === 0) return;

    const primaryZone = selectedZones[0];
    const allLabels = selectedZones.map((z) => z.label);

    // Build structured output for interview
    const result = {
      site: primaryZone.label,
      allSites: allLabels,
      radiation: selectedZones.length > 1 ? allLabels.slice(1).join(", ") : null,
      severity: severity,
      view,
      zones: selectedZones,
      // Human readable for interview
      description: isHi
        ? `${allLabels.join(" और ")} में दर्द — गंभीरता: ${severity}/10`
        : `Pain in ${allLabels.join(" and ")} — Severity: ${severity}/10`,
    };

    setIsConfirmed(true);
    onLocationSelect?.(result);
  };

  const handleClear = () => {
    setSelectedZones([]);
    setIsConfirmed(false);
  };

  const getZoneColor = (zone) => {
    const selected = selectedZones.find((z) => z.id === zone.id);
    if (selected) return SEVERITY_COLORS[Math.ceil(selected.severity / 2)] || "#ff5e57";
    if (hoveredZone === zone.id) return "rgba(0, 212, 170, 0.5)";
    return "rgba(255, 255, 255, 0.08)";
  };

  const getZoneStroke = (zone) => {
    const selected = selectedZones.find((z) => z.id === zone.id);
    if (selected) return SEVERITY_COLORS[Math.ceil(selected.severity / 2)] || "#ff5e57";
    if (hoveredZone === zone.id) return "#00d4aa";
    return "rgba(255,255,255,0.2)";
  };

  return (
    <div className="bodymap-container">
      {/* Header */}
      <div className="bodymap-header">
        <h3 style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <MapPin size={20} style={{ color: "var(--color-accent-primary)" }} /> {isHi ? "दर्द की जगह बताएं" : "Tap where it hurts"}
        </h3>
        <p className="bodymap-hint">
          {isHi
            ? "जहाँ दर्द है वहाँ टैप करें — एक से ज़्यादा जगह भी चुन सकते हैं"
            : "Tap the painful area(s) — select multiple if pain radiates"}
        </p>
      </div>

      {/* View Toggle */}
      <div className="bodymap-toggle">
        <button
          className={`view-btn ${view === "front" ? "active" : ""}`}
          onClick={() => setView("front")}
          id="bodymap-front-btn"
        >
          <User size={14} /> {isHi ? "आगे" : "Front"}
        </button>
        <button
          className={`view-btn ${view === "back" ? "active" : ""}`}
          onClick={() => setView("back")}
          id="bodymap-back-btn"
        >
          <RotateCcw size={14} /> {isHi ? "पीछे" : "Back"}
        </button>
      </div>

      {/* Body SVG */}
      <div className="bodymap-svg-wrapper">
        <svg
          viewBox="0 0 200 360"
          className="bodymap-svg"
          aria-label="Human body diagram"
        >
          {/* Body silhouette */}
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <radialGradient id="painGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ff4757" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#ff4757" stopOpacity="0.2" />
            </radialGradient>
          </defs>

          {/* Silhouette paths — simplified human outline */}
          {/* Head & Neck */}
          <ellipse cx="100" cy="42" rx="22" ry="26" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          <path d="M 93 68 L 93 82 L 107 82 L 107 68" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          {/* Torso */}
          <path
            d="M 65 92 C 60 92, 50 105, 52 140 C 53 160, 60 200, 72 215 L 128 215 C 140 200, 147 160, 148 140 C 150 105, 140 92, 135 92 Z"
            fill="rgba(255,255,255,0.05)"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="1"
          />
          {/* Left Arm */}
          <path
            d="M 52 95 C 40 105, 30 140, 26 195 C 24 208, 32 210, 35 198 C 40 155, 48 125, 58 105"
            fill="rgba(255,255,255,0.04)"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="1"
          />
          {/* Right Arm */}
          <path
            d="M 148 95 C 160 105, 170 140, 174 195 C 176 208, 168 210, 165 198 C 160 155, 152 125, 142 105"
            fill="rgba(255,255,255,0.04)"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="1"
          />
          {/* Legs */}
          {/* Left leg */}
          <path
            d="M 72 215 C 70 240, 68 280, 72 340 L 88 340 C 86 280, 88 240, 96 215 Z"
            fill="rgba(255,255,255,0.04)"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="1"
          />
          {/* Right leg */}
          <path
            d="M 128 215 C 130 240, 132 280, 128 340 L 112 340 C 114 280, 112 240, 104 215 Z"
            fill="rgba(255,255,255,0.04)"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="1"
          />

          {/* Radiating pain arrows */}
          {radiatingTargets.map((rt) => {
            const from = zones.find((z) => selectedZones.some((sz) => sz.id === z.id && RADIATION_MAP[sz.id]?.includes(rt.id)));
            if (!from) return null;
            return (
              <line
                key={`rad-${rt.id}`}
                x1={from.cx}
                y1={from.cy}
                x2={rt.cx}
                y2={rt.cy}
                stroke="#ff4757"
                strokeWidth="2"
                strokeDasharray="4 2"
                opacity="0.7"
              />
            );
          })}

          {/* Interactive zone circles */}
          {zones.map((zone) => {
            const isSelected = selectedZones.some((z) => z.id === zone.id);
            const isHovered = hoveredZone === zone.id;

            return (
              <g
                key={zone.id}
                onClick={() => handleZoneClick(zone)}
                onMouseEnter={() => setHoveredZone(zone.id)}
                onMouseLeave={() => setHoveredZone(null)}
                style={{ cursor: "pointer" }}
                id={`bodymap-zone-${zone.id}`}
              >
                <circle
                  cx={zone.cx}
                  cy={zone.cy}
                  r={isHovered ? zone.r + 2 : zone.r}
                  fill={getZoneColor(zone)}
                  stroke={getZoneStroke(zone)}
                  strokeWidth={isSelected ? "2" : "1"}
                  filter={isSelected ? "url(#glow)" : undefined}
                  style={{ transition: "all 0.15s ease" }}
                />
                {/* Checkmark for selected zone */}
                {isSelected && (
                  <path
                    d={`M${zone.cx - 3.5} ${zone.cy} l2.5 2.5 l5 -5`}
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ pointerEvents: "none", userSelect: "none" }}
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* Hover tooltip */}
        {hoveredZone && (
          <div className="bodymap-tooltip">
            <ZoomIn size={12} />
            {zones.find((z) => z.id === hoveredZone)?.label}
          </div>
        )}
      </div>

      {/* Selected zones display */}
      {selectedZones.length > 0 && (
        <div className="bodymap-selected animate-fade-in">
          <div className="selected-zones-header">
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
              <MapPin size={13} /> {isHi ? "चुनी गई जगहें:" : "Selected:"}
            </span>
            <button className="clear-btn" onClick={handleClear} id="bodymap-clear-btn">
              <X size={12} /> {isHi ? "हटाएं" : "Clear"}
            </button>
          </div>
          <div className="zone-tags">
            {selectedZones.map((zone) => (
              <span
                key={zone.id}
                className="zone-tag"
                style={{
                  borderColor: SEVERITY_COLORS[Math.ceil(zone.severity / 2)],
                  color: SEVERITY_COLORS[Math.ceil(zone.severity / 2)],
                }}
              >
                {zone.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Severity slider */}
      <div className="severity-section">
        <label className="severity-label">
          {isHi ? "दर्द की गंभीरता:" : "Pain severity:"}{" "}
          <span style={{ color: SEVERITY_COLORS[Math.ceil(severity / 2)], fontWeight: 700 }}>
            {severity}/10
          </span>
          <span className="severity-badge-text" style={{
            fontSize: "0.78rem",
            padding: "2px 8px",
            borderRadius: "50px",
            background: `${SEVERITY_COLORS[Math.ceil(severity / 2)]}20`,
            border: `1px solid ${SEVERITY_COLORS[Math.ceil(severity / 2)]}60`,
            color: SEVERITY_COLORS[Math.ceil(severity / 2)]
          }}>
            {severity <= 3 ? "Mild" : severity <= 6 ? "Moderate" : "Severe"}
          </span>
        </label>
        <input
          type="range"
          min="1"
          max="10"
          value={severity}
          onChange={(e) => setSeverity(Number(e.target.value))}
          className="severity-slider"
          id="bodymap-severity-slider"
          style={{ accentColor: SEVERITY_COLORS[Math.ceil(severity / 2)] }}
        />
        <div className="severity-labels">
          <span>{isHi ? "हल्का" : "Mild"}</span>
          <span>{isHi ? "मध्यम" : "Moderate"}</span>
          <span>{isHi ? "असहनीय" : "Severe"}</span>
        </div>
      </div>

      {/* Confirm button */}
      <button
        className={`bodymap-confirm-btn btn-touch ${isConfirmed ? "confirmed" : ""}`}
        onClick={handleConfirm}
        disabled={selectedZones.length === 0}
        id="bodymap-confirm-btn"
      >
        {isConfirmed ? (
          <>
            <Check size={20} /> {isHi ? "दर्ज हो गया!" : "Location Recorded!"}
          </>
        ) : (
          <>
            <Check size={18} /> {isHi ? "इस जगह का दर्द दर्ज करें" : "Confirm Pain Location"}
          </>
        )}
      </button>

      <style jsx>{`
        .bodymap-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          padding: 20px;
          background: var(--color-bg-glass);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          max-width: 420px;
          width: 100%;
          margin: 0 auto;
        }

        .bodymap-header {
          text-align: center;
        }

        .bodymap-header h3 {
          font-size: 1.1rem;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .bodymap-hint {
          font-size: 0.78rem;
          color: var(--color-text-muted);
          line-height: 1.4;
        }

        .bodymap-toggle {
          display: flex;
          gap: 8px;
          padding: 4px;
          background: rgba(255,255,255,0.05);
          border-radius: var(--radius-full);
          border: 1px solid var(--color-border);
        }

        .view-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 20px;
          border-radius: var(--radius-full);
          border: none;
          background: transparent;
          color: var(--color-text-muted);
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .view-btn.active {
          background: var(--color-accent-primary);
          color: #000;
          font-weight: 700;
        }

        .bodymap-svg-wrapper {
          position: relative;
          width: 100%;
          max-width: 220px;
        }

        .bodymap-svg {
          width: 100%;
          height: auto;
          cursor: crosshair;
        }

        .bodymap-tooltip {
          position: absolute;
          bottom: -30px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          background: rgba(0,0,0,0.8);
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          color: white;
          white-space: nowrap;
          pointer-events: none;
        }

        .pulse-ring {
          animation: pulse-zone 1.2s ease-in-out infinite;
        }

        @keyframes pulse-zone {
          0%, 100% { r: 22; opacity: 0.4; }
          50% { r: 28; opacity: 0.1; }
        }

        .bodymap-selected {
          width: 100%;
          padding: 12px;
          background: rgba(255, 71, 87, 0.06);
          border: 1px solid rgba(255, 71, 87, 0.2);
          border-radius: var(--radius-md);
        }

        .selected-zones-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--color-text-secondary);
        }

        .clear-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          border-radius: var(--radius-full);
          border: 1px solid rgba(255,255,255,0.15);
          background: transparent;
          color: var(--color-text-muted);
          font-size: 0.72rem;
          cursor: pointer;
          transition: all 0.15s;
        }

        .clear-btn:hover {
          background: rgba(255,255,255,0.08);
          color: var(--color-text-secondary);
        }

        .zone-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .zone-tag {
          padding: 3px 10px;
          border-radius: var(--radius-full);
          border: 1px solid;
          font-size: 0.73rem;
          font-weight: 600;
        }

        .severity-section {
          width: 100%;
        }

        .severity-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          margin-bottom: 8px;
          color: var(--color-text-secondary);
        }

        .severity-emoji {
          font-size: 1.2rem;
        }

        .severity-slider {
          width: 100%;
          height: 6px;
          border-radius: 3px;
          cursor: pointer;
          margin-bottom: 4px;
        }

        .severity-labels {
          display: flex;
          justify-content: space-between;
          font-size: 0.7rem;
          color: var(--color-text-muted);
        }

        .bodymap-confirm-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 14px 24px;
          border-radius: var(--radius-full);
          border: none;
          background: linear-gradient(135deg, #ff5e57, #ff8c42);
          color: white;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          letter-spacing: 0.01em;
        }

        .bodymap-confirm-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          transform: none !important;
        }

        .bodymap-confirm-btn:not(:disabled):hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(255, 94, 87, 0.4);
        }

        .bodymap-confirm-btn.confirmed {
          background: linear-gradient(135deg, #00d4aa, #00b894);
          box-shadow: 0 8px 24px rgba(0, 212, 170, 0.3);
        }
      `}</style>
    </div>
  );
}
