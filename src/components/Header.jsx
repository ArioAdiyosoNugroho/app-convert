import React from 'react';
import { useApp } from '../context/AppContext';

export default function Header() {
  const { setGuideModalOpen, t } = useApp();

  return (
    <header className="app-header">
      <div className="header-brand-group">
        <div className="brand-avatar-box">
          <img src="/assets/icon.png" alt="Grabbl" className="brand-avatar-img" />
        </div>
        <div className="brand-text-group">
          <h1 className="brand-title">GRABBL</h1>
        </div>
      </div>

      <button
        type="button"
        className="header-action-btn"
        title={t('guide-title', 'User Guide & FAQ')}
        onClick={() => setGuideModalOpen(true)}
      >
        <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </button>
    </header>
  );
}
