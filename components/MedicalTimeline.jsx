"use client";

import { Calendar, AlertCircle, FileText, Pill } from "lucide-react";

export default function MedicalTimeline({ documents = [] }) {
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
      case "prescription": return "Prescription";
      case "lab_report": return "Lab Report";
      case "discharge_summary": return "Discharge Summary";
      case "imaging_report": return "Imaging Report";
      default: return "Document";
    }
  };

  return (
    <div className="timeline">
      {sortedDocs.map((doc, index) => {
        const hasAbnormals = doc.labValues?.some((v) => v.isAbnormal);

        return (
          <div key={index} className={`timeline-item ${hasAbnormals ? "abnormal" : ""}`}>
            <div className="timeline-dot" />

            <div className="glass-card" style={{ padding: "16px" }}>
              <div className="timeline-header">
                <span className="timeline-type-icon">{getTypeIcon(doc.documentType)}</span>
                <div className="timeline-meta">
                  <h4>{getTypeLabel(doc.documentType)}</h4>
                  {doc.date && (
                    <span className="timeline-date">
                      <Calendar size={12} /> {doc.date}
                    </span>
                  )}
                </div>
                {hasAbnormals && (
                  <span className="badge badge-danger">
                    <AlertCircle size={10} /> Abnormal
                  </span>
                )}
              </div>

              {doc.error && (
                <div className="timeline-section" style={{ color: "var(--color-accent-warm)", backgroundColor: "rgba(255, 71, 87, 0.05)", padding: "10px", borderRadius: "8px", border: "1px solid rgba(255, 71, 87, 0.3)" }}>
                  <AlertCircle size={16} style={{ display: "inline-block", marginRight: "6px", verticalAlign: "middle" }} />
                  <strong style={{ display: "inline-block", verticalAlign: "middle", color: "var(--color-accent-warm)" }}>Error:</strong>
                  <p style={{ marginTop: "4px", fontSize: "0.85rem" }}>{doc.error}</p>
                </div>
              )}

              {doc.doctorName && (
                <p className="timeline-doctor">Dr. {doc.doctorName} {doc.facility ? `• ${doc.facility}` : ""}</p>
              )}

              {doc.diagnoses?.length > 0 && (
                <div className="timeline-section">
                  <strong>Diagnoses:</strong>
                  <div className="timeline-tags">
                    {doc.diagnoses.map((d, i) => (
                      <span key={i} className="badge">{typeof d === "string" ? d : d.name}</span>
                    ))}
                  </div>
                </div>
              )}

              {doc.medications?.length > 0 && (
                <div className="timeline-section">
                  <strong>Medications:</strong>
                  <ul className="timeline-meds">
                    {doc.medications.map((m, i) => (
                      <li key={i}>
                        <Pill size={12} /> {m.name} {m.dosage} {m.frequency}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {doc.labValues?.length > 0 && (
                <div className="timeline-section">
                  <strong>Diagnostic Lab Parameters:</strong>
                  <div className="lab-values-grid">
                    {doc.labValues.map((v, i) => (
                      <div key={i} className={`lab-value ${v.isAbnormal ? "abnormal" : ""}`}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 4 }}>
                          <span className="lab-name">{v.test}</span>
                          {v.isAbnormal && (
                            <span className="badge badge-danger" style={{ fontSize: "0.62rem", padding: "1px 5px", flexShrink: 0 }}>
                              Abnormal
                            </span>
                          )}
                        </div>
                        <span className="lab-result">{v.value} {v.unit}</span>
                        {v.referenceRange && <span className="lab-ref">Ref: {v.referenceRange}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {doc.keyFindings?.length > 0 && (
                <div className="timeline-section">
                  <strong>Key Clinical Findings:</strong>
                  <ul className="timeline-findings">
                    {doc.keyFindings.map((f, i) => (
                      <li key={i}>{typeof f === "string" ? f : f.text || JSON.stringify(f)}</li>
                    ))}
                  </ul>
                </div>
              )}

              {doc.followUp && (
                <div className="timeline-section timeline-followup">
                  <strong>Recommended Follow-up / Guidance:</strong>
                  <p>{doc.followUp}</p>
                </div>
              )}
            </div>
          </div>
        );
      })}

      <style jsx>{`
        .timeline-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
        }

        .timeline-type-icon {
          font-size: 1.5rem;
        }

        .timeline-meta {
          flex: 1;
        }

        .timeline-meta h4 {
          font-size: 0.95rem;
          margin: 0;
        }

        .timeline-date {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.75rem;
          color: var(--color-text-muted);
        }

        .timeline-doctor {
          font-size: 0.8rem;
          color: var(--color-text-secondary);
          margin-bottom: 10px;
        }

        .timeline-section {
          margin-top: 10px;
        }

        .timeline-section strong {
          font-size: 0.8rem;
          color: var(--color-text-secondary);
          display: block;
          margin-bottom: 6px;
        }

        .timeline-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .timeline-meds {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .timeline-meds li {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.82rem;
          color: var(--color-text-secondary);
          padding: 3px 0;
        }

        .lab-values-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 8px;
        }

        .lab-value {
          padding: 8px 10px;
          background: var(--color-bg-glass);
          border-radius: 8px;
          border: 1px solid var(--color-border);
        }

        .lab-value.abnormal {
          border-color: rgba(255, 71, 87, 0.3);
          background: rgba(255, 71, 87, 0.05);
        }

        .lab-name {
          display: block;
          font-size: 0.72rem;
          color: var(--color-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .lab-result {
          display: block;
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--color-text-primary);
          margin-top: 2px;
        }

        .lab-value.abnormal .lab-result {
          color: var(--color-accent-warm);
        }

        .lab-ref {
          display: block;
          font-size: 0.68rem;
          color: var(--color-text-muted);
          margin-top: 2px;
        }
      `}</style>
    </div>
  );
}
