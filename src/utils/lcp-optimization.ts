// LCP (Largest Contentful Paint) optimization utilities

export const optimizeLCP = () => {
  // Mark the hero section as the LCP candidate
  if (typeof window !== 'undefined') {
    // Use requestIdleCallback to perform non-critical optimizations
    const optimizeLCPElement = () => {
      // Find the main heading element once it's rendered
      const heroHeading = document.querySelector('h1');
      if (heroHeading && 'performance' in window) {
        // Mark as LCP element for browser optimization
        try {
          // Add explicit LCP hint to the browser
          heroHeading.setAttribute('data-lcp-element', 'true');
          
          // Ensure the element is visible and properly styled
          const style = heroHeading.style;
          style.containIntrinsicSize = 'auto';
          style.contentVisibility = 'visible';
          
          // Log LCP timing if available
          if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
              const entries = list.getEntries();
              const lastEntry = entries[entries.length - 1];
              if (lastEntry) {
                console.log(`[LCP] Largest Contentful Paint: ${lastEntry.startTime.toFixed(2)}ms`);
              }
            });
            observer.observe({ entryTypes: ['largest-contentful-paint'] });
          }
        } catch (error) {
          console.warn('LCP optimization failed:', error);
        }
      }
    };

    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(optimizeLCPElement, { timeout: 1000 });
    } else {
      setTimeout(optimizeLCPElement, 100);
    }
  }
};

// Preload critical LCP resources
export const preloadLCPResources = () => {
  if (typeof window !== 'undefined') {
    // Preload critical fonts that might be used in LCP element
    const fontPreloads = [
      'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2',
    ];

    fontPreloads.forEach((fontUrl) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.href = fontUrl;
      link.crossOrigin = 'anonymous';
      link.type = 'font/woff2';
      document.head.appendChild(link);
    });
  }
};

// Initialize LCP optimizations
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    optimizeLCP();
    preloadLCPResources();
  });
}