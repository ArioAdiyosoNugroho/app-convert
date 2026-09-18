import React from 'react';
import { useApp } from '../context/AppContext';

export default function DesktopTopbar({ onQuickPaste, onToggleBatch }) {
  const {
    activePage,
    viewMode,
    setViewMode,
    setGuideModalOpen,
    totalDownloads,
    t,
  } = useApp();

  const getPageInfo = () => {
    switch (activePage) {
      case 'home':
        return {
          breadcrumb: 'STUDIO / DASHBOARD',
          title: 'Media Converter Engine',
          subtitle: 'High-speed multi-source media analyzer & downloader',
        };
      case 'history':
        return {
          breadcrumb: 'STUDIO / ARCHIVE',
          title: 'Saved Media History',
          subtitle: 'Private on-device archive of downloaded media',
        };
      case 'settings':
        return {
          breadcrumb: 'STUDIO / PREFERENCES',
          title: 'System Preferences & Settings',
          subtitle: 'Customize appearance, engines, servers and security',
        };
      default:
        return {
          breadcrumb: 'STUDIO / CONVERTER',
          title: 'Moonlight Studio',
          subtitle: '',
        };
    }
  };

  const { breadcrumb, title, subtitle } = getPageInfo();

  return (
    <header className="desktop-topbar">
      <div className="desktop-topbar-left">
        <span className="desktop-breadcrumb">{breadcrumb}</span>
        <div className="desktop-title-row">
          <h1 className="desktop-page-title">{title}</h1>
          <span className="desktop-stat-pill">
            <span className="hero-pulse-dot" />
            {totalDownloads.toLocaleString()} Processed
          </span>
        </div>
        {subtitle && <p className="desktop-page-subtitle">{subtitle}</p>}
      </div>

      <div className="desktop-topbar-actions">
        {/* Quick Paste Button */}
        {onQuickPaste && activePage === 'home' && (
          <button
            type="button"
            className="desktop-top-btn secondary"
            onClick={onQuickPaste}
            title="Paste link from clipboard"
          >
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
            </svg>
            <span>Quick Paste</span>
          </button>
        )}

        {/* Batch Queue Toggle */}
        {onToggleBatch && activePage === 'home' && (
          <button
            type="button"
            className="desktop-top-btn secondary"
            onClick={onToggleBatch}
            title="Toggle Batch Multi-Download mode"
          >
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
            <span>Batch Mode</span>
          </button>
        )}

        {/* View Mode Toggle Switcher */}
        <div className="desktop-top-mode-switcher">
          <button
            type="button"
            className={`top-mode-btn ${viewMode === 'desktop' ? 'active' : ''}`}
            onClick={() => setViewMode('desktop')}
            title="Switch to Desktop Mode"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
            <span>Desktop</span>
          </button>
          <button
            type="button"
            className={`top-mode-btn ${viewMode === 'mobile' ? 'active' : ''}`}
            onClick={() => setViewMode('mobile')}
            title="Switch to Mobile Mode"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2">
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
              <line x1="12" y1="18" x2="12.01" y2="18" />
            </svg>
            <span>Mobile</span>
          </button>
        </div>

        {/* Guide Trigger */}
        <button
          type="button"
          className="desktop-top-icon-btn"
          onClick={() => setGuideModalOpen(true)}
          title={t('guide-title', 'User Guide & FAQ')}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </button>
      </div>
    </header>
  );
}
