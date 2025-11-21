
// Minimal performance tracking
const appStart = performance.now();

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/mobile-touch.css'
import './styles/ios-safe-area.css'
import App from './App.tsx'
import { PerformanceProvider } from '@/components/ui/performance-provider'

// Service worker for offline support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}


// PWA install prompts - lightweight version
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

// Lightweight font loading
const loadFonts = () => {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap';
  document.head.appendChild(link);
};

if ('requestIdleCallback' in window) {
  requestIdleCallback(loadFonts);
} else {
  setTimeout(loadFonts, 1000);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PerformanceProvider>
      <App />
    </PerformanceProvider>
  </StrictMode>,
);
