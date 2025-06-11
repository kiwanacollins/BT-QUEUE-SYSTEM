import React, { useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { CustomerCheckIn } from './components/CustomerCheckIn';
import { QueueDashboard } from './components/QueueDashboard';
import { Statistics } from './components/Statistics';
import { useQueue } from './hooks/useQueue';
import { useVoice } from './hooks/useVoice';

function App() {
  const {
    customers,
    stats,
    addCustomer,
    callCustomer,
    removeCustomer,
    clearQueue,
    exportData
  } = useQueue();

  const {
    speak,
    isAvailable: isVoiceAvailable,
    settings
  } = useVoice();

  // Initialize voice announcement
  useEffect(() => {
    if (isVoiceAvailable && settings.enabled) {
      // speak("BT Repair Centre Management System ready. Voice controls are active.", 'normal');
    }
  }, [isVoiceAvailable, settings.enabled, speak]);

  const handleCheckIn = useCallback((name: string, device: string, phoneNumber: string) => {
    const customer = addCustomer(name, device, phoneNumber);
    console.log('Customer added:', customer);
  }, [addCustomer]);

  const handleVoiceAnnouncement = useCallback((text: string) => {
    if (settings.enabled) {
      speak(text, 'high');
    }
  }, [speak, settings.enabled]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onExportData={exportData} onClearQueue={clearQueue} />
      
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