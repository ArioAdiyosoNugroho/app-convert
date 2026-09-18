import React from 'react';
import { useApp } from '../context/AppContext';

export default function DesktopSidebar() {
  const {
    activePage,
    setActivePage,
    history,
    viewMode,
    setViewMode,
    setGuideModalOpen,
    t,
  } = useApp();

  const PLATFORMS = [
    { name: 'TikTok', tag: 'HD Video & Audio' },
    { name: 'Instagram', tag: 'Reels, Posts & Stories' },
    { name: 'YouTube', tag: '1080p, 4K & MP3' },
    { name: 'Twitter / X', tag: 'Videos & Media' },
    { name: 'Spotify', tag: '320kbps MP3 Audio' },
    { name: 'Pinterest', tag: 'Original Pins' },
    { name: 'Douyin', tag: 'No Watermark HD' },
    { name: 'Bilibili', tag: 'HD Video Streams' },
  ];

  return (
    <aside className="desktop-sidebar">
      {/* Brand Header */}
      <div className="desktop-sidebar-brand">
        <div className="sidebar-brand-avatar">
          <img src="/assets/icon.png" alt="Grabbl" className="sidebar-brand-img" />
        </div>
        <div className="sidebar-brand-info">
          <h2 className="sidebar-brand-title">GRABBL</h2>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="desktop-sidebar-section">
        <span className="desktop-nav-group-title">MAIN NAVIGATION</span>
        <nav className="desktop-nav-menu">
          <button
            type="button"
            className={`desktop-nav-btn ${activePage === 'home' ? 'active' : ''}`}
            onClick={() => setActivePage('home')}
          >
            <span className="desktop-nav-icon">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1V9.5z" />
              </svg>
            </span>
            <span className="desktop-nav-text">{t('nav-home', 'Dashboard')}</span>
            {activePage === 'home' && <span className="desktop-active-indicator" />}
          </button>

          <button
            type="button"
            className={`desktop-nav-btn ${activePage === 'history' ? 'active' : ''}`}
            onClick={() => setActivePage('history')}
          >
            <span className="desktop-nav-icon">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
            </span>
            <span className="desktop-nav-text">{t('nav-history', 'History Archive')}</span>
            {history.length > 0 && (
              <span className="desktop-nav-badge">{history.length}</span>
            )}
            {activePage === 'history' && <span className="desktop-active-indicator" />}
          </button>

          <button
            type="button"
            className={`desktop-nav-btn ${activePage === 'settings' ? 'active' : ''}`}
            onClick={() => setActivePage('settings')}
          >
            <span className="desktop-nav-icon">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </span>
            <span className="desktop-nav-text">{t('nav-settings', 'Settings & System')}</span>
            {activePage === 'settings' && <span className="desktop-active-indicator" />}
          </button>
        </nav>
      </div>

      {/* Supported Platforms Directory in Sidebar */}
      <div className="desktop-sidebar-section platforms-section">
        <div className="desktop-section-header">
          <span className="desktop-nav-group-title">SUPPORTED ENGINES</span>
          <span className="engine-status-pill">14 Active</span>
        </div>
        <div className="desktop-platform-list">
          {PLATFORMS.map((p) => (
            <div key={p.name} className="desktop-platform-item" title={`${p.name}: ${p.tag}`}>
              <span className="platform-status-mini-dot" />
              <span className="platform-name-label">{p.name}</span>
              <span className="platform-badge-tag">{p.tag.split(' ')[0]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Mode Switcher & Footer */}
      <div className="desktop-sidebar-footer">
        {/* Layout Mode Switcher */}
        <div className="desktop-mode-switcher-box">
          <span className="desktop-mode-title">LAYOUT VIEW MODE</span>
          <div className="desktop-mode-pills">
            <button
              type="button"
              className={`mode-pill-btn ${viewMode === 'desktop' ? 'active' : ''}`}
              onClick={() => setViewMode('desktop')}
              title="Force Desktop Mode"
            >
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
              <span>Desktop</span>
            </button>
            <button
              type="button"
              className={`mode-pill-btn ${viewMode === 'mobile' ? 'active' : ''}`}
              onClick={() => setViewMode('mobile')}
              title="Preview Mobile Mode"
            >
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2">
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                <line x1="12" y1="18" x2="12.01" y2="18" />
              </svg>
              <span>Mobile</span>
            </button>
            <button
              type="button"
              className={`mode-pill-btn ${viewMode === 'auto' ? 'active' : ''}`}
              onClick={() => setViewMode('auto')}
              title="Auto switch based on screen width"
            >
              <span>Auto</span>
            </button>
          </div>
        </div>

        {/* User Guide Action */}
        <button
          type="button"
          className="desktop-guide-action-btn"
          onClick={() => setGuideModalOpen(true)}
        >
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <span>Shortcuts & Documentation</span>
        </button>
      </div>
    </aside>
  );
}
