import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

export default function PinModal({ isOpen, onSuccess, onClose, isSettingNew = false }) {
  const { storedPin, setStoredPin, showToast, t } = useApp();
  const [pin, setPin] = useState('');
  const [firstPin, setFirstPin] = useState('');
  const [step, setStep] = useState(1); // For setting new PIN: 1 = enter, 2 = confirm

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setFirstPin('');
      setStep(1);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleKeyPress = (key) => {
    if (pin.length < 4) {
      const nextPin = pin + key;
      setPin(nextPin);

      if (nextPin.length === 4) {
        setTimeout(() => {
          if (isSettingNew) {
            if (step === 1) {
              setFirstPin(nextPin);
              setPin('');
              setStep(2);
            } else {
              if (nextPin === firstPin) {
                setStoredPin(nextPin);
                showToast(t('toast-pin-set', 'PIN successfully set!'), 'success');
                onSuccess?.();
              } else {
                showToast(t('toast-pin-mismatch', 'PINs do not match! Try again.'), 'error');
                setPin('');
                setFirstPin('');
                setStep(1);
              }
            }
          } else {
            // Verify existing PIN
            if (nextPin === storedPin) {
              onSuccess?.();
            } else {
              showToast(t('toast-pin-wrong', 'Incorrect PIN'), 'error');
              setPin('');
            }
          }
        }, 150);
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  const title = isSettingNew
    ? step === 1
      ? t('pin-set-title', 'Create 4-Digit PIN')
      : t('pin-confirm-title', 'Confirm 4-Digit PIN')
    : t('pin-enter-title', 'Enter 4-Digit PIN');

  return (
    <div className="modal-overlay" style={{ display: 'flex' }} onClick={onClose}>
      <div className="modal-content pin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="pin-header">
          <h3>{title}</h3>
        </div>
        <div className="pin-dots-container">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className={`pin-dot ${i < pin.length ? 'filled' : ''}`} />
          ))}
        </div>
        <div className="pin-keypad">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              className="pin-key"
              onClick={() => handleKeyPress(digit)}
            >
              {digit}
            </button>
          ))}
          <button type="button" className="pin-key pin-cancel" onClick={onClose}>
            ✕
          </button>
          <button
            type="button"
            className="pin-key"
            onClick={() => handleKeyPress('0')}
          >
            0
          </button>
          <button type="button" className="pin-key pin-backspace" onClick={handleBackspace}>
            ⌫
          </button>
        </div>
      </div>
    </div>
  );
}
