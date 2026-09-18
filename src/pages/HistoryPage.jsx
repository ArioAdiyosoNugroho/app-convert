import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import ConfirmModal from '../components/ConfirmModal';

export default function HistoryPage() {
  const { history, totalDownloads, deleteHistoryItem, clearAllHistory, t, showToast } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

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

  return (
    <div id="historyPage" className="page-content">
      {/* Header */}
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

      {/* Signature Black Stats Card (Matching Reference image.png) */}
      <div className="history-stats-card">
        <div className="stats-top-row">
          <span className="stats-pill-badge">
            <span className="hero-pulse-dot" />
            LIFETIME ENGINE
          </span>
          <span className="stats-time-tag">Active</span>
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
          </div>

          <div className="stats-circle-box">
            <svg viewBox="0 0 48 48" width="48" height="48">
              <circle cx="24" cy="24" r="20" className="meter-bg" strokeWidth="4" fill="none" />
              <circle
                cx="24"
                cy="24"
                r="20"
                className="meter-fill"
                strokeWidth="4"
                strokeDasharray="125"
                strokeDashoffset="30"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
            <span className="stats-circle-text">{history.length}</span>
          </div>
        </div>
      </div>

      {/* History List or Empty State */}
      {history.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <polyline points="12 7 12 12 15 15" />
            </svg>
          </div>
          <p className="empty-title">{t('empty-history-title', 'No history yet')}</p>
          <span className="empty-desc">{t('empty-history-desc', 'Your downloads will show up here.')}</span>
        </div>
      ) : (
        <div className="history-list">
          {history.map((item, idx) => (
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
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
                    </svg>
                  </div>
                )}
              </div>

              <div className="history-item-details">
                <h4 className="history-item-title">
                  {item.title || 'Untitled Media'}
                </h4>
                <p className="history-item-date">
                  {item.date ? new Date(item.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Recently saved'}
                </p>
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
                )}
              </div>
            </div>
          ))}
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
