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
    showToast,
    setGuideModalOpen,
    viewMode,
    setViewMode,
  } = useApp();

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

  // Render Sub-Pages
  const renderSubPage = () => {
    switch (currentSubPage) {
      case 'general':
        return (
          <div className="settings-sub-page">
            <div className="sub-page-header">
              <button
                type="button"
                className="back-btn-settings"
                onClick={() => setCurrentSubPage(null)}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                </svg>
              </button>
              <h3>{t('menu-general-title', 'General')}</h3>
            </div>

            <div className="settings-list">
              <div className="settings-row">
                <div className="row-text">
                  <span className="row-title">Display Layout Mode</span>
                  <span className="row-desc">Choose between Desktop Dashboard or Mobile App interface</span>
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

              <div className="settings-row">
                <div className="row-text">
                  <span className="row-title">{t('setting-language', 'Language')}</span>
                  <span className="row-desc">{t('setting-language-desc', 'Select application interface language')}</span>
                </div>
                <CustomSelect
                  options={LANGUAGES}
                  value={lang}
                  onChange={setLang}
                />
              </div>

              <div className="settings-row">
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
                  <span className="slider"></span>
                </label>
              </div>

              {privacyLockEnabled && (
                <div className="settings-row">
                  <div className="row-text">
                    <span className="row-title">Change PIN</span>
                    <span className="row-desc">Set a new 4-digit security PIN</span>
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
          </div>
        );

      case 'appearance':
        return (
          <div className="settings-sub-page">
            <div className="sub-page-header">
              <button
                type="button"
                className="back-btn-settings"
                onClick={() => setCurrentSubPage(null)}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                </svg>
              </button>
              <h3>{t('menu-appearance-title', 'Look & feel')}</h3>
            </div>

            <div className="settings-list">
              <div className="settings-row">
                <div className="row-text">
                  <span className="row-title">{t('setting-theme', 'Color Theme')}</span>
                  <span className="row-desc">Choose your preferred visual aesthetic</span>
                </div>
                <CustomSelect
                  options={THEMES}
                  value={theme}
                  onChange={setTheme}
                />
              </div>

              <div className="settings-row">
                <div className="row-text">
                  <span className="row-title">Typography / Font</span>
                  <span className="row-desc">Select custom typeface</span>
                </div>
                <CustomSelect
                  options={FONTS}
                  value={font}
                  onChange={setFont}
                />
              </div>

              <div className="settings-row">
                <div className="row-text">
                  <span className="row-title">Live Canvas Background</span>
                  <span className="row-desc">Enable dynamic animated particle background</span>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={bgAnim}
                    onChange={(e) => setBgAnim(e.target.checked)}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              {bgAnim && (
                <div className="settings-row">
                  <div className="row-text">
                    <span className="row-title">Animation Style</span>
                    <span className="row-desc">Choose background particle pattern</span>
                  </div>
                  <CustomSelect
                    options={BG_SHAPES}
                    value={bgShape}
                    onChange={setBgShape}
                  />
                </div>
              )}

              <div className="settings-row">
                <div className="row-text">
                  <span className="row-title">Glassmorphism</span>
                  <span className="row-desc">Frosted glass blur effect on cards</span>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={glass === 'glass-on'}
                    onChange={(e) => setGlass(e.target.checked ? 'glass-on' : 'glass-off')}
                  />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
          </div>
        );

      case 'network':
        return (
          <div className="settings-sub-page">
            <div className="sub-page-header">
              <button
                type="button"
                className="back-btn-settings"
                onClick={() => setCurrentSubPage(null)}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                </svg>
              </button>
              <h3>Network & Extraction</h3>
            </div>

            <div className="settings-list">
              <div className="settings-row">
                <div className="row-text">
                  <span className="row-title">Preferred Server</span>
                  <span className="row-desc">Default scraper server for TikTok, Instagram & YouTube</span>
                </div>
                <CustomSelect
                  options={SERVERS}
                  value={preferServer}
                  onChange={setPreferServer}
                />
              </div>

              <div className="settings-row">
                <div className="row-text">
                  <span className="row-title">CORS Relay Proxy</span>
                  <span className="row-desc">Status: Active on /api/proxy</span>
                </div>
                <span style={{ fontSize: '0.85rem', color: '#52c41a', fontWeight: 'bold' }}>
                  Connected
                </span>
              </div>
            </div>
          </div>
        );

      case 'storage':
        return (
          <div className="settings-sub-page">
            <div className="sub-page-header">
              <button
                type="button"
                className="back-btn-settings"
                onClick={() => setCurrentSubPage(null)}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                </svg>
              </button>
              <h3>Storage & History</h3>
            </div>

            <div className="settings-list">
              <div className="settings-row">
                <div className="row-text">
                  <span className="row-title">Clear All History</span>
                  <span className="row-desc">Remove all saved download entries from storage</span>
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
          </div>
        );

      case 'about':
        return (
          <div className="settings-sub-page">
            <div className="sub-page-header">
              <button
                type="button"
                className="back-btn-settings"
                onClick={() => setCurrentSubPage(null)}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                </svg>
              </button>
              <h3>About Moonlight</h3>
            </div>

            <div className="settings-list">
              <div style={{ textAlign: 'center', padding: '24px 16px' }}>
                <div className="brand-mark" style={{ margin: '0 auto 12px auto' }}>
                  <svg viewBox="0 0 24 24" width="48" height="48">
                    <circle cx="12" cy="12" r="10" fill="var(--primary)" />
                    <circle cx="16.5" cy="8.5" r="8" fill="var(--bg-color)" />
                  </svg>
                </div>
                <h3 style={{ margin: '0 0 4px 0' }}>Moonlight (React Edition)</h3>
                <p style={{ margin: '0 0 16px 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Version 4.3.1
                </p>
                <p style={{ fontSize: '0.9rem', lineHeight: '1.5', maxWidth: '400px', margin: '0 auto 20px auto' }}>
                  A minimalist, private media downloader for TikTok, Instagram, YouTube, Twitter, Spotify, Pinterest, and 14+ platforms.
                </p>
                <a
                  href="https://github.com/rayhanrafifweb"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="primary-btn"
                  style={{ display: 'inline-block', textDecoration: 'none', padding: '8px 20px', borderRadius: '12px' }}
                >
                  Developer GitHub
                </a>
                <div style={{ marginTop: '16px' }}>
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={() => setGuideModalOpen?.(true)}
                    style={{ padding: '8px 18px', borderRadius: '12px', fontWeight: 600 }}
                  >
                    View User Guide
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'advanced':
        return (
          <div className="settings-sub-page">
            <div className="sub-page-header">
              <button
                type="button"
                className="back-btn-settings"
                onClick={() => setCurrentSubPage(null)}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </button>
              <h3>Advanced</h3>
            </div>

            <div className="settings-list">
              <div className="settings-row">
                <div className="row-text">
                  <span className="row-title">History Retention</span>
                  <span className="row-desc">Automatically manage old download records</span>
                </div>
                <CustomSelect
                  options={RETENTIONS}
                  value={localStorage.getItem('mori_retention') || 'forever'}
                  onChange={(val) => {
                    localStorage.setItem('mori_retention', val);
                    showToast('Setting saved', 'success');
                  }}
                />
              </div>

              <div className="settings-row">
                <div className="row-text">
                  <span className="row-title">Auto-Backup</span>
                  <span className="row-desc">Sync download history to browser backup storage</span>
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
                  <span className="slider"></span>
                </label>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div id="settingsPage" className={`page-content ${isDesktop ? 'desktop-settings-mode' : ''}`}>
      {currentSubPage ? (
        renderSubPage()
      ) : (
        <div id="settingsMainMenu">
          <div className="page-header">
            <span className="page-subheading">CONFIGURATION</span>
            <h2 className="page-title">{t('nav-settings', 'SETTINGS')}</h2>
          </div>

          <div className="settings-menu-list">
            <div
              className="settings-menu-item"
              onClick={() => setCurrentSubPage('general')}
            >
              <div className="menu-icon">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </div>
              <div className="menu-text">
                <div className="menu-title">{t('menu-general-title', 'GENERAL')}</div>
                <div className="menu-desc">Language, Automation &amp; App Security</div>
              </div>
            </div>

            <div
              className="settings-menu-item"
              onClick={() => setCurrentSubPage('appearance')}
            >
              <div className="menu-icon">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              </div>
              <div className="menu-text">
                <div className="menu-title">{t('menu-appearance-title', 'LOOK & FEEL')}</div>
                <div className="menu-desc">Theme, Color Accent &amp; Haptics</div>
              </div>
            </div>

            <div
              className="settings-menu-item"
              onClick={() => setCurrentSubPage('storage')}
            >
              <div className="menu-icon">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <div className="menu-text">
                <div className="menu-title">STORAGE &amp; DOWNLOAD</div>
                <div className="menu-desc">Save Paths, Filename &amp; Cache Cleaning</div>
              </div>
            </div>

            <div
              className="settings-menu-item"
              onClick={() => setCurrentSubPage('network')}
            >
              <div className="menu-icon">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              </div>
              <div className="menu-text">
                <div className="menu-title">NETWORK &amp; PERFORMANCE</div>
                <div className="menu-desc">Preferred Server, User-Agent &amp; Data Saver</div>
              </div>
            </div>

            <div
              className="settings-menu-item"
              onClick={() => setCurrentSubPage('advanced')}
            >
              <div className="menu-icon">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <div className="menu-text">
                <div className="menu-title">ADVANCED</div>
                <div className="menu-desc">History Retention, Auto-Backup &amp; Player</div>
              </div>
            </div>

            <div
              className="settings-menu-item"
              onClick={() => setCurrentSubPage('about')}
            >
              <div className="menu-icon">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
              </div>
              <div className="menu-text">
                <div className="menu-title">ABOUT &amp; HELP</div>
                <div className="menu-desc">Version, Help, Developer links</div>
              </div>
            </div>
          </div>
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
