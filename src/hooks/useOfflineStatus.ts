import { useState, useEffect, useCallback } from 'react';

interface OfflineData {
  key: string;
  data: unknown;
  timestamp: number;
  action: 'create' | 'update' | 'delete';
}

export const useOfflineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSync, setPendingSync] = useState<OfflineData[]>([]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncPendingData();
    };
    
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load pending sync data from localStorage
    const stored = localStorage.getItem('offlineSyncQueue');
    if (stored) {
      setPendingSync(JSON.parse(stored));
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const queueForSync = useCallback((key: string, data: unknown, action: 'create' | 'update' | 'delete') => {
    const item: OfflineData = { key, data, timestamp: Date.now(), action };
    const updated = [...pendingSync, item];
    setPendingSync(updated);
    localStorage.setItem('offlineSyncQueue', JSON.stringify(updated));
    
    // Request background sync if available
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      navigator.serviceWorker.ready.then(reg => {
        (reg as any).sync?.register('data-sync');
      });
    }
  }, [pendingSync]);

  const syncPendingData = useCallback(async () => {
    const queue = JSON.parse(localStorage.getItem('offlineSyncQueue') || '[]');
    if (queue.length === 0) return;

    // Process queue (actual sync logic would be implemented per use case)
    console.log('[Offline] Syncing', queue.length, 'items');
    
    // Clear queue after sync attempt
    localStorage.removeItem('offlineSyncQueue');
    setPendingSync([]);
  }, []);

  return { isOnline, pendingSync, queueForSync, syncPendingData };
};
