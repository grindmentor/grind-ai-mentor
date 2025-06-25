
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Register service worker for PWA functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// Enhanced PWA install prompt
let deferredPrompt: any;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  
  // Show modern install button
  const installBtn = document.createElement('button');
  installBtn.className = 'fixed bottom-6 right-6 z-50 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm font-medium transition-all duration-300 transform hover:scale-105';
  installBtn.innerHTML = '📱 Install App';
  installBtn.onclick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to the install prompt: ${outcome}`);
      deferredPrompt = null;
      installBtn.remove();
    }
  };
  
  // Show on mobile and tablet devices
  if (window.innerWidth <= 1024) {
    document.body.appendChild(installBtn);
    
    // Auto-hide after 15 seconds
    setTimeout(() => {
      if (installBtn.parentNode) {
        installBtn.style.opacity = '0';
        installBtn.style.transform = 'translateY(100%)';
        setTimeout(() => installBtn.remove(), 300);
      }
    }, 15000);
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
