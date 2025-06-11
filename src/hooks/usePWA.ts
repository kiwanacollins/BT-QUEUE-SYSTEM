import { useState, useEffect, useCallback } from 'react';

interface PWAState {
  isOnline: boolean;
  isInstallable: boolean;
  isInstalled: boolean;
  updateAvailable: boolean;
}

interface ExtendedNavigator extends Navigator {
  standalone?: boolean;
}

interface ExtendedWindow extends Window {
  deferredPrompt?: {
    prompt(): Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
  };
}

export const usePWA = () => {
  const [state, setState] = useState<PWAState>({
    isOnline: navigator.onLine,
    isInstallable: false,
    isInstalled: false,
    updateAvailable: false
  });

  useEffect(() => {
    // Check if app is installed
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                       (navigator as ExtendedNavigator).standalone === true;
    
    setState(prev => ({ ...prev, isInstalled }));

    // Online/offline listeners
    const handleOnline = () => setState(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setState(prev => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Install prompt listener
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setState(prev => ({ ...prev, isInstallable: true }));
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Service worker update listener
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        setState(prev => ({ ...prev, updateAvailable: true }));
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const installApp = useCallback(async () => {
    const deferredPrompt = (window as ExtendedWindow).deferredPrompt;
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setState(prev => ({ ...prev, isInstallable: false, isInstalled: true }));
      }
      
      (window as ExtendedWindow).deferredPrompt = undefined;
    }
  }, []);

  const updateApp = useCallback(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then(registration => {
        if (registration?.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          window.location.reload();
        }
      });
    }
  }, []);

  // Background sync for offline actions
  const syncWhenOnline = useCallback((action: () => Promise<void>) => {
    if (state.isOnline) {
      return action();
    } else {
      // Store action for later sync
      const pendingActions = JSON.parse(localStorage.getItem('pendingActions') || '[]');
      pendingActions.push({
        id: Date.now(),
        action: action.toString(),
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('pendingActions', JSON.stringify(pendingActions));
      return Promise.resolve();
    }
  }, [state.isOnline]);

  // Process pending actions when back online
  useEffect(() => {
    if (state.isOnline) {
      const pendingActions = JSON.parse(localStorage.getItem('pendingActions') || '[]');
      if (pendingActions.length > 0) {
        console.log(`Processing ${pendingActions.length} pending actions...`);
        
        // Clear pending actions
        localStorage.setItem('pendingActions', '[]');
        
        // Trigger a queue refresh or sync
        window.dispatchEvent(new CustomEvent('queue-sync-needed'));
      }
    }
  }, [state.isOnline]);

  return {
    ...state,
    installApp,
    updateApp,
    syncWhenOnline
  };
};
