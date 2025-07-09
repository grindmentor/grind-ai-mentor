// Background sync service for offline data synchronization
export class BackgroundSyncService {
  private static instance: BackgroundSyncService;
  private syncQueue: Array<{ 
    action: string; 
    data: any; 
    timestamp: number; 
    retries: number;
  }> = [];

  private constructor() {
    this.initializeBackgroundSync();
  }

  static getInstance(): BackgroundSyncService {
    if (!BackgroundSyncService.instance) {
      BackgroundSyncService.instance = new BackgroundSyncService();
    }
    return BackgroundSyncService.instance;
  }

  private async initializeBackgroundSync() {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready;
        
        // Register sync events
        await this.registerSyncEvents(registration);
        
        // Setup periodic sync for data updates
        if ('periodicSync' in registration) {
          await this.setupPeriodicSync(registration);
        }

        console.log('Background sync initialized successfully');
      } catch (error) {
        console.error('Failed to initialize background sync:', error);
      }
    }
  }

  private async registerSyncEvents(registration: ServiceWorkerRegistration) {
    // Register different sync tags for different data types
    const syncTags = [
      'workout-sync',
      'food-log-sync', 
      'progress-sync',
      'goal-sync',
      'preference-sync'
    ];

    for (const tag of syncTags) {
      try {
        await (registration as any).sync.register(tag);
      } catch (error) {
        console.warn(`Failed to register sync tag ${tag}:`, error);
      }
    }
  }

  private async setupPeriodicSync(registration: any) {
    try {
      // Request periodic sync for updating dynamic content
      await registration.periodicSync.register('data-refresh', {
        minInterval: 24 * 60 * 60 * 1000, // 24 hours
      });
      
      console.log('Periodic sync registered for data refresh');
    } catch (error) {
      console.warn('Periodic sync not supported or failed:', error);
    }
  }

  // Queue data for background sync
  async queueForSync(action: string, data: any): Promise<void> {
    const syncItem = {
      action,
      data,
      timestamp: Date.now(),
      retries: 0
    };

    // Add to local queue
    this.syncQueue.push(syncItem);
    
    // Store in localStorage for persistence
    const existingQueue = JSON.parse(localStorage.getItem('syncQueue') || '[]');
    existingQueue.push(syncItem);
    localStorage.setItem('syncQueue', JSON.stringify(existingQueue));

    // Try to sync immediately if online
    if (navigator.onLine) {
      await this.processQueue();
    } else {
      // Register for background sync when online
      try {
        const registration = await navigator.serviceWorker.ready;
        await (registration as any).sync.register(`${action}-sync`);
      } catch (error) {
        console.warn('Failed to register background sync:', error);
      }
    }
  }

  // Process the sync queue
  async processQueue(): Promise<void> {
    const queue = JSON.parse(localStorage.getItem('syncQueue') || '[]');
    const processedItems: number[] = [];

    for (let i = 0; i < queue.length; i++) {
      const item = queue[i];
      
      try {
        await this.syncItem(item);
        processedItems.push(i);
        console.log(`Successfully synced ${item.action}:`, item.data);
      } catch (error) {
        console.error(`Failed to sync ${item.action}:`, error);
        
        // Increment retry count
        item.retries = (item.retries || 0) + 1;
        
        // Remove item if too many retries (older than 7 days or 10+ retries)
        const isOld = Date.now() - item.timestamp > 7 * 24 * 60 * 60 * 1000;
        const tooManyRetries = item.retries >= 10;
        
        if (isOld || tooManyRetries) {
          processedItems.push(i);
          console.warn(`Removing failed sync item ${item.action} after ${item.retries} retries`);
        }
      }
    }

    // Remove processed items from queue
    const updatedQueue = queue.filter((_: any, index: number) => !processedItems.includes(index));
    localStorage.setItem('syncQueue', JSON.stringify(updatedQueue));
    this.syncQueue = updatedQueue;
  }

  private async syncItem(item: any): Promise<void> {
    const { action, data } = item;
    
    switch (action) {
      case 'workout-save':
        await this.syncWorkout(data);
        break;
      case 'food-log':
        await this.syncFoodLog(data);
        break;
      case 'progress-update':
        await this.syncProgress(data);
        break;
      case 'goal-update':
        await this.syncGoal(data);
        break;
      case 'preference-update':
        await this.syncPreferences(data);
        break;
      default:
        console.warn(`Unknown sync action: ${action}`);
    }
  }

  private async syncWorkout(data: any): Promise<void> {
    const response = await fetch('/api/workouts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`Workout sync failed: ${response.statusText}`);
    }
  }

  private async syncFoodLog(data: any): Promise<void> {
    const response = await fetch('/api/food-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`Food log sync failed: ${response.statusText}`);
    }
  }

  private async syncProgress(data: any): Promise<void> {
    const response = await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`Progress sync failed: ${response.statusText}`);
    }
  }

  private async syncGoal(data: any): Promise<void> {
    const response = await fetch('/api/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`Goal sync failed: ${response.statusText}`);
    }
  }

  private async syncPreferences(data: any): Promise<void> {
    const response = await fetch('/api/preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`Preferences sync failed: ${response.statusText}`);
    }
  }

  // Get sync queue status
  getSyncStatus(): { pending: number; lastSync: number | null } {
    const queue = JSON.parse(localStorage.getItem('syncQueue') || '[]');
    const lastSync = localStorage.getItem('lastSyncTime');
    
    return {
      pending: queue.length,
      lastSync: lastSync ? parseInt(lastSync) : null
    };
  }

  // Force sync now
  async forcSync(): Promise<void> {
    if (navigator.onLine) {
      await this.processQueue();
      localStorage.setItem('lastSyncTime', Date.now().toString());
    } else {
      throw new Error('Cannot sync while offline');
    }
  }
}

// Export singleton instance
export const backgroundSync = BackgroundSyncService.getInstance();