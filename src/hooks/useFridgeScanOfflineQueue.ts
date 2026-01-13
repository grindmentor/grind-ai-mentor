import { useState, useEffect, useCallback, useRef } from 'react';

export type FridgeScanAction = 'detect' | 'generate';

export interface QueuedRequest {
  id: string;
  action: FridgeScanAction;
  payload: Record<string, unknown>;
  timestamp: number;
  retryCount: number;
}

interface QueueState {
  items: QueuedRequest[];
  processing: boolean;
}

const STORAGE_KEY = 'fridgescan-offline-queue';
const MAX_RETRIES = 3;

/**
 * Offline queue for FridgeScan AI requests.
 * Queues requests when offline and automatically retries when connection is restored.
 */
export const useFridgeScanOfflineQueue = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queue, setQueue] = useState<QueueState>({ items: [], processing: false });
  const processingRef = useRef(false);
  const onResultCallbackRef = useRef<((id: string, result: unknown | null, error: string | null) => void) | null>(null);

  // Load queue from storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as QueuedRequest[];
        setQueue({ items: parsed, processing: false });
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  // Persist queue to storage
  const persistQueue = useCallback((items: QueuedRequest[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // storage full or unavailable
    }
  }, []);

  // Process queued requests
  const processQueue = useCallback(async () => {
    if (processingRef.current || !navigator.onLine) return;
    
    const storedItems = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as QueuedRequest[];
    if (storedItems.length === 0) return;

    processingRef.current = true;
    setQueue(prev => ({ ...prev, processing: true }));

    const remaining: QueuedRequest[] = [];

    for (const item of storedItems) {
      if (!navigator.onLine) {
        remaining.push(item);
        continue;
      }

      try {
        const { supabase } = await import('@/integrations/supabase/client');
        const { data, error } = await supabase.functions.invoke('fridge-scan-ai', {
          body: item.payload,
        });

        if (error) {
          // Check if retriable
          if (item.retryCount < MAX_RETRIES) {
            remaining.push({ ...item, retryCount: item.retryCount + 1 });
          }
          onResultCallbackRef.current?.(item.id, null, error.message);
        } else {
          onResultCallbackRef.current?.(item.id, data, null);
        }
      } catch (err) {
        if (item.retryCount < MAX_RETRIES) {
          remaining.push({ ...item, retryCount: item.retryCount + 1 });
        }
        onResultCallbackRef.current?.(item.id, null, err instanceof Error ? err.message : 'Unknown error');
      }
    }

    persistQueue(remaining);
    setQueue({ items: remaining, processing: false });
    processingRef.current = false;
  }, [persistQueue]);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Delay slightly to ensure network is stable
      setTimeout(() => processQueue(), 1000);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Process any pending items on mount if online
    if (navigator.onLine) {
      processQueue();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [processQueue]);

  // Add request to queue
  const enqueue = useCallback((action: FridgeScanAction, payload: Record<string, unknown>): string => {
    const id = `${action}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const request: QueuedRequest = {
      id,
      action,
      payload: { ...payload, action },
      timestamp: Date.now(),
      retryCount: 0,
    };

    setQueue(prev => {
      const updated = [...prev.items, request];
      persistQueue(updated);
      return { ...prev, items: updated };
    });

    return id;
  }, [persistQueue]);

  // Remove request from queue
  const dequeue = useCallback((id: string) => {
    setQueue(prev => {
      const updated = prev.items.filter(item => item.id !== id);
      persistQueue(updated);
      return { ...prev, items: updated };
    });
  }, [persistQueue]);

  // Clear entire queue
  const clearQueue = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setQueue({ items: [], processing: false });
  }, []);

  // Set callback for when queued items complete
  const setOnResult = useCallback((cb: (id: string, result: unknown | null, error: string | null) => void) => {
    onResultCallbackRef.current = cb;
  }, []);

  return {
    isOnline,
    queuedItems: queue.items,
    isProcessingQueue: queue.processing,
    enqueue,
    dequeue,
    clearQueue,
    processQueue,
    setOnResult,
  };
};
