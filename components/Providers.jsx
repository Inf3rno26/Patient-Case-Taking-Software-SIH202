"use client";

import { PatientProvider } from "@/context/PatientContext";
import AccessibilityBar from "@/components/AccessibilityBar";

export default function Providers({ children }) {
  return (
    <PatientProvider>
      {children}
      <AccessibilityBar />
    </PatientProvider>
  );
}
