"use client";

import { useState } from "react";
import { Check, Circle } from "lucide-react";

export default function TouchOptions({
  options = [],
  onSelect,
  multiSelect = false,
  disabled = false,
}) {
  const [selected, setSelected] = useState(multiSelect ? [] : null);

  const handleSelect = (option, index) => {
    if (disabled) return;

    if (multiSelect) {
      setSelected((prev) => {
        const isSelected = prev.includes(index);
        const newSelection = isSelected
          ? prev.filter((i) => i !== index)
          : [...prev, index];
        return newSelection;
      });
    } else {
      setSelected(index);
      onSelect(option);
    }
  };

  const handleSubmitMulti = () => {
    if (multiSelect && selected.length > 0) {
      const selectedOptions = selected.map((i) => options[i]);
      onSelect(selectedOptions);
      setSelected([]);
    }
  };

  return (
    <div className="touch-options-wrapper">
      <div className="touch-options-grid">
        {options.map((option, index) => {
          const isSelected = multiSelect
            ? selected.includes(index)
            : selected === index;
          const text = typeof option === "string" ? option : option.text;
          const icon = typeof option === "object" ? option.icon : null;

          return (
            <button
              key={index}
              className={`touch-option ${isSelected ? "selected" : ""}`}
              onClick={() => handleSelect(option, index)}
              disabled={disabled}
              id={`touch-option-${index}`}
              aria-pressed={isSelected}
            >
              <span className="option-icon">
                {isSelected ? (
                  <Check size={20} color="var(--color-accent-primary)" />
                ) : icon ? (
                  typeof icon === "string" ? <span>{icon}</span> : icon
                ) : (
                  <Circle size={18} style={{ opacity: 0.4 }} />
                )}
              </span>
              <span className="option-text">{text}</span>
            </button>
          );
        })}
      </div>

      {multiSelect && selected.length > 0 && (
        <button
          className="btn-primary btn-large"
          onClick={handleSubmitMulti}
          style={{ marginTop: "16px", width: "100%" }}
          id="touch-submit-multi"
        >
          <Check size={20} />
          Confirm Selection ({selected.length})
        </button>
      )}

      <style jsx>{`
        .touch-options-wrapper {
          width: 100%;
        }
        .option-text {
          flex: 1;
          font-size: 1rem;
          line-height: 1.4;
        }
      `}</style>
    </div>
  );
}
