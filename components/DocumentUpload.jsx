"use client";

import { useState, useRef } from "react";
import { Upload, Camera, FileText, X, Check } from "lucide-react";

export default function DocumentUpload({ onUpload, disabled = false, onCameraCapture }) {
  const [files, setFiles] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleFiles = async (fileList) => {
    const newFiles = Array.from(fileList).filter((f) =>
      f.type.startsWith("image/") || f.type === "application/pdf"
    );

    for (const file of newFiles) {
      setUploading(true);
      try {
        const base64 = await fileToBase64(file);
        const fileData = {
          name: file.name,
          type: file.type,
          size: file.size,
          base64,
          preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
          status: "ready",
        };
        setFiles((prev) => [...prev, fileData]);
      } catch (e) {
        console.error("Error processing file:", e);
      }
      setUploading(false);
    }
  };

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAnalyze = async () => {
    if (files.length === 0) return;
    onUpload(files);
  };

  return (
    <div className="document-upload">
      {/* Drop zone */}
      <div
        className={`upload-zone ${dragOver ? "dragover" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => fileInputRef.current?.click()}
        id="document-upload-zone"
      >
        <Upload size={48} style={{ color: "var(--color-accent-primary)", marginBottom: 12 }} />
        <h3>Upload Medical Documents</h3>
        <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>
          Drag & drop prescriptions, lab reports, or discharge summaries
        </p>
        <p style={{ color: "var(--color-text-muted)", fontSize: "0.8rem", marginTop: 8 }}>
          Supports: Images (JPG, PNG) and PDF files
        </p>

        <div className="upload-buttons">
          <button
            className="btn-secondary"
            onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
            id="upload-browse-btn"
          >
            <FileText size={18} />
            Browse Files
          </button>
          {onCameraCapture ? (
            <button
              className="btn-camera"
              onClick={(e) => { e.stopPropagation(); onCameraCapture(); }}
              id="upload-camera-btn"
            >
              <Camera size={18} />
              📷 Take Photo
            </button>
          ) : (
            <button
              className="btn-secondary"
              onClick={(e) => { e.stopPropagation(); cameraInputRef.current?.click(); }}
              id="upload-camera-fallback-btn"
            >
              <Camera size={18} />
              Take Photo
            </button>
          )}
        </div>
      </div>

      {/* Standard file picker */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf"
        multiple
        onChange={(e) => handleFiles(e.target.files)}
        style={{ display: "none" }}
        id="document-file-input"
      />

      {/* Mobile camera capture fallback (when no onCameraCapture prop) */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => handleFiles(e.target.files)}
        style={{ display: "none" }}
        id="document-camera-input"
      />

      {/* File previews */}
      {files.length > 0 && (
        <div className="file-list">
          {files.map((file, index) => (
            <div key={index} className="file-item glass-card">
              {file.preview ? (
                <img src={file.preview} alt={file.name} className="file-preview" />
              ) : (
                <div className="file-preview file-placeholder">
                  <FileText size={32} />
                </div>
              )}
              <div className="file-info">
                <p className="file-name">{file.name}</p>
                <p className="file-size">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
              <button className="btn-icon" onClick={() => removeFile(index)} aria-label="Remove file">
                <X size={18} />
              </button>
            </div>
          ))}

          <button
            className="btn-primary btn-large"
            onClick={handleAnalyze}
            disabled={disabled || uploading}
            id="document-analyze-btn"
            style={{ width: "100%", marginTop: 8 }}
          >
            <Check size={20} />
            Analyze {files.length} Document{files.length > 1 ? "s" : ""} with AI
          </button>
        </div>
      )}

      <style jsx>{`
        .document-upload {
          width: 100%;
        }

        .upload-buttons {
          display: flex;
          gap: 12px;
          margin-top: 20px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .btn-camera {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: var(--radius-md);
          font-size: 0.9rem;
          font-weight: 600;
          background: linear-gradient(135deg, rgba(0,212,170,0.15), rgba(0,153,255,0.15));
          border: 1px solid var(--color-border-accent);
          color: var(--color-accent-primary);
          cursor: pointer;
          transition: all var(--transition-base);
        }

        .btn-camera:hover {
          background: linear-gradient(135deg, rgba(0,212,170,0.25), rgba(0,153,255,0.25));
          border-color: var(--color-accent-primary);
          transform: translateY(-1px);
          box-shadow: var(--shadow-glow);
        }

        .file-list {
          margin-top: 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .file-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px !important;
        }

        .file-preview {
          width: 60px;
          height: 60px;
          border-radius: 8px;
          object-fit: cover;
          flex-shrink: 0;
        }

        .file-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-bg-glass);
          color: var(--color-text-muted);
        }

        .file-info {
          flex: 1;
          min-width: 0;
        }

        .file-name {
          font-size: 0.9rem;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .file-size {
          font-size: 0.75rem;
          color: var(--color-text-muted);
          margin-top: 2px;
        }
      `}</style>
    </div>
  );
}
