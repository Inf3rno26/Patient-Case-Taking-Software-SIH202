"use client";

export default function GradientButton({
  children,
  variant = "primary",
  size = "default",
  loading = false,
  disabled = false,
  className = "",
  ...props
}) {
  const variantClass = variant === "danger" ? "btn-danger" : variant === "secondary" ? "btn-secondary" : "btn-primary";
  const sizeClass = size === "large" ? "btn-large" : size === "touch" ? "btn-touch btn-large" : "";

  return (
    <button
      className={`${variantClass} ${sizeClass} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="btn-loading">
          <span className="loading-spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
        </span>
      ) : (
        children
      )}
    </button>
  );
}
