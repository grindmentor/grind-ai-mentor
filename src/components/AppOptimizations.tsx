import { useEffect } from 'react';

// Global app optimizations component
export const AppOptimizations = () => {
  useEffect(() => {
    // Optimize images and resources
    const optimizeImages = () => {
      const images = document.querySelectorAll('img');
      images.forEach(img => {
        // Add loading="lazy" if not set
        if (!img.hasAttribute('loading')) {
          img.setAttribute('loading', 'lazy');
        }
        // Add decoding="async" for better performance
        if (!img.hasAttribute('decoding')) {
          img.setAttribute('decoding', 'async');
        }
      });
    };

    // Optimize fonts
    const optimizeFonts = () => {
      // Preload critical fonts
      const fontPreloads = [
        { href: '/fonts/inter-var.woff2', type: 'font/woff2' }
      ];
      
      fontPreloads.forEach(font => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = font.href;
        link.as = 'font';
        link.type = font.type;
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
      });
    };

    // Prefetch critical routes
    const prefetchRoutes = () => {
      const criticalRoutes = ['/app', '/modules', '/settings'];
      
      criticalRoutes.forEach(route => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = route;
        document.head.appendChild(link);
      });
    };

    // Initialize optimizations
    const timer = setTimeout(() => {
      optimizeImages();
      optimizeFonts();
      prefetchRoutes();
    }, 100);

    // Observe new images being added
    const observer = new MutationObserver(() => {
      optimizeImages();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  return null;
};