// Prefetch utilities for instant navigation

class PrefetchManager {
  private prefetchedRoutes = new Set<string>();
  private prefetchedImages = new Set<string>();
  private observer: IntersectionObserver | null = null;

  constructor() {
    this.initializeObserver();
  }

  private initializeObserver() {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement;
            
            // Prefetch link routes
            if (target.tagName === 'A') {
              const href = target.getAttribute('href');
              if (href && !href.startsWith('http') && !href.startsWith('#')) {
                this.prefetchRoute(href);
              }
            }

            // Prefetch images
            if (target.tagName === 'IMG') {
              const src = target.getAttribute('data-src');
              if (src) {
                this.prefetchImage(src);
              }
            }

            this.observer?.unobserve(target);
          }
        });
      },
      {
        rootMargin: '50px', // Start prefetching 50px before element is visible
      }
    );
  }

  prefetchRoute(route: string) {
    if (this.prefetchedRoutes.has(route)) return;

    // Use resource hints for route prefetching
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = route;
    document.head.appendChild(link);

    this.prefetchedRoutes.add(route);
  }

  prefetchImage(src: string) {
    if (this.prefetchedImages.has(src)) return;

    const img = new Image();
    img.src = src;
    this.prefetchedImages.add(src);
  }

  observeLinks() {
    if (!this.observer) return;

    // Observe all internal links
    const links = document.querySelectorAll('a[href^="/"]');
    links.forEach((link) => this.observer?.observe(link));
  }

  observeImages() {
    if (!this.observer) return;

    // Observe all lazy images
    const images = document.querySelectorAll('img[data-src]');
    images.forEach((img) => this.observer?.observe(img));
  }

  // Prefetch on hover/touch for instant navigation
  setupHoverPrefetch() {
    const handleLinkInteraction = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'A') {
        const href = target.getAttribute('href');
        if (href && !href.startsWith('http') && !href.startsWith('#')) {
          this.prefetchRoute(href);
        }
      }
    };

    // Use capture phase for better performance
    document.addEventListener('mouseover', handleLinkInteraction, { 
      passive: true, 
      capture: true 
    });
    
    document.addEventListener('touchstart', handleLinkInteraction, { 
      passive: true, 
      capture: true 
    });
  }

  cleanup() {
    this.observer?.disconnect();
  }
}

// Singleton instance
export const prefetchManager = new PrefetchManager();

// Initialize prefetching when DOM is ready
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      prefetchManager.setupHoverPrefetch();
      prefetchManager.observeLinks();
      prefetchManager.observeImages();
    });
  } else {
    prefetchManager.setupHoverPrefetch();
    prefetchManager.observeLinks();
    prefetchManager.observeImages();
  }
}
