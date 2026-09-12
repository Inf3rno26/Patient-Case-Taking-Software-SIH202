"use client";

import { useEffect, useRef, useState } from "react";

/**
 * QRToken — renders a QR code for the patient's session token.
 * Uses the qrcode-generator library loaded from CDN (no npm install needed).
 *
 * Props:
 *   value    — string to encode (patient ID, URL, etc.)
 *   size     — pixel size of the QR canvas (default 160)
 *   label    — optional text label below the QR
 */
export default function QRToken({ value, size = 160, label }) {
  const canvasRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);

  const lastRenderedRef = useRef(null);

  // Load qrcode-generator from CDN once
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.qrcode || window.QRCode) { setReady(true); return; }

    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js";
    script.onload = () => setReady(true);
    script.onerror = () => setError(true);
    document.head.appendChild(script);
  }, []);

  // Draw QR onto canvas once library is ready and value is present
  useEffect(() => {
    if (!ready || !canvasRef.current || !value) return;
    if (lastRenderedRef.current === `${value}_${size}`) return;

    let timeoutId;
    let tmp = null;

    try {
      lastRenderedRef.current = `${value}_${size}`;
      tmp = document.createElement("div");
      tmp.style.display = "none";
      document.body.appendChild(tmp);

      // eslint-disable-next-line no-undef
      new QRCode(tmp, {
        text: String(value),
        width: size,
        height: size,
        colorDark: "#00d4aa",
        colorLight: "transparent",
        correctLevel: QRCode.CorrectLevel.M,
      });

      timeoutId = setTimeout(() => {
        const img = tmp?.querySelector("img");
        const ctx = canvasRef.current?.getContext("2d");
        if (img && ctx) {
          ctx.fillStyle = "rgba(255,255,255,0.04)";
          ctx.fillRect(0, 0, size, size);
          img.onload = () => ctx.drawImage(img, 0, 0, size, size);
          if (img.complete) ctx.drawImage(img, 0, 0, size, size);
        }
        if (tmp && tmp.parentNode) {
          tmp.parentNode.removeChild(tmp);
          tmp = null;
        }
      }, 80);
    } catch (e) {
      console.warn("QR render error:", e);
      setError(true);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (tmp && tmp.parentNode) {
        tmp.parentNode.removeChild(tmp);
      }
    };
  }, [ready, value, size]);

  if (error) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div
        style={{
          padding: 12,
          borderRadius: 12,
          background: "rgba(0, 212, 170, 0.06)",
          border: "1px solid rgba(0, 212, 170, 0.2)",
          display: "inline-block",
        }}
      >
        <canvas
          ref={canvasRef}
          width={size}
          height={size}
          style={{ display: "block", borderRadius: 6 }}
        />
      </div>
      {label && (
        <span
          style={{
            fontSize: "0.72rem",
            color: "var(--color-text-muted)",
            fontFamily: "monospace",
            letterSpacing: "0.04em",
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
}
