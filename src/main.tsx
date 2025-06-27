
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Enhanced PWA registration with comprehensive offline support
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
      
      // Listen for service worker messages
      navigator.serviceWorker.addEventListener('message', (event) => {
        console.log('Message from service worker:', event.data);
        
        if (event.data.type === 'OFFLINE_REQUEST_SYNCED') {
          // Show success notification when offline requests are synced
          const event = new CustomEvent('offlineRequestSynced', {
            detail: { url: event.data.url, method: event.data.method }
          });
          window.dispatchEvent(event);
        }
        
        if (event.data.type === 'BACKGROUND_SYNC_COMPLETE') {
          console.log('Background sync completed at:', new Date(event.data.timestamp));
        }
      });
      
      // Request persistent storage for better offline experience
      if ('storage' in navigator && 'persist' in navigator.storage) {
        const persistent = await navigator.storage.persist();
        console.log('Persistent storage:', persistent);
      }
      
    } catch (error) {
      console.log('SW registration failed:', error);
    }
  });
}

// Enhanced install prompt with better UX
let deferredPrompt: any;
let installButton: HTMLButtonElement | null = null;

// iOS-specific install detection
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
const isInStandaloneMode = ('standalone' in window.navigator) && (window.navigator as any).standalone;

function createIOSInstallPrompt() {
  if (isIOS && !isInStandaloneMode) {
    const iosPrompt = document.createElement('div');
    iosPrompt.className = 'fixed bottom-6 left-6 right-6 z-50 bg-gradient-to-r from-orange-500 to-red-600 text-white p-4 rounded-xl shadow-2xl flex items-center justify-between animate-slideUp';
    iosPrompt.innerHTML = `
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
          🏋️‍♂️
        </div>
        <div>
          <div class="font-semibold text-sm">Install Myotopia</div>
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
  installButton.className = 'fixed bottom-6 right-6 z-50 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm font-medium transition-all duration-300 transform hover:scale-105 animate-slideUp';
  installButton.innerHTML = '🏋️‍♂️ Install Myotopia';
  
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
  console.log('Myotopia PWA installed successfully');
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

// Performance optimizations for mobile
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

// Enhanced network status monitoring for better offline UX
function updateOnlineStatus() {
  const isOnline = navigator.onLine;
  const event = new CustomEvent('networkstatus', { 
    detail: { online: isOnline } 
  });
  window.dispatchEvent(event);
  
  // Show user-friendly offline/online notifications
  if (!isOnline) {
    console.log('App is offline - using cached content');
    showOfflineNotification();
  } else {
    console.log('App is online - syncing data');
    hideOfflineNotification();
  }
}

function showOfflineNotification() {
  const existingNotification = document.getElementById('offline-notification');
  if (existingNotification) return;
  
  const notification = document.createElement('div');
  notification.id = 'offline-notification';
  notification.className = 'fixed top-4 left-4 right-4 z-50 bg-yellow-600 text-white p-3 rounded-lg shadow-lg flex items-center gap-2 animate-slideDown';
  notification.innerHTML = `
    <span>⚡</span>
    <span class="flex-1 text-sm font-medium">You're offline. Changes will sync when you're back online.</span>
  `;
  document.body.appendChild(notification);
}

function hideOfflineNotification() {
  const notification = document.getElementById('offline-notification');
  if (notification) {
    notification.style.opacity = '0';
    notification.style.transform = 'translateY(-100%)';
    setTimeout(() => notification.remove(), 300);
  }
}

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

// Push notification setup
async function setupPushNotifications() {
  if ('Notification' in window && 'serviceWorker' in navigator) {
    // Request notification permission
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('Notification permission granted');
      
      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;
      
      // Subscribe to push notifications
      try {
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: null // You would add your VAPID key here
        });
        
        console.log('Push subscription:', subscription);
        
        // Send subscription to your backend
        // await fetch('/api/push-subscribe', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(subscription)
        // });
        
      } catch (error) {
        console.log('Push subscription failed:', error);
      }
    }
  }
}

// Set up push notifications after app loads
window.addEventListener('load', () => {
  setTimeout(setupPushNotifications, 2000);
});

// Initial network status check
updateOnlineStatus();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
