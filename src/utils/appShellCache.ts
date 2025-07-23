// App Shell Cache for instant loading
const CACHE_NAME = 'myotopia-shell-v1';
const CRITICAL_RESOURCES = [
  '/',
  '/app',
  '/static/js/main.js',
  '/static/css/main.css'
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
        
        // Cache critical shell resources
        await cache.addAll(CRITICAL_RESOURCES);
        
        // Preload fonts instantly
        const fontLinks = document.querySelectorAll('link[rel="preload"][as="font"]');
        const fontUrls = Array.from(fontLinks).map(link => (link as HTMLLinkElement).href);
        if (fontUrls.length > 0) {
          await cache.addAll(fontUrls);
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