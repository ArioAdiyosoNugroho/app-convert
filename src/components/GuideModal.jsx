import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function GuideModal({ isOpen, onClose }) {
  const { setActivePage } = useApp();
  const [dontShowAgain, setDontShowAgain] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    if (dontShowAgain) {
      try {
        localStorage.setItem('mori_guide_dismissed', 'true');
      } catch {}
    }
    onClose();
  };

  const handleOpenSettings = () => {
    if (dontShowAgain) {
      try {
        localStorage.setItem('mori_guide_dismissed', 'true');
      } catch {}
    }
    onClose();
    setActivePage('settings');
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content guide-modal" onClick={(e) => e.stopPropagation()}>
        <div className="guide-header">
          <h2>User guide</h2>
        </div>

        <div className="guide-body">
          <div className="guide-item">
            <div className="guide-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
              </svg>
            </div>
            <p className="guide-text">
              Copy any media link from TikTok, Instagram, YouTube, Twitter/X, Douyin &amp; 14+ platforms.
            </p>
          </div>

          <div className="guide-item">
            <div className="guide-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </div>
            <p className="guide-text">
              Tap &quot;Paste&quot; (or the Batch button beside it) to analyze the link and select your preferred quality.
            </p>
          </div>

          <div className="guide-item">
            <div className="guide-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <p className="guide-text">
              Tap &quot;Download&quot; to save files directly to device storage with live progress tracking.
            </p>
          </div>

          <div className="guide-item">
            <div className="guide-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <p className="guide-text">
              Access saved media in History for offline playback or secure with Biometric Lock.
            </p>
          </div>
        </div>

        <div className="guide-footer">
          <label className="guide-checkbox">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
            />
            <span className="checkmark" />
            <span>Don't show up again</span>
          </label>

          <div className="guide-actions">
            <button type="button" className="guide-close-btn" onClick={handleClose}>
              CLOSE
            </button>
            <button type="button" className="guide-settings-btn" onClick={handleOpenSettings}>
              Open settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
