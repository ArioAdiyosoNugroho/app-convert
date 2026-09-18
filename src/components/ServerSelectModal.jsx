import React from 'react';
import { useApp } from '../context/AppContext';

export default function ServerSelectModal({ isOpen, options, onSelect, onClose }) {
  const { t } = useApp();

  if (!isOpen || !options) return null;

  return (
    <div className="modal-overlay" style={{ display: 'flex' }} onClick={onClose}>
      <div className="modal-content confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-body">
          <h2>{options.title || t('label-choose-server', 'Choose Server')}</h2>
          <p style={{ whiteSpace: 'pre-line' }}>{options.message}</p>
        </div>
        <div className="confirm-actions">
          <button
            type="button"
            className="cancel-btn"
            onClick={() => onSelect(options.server2Id || 'server2')}
          >
            {options.server2Label || 'SERVER 2'}
          </button>
          <button
            type="button"
            className="ok-btn neutral-btn"
            onClick={() => onSelect(options.server1Id || 'server1')}
          >
            {options.server1Label || 'SERVER 1'}
          </button>
        </div>
      </div>
    </div>
  );
}
