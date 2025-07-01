const CACHE_NAME = 'myotopia-v4-optimized';
const STATIC_CACHE = 'myotopia-static-v4';
const DYNAMIC_CACHE = 'myotopia-dynamic-v4';
const AI_CACHE = 'myotopia-ai-responses-v2';
const IMAGE_CACHE = 'myotopia-images-v2';

// Critical assets for immediate caching (reduced for faster install)
const CRITICAL_ASSETS = [
  '/',
  '/manifest.json'
];

// Static assets for background caching
const STATIC_ASSETS = [
  '/lovable-uploads/f011887c-b33f-4514-a48a-42a9bbc6251f.png',
  '/favicon-32x32.png',
  '/favicon-16x16.png',
  '/apple-touch-icon.png'
];

// Install with ultra-fast caching strategy
self.addEventListener('install', (event) => {
  console.log('[SW] Installing ultra-optimized service worker...');
  
  event.waitUntil(
    Promise.all([
      // Cache only absolutely critical assets immediately
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('[SW] Caching critical assets');
        return cache.addAll(CRITICAL_ASSETS);
      }),
      // Initialize other caches
      caches.open(DYNAMIC_CACHE),
      caches.open(AI_CACHE),
      caches.open(IMAGE_CACHE)
    ]).then(() => {
      console.log('[SW] Critical installation complete');
      return self.skipWaiting();
    })
  );
  
  // Background cache non-critical assets without blocking install
  setTimeout(() => {
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(err => {
        console.log('[SW] Background caching completed with some skips');
      });
    });
  }, 1000);
});

// Activate with aggressive cleanup
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating ultra-optimized service worker...');
  
  event.waitUntil(
    Promise.all([
      // Clean old caches more aggressively
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!cacheName.includes('v4') && !cacheName.includes('v2')) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control immediately
      self.clients.claim()
    ]).then(() => {
      console.log('[SW] Activation complete - ultra performance mode enabled');
    })
  );
});

// Ultra-optimized fetch handling with performance priorities
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-HTTP requests and extension requests
  if (!request.url.startsWith('http') || url.protocol === 'chrome-extension:') return;
  
  // Handle different request types with ultra-optimized strategies
  if (isCriticalAsset(request)) {
    event.respondWith(handleCriticalAssetUltraFast(request));
  } else if (isImage(request)) {
    event.respondWith(handleImageOptimized(request));
  } else if (isAIRequest(request)) {
    event.respondWith(handleAIRequestCached(request));
  } else if (isAPIRequest(request)) {
    event.respondWith(handleAPIRequestFast(request));
  } else if (isNavigationRequest(request)) {
    event.respondWith(handleNavigationFast(request));
  } else {
    event.respondWith(handleDynamicRequestOptimized(request));
  }
});

// Asset type detection (optimized)
function isCriticalAsset(request) {
  const url = new URL(request.url);
  return CRITICAL_ASSETS.some(asset => url.pathname === asset) ||
         (url.pathname.match(/\.(css|js)$/) && url.pathname.includes('/src/'));
}

function isImage(request) {
  const url = new URL(request.url);
  return url.pathname.match(/\.(png|jpg|jpeg|svg|ico|woff|woff2|webp|avif)$/);
}

function isAIRequest(request) {
  const url = new URL(request.url);
  return url.pathname.includes('fitness-ai') || 
         url.pathname.includes('coach-gpt') ||
         url.searchParams.has('ai-query');
}

function isAPIRequest(request) {
  const url = new URL(request.url);
  return url.pathname.startsWith('/api/') || 
         url.hostname.includes('supabase') ||
         url.hostname.includes('stripe');
}

function isNavigationRequest(request) {
  return request.mode === 'navigate';
}

// Ultra-fast handlers
async function handleCriticalAssetUltraFast(request) {
  try {
    const cache = await caches.open(STATIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      // Serve from cache immediately, update in background
      fetchAndCacheBackground(request, cache);
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // Fallback to any cached version
    const cache = await caches.open(STATIC_CACHE);
    const fallback = await cache.match('/') || new Response('Critical asset unavailable', { status: 503 });
    return fallback;
  }
}

async function handleImageOptimized(request) {
  const cache = await caches.open(IMAGE_CACHE);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      // Cache images for longer period
      const responseToCache = networkResponse.clone();
      cache.put(request, responseToCache);
    }
    return networkResponse;
  } catch (error) {
    return new Response('Image not available offline', { status: 503 });
  }
}

async function handleAIRequestCached(request) {
  try {
    // Check cache for repeated AI queries first (faster than network)
    if (request.method === 'POST') {
      const cache = await caches.open(AI_CACHE);
      const cacheKey = await generateAICacheKeyFast(request);
      const cachedResponse = await cache.match(cacheKey);
      
      if (cachedResponse) {
        console.log('[SW] Serving cached AI response');
        return cachedResponse;
      }
    }
    
    const networkResponse = await fetch(request);
    
    // Cache successful AI responses for repeated queries
    if (networkResponse.ok && request.method === 'POST') {
      const cache = await caches.open(AI_CACHE);
      const cacheKey = await generateAICacheKeyFast(request);
      // Cache for shorter time for AI responses (30 minutes)
      const responseToCache = networkResponse.clone();
      cache.put(cacheKey, responseToCache);
      
      // Clean old AI cache entries to prevent memory issues
      setTimeout(() => cleanAICache(), 0);
    }
    
    return networkResponse;
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: 'AI service temporarily unavailable',
      offline: true,
      fallback: 'I\'m currently offline. Please try again when you\'re connected to the internet.'
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function handleAPIRequestFast(request) {
  try {
    const networkResponse = await fetch(request, {
      // Optimize API requests
      keepalive: true
    });
    
    // Cache successful GET requests only for short periods
    if (networkResponse.ok && request.method === 'GET') {
      const cache = await caches.open(DYNAMIC_CACHE);
      const responseToCache = networkResponse.clone();
      cache.put(request, responseToCache);
      
      // Auto-expire after 5 minutes
      setTimeout(() => {
        cache.delete(request);
      }, 300000);
    }
    
    return networkResponse;
  } catch (error) {
    if (request.method === 'GET') {
      const cache = await caches.open(DYNAMIC_CACHE);
      const cachedResponse = await cache.match(request);
      
      if (cachedResponse) {
        return cachedResponse;
      }
    }
    
    return new Response(JSON.stringify({ 
      error: 'Network unavailable',
      offline: true 
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function handleNavigationFast(request) {
  try {
    // Try network first for navigation (fresher content)
    const networkResponse = await Promise.race([
      fetch(request),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Network timeout')), 3000))
    ]);
    return networkResponse;
  } catch (error) {
    const cache = await caches.open(STATIC_CACHE);
    const appShell = await cache.match('/');
    return appShell || new Response('App not available offline', { status: 503 });
  }
}

async function handleDynamicRequestOptimized(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      // Only cache smaller responses to avoid memory issues
      const contentLength = networkResponse.headers.get('content-length');
      if (!contentLength || parseInt(contentLength) < 1048576) { // 1MB limit
        cache.put(request, networkResponse.clone());
      }
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await cache.match(request);
    return cachedResponse || new Response('Content not available offline', { status: 503 });
  }
}

// Utility functions (optimized)
async function fetchAndCacheBackground(request, cache) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response);
    }
  } catch (error) {
    console.log('[SW] Background fetch failed:', error);
  }
}

async function generateAICacheKeyFast(request) {
  try {
    const body = await request.text();
    // Use simpler hash for better performance
    const simpleHash = body.length + body.charCodeAt(0) + body.charCodeAt(body.length - 1);
    return new Request(`${request.url}?hash=${simpleHash}`);
  } catch {
    return request;
  }
}

async function cleanAICache() {
  try {
    const cache = await caches.open(AI_CACHE);
    const keys = await cache.keys();
    
    // Keep only the 50 most recent AI responses
    if (keys.length > 50) {
      const keysToDelete = keys.slice(0, keys.length - 50);
      await Promise.all(keysToDelete.map(key => cache.delete(key)));
      console.log('[SW] Cleaned old AI cache entries');
    }
  } catch (error) {
    console.log('[SW] AI cache cleanup failed:', error);
  }
}

// Enhanced push notifications with better performance
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New update available!',
    icon: '/lovable-uploads/f011887c-b33f-4514-a48a-42a9bbc6251f.png',
    badge: '/favicon-32x32.png',
    data: { dateOfArrival: Date.now(), primaryKey: 1 },
    requireInteraction: false,
    silent: false
  };
  
  event.waitUntil(
    self.registration.showNotification('Myotopia', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow('/'));
});

// Handle messages for cache updates
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_AI_RESPONSE') {
    const { query, response } = event.data;
    caches.open(AI_CACHE).then(cache => {
      cache.put(new Request(`/ai-cache/${btoa(query)}`), new Response(JSON.stringify(response)));
    });
  }
});

console.log('[SW] Ultra-optimized service worker loaded successfully');
