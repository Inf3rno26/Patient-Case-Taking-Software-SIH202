"use client";

import { PatientProvider } from "@/context/PatientContext";

export default function Providers({ children }) {
  return <PatientProvider>{children}</PatientProvider>;
}
