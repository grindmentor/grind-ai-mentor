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
        
        // Ultra-fast parallel caching
        const cachePromises = CRITICAL_RESOURCES.map(async (resource) => {
          try {
            await cache.add(resource);
          } catch (error) {
            console.warn(`Failed to cache ${resource}:`, error);
          }
        });

        await Promise.allSettled(cachePromises);
        
        // Aggressive background asset caching
        this.cacheStaticAssets(cache);
        
        console.log('App shell cached successfully');
      } catch (error) {
        console.warn('App shell caching failed:', error);
      }
    }
  }

  private async cacheStaticAssets(cache: Cache) {
    // Cache critical assets in background
    const staticAssets = [
      '/manifest.json',
      '/icon-512.png',
      '/icon-192.png'
    ];

    setTimeout(() => {
      staticAssets.forEach(async (asset) => {
        try {
          await cache.add(asset);
        } catch (error) {
          // Silent fail for non-critical assets
        }
      });
    }, 50);
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

  // Ultra-aggressive background preloading
  async backgroundPreload() {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(async () => {
        const commonRoutes = ['/settings', '/profile', '/pricing', '/modules'];
        const cache = await caches.open(CACHE_NAME);
        
        // Parallel route preloading
        const routePromises = commonRoutes.map(async (route) => {
          try {
            await cache.add(route);
          } catch (error) {
            console.warn(`Failed to preload ${route}:`, error);
          }
        });

        await Promise.allSettled(routePromises);
        console.log('Background routes preloaded');
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