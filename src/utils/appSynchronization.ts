import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * App Synchronization Utilities
 * 
 * This module handles cross-component synchronization, cache invalidation,
 * and ensures data consistency across the entire application.
 */

type CacheKey = string;
type EventName = string;
type CallbackFunction = (...args: any[]) => void;

class AppSynchronizationManager {
  private eventListeners: Map<EventName, Set<CallbackFunction>> = new Map();
  private cache: Map<CacheKey, { data: any; timestamp: number; ttl: number }> = new Map();
  private loadingStates: Map<string, boolean> = new Map();
  private retryQueues: Map<string, Function[]> = new Map();

  // Event system for cross-component communication
  on(event: EventName, callback: CallbackFunction) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);
  }

  off(event: EventName, callback: CallbackFunction) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(callback);
      if (listeners.size === 0) {
        this.eventListeners.delete(event);
      }
    }
  }

  emit(event: EventName, ...args: any[]) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  // Smart caching with TTL and invalidation
  setCache(key: CacheKey, data: any, ttl: number = 5 * 60 * 1000) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
    this.emit('cache:set', key, data);
  }

  getCache(key: CacheKey) {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > cached.ttl;
    if (isExpired) {
      this.cache.delete(key);
      this.emit('cache:expired', key);
      return null;
    }

    return cached.data;
  }

  invalidateCache(pattern: string | RegExp) {
    const keysToDelete: string[] = [];
    
    for (const key of this.cache.keys()) {
      if (typeof pattern === 'string') {
        if (key.includes(pattern)) {
          keysToDelete.push(key);
        }
      } else {
        if (pattern.test(key)) {
          keysToDelete.push(key);
        }
      }
    }

    keysToDelete.forEach(key => {
      this.cache.delete(key);
      this.emit('cache:invalidated', key);
    });

    console.log(`Invalidated ${keysToDelete.length} cache entries matching pattern:`, pattern);
  }

  // Loading state management
  setLoading(key: string, isLoading: boolean) {
    this.loadingStates.set(key, isLoading);
    this.emit('loading:changed', key, isLoading);
  }

  isLoading(key: string): boolean {
    return this.loadingStates.get(key) || false;
  }

  // Data refresh coordination
  async refreshUserData(userId: string) {
    if (this.isLoading('user-data-refresh')) {
      console.log('User data refresh already in progress');
      return;
    }

    this.setLoading('user-data-refresh', true);
    
    try {
      // Invalidate all user-related caches
      this.invalidateCache(`user-${userId}`);
      this.invalidateCache('goals');
      this.invalidateCache('achievements');
      this.invalidateCache('progress');
      this.invalidateCache('notifications');
      
      // Emit refresh events for all components to reload
      this.emit('user:dataChanged', userId);
      this.emit('goals:refresh', userId);
      this.emit('achievements:refresh', userId);
      this.emit('progress:refresh', userId);
      this.emit('notifications:refresh', userId);
      
      console.log('User data refresh coordinated successfully');
    } catch (error) {
      console.error('Error during user data refresh:', error);
      toast.error('Failed to refresh data. Please try again.');
    } finally {
      this.setLoading('user-data-refresh', false);
    }
  }

  // Modal coordination
  private openModals: Set<string> = new Set();

  openModal(modalId: string) {
    this.openModals.add(modalId);
    this.emit('modal:opened', modalId);
    document.body.style.overflow = 'hidden';
  }

  closeModal(modalId: string) {
    this.openModals.delete(modalId);
    this.emit('modal:closed', modalId);
    
    // Re-enable scrolling only if no modals are open
    if (this.openModals.size === 0) {
      document.body.style.overflow = '';
    }
  }

  closeAllModals() {
    const modals = Array.from(this.openModals);
    this.openModals.clear();
    modals.forEach(modalId => this.emit('modal:closed', modalId));
    document.body.style.overflow = '';
  }

  // Network retry queue
  addToRetryQueue(key: string, operation: Function) {
    if (!this.retryQueues.has(key)) {
      this.retryQueues.set(key, []);
    }
    this.retryQueues.get(key)!.push(operation);
  }

  async processRetryQueue(key: string) {
    const queue = this.retryQueues.get(key);
    if (!queue || queue.length === 0) return;

    console.log(`Processing retry queue for ${key}: ${queue.length} operations`);
    
    for (const operation of queue) {
      try {
        await operation();
      } catch (error) {
        console.error(`Retry operation failed for ${key}:`, error);
      }
    }
    
    this.retryQueues.delete(key);
  }

  // Connection state management
  private isOnline = navigator.onLine;

  initializeConnectionHandling() {
    const handleOnline = () => {
      this.isOnline = true;
      this.emit('connection:online');
      
      // Process all retry queues when back online
      for (const key of this.retryQueues.keys()) {
        this.processRetryQueue(key);
      }
      
      toast.success('Connection restored');
    };

    const handleOffline = () => {
      this.isOnline = false;
      this.emit('connection:offline');
      toast.error('Connection lost. Changes will be synced when online.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }

  getConnectionState() {
    return this.isOnline;
  }

  // Real-time subscription coordination
  private activeSubscriptions: Map<string, any> = new Map();

  createRealtimeSubscription(key: string, table: string, userId?: string) {
    // Remove existing subscription if any
    if (this.activeSubscriptions.has(key)) {
      this.activeSubscriptions.get(key).unsubscribe();
    }

    const subscription = supabase
      .channel(`${key}-changes`)
      .on('postgres_changes', 
        {
          event: '*',
          schema: 'public',
          table: table,
          ...(userId && { filter: `user_id=eq.${userId}` })
        },
        (payload) => {
          console.log(`Real-time change detected for ${key}:`, payload);
          this.invalidateCache(key);
          this.emit(`realtime:${key}`, payload);
        }
      )
      .subscribe();

    this.activeSubscriptions.set(key, subscription);
    return subscription;
  }

  removeRealtimeSubscription(key: string) {
    const subscription = this.activeSubscriptions.get(key);
    if (subscription) {
      subscription.unsubscribe();
      this.activeSubscriptions.delete(key);
    }
  }

  // Cleanup all subscriptions
  cleanup() {
    for (const [key, subscription] of this.activeSubscriptions) {
      subscription.unsubscribe();
    }
    this.activeSubscriptions.clear();
    this.eventListeners.clear();
    this.cache.clear();
    this.loadingStates.clear();
    this.retryQueues.clear();
  }
}

// Singleton instance
export const appSync = new AppSynchronizationManager();

// Hook for easy React integration
export const useAppSync = () => {
  return {
    on: appSync.on.bind(appSync),
    off: appSync.off.bind(appSync),
    emit: appSync.emit.bind(appSync),
    refreshUserData: appSync.refreshUserData.bind(appSync),
    setCache: appSync.setCache.bind(appSync),
    getCache: appSync.getCache.bind(appSync),
    invalidateCache: appSync.invalidateCache.bind(appSync),
    setLoading: appSync.setLoading.bind(appSync),
    isLoading: appSync.isLoading.bind(appSync),
    openModal: appSync.openModal.bind(appSync),
    closeModal: appSync.closeModal.bind(appSync),
    closeAllModals: appSync.closeAllModals.bind(appSync),
    addToRetryQueue: appSync.addToRetryQueue.bind(appSync),
    getConnectionState: appSync.getConnectionState.bind(appSync),
    createRealtimeSubscription: appSync.createRealtimeSubscription.bind(appSync),
    removeRealtimeSubscription: appSync.removeRealtimeSubscription.bind(appSync)
  };
};

// Initialize connection handling when module loads
if (typeof window !== 'undefined') {
  appSync.initializeConnectionHandling();
}