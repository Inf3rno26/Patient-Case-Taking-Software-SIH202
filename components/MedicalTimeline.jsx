"use client";

import { useState } from "react";
import { Calendar, AlertCircle, FileText, Pill, Eye, X, Stethoscope, FileCheck, ShieldCheck, Activity } from "lucide-react";

export default function MedicalTimeline({ documents = [] }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [expandedRaw, setExpandedRaw] = useState({});

  if (documents.length === 0) {
    return (
      <div className="timeline-empty" style={{ textAlign: "center", padding: "40px", color: "var(--color-text-muted)" }}>
        <FileText size={48} style={{ marginBottom: 12, opacity: 0.5 }} />
        <p>No documents analyzed yet</p>
      </div>
    );
  }

  // Sort by date, most recent first
  const sortedDocs = [...documents].sort((a, b) => {
    const dateA = a.date ? new Date(a.date) : new Date(0);
    const dateB = b.date ? new Date(b.date) : new Date(0);
    return dateB - dateA;
  });

  const getTypeIcon = (type) => {
    switch (type) {
      case "prescription": return "💊";
      case "lab_report": return "🧪";
      case "discharge_summary": return "🏥";
      case "imaging_report": return "📷";
      default: return "📄";
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case "prescription": return "Doctor's Prescription (Rx)";
      case "lab_report": return "Laboratory Diagnostic Report";
      case "discharge_summary": return "Hospital Discharge Summary";
      case "imaging_report": return "Radiology / Imaging Report";
      default: return "Medical Document";
    }
  };

  return (
    <div className="timeline">
      {sortedDocs.map((doc, index) => {
        const hasAbnormals = doc.labValues?.some((v) => v.isAbnormal);
        const isRx = doc.documentType === "prescription" || (doc.medications && doc.medications.length > 0);

        return (
          <div key={index} className={`timeline-item ${hasAbnormals ? "abnormal" : ""}`}>
            <div className="timeline-dot" />

            <div className="glass-card timeline-card">
              {/* Header with thumbnail preview */}
              <div className="timeline-header">
                {doc.preview ? (
                  <div
                    className="doc-thumb-container"
                    onClick={() => setSelectedImage(doc.preview)}
                    title="Click to view original scanned document"
                  >
                    <img src={doc.preview} alt="Scanned Document" className="doc-thumb-img" />
                    <div className="thumb-zoom-overlay">
                      <Eye size={12} />
                    </div>
                  </div>
                ) : (
                  <span className="timeline-type-icon">{getTypeIcon(doc.documentType)}</span>
                )}

                <div className="timeline-meta">
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <h4>{getTypeLabel(doc.documentType)}</h4>
                    {doc.fileName && (
                      <span className="doc-filename-badge">📎 {doc.fileName}</span>
                    )}
                    {doc.offlineNotice && (
                      <span className="badge badge-warning" style={{ fontSize: "0.68rem" }}>
                        ⚡ {doc.offlineNotice}
                      </span>
                    )}
                  </div>

                  <div className="timeline-submeta">
                    {doc.date && (
                      <span className="timeline-date">
                        <Calendar size={12} /> {doc.date}
                      </span>
                    )}
                    {doc.doctorName && (
                      <span className="timeline-doctor-pill">
                        <Stethoscope size={12} /> Dr. {doc.doctorName}
                      </span>
                    )}
                    {doc.facility && (
                      <span className="timeline-facility-pill">
                        🏢 {doc.facility}
                      </span>
                    )}
                  </div>
                </div>

                {hasAbnormals && (
                  <span className="badge badge-danger abnormal-header-badge">
                    <AlertCircle size={12} /> Abnormal Findings
                  </span>
                )}
              </div>

              {/* Error state if analysis failed */}
              {doc.error && (
                <div className="timeline-section error-section">
                  <AlertCircle size={16} />
                  <strong>Analysis Notice:</strong>
                  <p>{doc.error}</p>
                </div>
              )}

              {/* Diagnoses / Clinical Impression */}
              {doc.diagnoses?.length > 0 && (
                <div className="timeline-section">
                  <strong className="section-label">🎯 Clinical Diagnoses & Indications:</strong>
                  <div className="timeline-tags">
                    {doc.diagnoses.map((d, i) => (
                      <span key={i} className="diagnosis-tag">
                        {typeof d === "string" ? d : d.name}
                        {d.icd_code && <span className="icd-pill">ICD: {d.icd_code}</span>}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Prescribed Medications */}
              {doc.medications?.length > 0 && (
                <div className="timeline-section">
                  <strong className="section-label">💊 Prescribed Medications (Rx):</strong>
                  <div className="meds-cards-grid">
                    {doc.medications.map((m, i) => (
                      <div key={i} className="med-card">
                        <div className="med-card-header">
                          <Pill size={14} className="med-icon" />
                          <span className="med-name">{m.name}</span>
                        </div>
                        <div className="med-details-row">
                          {m.dosage && <span className="med-detail-badge dosage">{m.dosage}</span>}
                          {m.frequency && <span className="med-detail-badge frequency">{m.frequency}</span>}
                          {m.duration && <span className="med-detail-badge duration">{m.duration}</span>}
                        </div>
                        {m.instructions && (
                          <span className="med-instructions">ℹ️ {m.instructions}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Diagnostic Lab Tests */}
              {doc.labValues?.length > 0 && (
                <div className="timeline-section">
                  <strong className="section-label">🧪 Diagnostic Laboratory Investigations:</strong>
                  <div className="lab-values-grid">
                    {doc.labValues.map((v, i) => (
                      <div key={i} className={`lab-value-card ${v.isAbnormal ? "abnormal" : "normal"}`}>
                        <div className="lab-top-row">
                          <span className="lab-name">{v.test}</span>
                          {v.isAbnormal ? (
                            <span className="badge badge-danger lab-flag-badge">
                              {v.flag || "Abnormal"}
                            </span>
                          ) : (
                            <span className="badge badge-success lab-flag-badge">
                              Normal
                            </span>
                          )}
                        </div>
                        <div className="lab-result-row">
                          <span className="lab-result-number">{v.value}</span>
                          {v.unit && <span className="lab-result-unit">{v.unit}</span>}
                        </div>
                        {v.referenceRange && (
                          <span className="lab-ref-range">Reference: {v.referenceRange} {v.unit}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Clinical Findings */}
              {doc.keyFindings?.length > 0 && (
                <div className="timeline-section">
                  <strong className="section-label">📋 Key Clinical Findings:</strong>
                  <ul className="timeline-findings">
                    {doc.keyFindings.map((f, i) => (
                      <li key={i}>{typeof f === "string" ? f : f.text || JSON.stringify(f)}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Follow-up */}
              {doc.followUp && (
                <div className="timeline-section timeline-followup">
                  <strong className="section-label">🩺 Physician Instructions & Follow-up:</strong>
                  <p>{doc.followUp}</p>
                </div>
              )}

              {/* Verbatim Raw Text Toggle */}
              {doc.rawText && (
                <div className="timeline-raw-toggle-wrap">
                  <button
                    type="button"
                    className="btn-toggle-raw"
                    onClick={() => setExpandedRaw((p) => ({ ...p, [index]: !p[index] }))}
                  >
                    {expandedRaw[index] ? "▲ Hide Raw OCR Text" : "▼ View Raw OCR Text"}
                  </button>
                  {expandedRaw[index] && (
                    <pre className="raw-ocr-box animate-fade-in">{doc.rawText}</pre>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Full Size Preview Modal */}
      {selectedImage && (
        <div className="image-preview-modal animate-fade-in" onClick={() => setSelectedImage(null)}>
          <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="image-modal-header">
              <span>Original Scanned Document</span>
              <button className="btn-icon" onClick={() => setSelectedImage(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="image-modal-body">
              <img src={selectedImage} alt="Document Enqueue" />
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .timeline-card {
          padding: 20px;
          border-radius: var(--radius-lg);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .timeline-header {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          margin-bottom: 14px;
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .doc-thumb-container {
          width: 54px;
          height: 54px;
          border-radius: 8px;
          overflow: hidden;
          position: relative;
          cursor: pointer;
          border: 1.5px solid rgba(0, 212, 170, 0.4);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          flex-shrink: 0;
          background: #000;
        }

        .doc-thumb-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.2s ease;
        }

        .doc-thumb-container:hover .doc-thumb-img {
          transform: scale(1.1);
        }

        .thumb-zoom-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          opacity: 0;
          transition: opacity 0.2s;
        }

        .doc-thumb-container:hover .thumb-zoom-overlay {
          opacity: 1;
        }

        .timeline-type-icon {
          font-size: 1.6rem;
        }

        .timeline-meta {
          flex: 1;
          min-width: 0;
        }

        .timeline-meta h4 {
          font-size: 1.05rem;
          margin: 0;
          color: #ffffff;
          font-weight: 700;
        }

        .doc-filename-badge {
          font-size: 0.72rem;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          padding: 2px 8px;
          border-radius: 4px;
          color: var(--color-text-secondary);
        }

        .timeline-submeta {
          display: flex;
          gap: 12px;
          margin-top: 6px;
          flex-wrap: wrap;
          font-size: 0.78rem;
          color: var(--color-text-muted);
        }

        .timeline-date,
        .timeline-doctor-pill,
        .timeline-facility-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .abnormal-header-badge {
          font-size: 0.72rem;
          padding: 4px 10px;
          flex-shrink: 0;
        }

        .error-section {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--color-accent-warm);
          background: rgba(255, 71, 87, 0.08);
          padding: 10px 14px;
          border-radius: 8px;
          border: 1px solid rgba(255, 71, 87, 0.3);
          font-size: 0.85rem;
        }

        .timeline-section {
          margin-top: 14px;
        }

        .section-label {
          font-size: 0.82rem;
          color: var(--color-text-secondary);
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .timeline-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .diagnosis-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 6px;
          background: rgba(0, 212, 170, 0.08);
          border: 1px solid rgba(0, 212, 170, 0.25);
          color: var(--color-accent-primary);
          font-size: 0.84rem;
          font-weight: 600;
        }

        .icd-pill {
          font-size: 0.68rem;
          background: rgba(0, 212, 170, 0.2);
          padding: 1px 5px;
          border-radius: 3px;
        }

        /* Medications Grid */
        .meds-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 10px;
        }

        .med-card {
          background: rgba(15, 23, 62, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 10px 12px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .med-card-header {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .med-icon {
          color: #ff9933;
          flex-shrink: 0;
        }

        .med-name {
          font-size: 0.9rem;
          font-weight: 700;
          color: #ffffff;
        }

        .med-details-row {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }

        .med-detail-badge {
          font-size: 0.72rem;
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 600;
        }

        .med-detail-badge.dosage {
          background: rgba(0, 153, 255, 0.15);
          color: #4db8ff;
          border: 1px solid rgba(0, 153, 255, 0.3);
        }

        .med-detail-badge.frequency {
          background: rgba(0, 212, 170, 0.15);
          color: var(--color-accent-primary);
          border: 1px solid rgba(0, 212, 170, 0.3);
        }

        .med-detail-badge.duration {
          background: rgba(255, 255, 255, 0.06);
          color: var(--color-text-secondary);
        }

        .med-instructions {
          font-size: 0.74rem;
          color: var(--color-text-muted);
        }

        /* Diagnostic Lab Parameters Grid */
        .lab-values-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 10px;
        }

        .lab-value-card {
          padding: 10px 12px;
          background: rgba(15, 23, 62, 0.7);
          border-radius: 8px;
          border: 1px solid var(--color-border);
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .lab-value-card.abnormal {
          border-color: rgba(255, 71, 87, 0.4);
          background: rgba(255, 71, 87, 0.08);
        }

        .lab-top-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 4px;
        }

        .lab-name {
          font-size: 0.76rem;
          color: var(--color-text-secondary);
          font-weight: 600;
          line-height: 1.3;
        }

        .lab-flag-badge {
          font-size: 0.62rem;
          padding: 1px 6px;
          flex-shrink: 0;
        }

        .lab-result-row {
          display: flex;
          align-items: baseline;
          gap: 4px;
          margin-top: 2px;
        }

        .lab-result-number {
          font-size: 1.15rem;
          font-weight: 700;
          color: #ffffff;
        }

        .lab-value-card.abnormal .lab-result-number {
          color: #ff6b81;
        }

        .lab-result-unit {
          font-size: 0.75rem;
          color: var(--color-text-muted);
        }

        .lab-ref-range {
          font-size: 0.68rem;
          color: var(--color-text-muted);
        }

        .timeline-findings {
          list-style: disc;
          padding-left: 20px;
          margin: 0;
          font-size: 0.85rem;
          color: var(--color-text-secondary);
          line-height: 1.5;
        }

        .timeline-followup {
          background: rgba(0, 153, 255, 0.06);
          border: 1px solid rgba(0, 153, 255, 0.2);
          padding: 10px 14px;
          border-radius: 8px;
        }

        .timeline-followup p {
          margin: 0;
          font-size: 0.85rem;
          color: #99d6ff;
        }

        .timeline-raw-toggle-wrap {
          margin-top: 14px;
          padding-top: 10px;
          border-top: 1px dashed rgba(255, 255, 255, 0.1);
        }

        .btn-toggle-raw {
          background: transparent;
          border: none;
          color: var(--color-accent-primary);
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          padding: 0;
        }

        .btn-toggle-raw:hover {
          text-decoration: underline;
        }

        .raw-ocr-box {
          margin-top: 8px;
          padding: 10px;
          background: rgba(0, 0, 0, 0.5);
          border-radius: 6px;
          font-size: 0.74rem;
          color: #d1d7f0;
          white-space: pre-wrap;
          word-break: break-word;
          max-height: 180px;
          overflow-y: auto;
          font-family: monospace;
        }

        /* Full Preview Modal */
        .image-preview-modal {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(8px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .image-modal-content {
          background: #0c1230;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          max-width: 800px;
          width: 100%;
          max-height: 90vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .image-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 18px;
          border-bottom: 1px solid var(--color-border);
          font-weight: 600;
          color: #ffffff;
        }

        .image-modal-body {
          padding: 16px;
          overflow-y: auto;
          display: flex;
          justify-content: center;
          background: #050818;
        }

        .image-modal-body img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
        }
      `}</style>
    </div>
  );
}
