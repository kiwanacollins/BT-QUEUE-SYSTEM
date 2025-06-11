import React, { useState } from 'react';
import { Trash2, Settings, Smartphone, Wifi, WifiOff, Volume2, FileSpreadsheet } from 'lucide-react';
import { VoiceSettings } from './VoiceSettings';
import { usePWA } from '../hooks/usePWA';
import { useVoice } from '../hooks/useVoice';

interface HeaderProps {
  onClearQueue: () => void;
  onExportExcel: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onClearQueue, onExportExcel }) => {
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const { isOnline, isInstallable, installApp, updateAvailable, updateApp } = usePWA();
  const { settings: voiceSettings } = useVoice();

  const handleClearQueue = () => {
    if (window.confirm('Are you sure you want to clear the entire queue? This will permanently remove ALL customers including recently called customers. This action cannot be undone.')) {
      onClearQueue();
    }
  };

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white p-2 rounded-lg shadow-sm">
                <img 
                  src="/images/logo.png" 
                  alt="BT Repair Centre Logo" 
                  className="w-14 h-14 object-contain"
                  onError={(e) => {
                    // Replace with text logo if image fails
                    const target = e.target as HTMLImageElement;
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `
                        <div class="w-14 h-14 bg-purple-600 text-white rounded-lg flex items-center justify-center font-bold text-lg">
                          BT
                        </div>
                      `;
                    }
                  }}
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">BT Repair Centre</h1>
                <p className="text-gray-600">Queue Management System</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Connection Status */}
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                isOnline 
                  ? 'bg-green-50 text-green-700' 
                  : 'bg-orange-50 text-orange-700'
              }`}>
                {isOnline ? (
                  <Wifi className="w-4 h-4" />
                ) : (
                  <WifiOff className="w-4 h-4" />
                )}
                <span className="font-medium">
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>

              {/* Voice Status */}
              {voiceSettings.enabled && (
                <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm">
                  <Volume2 className="w-4 h-4" />
                  <span className="font-medium">Voice On</span>
                </div>
              )}

              {/* Update Available */}
              {updateAvailable && (
                <button
                  onClick={updateApp}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-sm transition-colors"
                  title="Update available"
                >
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="font-medium">Update</span>
                </button>
              )}

              {/* Install App */}
              {/* {isInstallable && (
                <button
                  onClick={installApp}
                  className="flex items-center gap-2 px-3 py-2 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg text-sm transition-colors"
                  title="Install as app"
                >
                  <Smartphone className="w-4 h-4" />
                  <span className="font-medium">Install</span>
                </button>
              )} */}

              {/* Voice Settings */}
              {/* <button
                onClick={() => setShowVoiceSettings(true)}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200"
                title="Voice settings"
              >
                <Settings className="w-4 h-4" />
                <span className="font-medium">Settings</span>
              </button> */}

              <button
                onClick={onExportExcel}
                className="flex items-center gap-2 px-4 py-2 text-green-700 hover:text-green-800 hover:bg-green-50 rounded-lg transition-all duration-200"
                title="Export called customers to Excel"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span className="font-medium">Export Excel</span>
              </button>

              <button
                onClick={handleClearQueue}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                title="Clear entire queue including recently called customers"
              >
                <Trash2 className="w-4 h-4" />
                <span className="font-medium">Clear Recently Called</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <VoiceSettings 
        isOpen={showVoiceSettings}
        onClose={() => setShowVoiceSettings(false)}
      />
    </>
  );
};