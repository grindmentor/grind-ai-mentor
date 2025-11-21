
// Performance monitor initialization
import { performanceMonitor } from '@/utils/performance';
import { logger } from '@/utils/logger';

// Start app loading measurement
performanceMonitor.startMeasure('app-startup');

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/mobile-optimizations.css'
import './styles/mobile-performance.css'
import './styles/mobile-touch.css'
import App from './App.tsx'
import { finalizeProdOptimizations } from './utils/performance'
finalizeProdOptimizations();
import { PerformanceProvider } from '@/components/ui/performance-provider'
import { loadAppShell } from '@/utils/appShellCache'

// Instant app shell initialization
loadAppShell();

// Mobile-optimized PWA registration
if ('serviceWorker' in navigator && !window.matchMedia('(display-mode: standalone)').matches) {
  // Only register service worker if not in Capacitor/standalone mode
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      });
      
      logger.info('SW registered:', registration);
      
      // Simplified update handling for mobile
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              newWorker.postMessage({ type: 'SKIP_WAITING' });
              setTimeout(() => window.location.reload(), 1000);
            }
          });
        }
      });
      
    } catch (error) {
      logger.warn('SW registration failed:', error);
    }
  });
}

// Mobile-optimized install prompts
let deferredPrompt: any;
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
const isInStandaloneMode = ('standalone' in window.navigator) && (window.navigator as any).standalone;
const isCapacitor = !!(window as any).Capacitor;

// Don't show install prompts if running in Capacitor
if (!isCapacitor) {

// Optimized iOS install prompt with better performance
function createIOSInstallPrompt() {
  if (isIOS && !isInStandaloneMode) {
    // Use requestIdleCallback for non-critical UI
    const createPrompt = () => {
      const iosPrompt = document.createElement('div');
      iosPrompt.className = 'fixed bottom-4 left-4 right-4 z-50 bg-gradient-to-r from-orange-500 to-red-600 text-white p-3 rounded-xl shadow-2xl flex items-center justify-between transform transition-all duration-300 animate-slide-up';
      iosPrompt.innerHTML = `
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-sm">📱</div>
          <div class="min-w-0 flex-1">
            <div class="font-semibold text-sm">Install Myotopia</div>
            <div class="text-xs opacity-90 truncate">Tap Share → Add to Home Screen</div>
          </div>
        </div>
        <button class="bg-white/20 hover:bg-white/30 px-2 py-1 rounded text-xs font-medium transition-colors shrink-0" onclick="this.parentElement.remove()">✕</button>
      `;
      
      document.body.appendChild(iosPrompt);
      
      // Auto-hide after 8 seconds (reduced for better UX)
      setTimeout(() => {
        if (iosPrompt.parentNode) {
          iosPrompt.style.opacity = '0';
          iosPrompt.style.transform = 'translateY(100%)';
          setTimeout(() => iosPrompt.remove(), 300);
        }
      }, 8000);
    };

    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(createPrompt);
    } else {
      setTimeout(createPrompt, 1500);
    }
    
    return true;
  }
  return false;
}

// Ultra-fast PWA install prompt
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  
  if (isIOS) return;
  
  // Use requestIdleCallback for non-critical UI
  const createInstallButton = () => {
    const installButton = document.createElement('button');
    installButton.className = 'fixed bottom-4 right-4 z-50 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-3 py-2 rounded-xl shadow-lg flex items-center gap-2 text-sm font-medium transition-all duration-200 transform hover:scale-105 touch-manipulation animate-slide-up';
    installButton.innerHTML = '📱 Install App';
    
    installButton.onclick = async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        logger.info(`Install outcome: ${outcome}`);
        deferredPrompt = null;
        installButton.remove();
      }
    };
    
    document.body.appendChild(installButton);
    
    // Auto-hide after 8 seconds (reduced for better UX)
    setTimeout(() => {
      if (installButton && installButton.parentNode) {
        installButton.style.opacity = '0';
        installButton.style.transform = 'translateY(100%)';
        setTimeout(() => installButton.remove(), 300);
      }
    }, 8000);
  };

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(createInstallButton);
  } else {
    setTimeout(createInstallButton, 100);
  }
});

  window.addEventListener('appinstalled', () => {
    logger.info('Myotopia PWA installed successfully');
    deferredPrompt = null;
  });

  if (isIOS) {
    setTimeout(createIOSInstallPrompt, 1000);
  }
}


if (isIOS && !isCapacitor) {
  // Prevent double-tap zoom
  let lastTouchEnd = 0;
  document.addEventListener('touchend', (event) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
      event.preventDefault();
    }
    lastTouchEnd = now;
  }, { passive: false });
  
  // Safe area handling
  document.addEventListener('DOMContentLoaded', () => {
    const root = document.getElementById('root');
    if (root) {
      root.style.paddingTop = 'env(safe-area-inset-top)';
      root.style.paddingBottom = 'env(safe-area-inset-bottom)';
      root.style.paddingLeft = 'env(safe-area-inset-left)';
      root.style.paddingRight = 'env(safe-area-inset-right)';
    }
  });
}

// Network status monitoring
function updateOnlineStatus() {
  const isOnline = navigator.onLine;
  window.dispatchEvent(new CustomEvent('networkstatus', { 
    detail: { online: isOnline } 
  }));
}

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

// Ultra-optimized font preloading with performance monitoring
const criticalFonts = [
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&display=swap'
];

criticalFonts.forEach((fontUrl, index) => {
  // Stagger font loading to avoid blocking
  setTimeout(() => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    link.href = fontUrl;
    link.onload = () => {
      link.rel = 'stylesheet';
    };
    document.head.appendChild(link);
  }, index * 50);
});

// Smart preloading - only preload on user interaction
if (typeof window !== 'undefined') {
  // Preload critical components on hover/focus for instant navigation
  const setupSmartPreloading = () => {
    const navLinks = document.querySelectorAll('a[href^="/"], button[data-preload]');
    
    navLinks.forEach(link => {
      const preloadModule = () => {
        const href = link.getAttribute('href') || link.getAttribute('data-preload');
        if (!href) return;
        
        // Map routes to their lazy-loaded components
        const preloadMap: { [key: string]: () => Promise<any> } = {
          '/app': () => import('./pages/App'),
          '/workout-logger': () => import('./pages/WorkoutLogger'),
          '/settings': () => import('./pages/Settings'),
          '/profile': () => import('./pages/Profile'),
        };
        
        const importFn = preloadMap[href];
        if (importFn) {
          importFn().catch(() => {});
        }
      };
      
      // Preload on hover (desktop) or touchstart (mobile)
      link.addEventListener('mouseenter', preloadModule, { once: true, passive: true });
      link.addEventListener('touchstart', preloadModule, { once: true, passive: true });
    });
  };
  
  // Set up smart preloading after initial render
  if ('requestIdleCallback' in window) {
    requestIdleCallback(setupSmartPreloading);
  } else {
    setTimeout(setupSmartPreloading, 1000);
  }
}

// Performance measurement
const appStart = performance.now();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PerformanceProvider>
      <App />
    </PerformanceProvider>
  </StrictMode>,
);

// End app loading measurement and log total app initialization time
performanceMonitor.endMeasure('app-startup');

window.addEventListener('load', () => {
  const totalTime = performance.now() - appStart;
  logger.perf('app-initialization', totalTime);
});
