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

    // Debug: log all available voices
    console.log('All available voices:', availableVoices.map(v => `${v.name} (${v.lang})`));

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
      if (voice) {
        console.log('Found preferred female voice:', voice.name);
        return voice;
      }
    }

    // Then try to find any high-quality UK/GB female voice
    const ukFemaleVoice = availableVoices.find(voice => 
      (voice.lang.includes('en-GB') || voice.lang.includes('en-UK')) &&
      !voice.name.toLowerCase().includes('compact') &&
      !voice.name.toLowerCase().includes('enhanced') &&
      !isMaleVoice(voice.name)
    );
    if (ukFemaleVoice) {
      console.log('Found UK female voice:', ukFemaleVoice.name);
      return ukFemaleVoice;
    }

    // Fallback to any English female voice that sounds natural
    const englishFemaleVoice = availableVoices.find(voice => 
      voice.lang.startsWith('en') && 
      !voice.name.toLowerCase().includes('compact') &&
      (voice.name.includes('Google') || voice.name.includes('Microsoft') || voice.name.includes('System')) &&
      !isMaleVoice(voice.name)
    );
    if (englishFemaleVoice) {
      console.log('Found English female voice:', englishFemaleVoice.name);
      return englishFemaleVoice;
    }

    // Last resort - any English voice that's likely female
    const anyFemaleVoice = availableVoices.find(voice => 
      voice.lang.startsWith('en') && 
      !isMaleVoice(voice.name)
    );
    
    if (anyFemaleVoice) {
      console.log('Found fallback female voice:', anyFemaleVoice.name);
    } else {
      console.log('No suitable female voice found');
    }
    
    return anyFemaleVoice || null;
  }, [synthesis, availableVoices]);

  // Helper function to identify male voices
  const isMaleVoice = (voiceName: string): boolean => {
    const lowerName = voiceName.toLowerCase();
    const maleIndicators = [
      'male', 'man', 'david', 'mark', 'alex', 'daniel', 'tom', 'mike', 'john', 
      'james', 'robert', 'william', 'richard', 'christopher', 'matthew', 'anthony',
      'microsoft david', 'microsoft mark', 'microsoft alex'
    ];
    
    return maleIndicators.some(indicator => lowerName.includes(indicator));
  };

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

    // Always use the best available female voice
    const bestVoice = getBestVoice();
    if (bestVoice) {
      utterance.voice = bestVoice;
      console.log('Using voice for speech:', bestVoice.name, bestVoice.lang);
    } else {
      console.log('No suitable female voice found, using default');
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

    // Ensure voices are loaded before speaking
    if (availableVoices.length === 0) {
      // Trigger voice loading and retry after a short delay
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        setAvailableVoices(voices);
        // Retry with voices loaded
        setTimeout(() => {
          const retryBestVoice = getBestVoice();
          if (retryBestVoice) {
            utterance.voice = retryBestVoice;
            console.log('Retry - Using voice for speech:', retryBestVoice.name, retryBestVoice.lang);
          }
          synthesis.speak(utterance);
        }, 100);
        return;
      }
    }

    synthesis.speak(utterance);
  }, [synthesis, settings, getBestVoice, availableVoices]);

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