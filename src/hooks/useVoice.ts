import { useState, useCallback, useEffect } from 'react';
import { VoiceSettings } from '../types';

export const useVoice = () => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [synthesis, setSynthesis] = useState<SpeechSynthesis | null>(null);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [settings, setSettings] = useState<VoiceSettings>({
    enabled: true,
    volume: 0.9,
    rate: 0.85,
    pitch: 1.1,
    voice: 'auto'
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
      
      // Load available voices
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
      };
      
      // Load voices immediately and on voiceschanged event
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const getBestVoice = useCallback(() => {
    if (!synthesis || availableVoices.length === 0) return null;

    // Preferred female voice names (more natural sounding)
    const preferredFemaleVoices = [
      // High quality female voices only
      'Samantha', 'Victoria', 'Karen', 'Moira',
      // Google female voices (very natural)
      'Google UK English Female', 'Google US English Female',
      // Microsoft female voices
      'Microsoft Hazel Desktop', 'Microsoft Zira Desktop',
      // System female voices
      'Fiona', 'Kate', 'Serena', 'Ava', 'Allison',
      // Fallback to any UK/GB female voice
      'UK English Female'
    ];

    // First try to find preferred female voices
    for (const preferredName of preferredFemaleVoices) {
      const voice = availableVoices.find(v => 
        v.name.includes(preferredName)
      );
      if (voice) return voice;
    }

    // Then try to find any high-quality UK/GB female voice
    const ukFemaleVoice = availableVoices.find(voice => 
      (voice.lang.includes('en-GB') || voice.lang.includes('en-UK')) &&
      !voice.name.toLowerCase().includes('compact') &&
      !voice.name.toLowerCase().includes('enhanced') &&
      (voice.name.toLowerCase().includes('female') || 
       voice.name.toLowerCase().includes('woman') ||
       !voice.name.toLowerCase().includes('male'))
    );
    if (ukFemaleVoice) return ukFemaleVoice;

    // Fallback to any English female voice that sounds natural
    const englishFemaleVoice = availableVoices.find(voice => 
      voice.lang.startsWith('en') && 
      !voice.name.toLowerCase().includes('compact') &&
      (voice.name.includes('Google') || voice.name.includes('Microsoft') || voice.name.includes('System')) &&
      (voice.name.toLowerCase().includes('female') || 
       voice.name.toLowerCase().includes('woman') ||
       (!voice.name.toLowerCase().includes('male') && 
        (voice.name.includes('Samantha') || voice.name.includes('Victoria') || 
         voice.name.includes('Karen') || voice.name.includes('Fiona') || 
         voice.name.includes('Kate') || voice.name.includes('Serena') || 
         voice.name.includes('Ava') || voice.name.includes('Allison') ||
         voice.name.includes('Hazel') || voice.name.includes('Zira'))))
    );
    if (englishFemaleVoice) return englishFemaleVoice;

    // Last resort - any English voice that's likely female (exclude obvious male names)
    const anyFemaleVoice = availableVoices.find(voice => 
      voice.lang.startsWith('en') && 
      !voice.name.toLowerCase().includes('male') &&
      !voice.name.toLowerCase().includes('david') &&
      !voice.name.toLowerCase().includes('mark') &&
      !voice.name.toLowerCase().includes('alex') &&
      !voice.name.toLowerCase().includes('daniel')
    );
    
    return anyFemaleVoice || null;
  }, [synthesis, availableVoices]);

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

    // Use the best available voice
    const bestVoice = getBestVoice();
    if (bestVoice) {
      utterance.voice = bestVoice;
    }

    // Add some natural pauses for better speech flow
    const processedText = text
      .replace(/\./g, '. ')
      .replace(/,/g, ', ')
      .replace(/:/g, ': ')
      .replace(/;/g, '; ')
      .replace(/\s+/g, ' ')
      .trim();
    
    utterance.text = processedText;

    // Error handling
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event.error);
    };

    synthesis.speak(utterance);
  }, [synthesis, settings, getBestVoice]);

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
    setSettings,
    availableVoices,
    getBestVoice
  };
};