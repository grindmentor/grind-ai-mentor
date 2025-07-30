// App Shell Cache for instant loading
const CACHE_NAME = 'myotopia-shell-v1';
const CRITICAL_RESOURCES = [
  '/',
  '/app'
];

export class AppShellCache {
  private static instance: AppShellCache;
  
  static getInstance(): AppShellCache {
    if (!AppShellCache.instance) {
      AppShellCache.instance = new AppShellCache();
    }
    return AppShellCache.instance;
  }

  async preloadCriticalResources() {
    if ('serviceWorker' in navigator && 'caches' in window) {
      try {
        const cache = await caches.open(CACHE_NAME);
        
        // Cache only essential routes, not static assets
        for (const resource of CRITICAL_RESOURCES) {
          try {
            await cache.add(resource);
          } catch (error) {
            console.warn(`Failed to cache ${resource}:`, error);
            // Continue with other resources even if one fails
          }
        }
        
        console.log('App shell cached successfully');
      } catch (error) {
        console.warn('App shell caching failed:', error);
      }
    }
  }

  async getCachedResponse(request: Request): Promise<Response | null> {
    if ('caches' in window) {
      const cache = await caches.open(CACHE_NAME);
      return cache.match(request);
    }
    return null;
  }

  async warmupNextPage(url: string) {
    if ('caches' in window) {
      try {
        const cache = await caches.open(CACHE_NAME);
        await cache.add(url);
      } catch (error) {
        console.warn('Page warmup failed:', error);
      }
    }
  }

  // Aggressive background preloading
  async backgroundPreload() {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(async () => {
        const commonRoutes = ['/settings', '/profile', '/pricing'];
        const cache = await caches.open(CACHE_NAME);
        
        for (const route of commonRoutes) {
          try {
            await cache.add(route);
          } catch (error) {
            console.warn(`Failed to preload ${route}:`, error);
          }
        }
      });
    }
  }
}

// Instant shell loader
export const loadAppShell = () => {
  const shellCache = AppShellCache.getInstance();
  
  // Start preloading immediately
  shellCache.preloadCriticalResources();
  
  // Background preload when idle
  if (document.readyState === 'complete') {
    shellCache.backgroundPreload();
  } else {
    window.addEventListener('load', () => shellCache.backgroundPreload());
  }
};