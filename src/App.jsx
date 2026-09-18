import React from 'react';
import { useApp } from './context/AppContext';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
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

  return (
    <>
      <BackgroundAnimation />
      <div className="app-container">
        <Header />
        <main>
          {activePage === 'home' && <HomePage />}
          {activePage === 'history' && <HistoryPage />}
          {activePage === 'settings' && <SettingsPage />}
        </main>
        <BottomNav />
      </div>

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
