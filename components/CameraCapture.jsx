"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Camera,
  RotateCcw,
  FlipHorizontal,
  X,
  Zap,
  CheckCircle,
  Trash2,
  AlertCircle,
} from "lucide-react";

/**
 * CameraCapture — Live camera document scanner for MediKiosk
 * Uses getUserMedia to access device camera and capture medical documents.
 *
 * Props:
 *   onCapture(photos) — called with array of {base64, type, name, preview}
 *   onClose() — called when the camera view should be dismissed
 */
export default function CameraCapture({ onCapture, onClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [isReady, setIsReady] = useState(false);
  const [facingMode, setFacingMode] = useState("environment");
  const [photos, setPhotos] = useState([]);
  const [flash, setFlash] = useState(false);
  const [error, setError] = useState(null);
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const startCamera = useCallback(async (facing) => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      setIsReady(false);
      setError(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 1920, min: 1280 },
          height: { ideal: 1080, min: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => setIsReady(true);
      }

      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((d) => d.kind === "videoinput");
      setHasMultipleCameras(videoDevices.length > 1);
    } catch (err) {
      console.error("Camera error:", err);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setError("Camera permission denied. Please allow camera access and try again.");
      } else if (err.name === "NotFoundError") {
        setError("No camera found on this device.");
      } else {
        setError("Could not start camera: " + err.message);
      }
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    startCamera("environment");
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [mounted, startCamera]);

  const flipCamera = useCallback(() => {
    const newFacing = facingMode === "environment" ? "user" : "environment";
    setFacingMode(newFacing);
    startCamera(newFacing);
  }, [facingMode, startCamera]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !isReady) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (facingMode === "user") {
      ctx.scale(-1, 1);
      ctx.drawImage(video, -canvas.width, 0);
    } else {
      ctx.drawImage(video, 0, 0);
    }

    setFlash(true);
    setTimeout(() => setFlash(false), 300);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    const photoCount = photos.length + 1;
    setPhotos((prev) => [
      ...prev,
      {
        base64: dataUrl,
        type: "image/jpeg",
        name: `scan-${Date.now()}-doc${photoCount}.jpg`,
        preview: dataUrl,
      },
    ]);
  }, [isReady, facingMode, photos.length]);

  const removePhoto = (index) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleConfirm = () => {
    if (photos.length > 0) {
      onCapture(photos);
    }
  };

  if (!mounted) return null;

  return (
    <div className="camera-overlay">
      <div className="camera-backdrop" onClick={onClose} />

      <div className="camera-modal">
        {/* Header */}
        <div className="camera-header">
          <h2>
            <Camera size={20} />
            Camera Scanner
          </h2>
          <p>Position your document within the frame, then tap capture</p>
          <button className="btn-icon camera-close-btn" onClick={onClose} id="camera-close-btn">
            <X size={20} />
          </button>
        </div>

        {/* Error state */}
        {error ? (
          <div className="camera-error">
            <AlertCircle size={48} />
            <h3>Camera Unavailable</h3>
            <p>{error}</p>
            <button className="btn-secondary" onClick={() => startCamera(facingMode)}>
              Try Again
            </button>
          </div>
        ) : (
          <div className="camera-body">
            <div className="viewfinder-container">
              {flash && <div className="flash-overlay" />}

              {/* Corner bracket guide */}
              <div className={`viewfinder-frame ${isReady ? "ready" : ""}`}>
                <div className="corner top-left" />
                <div className="corner top-right" />
                <div className="corner bottom-left" />
                <div className="corner bottom-right" />
                {!isReady && (
                  <div className="camera-loading">
                    <div className="loading-spinner" />
                    <p>Starting camera...</p>
                  </div>
                )}
              </div>

              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`camera-video ${facingMode === "user" ? "mirrored" : ""}`}
              />

              {isReady && <div className="scan-line" />}

              {/* Controls */}
              <div className="camera-controls">
                {hasMultipleCameras ? (
                  <button
                    className="cam-ctrl-btn"
                    onClick={flipCamera}
                    title="Flip camera"
                    id="camera-flip-btn"
                  >
                    <FlipHorizontal size={22} />
                  </button>
                ) : (
                  <div className="cam-ctrl-btn placeholder" />
                )}

                <button
                  className={`capture-btn ${!isReady ? "disabled" : ""}`}
                  onClick={capturePhoto}
                  disabled={!isReady}
                  id="camera-capture-btn"
                  aria-label="Capture photo"
                >
                  <div className="capture-ring" />
                  <div className="capture-inner" />
                </button>

                <div className="cam-ctrl-btn photo-count-btn">
                  {photos.length > 0 ? (
                    <span className="photo-count">{photos.length}</span>
                  ) : (
                    <Zap size={22} />
                  )}
                </div>
              </div>
            </div>

            <canvas ref={canvasRef} style={{ display: "none" }} />

            {/* Photo review strip */}
            {photos.length > 0 && (
              <div className="photo-strip animate-fade-in">
                <div className="photo-strip-header">
                  <span>
                    {photos.length} photo{photos.length > 1 ? "s" : ""} captured
                  </span>
                  <button
                    className="btn-secondary"
                    onClick={() => setPhotos([])}
                    style={{ fontSize: "0.75rem", padding: "4px 10px", minHeight: "unset" }}
                  >
                    <RotateCcw size={12} /> Clear all
                  </button>
                </div>

                <div className="photo-thumbnails">
                  {photos.map((photo, idx) => (
                    <div key={idx} className="photo-thumb">
                      <img src={photo.preview} alt={`Doc ${idx + 1}`} />
                      <button
                        className="thumb-remove"
                        onClick={() => removePhoto(idx)}
                        aria-label="Remove"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  className="btn-primary btn-large"
                  onClick={handleConfirm}
                  id="camera-confirm-btn"
                  style={{ width: "100%", marginTop: 10 }}
                >
                  <CheckCircle size={20} />
                  Analyze {photos.length} Photo{photos.length > 1 ? "s" : ""} with AI
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .camera-overlay {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
        }

        .camera-backdrop {
          position: absolute;
          inset: 0;
          background: rgba(3, 5, 15, 0.92);
          backdrop-filter: blur(8px);
        }

        .camera-modal {
          position: relative;
          width: 100%;
          max-width: 700px;
          max-height: 95vh;
          overflow-y: auto;
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border-accent);
          border-radius: var(--radius-xl);
          box-shadow: 0 0 60px rgba(0, 212, 170, 0.15), var(--shadow-lg);
          display: flex;
          flex-direction: column;
        }

        .camera-header {
          padding: 20px 24px 16px;
          border-bottom: 1px solid var(--color-border);
          position: relative;
          flex-shrink: 0;
        }

        .camera-header h2 {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 1.1rem;
          margin-bottom: 4px;
          color: var(--color-accent-primary);
        }

        .camera-header p {
          font-size: 0.82rem;
          color: var(--color-text-muted);
          margin: 0;
        }

        .camera-close-btn {
          position: absolute;
          top: 16px;
          right: 16px;
        }

        .camera-body {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .viewfinder-container {
          position: relative;
          width: 100%;
          border-radius: var(--radius-lg);
          overflow: hidden;
          background: #000;
          aspect-ratio: 4/3;
        }

        .camera-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .camera-video.mirrored {
          transform: scaleX(-1);
        }

        .viewfinder-frame {
          position: absolute;
          inset: 16px;
          z-index: 2;
          pointer-events: none;
        }

        .corner {
          position: absolute;
          width: 28px;
          height: 28px;
          border-color: rgba(0, 212, 170, 0.6);
          border-style: solid;
          transition: border-color 0.3s;
        }

        .viewfinder-frame.ready .corner {
          border-color: var(--color-accent-primary);
        }

        .top-left {
          top: 0;
          left: 0;
          border-width: 3px 0 0 3px;
          border-radius: 4px 0 0 0;
        }

        .top-right {
          top: 0;
          right: 0;
          border-width: 3px 3px 0 0;
          border-radius: 0 4px 0 0;
        }

        .bottom-left {
          bottom: 0;
          left: 0;
          border-width: 0 0 3px 3px;
          border-radius: 0 0 0 4px;
        }

        .bottom-right {
          bottom: 0;
          right: 0;
          border-width: 0 3px 3px 0;
          border-radius: 0 0 4px 0;
        }

        .scan-line {
          position: absolute;
          left: 16px;
          right: 16px;
          height: 2px;
          background: linear-gradient(
            90deg,
            transparent,
            var(--color-accent-primary),
            transparent
          );
          z-index: 3;
          animation: scanMove 2.5s ease-in-out infinite;
          box-shadow: 0 0 10px var(--color-accent-primary);
          pointer-events: none;
        }

        @keyframes scanMove {
          0% {
            top: 12%;
            opacity: 0.5;
          }
          50% {
            opacity: 1;
          }
          100% {
            top: 85%;
            opacity: 0.5;
          }
        }

        .flash-overlay {
          position: absolute;
          inset: 0;
          background: white;
          z-index: 10;
          animation: flashFade 0.3s ease-out forwards;
          pointer-events: none;
        }

        @keyframes flashFade {
          0% {
            opacity: 0.85;
          }
          100% {
            opacity: 0;
          }
        }

        .camera-loading {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          color: var(--color-text-muted);
          z-index: 5;
          background: rgba(0, 0, 0, 0.6);
        }

        .loading-spinner {
          width: 44px;
          height: 44px;
          border: 3px solid rgba(0, 212, 170, 0.2);
          border-top-color: var(--color-accent-primary);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .camera-controls {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 16px 28px 22px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: linear-gradient(transparent, rgba(0, 0, 0, 0.72));
          z-index: 4;
        }

        .cam-ctrl-btn {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.12);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          cursor: pointer;
          transition: background var(--transition-fast), transform var(--transition-fast);
        }

        .cam-ctrl-btn:hover {
          background: rgba(255, 255, 255, 0.22);
          transform: scale(1.06);
        }

        .cam-ctrl-btn.placeholder {
          background: transparent;
          border: none;
          pointer-events: none;
        }

        .photo-count-btn {
          cursor: default;
        }

        .photo-count {
          font-size: 1.2rem;
          font-weight: 800;
          color: var(--color-accent-primary);
          font-family: var(--font-display);
        }

        .capture-btn {
          position: relative;
          width: 76px;
          height: 76px;
          border-radius: 50%;
          background: transparent;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform var(--transition-fast);
        }

        .capture-btn:active:not(.disabled) {
          transform: scale(0.9);
        }

        .capture-btn.disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }

        .capture-ring {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 3px solid white;
        }

        .capture-inner {
          width: 60px;
          height: 60px;
          background: white;
          border-radius: 50%;
          transition: background var(--transition-fast);
        }

        .capture-btn:hover:not(.disabled) .capture-inner {
          background: rgba(255, 255, 255, 0.85);
        }

        .camera-error {
          padding: 48px 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          text-align: center;
          color: var(--color-text-muted);
        }

        .camera-error h3 {
          color: var(--color-text-primary);
          font-size: 1.1rem;
        }

        .camera-error p {
          font-size: 0.88rem;
          max-width: 360px;
          line-height: 1.6;
        }

        .photo-strip {
          background: var(--color-bg-glass);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          padding: 16px;
        }

        .photo-strip-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          font-size: 0.85rem;
          color: var(--color-text-secondary);
          font-weight: 500;
        }

        .photo-thumbnails {
          display: flex;
          gap: 10px;
          overflow-x: auto;
          padding-bottom: 4px;
          scrollbar-width: thin;
        }

        .photo-thumb {
          position: relative;
          flex-shrink: 0;
          width: 80px;
          height: 80px;
          border-radius: 8px;
          overflow: hidden;
          border: 2px solid var(--color-border-accent);
          box-shadow: var(--shadow-glow);
        }

        .photo-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .thumb-remove {
          position: absolute;
          top: 3px;
          right: 3px;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: rgba(255, 71, 87, 0.85);
          border: none;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background var(--transition-fast);
        }

        .thumb-remove:hover {
          background: rgba(255, 71, 87, 1);
        }

        @media (max-width: 600px) {
          .camera-overlay {
            padding: 0;
            align-items: flex-end;
          }

          .camera-modal {
            border-radius: var(--radius-lg) var(--radius-lg) 0 0;
            max-width: 100%;
            max-height: 98vh;
          }
        }
      `}</style>
    </div>
  );
}
