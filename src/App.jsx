import React from 'react';
import { useApp } from './context/AppContext';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import DesktopSidebar from './components/DesktopSidebar';
import DesktopTopbar from './components/DesktopTopbar';
import BackgroundAnimation from './components/BackgroundAnimation';
import Toast from './components/Toast';
import PinModal from './components/PinModal';
import GuideModal from './components/GuideModal';
import HomePage from './pages/HomePage';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';

function MainApp() {
  const {
    activePage,
    pinModalOpen,
    setPinModalOpen,
    pinTargetPage,
    setActivePage,
    setIsHistoryUnlocked,
    setIsSettingsUnlocked,
    guideModalOpen,
    setGuideModalOpen,
    effectiveMode,
    viewMode,
    setViewMode,
    isDesktopScreen,
  } = useApp();

  const handlePinSuccess = () => {
    if (pinTargetPage === 'history') {
      setIsHistoryUnlocked(true);
      setActivePage('history');
    } else if (pinTargetPage === 'settings') {
      setIsSettingsUnlocked(true);
      setActivePage('settings');
    }
    setPinModalOpen(false);
  };

  const isDesktop = effectiveMode === 'desktop';

  return (
    <>
      <BackgroundAnimation />

      {isDesktop ? (
        /* ====================================================================
           DESKTOP MODE (Widescreen Studio Dashboard with Sidebar & Topbar)
           ==================================================================== */
        <div className="desktop-layout-shell">
          <DesktopSidebar />
          <div className="desktop-main-wrapper">
            <DesktopTopbar />
            <main className="desktop-main-content">
              {activePage === 'home' && <HomePage isDesktop={true} />}
              {activePage === 'history' && <HistoryPage isDesktop={true} />}
              {activePage === 'settings' && <SettingsPage isDesktop={true} />}
            </main>
          </div>
        </div>
      ) : (
        /* ====================================================================
           MOBILE MODE (Phone Frame with Compact Header & Bottom Floating Dock)
           ==================================================================== */
        <div className={`mobile-wrapper ${viewMode === 'mobile' && isDesktopScreen ? 'forced-mobile-simulator' : ''}`}>
          {viewMode === 'mobile' && isDesktopScreen && (
            <div className="forced-mobile-banner">
              <div className="banner-badge">
                <span className="hero-pulse-dot" />
                <span>MOBILE PREVIEW MODE</span>
              </div>
              <div className="banner-actions">
                <button
                  type="button"
                  className="banner-switch-btn"
                  onClick={() => setViewMode('desktop')}
                >
                  Switch to Desktop Mode
                </button>
                <button
                  type="button"
                  className="banner-auto-btn"
                  onClick={() => setViewMode('auto')}
                >
                  Reset to Auto
                </button>
              </div>
            </div>
          )}

          <div className="app-container mobile-container">
            <Header />
            <main>
              {activePage === 'home' && <HomePage isDesktop={false} />}
              {activePage === 'history' && <HistoryPage isDesktop={false} />}
              {activePage === 'settings' && <SettingsPage isDesktop={false} />}
            </main>
            <BottomNav />
          </div>
        </div>
      )}

      <Toast />

      {/* Global Unlock PIN Modal */}
      <PinModal
        isOpen={pinModalOpen}
        onSuccess={handlePinSuccess}
        onClose={() => setPinModalOpen(false)}
      />

      {/* User Guide Modal */}
      <GuideModal
        isOpen={guideModalOpen}
        onClose={() => setGuideModalOpen(false)}
      />
    </>
  );
}

export default function App() {
  return <MainApp />;
}
