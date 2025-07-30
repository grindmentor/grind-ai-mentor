// Resource preloader for instant loading
class ResourcePreloader {
  private preloadedResources = new Set<string>();
  
  constructor() {
    this.preloadCriticalResources();
  }

  private preloadCriticalResources() {
    // Preload critical CSS
    this.preloadCSS([
      'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
    ]);

    // Preload critical images
    this.preloadImages([
      '/icon-512.png',
      '/icon-192.png'
    ]);

    // Preload critical routes
    this.preloadRoutes([
      '/app',
      '/modules'
    ]);
  }

  private preloadCSS(urls: string[]) {
    urls.forEach(url => {
      if (!this.preloadedResources.has(url)) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'style';
        link.href = url;
        link.onload = () => {
          link.rel = 'stylesheet';
        };
        document.head.appendChild(link);
        this.preloadedResources.add(url);
      }
    });
  }

  private preloadImages(urls: string[]) {
    urls.forEach(url => {
      if (!this.preloadedResources.has(url)) {
        const img = new Image();
        img.src = url;
        this.preloadedResources.add(url);
      }
    });
  }

  private preloadRoutes(routes: string[]) {
    if ('caches' in window) {
      caches.open('myotopia-routes-v1').then(cache => {
        routes.forEach(route => {
          if (!this.preloadedResources.has(route)) {
            cache.add(route).catch(() => {});
            this.preloadedResources.add(route);
          }
        });
      });
    }
  }

  // Preload additional resources
  preloadResource(url: string, type: 'style' | 'script' | 'image' | 'route' = 'script') {
    if (this.preloadedResources.has(url)) return;

    switch (type) {
      case 'style':
        this.preloadCSS([url]);
        break;
      case 'image':
        this.preloadImages([url]);
        break;
      case 'route':
        this.preloadRoutes([url]);
        break;
      case 'script':
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'script';
        link.href = url;
        document.head.appendChild(link);
        this.preloadedResources.add(url);
        break;
    }
  }
}

// Initialize resource preloader
export const resourcePreloader = new ResourcePreloader();