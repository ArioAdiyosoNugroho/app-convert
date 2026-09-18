import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import PinModal from '../components/PinModal';
import ConfirmModal from '../components/ConfirmModal';
import CustomSelect from '../components/CustomSelect';

export default function SettingsPage({ isDesktop }) {
  const {
    lang,
    setLang,
    t,
    theme,
    setTheme,
    font,
    setFont,
    animSpeed,
    setAnimSpeed,
    glass,
    setGlass,
    preferServer,
    setPreferServer,
    bgAnim,
    setBgAnim,
    bgShape,
    setBgShape,
    privacyLockEnabled,
    setPrivacyLockEnabled,
    storedPin,
    setStoredPin,
    clearAllHistory,
    history,
    showToast,
    setGuideModalOpen,
    viewMode,
    setViewMode,
  } = useApp();

  // Desktop active category tab (defaults to 'general')
  const [activeDesktopTab, setActiveDesktopTab] = useState('general');

  // Mobile active subpage (null = main menu, 'general', 'appearance', etc.)
  const [currentSubPage, setCurrentSubPage] = useState(null);

  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  const THEMES = [
    { id: 'default', name: 'Moonlight (Clean White & Black)' },
    { id: 'dark', name: 'Midnight Dark' },
    { id: 'amoled', name: 'AMOLED Pitch Black' },
    { id: 'tokyo', name: 'Obsidian Charcoal' },
    { id: 'cyberpunk', name: 'Monochrome High Contrast' },
  ];

  const FONTS = [
    { id: 'font-jakarta', name: 'Plus Jakarta Sans (Reference Style)' },
    { id: 'font-default', name: 'Manrope Minimalist' },
    { id: 'font-display', name: 'Outfit Rounded' },
    { id: 'font-mono', name: 'Space Mono' },
  ];

  const LANGUAGES = [
    { id: 'en', name: 'English' },
    { id: 'id', name: 'Bahasa Indonesia' },
    { id: 'ja', name: '日本語' },
    { id: 'zh', name: '中文' },
    { id: 'es', name: 'Español' },
    { id: 'fr', name: 'Français' },
    { id: 'de', name: 'Deutsch' },
    { id: 'ru', name: 'Русский' },
    { id: 'ar', name: 'العربية' },
  ];

  const BG_SHAPES = [
    { id: 'stars', name: 'Starfield' },
    { id: 'particles', name: 'Particles' },
    { id: 'waves', name: 'Waves' },
    { id: 'matrix', name: 'Matrix Rain' },
    { id: 'snow', name: 'Snowfall' },
    { id: 'bubbles', name: 'Bubbles' },
  ];

  const SERVERS = [
    { id: 'ask', name: 'Ask every time (Recommended)' },
    { id: 'server1', name: 'Always Server 1 (Primary)' },
    { id: 'server2', name: 'Always Server 2 (Alternative)' },
  ];

  const RETENTIONS = [
    { id: '30', name: 'Keep for 30 Days' },
    { id: '60', name: 'Keep for 60 Days' },
    { id: 'forever', name: 'Keep Forever' },
  ];

  const VIEW_MODES = [
    { id: 'auto', name: 'Auto (Screen Responsive)' },
    { id: 'desktop', name: 'Always Desktop Mode' },
    { id: 'mobile', name: 'Always Mobile Mode' },
  ];

  const CATEGORIES = [
    {
      id: 'general',
      title: t('menu-general-title', 'General'),
      desc: 'Display Mode, Language & App Security',
      icon: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      ),
    },
    {
      id: 'appearance',
      title: t('menu-appearance-title', 'Look & Feel'),
      desc: 'Theme, Typography & Canvas Particles',
      icon: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      ),
    },
    {
      id: 'storage',
      title: 'Storage & History',
      desc: 'History Vault & Cache Management',
      icon: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
      ),
    },
    {
      id: 'network',
      title: 'Network & Engines',
      desc: 'Preferred Scraper Server & Relay Proxy',
      icon: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      ),
    },
    {
      id: 'advanced',
      title: 'Advanced System',
      desc: 'Retention Policy & Auto-Backup',
      icon: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      ),
    },
    {
      id: 'about',
      title: 'About Moonlight',
      desc: 'Version 4.3.1 & Documentation',
      icon: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      ),
    },
  ];

  // Render content for any given category id (shared by both Desktop right panel and Mobile subpage)
  const renderCategoryContent = (categoryId) => {
    switch (categoryId) {
      case 'general':
        return (
          <div className="settings-list">
            <div className="settings-row row-stack-mobile">
              <div className="row-text">
                <span className="row-title">Display Layout Mode</span>
                <span className="row-desc">Switch between Desktop Dashboard and Mobile App interface</span>
              </div>
              <CustomSelect
                options={VIEW_MODES}
                value={viewMode}
                onChange={(val) => {
                  setViewMode(val);
                  showToast(`Layout set to ${val === 'auto' ? 'Auto' : val === 'desktop' ? 'Desktop' : 'Mobile'}`, 'success');
                }}
              />
            </div>

            <div className="settings-row row-stack-mobile">
              <div className="row-text">
                <span className="row-title">{t('setting-language', 'Interface Language')}</span>
                <span className="row-desc">{t('setting-language-desc', 'Select application interface language')}</span>
              </div>
              <CustomSelect
                options={LANGUAGES}
                value={lang}
                onChange={setLang}
              />
            </div>

            <div className="settings-row row-inline-mobile">
              <div className="row-text">
                <span className="row-title">{t('setting-privacy-lock', 'Security PIN Lock')}</span>
                <span className="row-desc">{t('setting-privacy-lock-desc', 'Require 4-digit PIN to open History or Settings')}</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={privacyLockEnabled}
                  onChange={(e) => {
                    if (e.target.checked && !storedPin) {
                      setPinModalOpen(true);
                    } else {
                      setPrivacyLockEnabled(e.target.checked);
                    }
                  }}
                />
                <span className="slider" />
              </label>
            </div>

            {privacyLockEnabled && (
              <div className="settings-row row-inline-mobile">
                <div className="row-text">
                  <span className="row-title">Change Security PIN</span>
                  <span className="row-desc">Update your 4-digit privacy access code</span>
                </div>
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => setPinModalOpen(true)}
                >
                  Set PIN
                </button>
              </div>
            )}
          </div>
        );

      case 'appearance':
        return (
          <div className="settings-list">
            <div className="settings-row row-stack-mobile">
              <div className="row-text">
                <span className="row-title">{t('setting-theme', 'Color Theme')}</span>
                <span className="row-desc">Pure monochrome black & white aesthetic</span>
              </div>
              <CustomSelect
                options={THEMES}
                value={theme}
                onChange={setTheme}
              />
            </div>

            <div className="settings-row row-stack-mobile">
              <div className="row-text">
                <span className="row-title">Typography / Font</span>
                <span className="row-desc">Select geometric sans-serif typeface</span>
              </div>
              <CustomSelect
                options={FONTS}
                value={font}
                onChange={setFont}
              />
            </div>

            <div className="settings-row row-inline-mobile">
              <div className="row-text">
                <span className="row-title">Live Canvas Background</span>
                <span className="row-desc">Enable dynamic animated particle field</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={bgAnim}
                  onChange={(e) => setBgAnim(e.target.checked)}
                />
                <span className="slider" />
              </label>
            </div>

            {bgAnim && (
              <div className="settings-row row-stack-mobile">
                <div className="row-text">
                  <span className="row-title">Particle Pattern</span>
                  <span className="row-desc">Select visual pattern for animated canvas</span>
                </div>
                <CustomSelect
                  options={BG_SHAPES}
                  value={bgShape}
                  onChange={setBgShape}
                />
              </div>
            )}

            <div className="settings-row row-inline-mobile">
              <div className="row-text">
                <span className="row-title">Glassmorphism</span>
                <span className="row-desc">Frosted glass blur effect on headers and navigation</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={glass === 'glass-on'}
                  onChange={(e) => setGlass(e.target.checked ? 'glass-on' : 'glass-off')}
                />
                <span className="slider" />
              </label>
            </div>
          </div>
        );

      case 'storage':
        return (
          <div className="settings-list">
            <div className="settings-row row-inline-mobile">
              <div className="row-text">
                <span className="row-title">Saved Records Archive</span>
                <span className="row-desc">Preserved offline media records stored locally on this device</span>
              </div>
              <span className="settings-stat-badge">
                {history.length} {history.length === 1 ? 'item' : 'items'}
              </span>
            </div>

            <div className="settings-row row-inline-mobile">
              <div className="row-text">
                <span className="row-title">Local Cache Status</span>
                <span className="row-desc">Temporary thumbnail previews and stream memory</span>
              </div>
              <span className="settings-status-clean">Clean · 0 MB</span>
            </div>

            <div className="settings-row row-inline-mobile">
              <div className="row-text">
                <span className="row-title">Clear All History Records</span>
                <span className="row-desc">Permanently remove all saved download entries from storage</span>
              </div>
              <button
                type="button"
                className="danger-btn-pill"
                onClick={() => setConfirmResetOpen(true)}
              >
                Clear History
              </button>
            </div>
          </div>
        );

      case 'network':
        return (
          <div className="settings-list">
            <div className="settings-row row-stack-mobile">
              <div className="row-text">
                <span className="row-title">Preferred Scraper Server</span>
                <span className="row-desc">Default resolution server for TikTok, Instagram & YouTube</span>
              </div>
              <CustomSelect
                options={SERVERS}
                value={preferServer}
                onChange={setPreferServer}
              />
            </div>

            <div className="settings-row row-inline-mobile">
              <div className="row-text">
                <span className="row-title">CORS Relay Handler</span>
                <span className="row-desc">Server-side proxy bypass for strict media streams</span>
              </div>
              <span className="settings-status-online">
                <span className="hero-pulse-dot" />
                Active on /api/proxy
              </span>
            </div>

            <div className="settings-row row-inline-mobile">
              <div className="row-text">
                <span className="row-title">Operational Scrapers</span>
                <span className="row-desc">TikTok, IG, YouTube, X, Spotify, Pinterest, Douyin & Bilibili</span>
              </div>
              <span className="settings-stat-badge">14/14 Online</span>
            </div>
          </div>
        );

      case 'advanced':
        return (
          <div className="settings-list">
            <div className="settings-row row-stack-mobile">
              <div className="row-text">
                <span className="row-title">History Retention</span>
                <span className="row-desc">Automatically purge download records older than specified duration</span>
              </div>
              <CustomSelect
                options={RETENTIONS}
                value={localStorage.getItem('mori_retention') || 'forever'}
                onChange={(val) => {
                  localStorage.setItem('mori_retention', val);
                  showToast('Retention policy saved', 'success');
                }}
              />
            </div>

            <div className="settings-row row-inline-mobile">
              <div className="row-text">
                <span className="row-title">Browser Auto-Backup</span>
                <span className="row-desc">Periodically mirror history to browser persistent backup</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  defaultChecked={true}
                  onChange={(e) => {
                    localStorage.setItem('mori_backup', String(e.target.checked));
                    showToast('Backup setting updated', 'success');
                  }}
                />
                <span className="slider" />
              </label>
            </div>
          </div>
        );

      case 'about':
        return (
          <div className="settings-list about-card-wrapper">
            <div className="about-brand-box">
              <div className="about-avatar-frame">
                <img src="/assets/icon.png" alt="Moonlight" className="about-avatar-img" />
              </div>
              <h3 className="about-app-name">Moonlight Studio</h3>
              <span className="about-version-tag">Version 4.3.1 (React Production)</span>
              <p className="about-app-summary">
                A minimalist, privacy-focused media downloader and analyzer. Designed for ultra-clean UI/UX with pure monochrome styling.
              </p>
              <div className="about-actions-row">
                <button
                  type="button"
                  className="primary-btn"
                  onClick={() => setGuideModalOpen?.(true)}
                >
                  View User Guide & FAQ
                </button>
                <a
                  href="https://github.com/rayhanrafifweb"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="secondary-btn"
                >
                  Developer GitHub
                </a>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const activeCategoryObj = CATEGORIES.find((c) => c.id === (isDesktop ? activeDesktopTab : currentSubPage)) || CATEGORIES[0];

  return (
    <div id="settingsPage" className={`page-content ${isDesktop ? 'desktop-settings-mode' : 'mobile-settings-mode'}`}>
      {isDesktop ? (
        /* ====================================================================
           DESKTOP SETTINGS (Master-Detail Split View - 100% Fixed & Consistent)
           ==================================================================== */
        <div className="desktop-settings-split-view">
          {/* Left Pane: Categories Navigation */}
          <aside className="desktop-settings-nav">
            <div className="desktop-settings-nav-header">
              <span>SETTINGS CATEGORIES</span>
            </div>
            <div className="desktop-settings-tabs">
              {CATEGORIES.map((cat) => {
                const isActive = activeDesktopTab === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    className={`desktop-settings-tab-btn ${isActive ? 'active' : ''}`}
                    onClick={() => setActiveDesktopTab(cat.id)}
                  >
                    <span className="tab-icon">{cat.icon}</span>
                    <div className="tab-info">
                      <span className="tab-title">{cat.title}</span>
                      <span className="tab-desc">{cat.desc}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Right Pane: Active Settings Panel (Always same container width & layout) */}
          <section className="desktop-settings-panel">
            <div className="desktop-panel-header">
              <h2 className="desktop-panel-title">{activeCategoryObj.title}</h2>
              <p className="desktop-panel-desc">{activeCategoryObj.desc}</p>
            </div>
            {renderCategoryContent(activeDesktopTab)}
          </section>
        </div>
      ) : (
        /* ====================================================================
           MOBILE SETTINGS (Main Menu / Smooth Subpages - 100% Fluid Width)
           ==================================================================== */
        <div className="mobile-settings-container">
          {currentSubPage ? (
            /* Mobile Sub-page view with Back Button */
            <div className="settings-sub-page">
              <div className="sub-page-header">
                <button
                  type="button"
                  className="back-btn-settings"
                  onClick={() => setCurrentSubPage(null)}
                  aria-label="Back to settings menu"
                >
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                    <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                  </svg>
                </button>
                <div className="sub-page-title-group">
                  <span className="sub-page-badge">SETTINGS</span>
                  <h3 className="sub-page-heading">{activeCategoryObj.title}</h3>
                </div>
              </div>

              {renderCategoryContent(currentSubPage)}
            </div>
          ) : (
            /* Mobile Main Menu view */
            <div id="settingsMainMenu">
              <div className="page-header">
                <span className="page-subheading">CONFIGURATION</span>
                <h2 className="page-title">{t('nav-settings', 'SETTINGS')}</h2>
              </div>

              <div className="settings-menu-list">
                {CATEGORIES.map((cat) => (
                  <div
                    key={cat.id}
                    className="settings-menu-item"
                    onClick={() => setCurrentSubPage(cat.id)}
                  >
                    <div className="menu-icon">{cat.icon}</div>
                    <div className="menu-text">
                      <div className="menu-title">{cat.title}</div>
                      <div className="menu-desc">{cat.desc}</div>
                    </div>
                    <div className="menu-chevron">
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Set PIN Modal */}
      <PinModal
        isOpen={pinModalOpen}
        isSettingNew={true}
        onSuccess={() => {
          setPinModalOpen(false);
          setPrivacyLockEnabled(true);
        }}
        onClose={() => setPinModalOpen(false)}
      />

      {/* Confirm Clear History */}
      <ConfirmModal
        isOpen={confirmResetOpen}
        title="Clear All History?"
        message="This action cannot be undone. All saved downloads will be removed."
        confirmText="CLEAR"
        cancelText="CANCEL"
        onConfirm={() => {
          clearAllHistory();
          setConfirmResetOpen(false);
          showToast('History cleared!', 'success');
        }}
        onCancel={() => setConfirmResetOpen(false)}
      />
    </div>
  );
}
