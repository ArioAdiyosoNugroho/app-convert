import React from 'react';
import { useApp } from '../context/AppContext';

export default function Toast() {
  const { toast } = useApp();

  if (!toast.visible) return null;

  return (
    <div className={`custom-toast toast-${toast.type || 'info'}`} style={{ display: 'flex' }}>
      <div className="toast-content">
        <span className="toast-message">{toast.message}</span>
      </div>
    </div>
  );
}
