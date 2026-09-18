import React, { useState, useRef, useEffect } from 'react';

export default function CustomSelect({
  options = [],
  value,
  onChange,
  placeholder = 'Select option...',
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Normalize options to object format { id, name }
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === 'object' && opt !== null) {
      return { id: opt.id ?? opt.value, name: opt.name ?? opt.label ?? String(opt.id) };
    }
    return { id: opt, name: String(opt) };
  });

  const selectedOption = normalizedOptions.find((opt) => String(opt.id) === String(value)) || normalizedOptions[0];

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSelect = (optionId) => {
    onChange(optionId);
    setIsOpen(false);
  };

  return (
    <div className={`custom-select-container ${className} ${isOpen ? 'is-open' : ''}`} ref={containerRef}>
      <button
        type="button"
        className="custom-select-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className="custom-select-label">
          {selectedOption ? selectedOption.name : placeholder}
        </span>
        <svg
          className="custom-select-arrow"
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <div className="custom-select-dropdown">
          <div className="custom-select-options">
            {normalizedOptions.map((opt) => {
              const isSelected = String(opt.id) === String(value);
              return (
                <div
                  key={opt.id}
                  className={`custom-select-option ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => handleSelect(opt.id)}
                >
                  <span className="option-text">{opt.name}</span>
                  {isSelected && (
                    <span className="option-check">
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
