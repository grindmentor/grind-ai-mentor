import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SyncQueueItem {
  id: string;
  action: string;
  data: any;
  timestamp: number;
  retryCount: number;
}

export const BackgroundSync: React.FC = () => {
  const { user } = useAuth();
  const [syncQueue, setSyncQueue] = useState<SyncQueueItem[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSync, setLastSync] = useState<number | null>(null);

  useEffect(() => {
    // Load sync queue from localStorage
    const savedQueue = localStorage.getItem('syncQueue');
    if (savedQueue) {
      setSyncQueue(JSON.parse(savedQueue));
    }

    const savedLastSync = localStorage.getItem('lastSync');
    if (savedLastSync) {
      setLastSync(parseInt(savedLastSync));
    }

    // Set up online/offline listeners
    const handleOnline = () => {
      setIsOnline(true);
      processSyncQueue();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Register service worker for background sync
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        // Check if background sync is supported
        if ('sync' in registration) {
          try {
            // Register background sync events with shorter, valid tags
            (registration as any).sync.register('workout');
            (registration as any).sync.register('food');
            (registration as any).sync.register('progress');
            (registration as any).sync.register('goals');
            (registration as any).sync.register('prefs');
          } catch (error) {
            console.log('Background sync registration failed:', error);
          }
        }
      }).catch(error => {
        console.log('Service worker not ready:', error);
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    // Process sync queue when coming online
    if (isOnline && syncQueue.length > 0) {
      processSyncQueue();
    }
  }, [isOnline, syncQueue]);

  const addToSyncQueue = (action: string, data: any) => {
    const item: SyncQueueItem = {
      id: `${action}-${Date.now()}-${Math.random()}`,
      action,
      data,
      timestamp: Date.now(),
      retryCount: 0
    };

    const newQueue = [...syncQueue, item];
    setSyncQueue(newQueue);
    localStorage.setItem('syncQueue', JSON.stringify(newQueue));

    // If online, try to sync immediately
    if (isOnline) {
      syncItem(item);
    }
  };

  const removeFromSyncQueue = (itemId: string) => {
    const newQueue = syncQueue.filter(item => item.id !== itemId);
    setSyncQueue(newQueue);
    localStorage.setItem('syncQueue', JSON.stringify(newQueue));
  };

  const processSyncQueue = async () => {
    if (!isOnline || !user) return;

    const itemsToSync = syncQueue.filter(item => item.retryCount < 3);
    
    for (const item of itemsToSync) {
      await syncItem(item);
    }
  };

  const syncItem = async (item: SyncQueueItem) => {
    if (!user) return;

    try {
      switch (item.action) {
        case 'workout-save':
          await supabase.from('workout_sessions').insert(item.data);
          break;
        case 'food-log':
          await supabase.from('food_log_entries').insert(item.data);
          break;
        case 'progress-update':
          await supabase.from('progress_photos').insert(item.data);
          break;
        case 'goal-update':
          await supabase.from('user_goals').upsert(item.data);
          break;
        case 'preference-update':
          await supabase.from('user_preferences').upsert(item.data);
          break;
        case 'habit-completion':
          await supabase.from('habit_completions').insert(item.data);
          break;
        case 'recovery-data':
          await supabase.from('recovery_data').insert(item.data);
          break;
        case 'exercise-log':
          await supabase.from('progressive_overload_entries').insert(item.data);
          break;
        default:
          console.warn('Unknown sync action:', item.action);
      }

      // Remove from queue on success
      removeFromSyncQueue(item.id);
      setLastSync(Date.now());
      localStorage.setItem('lastSync', Date.now().toString());

    } catch (error) {
      console.error('Sync failed for item:', item, error);
      
      // Increment retry count
      const updatedQueue = syncQueue.map(queueItem =>
        queueItem.id === item.id
          ? { ...queueItem, retryCount: queueItem.retryCount + 1 }
          : queueItem
      );
      setSyncQueue(updatedQueue);
      localStorage.setItem('syncQueue', JSON.stringify(updatedQueue));

      // Remove items that have failed too many times
      if (item.retryCount >= 2) {
        removeFromSyncQueue(item.id);
        toast.error(`Failed to sync ${item.action}. Data may be lost.`);
      }
    }
  };

  // Expose sync functions globally for use by other components
  useEffect(() => {
    window.backgroundSync = {
      addToQueue: addToSyncQueue,
      forceSync: processSyncQueue,
      getQueueStatus: () => ({ 
        pending: syncQueue.length, 
        lastSync,
        isOnline 
      })
    };
  }, [syncQueue, lastSync, isOnline]);

  return null; // This is a background service component
};

export default BackgroundSync;

// Type declarations for global window object
declare global {
  interface Window {
    backgroundSync: {
      addToQueue: (action: string, data: any) => void;
      forceSync: () => void;
      getQueueStatus: () => { pending: number; lastSync: number | null; isOnline: boolean };
    };
  }
}