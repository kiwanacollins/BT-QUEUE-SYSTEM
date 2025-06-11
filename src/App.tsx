import React, { useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { CustomerCheckIn } from './components/CustomerCheckIn';
import { QueueDashboard } from './components/QueueDashboard';
import { Statistics } from './components/Statistics';
import { useQueue } from './hooks/useQueue';
import { useVoice } from './hooks/useVoice';
import { usePWA } from './hooks/usePWA';

function App() {
  const {
    customers,
    stats,
    addCustomer,
    callCustomer,
    removeCustomer,
    clearQueue,
    exportCalledCustomersToExcel
  } = useQueue();

  const {
    speak,
    isAvailable: isVoiceAvailable,
    settings
  } = useVoice();

  const { syncWhenOnline } = usePWA();

  // Initialize voice announcement
  useEffect(() => {
    if (isVoiceAvailable && settings.enabled) {
      // speak("BT Queue Management System is ready. Voice announcements are active.", 'normal');
    }
  }, [isVoiceAvailable, settings.enabled, speak]);

  const handleCheckIn = useCallback((name: string, device: string, phoneNumber: string) => {
    const customer = addCustomer(name, device, phoneNumber);
    
    console.log('Customer added:', customer);
  }, [addCustomer]);

  const handleVoiceAnnouncement = useCallback((text: string) => {
    if (settings.enabled) {
      // Enhanced voice announcements with better pacing
      const enhancedText = text
        .replace(/(\d+)/g, ' $1 ') // Add spaces around numbers
        .replace(/([.!?])/g, '$1 ') // Add pause after punctuation
        .trim();
      
      speak(enhancedText, 'high');
    }
  }, [speak, settings.enabled]);

  // Handle offline queue sync
  useEffect(() => {
    const handleQueueSync = () => {
      syncWhenOnline(async () => {
        // This would sync with a backend if available
        console.log('Syncing queue data with server...');
        // For now, just log the action
      });
    };

    window.addEventListener('queue-sync-needed', handleQueueSync);
    return () => window.removeEventListener('queue-sync-needed', handleQueueSync);
  }, [syncWhenOnline]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onClearQueue={clearQueue}
        onExportExcel={exportCalledCustomersToExcel}
      />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-8">
            <CustomerCheckIn 
              onCheckIn={handleCheckIn}
              onVoiceAnnouncement={handleVoiceAnnouncement}
            />
            
            <Statistics stats={stats} />
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2">
            <QueueDashboard
              customers={customers}
              onCallCustomer={callCustomer}
              onRemoveCustomer={removeCustomer}
              onVoiceAnnouncement={handleVoiceAnnouncement}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;