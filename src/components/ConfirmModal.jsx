import React from 'react';

export default function ConfirmModal({
  isOpen,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'CONFIRM',
  cancelText = 'CANCEL',
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{ display: 'flex' }} onClick={onCancel}>
      <div className="modal-content confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-body">
          <h2>{title}</h2>
          <p>{message}</p>
        </div>
        <div className="confirm-actions">
          <button type="button" className="cancel-btn" onClick={onCancel}>
            {cancelText}
          </button>
          <button type="button" className="ok-btn" onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
