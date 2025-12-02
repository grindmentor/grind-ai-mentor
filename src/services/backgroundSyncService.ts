import { supabase } from '@/integrations/supabase/client';

// Types for sync items
interface SyncItem {
  id: string;
  action: string;
  data: any;
  timestamp: number;
  retries: number;
  userId?: string;
}

// Background sync service for offline data synchronization
export class BackgroundSyncService {
  private static instance: BackgroundSyncService;
  private isSyncing = false;
  private listeners: Set<(status: SyncStatus) => void> = new Set();

  private constructor() {
    this.initializeBackgroundSync();
    this.setupOnlineListener();
    this.setupServiceWorkerListener();
  }

  static getInstance(): BackgroundSyncService {
    if (!BackgroundSyncService.instance) {
      BackgroundSyncService.instance = new BackgroundSyncService();
    }
    return BackgroundSyncService.instance;
  }

  private setupOnlineListener() {
    window.addEventListener('online', () => {
      console.log('[BackgroundSync] Back online, processing queue...');
      this.processQueue();
    });
  }

  private setupServiceWorkerListener() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data?.type === 'SYNC_REQUESTED') {
          console.log('[BackgroundSync] SW requested sync:', event.data.syncType);
          this.processQueue();
        }
        if (event.data?.type === 'REFRESH_DATA') {
          console.log('[BackgroundSync] SW requested data refresh');
          this.notifyListeners();
        }
      });
    }
  }

  private async initializeBackgroundSync() {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await this.registerSyncEvents(registration);
        console.log('[BackgroundSync] Service initialized');
      } catch (error) {
        console.warn('[BackgroundSync] Failed to initialize:', error);
      }
    }
  }

  private async registerSyncEvents(registration: ServiceWorkerRegistration) {
    const syncTags = ['workout-sync', 'food-log-sync', 'recovery-sync'];
    for (const tag of syncTags) {
      try {
        await (registration as any).sync?.register(tag);
      } catch (error) {
        // Sync API not available, will use online event
      }
    }
  }

  // Subscribe to sync status updates
  subscribe(callback: (status: SyncStatus) => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners() {
    const status = this.getSyncStatus();
    this.listeners.forEach(cb => cb(status));
  }

  // Generate unique ID for sync items
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Queue data for background sync
  async queueForSync(action: string, data: any, userId?: string): Promise<void> {
    const syncItem: SyncItem = {
      id: this.generateId(),
      action,
      data,
      timestamp: Date.now(),
      retries: 0,
      userId
    };

    const queue = this.getQueue();
    queue.push(syncItem);
    this.saveQueue(queue);
    this.notifyListeners();

    console.log(`[BackgroundSync] Queued: ${action}`, { itemId: syncItem.id });

    // Try to sync immediately if online
    if (navigator.onLine) {
      await this.processQueue();
    } else {
      // Request background sync
      try {
        const registration = await navigator.serviceWorker.ready;
        await (registration as any).sync?.register(`${action}-sync`);
      } catch { }
    }
  }

  private getQueue(): SyncItem[] {
    try {
      return JSON.parse(localStorage.getItem('offlineSyncQueue') || '[]');
    } catch {
      return [];
    }
  }

  private saveQueue(queue: SyncItem[]) {
    localStorage.setItem('offlineSyncQueue', JSON.stringify(queue));
  }

  // Process the sync queue
  async processQueue(): Promise<{ success: number; failed: number }> {
    if (this.isSyncing || !navigator.onLine) {
      return { success: 0, failed: 0 };
    }

    this.isSyncing = true;
    this.notifyListeners();

    const queue = this.getQueue();
    if (queue.length === 0) {
      this.isSyncing = false;
      return { success: 0, failed: 0 };
    }

    console.log(`[BackgroundSync] Processing ${queue.length} items...`);

    let success = 0;
    let failed = 0;
    const processedIds: string[] = [];
    const failedItems: SyncItem[] = [];

    for (const item of queue) {
      try {
        await this.syncItem(item);
        processedIds.push(item.id);
        success++;
        console.log(`[BackgroundSync] Synced: ${item.action}`, item.id);
      } catch (error) {
        console.error(`[BackgroundSync] Failed: ${item.action}`, error);
        item.retries++;

        // Keep item if under retry limit and not too old
        const isOld = Date.now() - item.timestamp > 7 * 24 * 60 * 60 * 1000;
        if (item.retries < 5 && !isOld) {
          failedItems.push(item);
        } else {
          processedIds.push(item.id);
          console.warn(`[BackgroundSync] Dropped item after ${item.retries} retries:`, item.action);
        }
        failed++;
      }
    }

    // Update queue with remaining failed items
    const remainingQueue = queue.filter(item =>
      !processedIds.includes(item.id) || failedItems.some(f => f.id === item.id)
    );
    this.saveQueue(failedItems);

    localStorage.setItem('lastSyncTime', Date.now().toString());
    this.isSyncing = false;
    this.notifyListeners();

    console.log(`[BackgroundSync] Complete: ${success} synced, ${failed} failed`);
    return { success, failed };
  }

  private async syncItem(item: SyncItem): Promise<void> {
    const { action, data, userId } = item;

    switch (action) {
      case 'workout-save':
        await this.syncWorkout(data, userId);
        break;
      case 'food-log':
        await this.syncFoodLog(data, userId);
        break;
      case 'recovery-data':
        await this.syncRecoveryData(data, userId);
        break;
      case 'progress-entry':
        await this.syncProgressEntry(data, userId);
        break;
      case 'goal-update':
        await this.syncGoalUpdate(data, userId);
        break;
      default:
        console.warn(`[BackgroundSync] Unknown action: ${action}`);
    }
  }

  private async syncWorkout(data: any, userId?: string): Promise<void> {
    if (!userId) throw new Error('User ID required for workout sync');

    const { error } = await supabase
      .from('workout_sessions')
      .upsert({
        ...data,
        user_id: userId,
        created_at: data.created_at || new Date().toISOString()
      }, { onConflict: 'id' });

    if (error) throw error;
  }

  private async syncFoodLog(data: any, userId?: string): Promise<void> {
    if (!userId) throw new Error('User ID required for food log sync');

    const { error } = await supabase
      .from('food_log_entries')
      .upsert({
        ...data,
        user_id: userId,
        created_at: data.created_at || new Date().toISOString()
      }, { onConflict: 'id' });

    if (error) throw error;
  }

  private async syncRecoveryData(data: any, userId?: string): Promise<void> {
    if (!userId) throw new Error('User ID required for recovery sync');

    const { error } = await supabase
      .from('recovery_data')
      .upsert({
        ...data,
        user_id: userId
      }, { onConflict: 'id' });

    if (error) throw error;
  }

  private async syncProgressEntry(data: any, userId?: string): Promise<void> {
    if (!userId) throw new Error('User ID required for progress sync');

    const { error } = await supabase
      .from('progressive_overload_entries')
      .upsert({
        ...data,
        user_id: userId
      }, { onConflict: 'id' });

    if (error) throw error;
  }

  private async syncGoalUpdate(data: any, userId?: string): Promise<void> {
    if (!userId) throw new Error('User ID required for goal sync');

    const { error } = await supabase
      .from('user_goals')
      .upsert({
        ...data,
        user_id: userId
      }, { onConflict: 'id' });

    if (error) throw error;
  }

  // Get sync queue status
  getSyncStatus(): SyncStatus {
    const queue = this.getQueue();
    const lastSync = localStorage.getItem('lastSyncTime');

    return {
      pending: queue.length,
      lastSync: lastSync ? parseInt(lastSync) : null,
      isSyncing: this.isSyncing,
      isOnline: navigator.onLine
    };
  }

  // Force sync now
  async forceSync(): Promise<{ success: number; failed: number }> {
    if (!navigator.onLine) {
      throw new Error('Cannot sync while offline');
    }
    return this.processQueue();
  }

  // Alias for backward compatibility
  async forcSync(): Promise<void> {
    await this.forceSync();
  }

  // Clear all pending items
  clearQueue(): void {
    localStorage.removeItem('offlineSyncQueue');
    this.notifyListeners();
  }
}

export interface SyncStatus {
  pending: number;
  lastSync: number | null;
  isSyncing: boolean;
  isOnline: boolean;
}

// Export singleton instance
export const backgroundSync = BackgroundSyncService.getInstance();
