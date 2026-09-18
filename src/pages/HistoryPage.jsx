import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import ConfirmModal from '../components/ConfirmModal';

export default function HistoryPage({ isDesktop }) {
  const { history, totalDownloads, deleteHistoryItem, clearAllHistory, setActivePage, t, showToast } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState('all');

  const handleDownloadItem = (item) => {
    const directUrl = item.downloads?.[0]?.url || item.url;
    if (!directUrl) return;

    try {
      const a = document.createElement('a');
      a.href = directUrl;
      a.download = '';
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast(t('toast-download-started', 'Download started!'), 'success');
    } catch {
      window.open(directUrl, '_blank');
    }
  };

  const copyUrl = (urlStr) => {
    if (!urlStr) return;
    navigator.clipboard.writeText(urlStr).then(() => {
      showToast(t('toast-copied', 'Link copied to clipboard!'), 'success');
    }).catch(() => {
      showToast('Failed to copy', 'error');
    });
  };

  // Helper to detect platform from URL
  const getPlatformName = (urlStr) => {
    const u = (urlStr || '').toLowerCase();
    if (u.includes('tiktok.com')) return 'TikTok';
    if (u.includes('instagram.com')) return 'Instagram';
    if (u.includes('youtube.com') || u.includes('youtu.be')) return 'YouTube';
    if (u.includes('twitter.com') || u.includes('x.com')) return 'Twitter/X';
    if (u.includes('spotify.com')) return 'Spotify';
    if (u.includes('pinterest.com') || u.includes('pin.it')) return 'Pinterest';
    if (u.includes('threads.net')) return 'Threads';
    if (u.includes('facebook.com')) return 'Facebook';
    if (u.includes('bilibili.com')) return 'Bilibili';
    if (u.includes('douyin.com')) return 'Douyin';
    return 'Web Media';
  };

  const PLATFORM_FILTERS = [
    { id: 'all', label: 'All Media' },
    { id: 'tiktok', label: 'TikTok' },
    { id: 'instagram', label: 'Instagram' },
    { id: 'youtube', label: 'YouTube' },
    { id: 'twitter', label: 'Twitter/X' },
    { id: 'spotify', label: 'Spotify' },
  ];

  const filteredHistory = history.filter((item) => {
    const titleMatch = (item.title || '').toLowerCase().includes(searchQuery.toLowerCase());
    const urlMatch = (item.url || item.sourceUrl || '').toLowerCase().includes(searchQuery.toLowerCase());
    const plat = getPlatformName(item.url || item.sourceUrl).toLowerCase();
    const platMatch = platformFilter === 'all' || plat.includes(platformFilter.toLowerCase());
    return (titleMatch || urlMatch) && platMatch;
  });

  return (
    <div id="historyPage" className={`page-content ${isDesktop ? 'desktop-history-mode' : ''}`}>
      {/* Mobile Top Header (Hidden on Desktop) */}
      {!isDesktop && (
        <div className="page-header history-header">
          <div className="header-main">
            <span className="page-subheading">SAVED ARCHIVE</span>
            <h2 className="page-title">{t('nav-history', 'HISTORY')}</h2>
          </div>

          {history.length > 0 && (
            <div className="history-actions-wrapper">
              {!isEditing ? (
                <button
                  type="button"
                  id="editHistoryBtn"
                  className="edit-btn"
                  onClick={() => setIsEditing(true)}
                >
                  {t('btn-edit', 'EDIT')}
                </button>
              ) : (
                <div id="historyActions" className="history-actions">
                  <button
                    type="button"
                    id="clearAllBtn"
                    className="clear-all-btn"
                    onClick={() => setConfirmClearOpen(true)}
                  >
                    {t('btn-clear-all', 'CLEAR')}
                  </button>
                  <button
                    type="button"
                    id="doneEditBtn"
                    className="done-btn"
                    onClick={() => setIsEditing(false)}
                  >
                    {t('btn-done', 'DONE')}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Desktop Metric Cards (Shown on Desktop) */}
      {isDesktop ? (
        <div className="desktop-history-metrics-row">
          <div className="desktop-metric-card">
            <div className="metric-card-top">
              <span className="metric-tag-pill">
                <span className="hero-pulse-dot" />
                LIFETIME VOLUME
              </span>
            </div>
            <div className="metric-card-body">
              <span className="metric-large-val">{totalDownloads.toLocaleString()}</span>
              <span className="metric-sublabel">Total Processed Media</span>
            </div>
          </div>

          <div className="desktop-metric-card">
            <div className="metric-card-top">
              <span className="metric-tag-pill">LOCAL VAULT</span>
            </div>
            <div className="metric-card-body">
              <span className="metric-large-val">{history.length}</span>
              <span className="metric-sublabel">Saved Records in Storage</span>
            </div>
          </div>

          <div className="desktop-metric-card">
            <div className="metric-card-top">
              <span className="metric-tag-pill">SECURITY</span>
            </div>
            <div className="metric-card-body">
              <span className="metric-large-val">100%</span>
              <span className="metric-sublabel">Private On-Device Archive</span>
            </div>
          </div>
        </div>
      ) : (
        /* Signature Black Stats Card for Mobile */
        <div className="history-stats-card">
          <div className="hero-card-glow" />

          <div className="stats-top-row">
            <span className="stats-pill-badge">
              <span className="hero-pulse-dot" />
              LIFETIME ARCHIVE
            </span>

            <span className="stats-time-tag">
              {history.length} {history.length === 1 ? 'record' : 'records'}
            </span>
          </div>

          <div className="stats-content-row">
            <div className="stats-main-col">
              <span className="stats-subtext">{t('dl-stats-total', 'TOTAL DOWNLOADS PROCESSED')}</span>
              <div className="stats-value-box">
                <span className="stats-val" id="historyDlStatsVal">
                  {totalDownloads.toLocaleString()}
                </span>
                <span className="stats-unit">Items</span>
              </div>
              <p className="stats-footnote">Clean, private local archive stored on your device</p>
            </div>

            <div className="stats-circle-box">
              <svg viewBox="0 0 54 54" width="54" height="54">
                <circle cx="27" cy="27" r="22" className="meter-bg" strokeWidth="5" fill="none" />
                <circle
                  cx="27"
                  cy="27"
                  r="22"
                  className="meter-fill"
                  strokeWidth="5"
                  strokeDasharray="138"
                  strokeDashoffset={history.length > 0 ? "25" : "138"}
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
              <span className="stats-circle-text">{history.length}</span>
            </div>
          </div>

          <div className="hero-card-bottom-actions">
            <button
              type="button"
              className="hero-action-pill primary"
              onClick={() => setActivePage('home')}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>Convert More</span>
            </button>

            {history.length > 0 && (
              <button
                type="button"
                className="hero-action-pill secondary"
                onClick={() => setConfirmClearOpen(true)}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                <span>Clear History</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Desktop Search & Filter Toolbar */}
      {isDesktop && history.length > 0 && (
        <div className="desktop-history-toolbar">
          <div className="desktop-history-search">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search archive by title or platform..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="search-clear-mini-btn"
                onClick={() => setSearchQuery('')}
              >
                ✕
              </button>
            )}
          </div>

          <div className="desktop-filter-pills">
            {PLATFORM_FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                className={`filter-pill-btn ${platformFilter === f.id ? 'active' : ''}`}
                onClick={() => setPlatformFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="desktop-history-toolbar-actions">
            <button
              type="button"
              className={`toolbar-btn ${isEditing ? 'active' : ''}`}
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 'Done Editing' : 'Manage / Delete'}
            </button>
            <button
              type="button"
              className="toolbar-btn danger"
              onClick={() => setConfirmClearOpen(true)}
            >
              Clear All
            </button>
          </div>
        </div>
      )}

      {/* History List or Empty State */}
      {history.length === 0 ? (
        <div className="empty-state-card">
          <div className="empty-state-icon-box">
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <polyline points="12 7 12 12 15 15" />
            </svg>
          </div>
          <h3 className="empty-card-title">{t('empty-history-title', 'No history yet')}</h3>
          <p className="empty-card-desc">
            {t('empty-history-desc', 'Media you analyze and download will appear here automatically for fast offline re-access.')}
          </p>
          <button
            type="button"
            className="empty-cta-btn"
            onClick={() => setActivePage('home')}
          >
            <span>Start Converting Media</span>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="empty-state-card search-empty">
          <h3 className="empty-card-title">No matching downloads found</h3>
          <p className="empty-card-desc">Try searching for a different keyword or reset your platform filter.</p>
          <button
            type="button"
            className="empty-cta-btn"
            onClick={() => {
              setSearchQuery('');
              setPlatformFilter('all');
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className={`history-list ${isDesktop ? 'desktop-grid' : ''}`}>
          {filteredHistory.map((item, idx) => {
            const platformName = getPlatformName(item.url || item.sourceUrl);
            const formatBadge = item.downloads?.[0]?.isAudio ? 'MP3' : 'MP4';

            return (
              <div key={item.id} className="history-item">
                <span className="history-item-number">{String(idx + 1).padStart(2, '0')}</span>

                <div className="history-thumb-container">
                  {item.thumbnail ? (
                    <img
                      src={item.thumbnail}
                      alt=""
                      className="history-thumb-img"
                    />
                  ) : (
                    <div className="history-thumb-placeholder">
                      <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
                      </svg>
                    </div>
                  )}
                  <span className="thumb-format-pill">{formatBadge}</span>
                </div>

                <div className="history-item-details">
                  <h4 className="history-item-title" title={item.title}>
                    {item.title || 'Untitled Media'}
                  </h4>

                  <div className="history-item-tags">
                    <span className="history-platform-badge">{platformName}</span>
                    <span className="history-item-date">
                      {item.date ? new Date(item.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Recently saved'}
                    </span>
                  </div>
                </div>

                <div className="history-item-actions">
                  {isEditing ? (
                    <button
                      type="button"
                      className="delete-history-btn"
                      title="Delete item"
                      onClick={() => deleteHistoryItem(item.id)}
                      aria-label="Delete item"
                    >
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="download-history-btn"
                        title="Re-download"
                        onClick={() => handleDownloadItem(item)}
                        aria-label="Re-download"
                      >
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                      </button>

                      <button
                        type="button"
                        className="copy-history-btn"
                        title="Copy original link"
                        onClick={() => copyUrl(item.url || item.sourceUrl)}
                        aria-label="Copy link"
                      >
                        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Clear All Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmClearOpen}
        title={t('dialog-clear-history-title', 'Clear All History?')}
        message={t('dialog-clear-history-desc', 'This action will permanently delete all your download history records.')}
        confirmText={t('btn-clear-all', 'CLEAR ALL')}
        cancelText={t('btn-cancel', 'CANCEL')}
        onConfirm={() => {
          clearAllHistory();
          setConfirmClearOpen(false);
          setIsEditing(false);
          showToast(t('toast-history-cleared', 'History cleared!'), 'success');
        }}
        onCancel={() => setConfirmClearOpen(false)}
      />
    </div>
  );
}
