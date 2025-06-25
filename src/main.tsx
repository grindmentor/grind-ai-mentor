
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Enhanced PWA registration with iOS optimizations
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      });
      
      console.log('SW registered successfully:', registration);
      
      // Handle service worker updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content is available, prompt user to update
              if (confirm('New version available! Reload to update?')) {
                newWorker.postMessage({ type: 'SKIP_WAITING' });
                window.location.reload();
              }
            }
          });
        }
      });
      
      // Listen for controlling service worker changes
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
      
    } catch (error) {
      console.log('SW registration failed:', error);
    }
  });
}

// Enhanced iOS PWA install prompt
let deferredPrompt: any;
let installButton: HTMLButtonElement | null = null;

// iOS-specific install detection
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
const isInStandaloneMode = ('standalone' in window.navigator) && (window.navigator as any).standalone;

function createIOSInstallPrompt() {
  if (isIOS && !isInStandaloneMode) {
    const iosPrompt = document.createElement('div');
    iosPrompt.className = 'fixed bottom-6 left-6 right-6 z-50 bg-gradient-to-r from-orange-500 to-red-600 text-white p-4 rounded-xl shadow-2xl flex items-center justify-between';
    iosPrompt.innerHTML = `
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
          📱
        </div>
        <div>
          <div class="font-semibold text-sm">Install GrindMentor</div>
          <div class="text-xs opacity-90">Tap Share → Add to Home Screen</div>
        </div>
      </div>
      <button class="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200" onclick="this.parentElement.remove()">
        ✕
      </button>
    `;
    
    document.body.appendChild(iosPrompt);
    
    // Auto-hide after 15 seconds
    setTimeout(() => {
      if (iosPrompt.parentNode) {
        iosPrompt.style.opacity = '0';
        iosPrompt.style.transform = 'translateY(100%)';
        setTimeout(() => iosPrompt.remove(), 300);
      }
    }, 15000);
    
    return iosPrompt;
  }
  return null;
}

// Standard PWA install prompt
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  
  // Don't show standard prompt on iOS devices
  if (isIOS) return;
  
  // Create modern install button for non-iOS devices
  installButton = document.createElement('button');
  installButton.className = 'fixed bottom-6 right-6 z-50 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm font-medium transition-all duration-300 transform hover:scale-105';
  installButton.innerHTML = '📱 Install App';
  
  installButton.onclick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`Install prompt outcome: ${outcome}`);
      deferredPrompt = null;
      if (installButton) {
        installButton.remove();
        installButton = null;
      }
    }
  };
  
  // Show on devices that support standard install prompt
  document.body.appendChild(installButton);
  
  // Auto-hide after 15 seconds
  setTimeout(() => {
    if (installButton && installButton.parentNode) {
      installButton.style.opacity = '0';
      installButton.style.transform = 'translateY(100%)';
      setTimeout(() => {
        if (installButton) {
          installButton.remove();
          installButton = null;
        }
      }, 300);
    }
  }, 15000);
});

// Handle successful app installation
window.addEventListener('appinstalled', () => {
  console.log('GrindMentor PWA installed successfully');
  deferredPrompt = null;
  if (installButton) {
    installButton.remove();
    installButton = null;
  }
});

// iOS-specific optimizations
if (isIOS) {
  // Show iOS install prompt after a delay
  setTimeout(() => {
    createIOSInstallPrompt();
  }, 3000);
  
  // Prevent zoom on double tap
  let lastTouchEnd = 0;
  document.addEventListener('touchend', (event) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
      event.preventDefault();
    }
    lastTouchEnd = now;
  }, false);
  
  // Handle iOS safe areas
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

// Performance optimizations for iOS
if (isIOS) {
  // Preload critical resources
  const criticalResources = [
    '/src/index.css',
    '/icon-192.png'
  ];
  
  criticalResources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource;
    link.as = resource.endsWith('.css') ? 'style' : 'image';
    document.head.appendChild(link);
  });
}

// Network status monitoring for offline functionality
function updateOnlineStatus() {
  const isOnline = navigator.onLine;
  const event = new CustomEvent('networkstatus', { 
    detail: { online: isOnline } 
  });
  window.dispatchEvent(event);
  
  if (!isOnline) {
    console.log('App is offline - using cached content');
  } else {
    console.log('App is online - syncing data');
  }
}

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

// Initial network status check
updateOnlineStatus();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
