"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, FileSearch, Camera, Upload } from "lucide-react";
import Navbar from "@/components/ui/Navbar";
import GlassCard from "@/components/ui/GlassCard";
import LoadingPulse from "@/components/ui/LoadingPulse";
import DocumentUpload from "@/components/DocumentUpload";
import MedicalTimeline from "@/components/MedicalTimeline";
import CameraCapture from "@/components/CameraCapture";
import { usePatient } from "@/context/PatientContext";
import DrugInteractionCard from "@/components/DrugInteractionCard";
import { checkDrugInteractions } from "@/lib/drug-interactions";

function ScanContent() {
  const router = useRouter();
  const { addDocument, session } = usePatient();
  const [documents, setDocuments] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (session?.documents && session.documents.length > 0) {
      setDocuments(session.documents);
    }
  }, [session]);

  const handleUpload = async (files) => {
    setIsAnalyzing(true);
    // Close camera if open
    setShowCamera(false);

    for (const file of files) {
      try {
        const response = await fetch("/api/ocr", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            image: file.base64,
            mimeType: file.type,
            fileName: file.name,
          }),
        });

        if (!response.ok) throw new Error("OCR failed");

        const data = await response.json();
        const docResult = { ...data, preview: file.preview, fileName: file.name };
        setDocuments((prev) => [...prev, docResult]);
        addDocument(docResult);
      } catch (error) {
        console.error("Document analysis error:", error);
        setDocuments((prev) => [
          ...prev,
          {
            documentType: "other",
            fileName: file.name,
            error: error.message || "Analysis failed. Please try a smaller image.",
            preview: file.preview,
          },
        ]);
      }
    }

    setIsAnalyzing(false);
  };

  // Handle photos from camera capture
  const handleCameraCapture = (photos) => {
    setShowCamera(false);
    handleUpload(photos);
  };

  // Aggregate medications from scanned documents and patient drug history
  const allMeds = [];
  documents.forEach((doc) => {
    if (doc.medications && Array.isArray(doc.medications)) {
      doc.medications.forEach((m) => allMeds.push(m));
    }
  });
  if (session?.extractedHistory?.drugHistory?.current) {
    session.extractedHistory.drugHistory.current.forEach((m) => allMeds.push(m));
  }
  const interactions = checkDrugInteractions(allMeds);

  if (!mounted) return null;

  return (
    <>
      <Navbar />
      <div className="page-wrapper">
        <div className="container container-narrow" style={{ padding: "24px 16px" }}>
          <div className="section-header animate-fade-in">
            <h1>
              <span className="text-gradient">Document</span> Scanner
            </h1>
            <p>Upload prescriptions, lab reports, or discharge summaries — or use your camera</p>
          </div>

          {/* Mode toggle hint */}
          <div className="scan-mode-hint animate-fade-in-up delay-1">
            <div className="mode-hint-item">
              <Upload size={16} />
              <span>Upload images / PDF</span>
            </div>
            <div className="mode-hint-divider">or</div>
            <div className="mode-hint-item">
              <Camera size={16} />
              <span>Tap "Take Photo" to scan live</span>
            </div>
          </div>

          {/* Upload Zone */}
          <div className="animate-fade-in-up delay-2">
            <DocumentUpload
              onUpload={handleUpload}
              disabled={isAnalyzing}
              onCameraCapture={() => setShowCamera(true)}
            />
          </div>

          {/* Analysis Progress */}
          {isAnalyzing && (
            <GlassCard hoverable={false} style={{ marginTop: 24 }}>
              <LoadingPulse text="🔍 Analyzing documents with AI... Extracting diagnoses, medications, and lab values" size="large" />
            </GlassCard>
          )}

          {/* Drug Interaction Guard Card */}
          {allMeds.length > 0 && (
            <div className="animate-fade-in-up" style={{ marginTop: 24 }}>
              <DrugInteractionCard interactions={interactions} scannedMeds={allMeds} />
            </div>
          )}

          {/* Results Timeline */}
          {documents.length > 0 && (
            <div className="results-section animate-fade-in-up" style={{ marginTop: 32 }}>
              <h2 style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
                <FileSearch size={24} />
                Extracted Medical Data
              </h2>
              <MedicalTimeline documents={documents} />
            </div>
          )}

          {/* Continue Button */}
          <div className="continue-bar" style={{ marginTop: 32, display: "flex", gap: 12, justifyContent: "center" }}>
            <button
              className="btn-secondary btn-touch"
              onClick={() => router.push("/interview")}
              id="scan-back-interview-btn"
            >
              ← Back to Interview
            </button>
            <button
              className="btn-primary btn-touch"
              onClick={() => router.push("/summary")}
              id="scan-to-summary-btn"
            >
              <ArrowRight size={20} />
              Generate Summary
            </button>
          </div>
        </div>
      </div>

      {/* Camera capture modal */}
      {showCamera && (
        <CameraCapture
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
        />
      )}

      <style jsx>{`
        .scan-mode-hint {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          padding: 10px 20px;
          background: var(--color-bg-glass);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-full);
          margin-bottom: 20px;
          font-size: 0.82rem;
          color: var(--color-text-muted);
          flex-wrap: wrap;
        }

        .mode-hint-item {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--color-text-secondary);
        }

        .mode-hint-divider {
          font-size: 0.75rem;
          color: var(--color-text-muted);
          padding: 0 4px;
        }
      `}</style>
    </>
  );
}

export default function ScanPage() {
  return <ScanContent />;
}
