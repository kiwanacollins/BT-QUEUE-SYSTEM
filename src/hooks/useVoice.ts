import { useState, useCallback, useEffect } from 'react';
import { VoiceSettings } from '../types';

export const useVoice = () => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [synthesis, setSynthesis] = useState<SpeechSynthesis | null>(null);
  const [settings, setSettings] = useState<VoiceSettings>({
    enabled: true,
    volume: 0.8,
    rate: 0.9,
    pitch: 1,
    voice: 'UK English Female'
  });

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-GB';
      
      setRecognition(recognitionInstance);
    }

    // Initialize speech synthesis
    if ('speechSynthesis' in window) {
      setSynthesis(window.speechSynthesis);
    }
  }, []);

  const speak = useCallback((text: string, priority: 'normal' | 'high' = 'normal') => {
    if (!synthesis || !settings.enabled) return;

    // Cancel current speech if high priority
    if (priority === 'high') {
      synthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.volume = settings.volume;
    utterance.rate = settings.rate;
    utterance.pitch = settings.pitch;
    utterance.lang = 'en-GB';

    // Try to use a British voice
    const voices = synthesis.getVoices();
    const britishVoice = voices.find(voice => 
      voice.lang.includes('en-GB') || voice.name.includes('UK') || voice.name.includes('British')
    );
    if (britishVoice) {
      utterance.voice = britishVoice;
    }

    synthesis.speak(utterance);
  }, [synthesis, settings]);

  const startListening = useCallback((onResult: (text: string) => void) => {
    if (!recognition) return;

    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
      onResult(transcript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
    setIsListening(true);
  }, [recognition]);

  const stopListening = useCallback(() => {
    if (recognition) {
      recognition.stop();
    }
    setIsListening(false);
  }, [recognition]);

  return {
    speak,
    startListening,
    stopListening,
    isListening,
    isAvailable: !!recognition && !!synthesis,
    settings,
    setSettings
  };
};