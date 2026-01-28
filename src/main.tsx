// Performance instrumentation
import { perfMetrics } from '@/utils/performanceMetrics';

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/mobile-touch.css'
import './styles/ios-safe-area.css'
import App from './App.tsx'
import { PerformanceProvider } from '@/components/ui/performance-provider'
import { preloadCriticalRoutes, setupLinkPreloading } from '@/utils/routePreloader'

// Service worker for offline support - register immediately for caching
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(() => {});
}

// PWA install prompts
let deferredPrompt: any;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
});

// iOS double-tap zoom prevention
if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
  let lastTouchEnd = 0;
  document.addEventListener('touchend', (event) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
      event.preventDefault();
    }
    lastTouchEnd = now;
  }, { passive: false });
}

// Render immediately
const root = createRoot(document.getElementById('root')!);
root.render(
  <StrictMode>
    <PerformanceProvider>
      <App />
    </PerformanceProvider>
  </StrictMode>,
);

// Mark app ready after first render
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    perfMetrics.markAppReady();
  });
});

// Post-render optimizations (non-blocking)
if ('requestIdleCallback' in window) {
  requestIdleCallback(() => {
    // Preload critical routes after initial render
    preloadCriticalRoutes();
    // Setup hover preloading for instant navigation
    setupLinkPreloading();
  }, { timeout: 2000 });
} else {
  setTimeout(() => {
    preloadCriticalRoutes();
    setupLinkPreloading();
  }, 100);
}

// Development performance logging
if (import.meta.env.DEV) {
  // Print performance report after 10 seconds
  setTimeout(() => {
    perfMetrics.printReport();
  }, 10000);
}
