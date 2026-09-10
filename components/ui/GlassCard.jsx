"use client";

export default function GlassCard({ children, className = "", onClick, hoverable = true, ...props }) {
  return (
    <div
      className={`glass-card ${hoverable ? '' : 'no-hover'} ${className}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(e); } : undefined}
      {...props}
    >
      {children}
      <style jsx>{`
        .no-hover:hover {
          transform: none;
          background: var(--gradient-glass);
          border-color: rgba(255, 255, 255, 0.08);
          box-shadow: none;
        }
        .no-hover:hover::before {
          left: -100%;
        }
      `}</style>
    </div>
  );
}
