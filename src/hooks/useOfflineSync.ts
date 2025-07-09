import { useState, useEffect, useCallback } from 'react';
import { backgroundSync } from '@/services/backgroundSyncService';

interface SyncStatus {
  isOnline: boolean;
  pendingCount: number;
  lastSyncTime: number | null;
  isSyncing: boolean;
}

export const useOfflineSync = () => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: navigator.onLine,
    pendingCount: 0,
    lastSyncTime: null,
    isSyncing: false
  });

  useEffect(() => {
    // Update online status
    const handleOnline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: true }));
      // Trigger sync when coming back online
      backgroundSync.processQueue().catch(console.error);
    };

    const handleOffline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: false }));
    };

    // Update sync status periodically
    const updateSyncStatus = () => {
      const status = backgroundSync.getSyncStatus();
      setSyncStatus(prev => ({
        ...prev,
        pendingCount: status.pending,
        lastSyncTime: status.lastSync
      }));
    };

    // Set up listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Update sync status every 30 seconds
    const syncInterval = setInterval(updateSyncStatus, 30000);
    updateSyncStatus(); // Initial call

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(syncInterval);
    };
  }, []);

  // Queue data for offline sync
  const queueForSync = useCallback(async (action: string, data: any) => {
    try {
      await backgroundSync.queueForSync(action, data);
      // Update pending count immediately
      const status = backgroundSync.getSyncStatus();
      setSyncStatus(prev => ({
        ...prev,
        pendingCount: status.pending
      }));
    } catch (error) {
      console.error('Failed to queue for sync:', error);
      throw error;
    }
  }, []);

  // Force sync now
  const forceSync = useCallback(async () => {
    if (!syncStatus.isOnline) {
      throw new Error('Cannot sync while offline');
    }

    setSyncStatus(prev => ({ ...prev, isSyncing: true }));
    
    try {
      await backgroundSync.forcSync();
      const status = backgroundSync.getSyncStatus();
      setSyncStatus(prev => ({
        ...prev,
        pendingCount: status.pending,
        lastSyncTime: status.lastSync,
        isSyncing: false
      }));
    } catch (error) {
      setSyncStatus(prev => ({ ...prev, isSyncing: false }));
      throw error;
    }
  }, [syncStatus.isOnline]);

  return {
    syncStatus,
    queueForSync,
    forceSync
  };
};

export default useOfflineSync;