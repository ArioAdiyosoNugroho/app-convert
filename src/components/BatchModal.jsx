import React from 'react';
import { useApp } from '../context/AppContext';

export default function BatchModal({
  isOpen,
  items = [],
  onClose,
  onDownloadAll,
  onDownloadItem,
}) {
  const { t } = useApp();

  if (!isOpen) return null;

  const completedCount = items.filter((i) => i.status === 'success').length;

  return (
    <div className="modal-overlay" style={{ display: 'flex' }} onClick={onClose}>
      <div className="modal-content batch-modal" onClick={(e) => e.stopPropagation()}>
        <div className="batch-header">
          <h3>{t('batch-modal-title', 'Batch Download Queue')}</h3>
          <span className="batch-counter">
            {completedCount} / {items.length}
          </span>
        </div>

        <div className="batch-progress-list">
          {items.map((item, idx) => (
            <div key={idx} className="batch-item">
              <div className="batch-item-info">
                <span className="batch-item-title">
                  {item.result?.title || item.url}
                </span>
                <span className={`batch-item-status status-${item.status}`}>
                  {item.status === 'analyzing'
                    ? t('loader-analyzing', 'Analyzing...')
                    : item.status === 'success'
                    ? t('label-success', 'Ready')
                    : item.status === 'error'
                    ? t('label-error', 'Failed')
                    : t('label-pending', 'Pending')}
                </span>
              </div>
              {item.status === 'success' && item.result?.downloads?.[0] && (
                <button
                  type="button"
                  className="download-btn-compact"
                  onClick={() => onDownloadItem?.(item)}
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="batch-modal-actions">
          {completedCount > 0 && (
            <button
              type="button"
              className="primary-btn"
              onClick={onDownloadAll}
            >
              {t('batch-download-all', `DOWNLOAD ALL (${completedCount})`)}
            </button>
          )}
          <button type="button" className="secondary-btn" onClick={onClose}>
            {t('btn-close', 'CLOSE')}
          </button>
        </div>
      </div>
    </div>
  );
}
