
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { PerformanceProvider } from '@/components/ui/performance-provider'
import { loadAppShell } from '@/utils/appShellCache'

// Instant app shell initialization
loadAppShell();

// Ultra-optimized PWA registration with performance monitoring
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      // Start performance timer
      const swStart = performance.now();
      
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      });
      
      console.log(`SW registered in ${(performance.now() - swStart).toFixed(2)}ms:`, registration);
      
      // Ultra-optimized update handling
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Auto-update without user prompt for better UX
              newWorker.postMessage({ type: 'SKIP_WAITING' });
              setTimeout(() => window.location.reload(), 1000);
            }
          });
        }
      });
      
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
      
    } catch (error) {
      console.log('SW registration failed:', error);
    }
  });
}

// Ultra-optimized install prompts with performance considerations
let deferredPrompt: any;
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
const isInStandaloneMode = ('standalone' in window.navigator) && (window.navigator as any).standalone;

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

// iOS optimizations with better performance
if (isIOS) {
  setTimeout(() => createIOSInstallPrompt(), 1000);
  
  // Prevent double-tap zoom (optimized)
  let lastTouchEnd = 0;
  document.addEventListener('touchend', (event) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
      event.preventDefault();
    }
    lastTouchEnd = now;
  }, { passive: false });
  
  // Optimized safe area handling
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

// Ultra-optimized network status monitoring
function updateOnlineStatus() {
  const isOnline = navigator.onLine;
  window.dispatchEvent(new CustomEvent('networkstatus', { 
    detail: { online: isOnline } 
  }));
  
  if (!isOnline) {
    console.log('App offline - using cached content');
  } else {
    console.log('App online - syncing data');
  }
}

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);
updateOnlineStatus();

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

// Ultra-optimized critical component preloading
if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
  window.requestIdleCallback(() => {
    // Preload critical components in order of importance
    const criticalImports = [
      () => import('./components/Dashboard'),
      () => import('./components/ui/loading-screen'),
      () => import('./components/ai-modules/CoachGPT'),
      () => import('./components/ai-modules/SmartTraining'),
      () => import('./components/ai-modules/WorkoutLoggerAI')
    ];

    criticalImports.forEach((importFn, index) => {
      setTimeout(() => {
        importFn().catch(() => {});
      }, index * 100);
    });
  });
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

// Log total app initialization time
window.addEventListener('load', () => {
  const totalTime = performance.now() - appStart;
  console.log(`[Performance] Total app initialization: ${totalTime.toFixed(2)}ms`);
});
