"use client";

import { createContext, useContext, useState, useEffect } from "react";

const ToneContext = createContext();

export const TONES = {
  NAVY: {
    id: "slate",
    name: "Deep Slate Navy",
    primaryColor: "#1E293B",
    accentColor: "#38bdf8",
    description: "Clinical slate navy aesthetic",
  },
  TEAL: {
    id: "teal",
    name: "Soft Medical Teal",
    primaryColor: "#0D9488",
    accentColor: "#00D4AA",
    description: "Calming hospital medical teal aesthetic",
  },
};

export function ToneProvider({ children }) {
  const [tone, setToneState] = useState("slate");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("medikiosk_color_tone");
    const initialTone = saved === "teal" ? "teal" : "slate";
    setToneState(initialTone);
    applyTone(initialTone);
  }, []);

  const applyTone = (targetTone) => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-tone", targetTone);
    }
  };

  const setTone = (targetTone) => {
    const valid = targetTone === "slate" ? "slate" : "teal";
    setToneState(valid);
    localStorage.setItem("medikiosk_color_tone", valid);
    applyTone(valid);
  };

  const toggleTone = () => {
    const next = tone === "teal" ? "slate" : "teal";
    setTone(next);
  };

  return (
    <ToneContext.Provider value={{ tone, setTone, toggleTone, TONES, mounted }}>
      {children}
    </ToneContext.Provider>
  );
}

export function useTone() {
  const context = useContext(ToneContext);
  if (!context) {
    return {
      tone: "teal",
      setTone: () => {},
      toggleTone: () => {},
      TONES,
      mounted: false,
    };
  }
  return context;
}
