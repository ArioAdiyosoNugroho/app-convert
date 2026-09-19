import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translations } from '../i18n/index.js';

const AppContext = createContext();

export function AppProvider({ children }) {
  // Language
  const [lang, setLangState] = useState(() => localStorage.getItem('mori_lang') || 'en');

  const setLang = useCallback((newLang) => {
    setLangState(newLang);
    localStorage.setItem('mori_lang', newLang);
  }, []);

  const t = useCallback((key, fallback) => {
    const dict = translations[lang] || translations.en;
    return dict?.[key] || fallback || key;
  }, [lang]);

  // Theme
  const [theme, setThemeState] = useState(() => localStorage.getItem('mori_theme') || 'default');
  const setTheme = useCallback((newTheme) => {
    setThemeState(newTheme);
    localStorage.setItem('mori_theme', newTheme);
    if (newTheme === 'default') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', newTheme);
    }
  }, []);

  // Appearance Options: Font, Speed, Glass
  const [font, setFontState] = useState(() => localStorage.getItem('mori_font') || 'font-default');
  const setFont = useCallback((f) => {
    setFontState(f);
    localStorage.setItem('mori_font', f);
  }, []);

  const [animSpeed, setAnimSpeedState] = useState(() => localStorage.getItem('mori_anim_speed') || 'anim-normal');
  const setAnimSpeed = useCallback((s) => {
    setAnimSpeedState(s);
    localStorage.setItem('mori_anim_speed', s);
  }, []);

  const [glass, setGlassState] = useState(() => localStorage.getItem('mori_glass') || 'glass-on');
  const setGlass = useCallback((g) => {
    setGlassState(g);
    localStorage.setItem('mori_glass', g);
  }, []);

  // Navigation
  const [activePage, setActivePage] = useState('home');

  // View Mode: 'auto', 'desktop', 'mobile'
  const [viewMode, setViewModeState] = useState(() => localStorage.getItem('mori_view_mode') || 'auto');
  const [isDesktopScreen, setIsDesktopScreen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return true;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsDesktopScreen(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const setViewMode = useCallback((mode) => {
    setViewModeState(mode);
    localStorage.setItem('mori_view_mode', mode);
  }, []);

  const effectiveMode = viewMode === 'auto' ? (isDesktopScreen ? 'desktop' : 'mobile') : viewMode;

  // Server Preference: 'ask', 'server1', 'server2'
  const [preferServer, setPreferServerState] = useState(() => localStorage.getItem('mori_prefer_server') || 'ask');
  const setPreferServer = useCallback((val) => {
    setPreferServerState(val);
    localStorage.setItem('mori_prefer_server', val);
  }, []);

  // Background Animation
  const [bgAnim, setBgAnimState] = useState(() => localStorage.getItem('mori_bg_animated') === 'true');
  const setBgAnim = useCallback((val) => {
    setBgAnimState(val);
    localStorage.setItem('mori_bg_animated', String(val));
  }, []);

  const [bgShape, setBgShapeState] = useState(() => localStorage.getItem('mori_bg_shape') || 'stars');
  const setBgShape = useCallback((val) => {
    setBgShapeState(val);
    localStorage.setItem('mori_bg_shape', val);
  }, []);

  const [bgBrightness, setBgBrightnessState] = useState(() => parseInt(localStorage.getItem('mori_bg_brightness') || '150', 10));
  const setBgBrightness = useCallback((val) => {
    setBgBrightnessState(val);
    localStorage.setItem('mori_bg_brightness', String(val));
  }, []);

  const [bgSpeed, setBgSpeedState] = useState(() => parseInt(localStorage.getItem('mori_bg_speed') || '100', 10));
  const setBgSpeed = useCallback((val) => {
    setBgSpeedState(val);
    localStorage.setItem('mori_bg_speed', String(val));
  }, []);

  // History & Statistics
  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('mori_history') || '[]');
    } catch {
      return [];
    }
  });

  const [totalDownloads, setTotalDownloads] = useState(() => {
    const val = parseInt(localStorage.getItem('mori_dl_count') || '0', 10);
    return isNaN(val) ? 0 : val;
  });

  const addToHistory = useCallback((item) => {
    setHistory((prev) => {
      const newItem = {
        id: 'dl_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        date: new Date().toISOString(),
        ...item,
      };
      const updated = [newItem, ...prev].slice(0, 100);
      localStorage.setItem('mori_history', JSON.stringify(updated));
      return updated;
    });

    setTotalDownloads((prev) => {
      const updated = prev + 1;
      localStorage.setItem('mori_dl_count', String(updated));
      return updated;
    });
  }, []);

  const deleteHistoryItem = useCallback((id) => {
    setHistory((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      localStorage.setItem('mori_history', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearAllHistory = useCallback(() => {
    setHistory([]);
    localStorage.setItem('mori_history', '[]');
  }, []);

  // Toast
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });
  const toastTimerRef = useRef(null);

  const hideToast = useCallback(() => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    setToast({ visible: false, message: '', type: 'info' });
  }, []);

  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    setToast({ visible: true, message, type });

    if (duration > 0) {
      toastTimerRef.current = setTimeout(() => {
        setToast({ visible: false, message: '', type: 'info' });
        toastTimerRef.current = null;
      }, duration);
    }
  }, []);

  // Privacy & PIN Lock
  const [privacyLockEnabled, setPrivacyLockEnabledState] = useState(() => localStorage.getItem('mori_privacy_lock') === 'true');
  const [storedPin, setStoredPinState] = useState(() => localStorage.getItem('mori_pin') || '');
  const [isHistoryUnlocked, setIsHistoryUnlocked] = useState(false);
  const [isSettingsUnlocked, setIsSettingsUnlocked] = useState(false);
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [pinTargetPage, setPinTargetPage] = useState(null);

  const setPrivacyLockEnabled = useCallback((val) => {
    setPrivacyLockEnabledState(val);
    localStorage.setItem('mori_privacy_lock', String(val));
  }, []);

  const setStoredPin = useCallback((val) => {
    setStoredPinState(val);
    localStorage.setItem('mori_pin', val);
  }, []);

  // Guide modal state
  const [guideModalOpen, setGuideModalOpen] = useState(() => {
    try {
      return localStorage.getItem('mori_guide_dismissed') !== 'true';
    } catch {
      return false;
    }
  });

  const handlePageSwitch = useCallback((page) => {
    if (page === 'history' && privacyLockEnabled && storedPin && !isHistoryUnlocked) {
      setPinTargetPage('history');
      setPinModalOpen(true);
      return;
    }
    if (page === 'settings' && privacyLockEnabled && storedPin && !isSettingsUnlocked) {
      setPinTargetPage('settings');
      setPinModalOpen(true);
      return;
    }
    setActivePage(page);
  }, [privacyLockEnabled, storedPin, isHistoryUnlocked, isSettingsUnlocked]);

  // Sync initial classes
  useEffect(() => {
    if (theme === 'default') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }

    document.body.className = `${font} ${animSpeed} ${glass}`;
  }, [theme, font, animSpeed, glass]);

  return (
    <AppContext.Provider
      value={{
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
        activePage,
        setActivePage: handlePageSwitch,
        viewMode,
        setViewMode,
        effectiveMode,
        isDesktopScreen,
        preferServer,
        setPreferServer,
        bgAnim,
        setBgAnim,
        bgShape,
        setBgShape,
        bgBrightness,
        setBgBrightness,
        bgSpeed,
        setBgSpeed,
        history,
        totalDownloads,
        addToHistory,
        deleteHistoryItem,
        clearAllHistory,
        toast,
        showToast,
        hideToast,
        privacyLockEnabled,
        setPrivacyLockEnabled,
        storedPin,
        setStoredPin,
        isHistoryUnlocked,
        setIsHistoryUnlocked,
        isSettingsUnlocked,
        setIsSettingsUnlocked,
        pinModalOpen,
        setPinModalOpen,
        pinTargetPage,
        setPinTargetPage,
        guideModalOpen,
        setGuideModalOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
