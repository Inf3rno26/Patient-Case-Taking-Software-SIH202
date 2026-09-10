"use client";

export default function LoadingPulse({ text = "Processing...", size = "default" }) {
  return (
    <div className="loading-container" aria-live="polite" aria-busy="true">
      <div className="loading-pulse">
        <span className="loading-dot" />
        <span className="loading-dot" />
        <span className="loading-dot" />
      </div>
      {text && <p className="loading-text">{text}</p>}

      <style jsx>{`
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 20px;
        }
        .loading-text {
          color: var(--color-text-secondary);
          font-size: ${size === "large" ? "1.1rem" : "0.9rem"};
          animation: pulse 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
