import React, { useState, useEffect } from 'react';
import { Settings, Play, RotateCcw } from 'lucide-react';
import { useVoice } from '../hooks/useVoice';

interface VoiceSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VoiceSettings: React.FC<VoiceSettingsProps> = ({ isOpen, onClose }) => {
  const { settings, setSettings, availableVoices, speak, getBestVoice } = useVoice();
  const [selectedVoice, setSelectedVoice] = useState<string>('');

  useEffect(() => {
    if (availableVoices.length > 0) {
      const bestVoice = getBestVoice();
      setSelectedVoice(bestVoice?.name || '');
    }
  }, [availableVoices, getBestVoice]);

  const testVoice = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Cancel any ongoing speech
      
      // Get the best female voice
      const bestFemaleVoice = getBestVoice();
      
      // Additional filtering to ensure it's female
      const femaleVoices = availableVoices.filter(voice => 
        voice.lang.startsWith('en') &&
        // Strict female filtering
        (voice.name.toLowerCase().includes('female') || 
         voice.name.toLowerCase().includes('woman') ||
         voice.name.includes('Samantha') || voice.name.includes('Victoria') || 
         voice.name.includes('Karen') || voice.name.includes('Fiona') || 
         voice.name.includes('Kate') || voice.name.includes('Serena') || 
         voice.name.includes('Ava') || voice.name.includes('Allison') ||
         voice.name.includes('Hazel') || voice.name.includes('Zira') ||
         voice.name.includes('Moira')) &&
        // Exclude obvious male voices
        !voice.name.toLowerCase().includes('male') &&
        !voice.name.toLowerCase().includes('david') &&
        !voice.name.toLowerCase().includes('mark') &&
        !voice.name.toLowerCase().includes('alex') &&
        !voice.name.toLowerCase().includes('daniel')
      );
      
      // Use the first female voice from our filtered list, or the best voice as fallback
      const voiceToUse = femaleVoices[0] || bestFemaleVoice;
      
      console.log('Available female voices:', femaleVoices.map(v => v.name));
      console.log('Using voice for test:', voiceToUse?.name);
      
      const utterance = new SpeechSynthesisUtterance("Hello, this is how I will sound when making announcements for the BT repair queue system.");
      
      if (voiceToUse) {
        utterance.voice = voiceToUse;
      }
      
      utterance.volume = settings.volume;
      utterance.rate = settings.rate;
      utterance.pitch = settings.pitch;
      utterance.lang = 'en-GB';
      
      // Error handling
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event.error);
        alert('Voice test failed. Please try a different voice.');
      };
      
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Speech synthesis is not supported in this browser.');
    }
  };

  const handleVolumeChange = (volume: number) => {
    setSettings({ ...settings, volume });
  };

  const handleRateChange = (rate: number) => {
    setSettings({ ...settings, rate });
  };

  const handlePitchChange = (pitch: number) => {
    setSettings({ ...settings, pitch });
  };

  const resetToDefaults = () => {
    const defaultSettings = {
      enabled: true,
      volume: 0.9,
      rate: 0.85,
      pitch: 1.1,
      voice: 'auto'
    };
    setSettings(defaultSettings);
    setSelectedVoice('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Settings className="w-5 h-5 text-purple-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Voice Settings</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl font-bold"
            >
              ×
            </button>
          </div>

          <div className="space-y-6">
            {/* Voice Enable/Disable */}
            {/* <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {settings.enabled ? (
                  <Volume2 className="w-5 h-5 text-green-600" />
                ) : (
                  <VolumeX className="w-5 h-5 text-gray-400" />
                )}
                <span className="font-medium">Voice Announcements</span>
              </div>
              <button
                onClick={toggleVoice}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.enabled ? 'bg-purple-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div> */}

            {settings.enabled && (
              <>
                {/* Voice Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Voice Selection
                  </label>
                  <select
                    value={selectedVoice}
                    onChange={(e) => setSelectedVoice(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Auto (Best Available Female Voice)</option>
                    {availableVoices
                      .filter(voice => 
                        voice.lang.startsWith('en') &&
                        // Filter to only female voices
                        (voice.name.toLowerCase().includes('female') || 
                         voice.name.toLowerCase().includes('woman') ||
                         (!voice.name.toLowerCase().includes('male') && 
                          !voice.name.toLowerCase().includes('david') &&
                          !voice.name.toLowerCase().includes('mark') &&
                          !voice.name.toLowerCase().includes('alex') &&
                          !voice.name.toLowerCase().includes('daniel')))
                      )
                      .sort((a, b) => {
                        // Prioritize higher quality voices
                        const aScore = a.name.includes('Google') ? 3 : a.name.includes('Microsoft') ? 2 : 1;
                        const bScore = b.name.includes('Google') ? 3 : b.name.includes('Microsoft') ? 2 : 1;
                        return bScore - aScore;
                      })
                      .map(voice => (
                        <option key={voice.name} value={voice.name}>
                          {voice.name} ({voice.lang})
                        </option>
                      ))}
                  </select>
                </div>

                {/* Volume Control */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Volume: {Math.round(settings.volume * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={settings.volume}
                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Speed Control */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Speed: {Math.round(settings.rate * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={settings.rate}
                    onChange={(e) => handleRateChange(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Pitch Control */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pitch: {Math.round(settings.pitch * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={settings.pitch}
                    onChange={(e) => handlePitchChange(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Test Voice */}
                <button
                  onClick={testVoice}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Test Voice
                </button>

                {/* Reset to Defaults */}
                <button
                  onClick={resetToDefaults}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset to Defaults
                </button>
              </>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              <p className="mb-2">
                <strong>Voice Quality Tips:</strong>
              </p>
              <ul className="space-y-1 text-xs">
                <li>• Google voices typically sound most natural</li>
                <li>• Microsoft voices are also high quality</li>
                <li>• System voices may vary by device</li>
                <li>• Slower speeds often sound more professional</li>
                <li>• Use "Reset to Defaults" for optimal settings</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
