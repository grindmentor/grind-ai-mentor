
// Performance monitor initialization
import { performanceMonitor } from '@/utils/performanceMonitor';

// Start app loading measurement
performanceMonitor.startMeasure('app-startup');

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import "./utils/prodOptimizations.ts"
import './utils/lcp-optimization.ts'
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
      
      console.log('SW registered:', registration);
      
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
      console.log('SW registration failed:', error);
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
    
    // Create elements safely without innerHTML
    const contentDiv = document.createElement('div');
    contentDiv.className = 'flex items-center gap-3';
    
    const iconDiv = document.createElement('div');
    iconDiv.className = 'w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-sm';
    iconDiv.textContent = '📱';
    
    const textContainer = document.createElement('div');
    textContainer.className = 'min-w-0 flex-1';
    
    const titleDiv = document.createElement('div');
    titleDiv.className = 'font-semibold text-sm';
    titleDiv.textContent = 'Install Myotopia';
    
    const subtitleDiv = document.createElement('div');
    subtitleDiv.className = 'text-xs opacity-90 truncate';
    subtitleDiv.textContent = 'Tap Share → Add to Home Screen';
    
    const closeButton = document.createElement('button');
    closeButton.className = 'bg-white/20 hover:bg-white/30 px-2 py-1 rounded text-xs font-medium transition-colors shrink-0';
    closeButton.textContent = '✕';
    closeButton.onclick = () => iosPrompt.remove();
    
    textContainer.appendChild(titleDiv);
    textContainer.appendChild(subtitleDiv);
    contentDiv.appendChild(iconDiv);
    contentDiv.appendChild(textContainer);
    iosPrompt.appendChild(contentDiv);
    iosPrompt.appendChild(closeButton);
      
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
    installButton.textContent = '📱 Install App';
    
    installButton.onclick = async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`Install outcome: ${outcome}`);
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
    console.log('Myotopia PWA installed successfully');
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

// Optimize font loading to reduce critical path blocking
if (typeof window !== 'undefined') {
  const optimizedFontLoad = () => {
    // Only load Inter for critical text, defer Orbitron
    const criticalFont = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap';
    const decorativeFont = 'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&display=swap';

    // Load critical font immediately
    const criticalLink = document.createElement('link');
    criticalLink.rel = 'stylesheet';
    criticalLink.href = criticalFont;
    document.head.appendChild(criticalLink);

    // Defer decorative font to avoid blocking
    setTimeout(() => {
      const decorativeLink = document.createElement('link');
      decorativeLink.rel = 'stylesheet';
      decorativeLink.href = decorativeFont;
      decorativeLink.media = 'print';
      decorativeLink.onload = () => {
        decorativeLink.media = 'all';
      };
      document.head.appendChild(decorativeLink);
    }, 1000);
  };

  // Load fonts after critical path
  setTimeout(optimizedFontLoad, 300);
}

// Defer all non-critical component preloading until after critical path
if (typeof window !== 'undefined') {
  // Only preload after the page is fully interactive to avoid blocking critical requests
  const deferredPreload = () => {
    // Only load the most critical components, defer the rest
    const criticalImports = [
      () => import('./components/ui/loading-screen'), // Essential for UX
      () => import('./components/Dashboard'), // Main app component
    ];

    const nonCriticalImports = [
      () => import('./components/ai-modules/CoachGPT'),
      () => import('./components/ai-modules/SmartTraining'),
      () => import('./components/ai-modules/WorkoutLoggerAI'),
      () => import('./components/ai-modules/TDEECalculator'),
      () => import('./components/ai-modules/ProgressHub'),
      () => import('./components/ai-modules/BlueprintAI')
    ];

    // Load critical components first
    criticalImports.forEach((importFn, index) => {
      setTimeout(() => {
        importFn().catch(() => {});
      }, 500 + (index * 100)); // Start after 500ms
    });

    // Load non-critical components much later to avoid interfering with critical path
    nonCriticalImports.forEach((importFn, index) => {
      setTimeout(() => {
        importFn().catch(() => {});
      }, 2000 + (index * 200)); // Start after 2 seconds
    });
  };

  // Wait much longer before any preloading to ensure critical path completes
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(deferredPreload, { timeout: 2000 });
  } else {
    setTimeout(deferredPreload, 1500);
  }
}

// Performance measurement
const appStart = performance.now();

// Hide loading indicator and skeleton immediately when React starts
const loadingElement = document.getElementById('app-loading');
const heroSkeleton = document.getElementById('hero-skeleton');

if (loadingElement) {
  loadingElement.style.display = 'none';
}

// Keep skeleton visible until React content renders
if (heroSkeleton) {
  // Will be hidden by the observer in index.html once React content appears
}

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
  console.log(`[Performance] Total app initialization: ${totalTime.toFixed(2)}ms`);
});
