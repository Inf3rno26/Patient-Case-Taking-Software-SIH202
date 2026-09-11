"use client";

import { PatientProvider } from "@/context/PatientContext";
import { ToneProvider } from "@/context/ToneContext";
import AccessibilityBar from "@/components/AccessibilityBar";

export default function Providers({ children }) {
  return (
    <ToneProvider>
      <PatientProvider>
        {children}
        <AccessibilityBar />
      </PatientProvider>
    </ToneProvider>
  );
}

