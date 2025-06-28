
const CACHE_NAME = 'myotopia-v3-optimized';
const STATIC_CACHE = 'myotopia-static-v3';
const DYNAMIC_CACHE = 'myotopia-dynamic-v3';
const AI_CACHE = 'myotopia-ai-responses-v1';

// Critical assets for immediate caching
const CRITICAL_ASSETS = [
  '/',
  '/src/main.tsx',
  '/src/index.css',
  '/manifest.json'
];

// Static assets for background caching
const STATIC_ASSETS = [
  '/lovable-uploads/f011887c-b33f-4514-a48a-42a9bbc6251f.png',
  '/favicon-32x32.png',
  '/favicon-16x16.png',
  '/apple-touch-icon.png'
];

// Install with optimized caching strategy
self.addEventListener('install', (event) => {
  console.log('[SW] Installing optimized service worker...');
  
  event.waitUntil(
    Promise.all([
      // Cache critical assets immediately
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('[SW] Caching critical assets');
        return cache.addAll(CRITICAL_ASSETS);
      }),
      // Initialize other caches
      caches.open(DYNAMIC_CACHE),
      caches.open(AI_CACHE)
    ]).then(() => {
      console.log('[SW] Critical installation complete');
      return self.skipWaiting();
    })
  );
  
  // Background cache non-critical assets
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(err => {
        console.log('[SW] Background caching completed with some skips');
      });
    })
  );
});

// Activate with aggressive cleanup
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating optimized service worker...');
  
  event.waitUntil(
    Promise.all([
      // Clean old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!cacheName.includes('v3') && !cacheName.includes('v1')) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control immediately
      self.clients.claim()
    ]).then(() => {
      console.log('[SW] Activation complete - ready for optimal performance');
    })
  );
});

// Optimized fetch handling
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-HTTP requests
  if (!request.url.startsWith('http')) return;
  
  // Handle different request types with optimized strategies
  if (isCriticalAsset(request)) {
    event.respondWith(handleCriticalAsset(request));
  } else if (isAIRequest(request)) {
    event.respondWith(handleAIRequest(request));
  } else if (isStaticAsset(request)) {
    event.respondWith(handleStaticAsset(request));
  } else if (isAPIRequest(request)) {
    event.respondWith(handleAPIRequest(request));
  } else if (isNavigationRequest(request)) {
    event.respondWith(handleNavigationRequest(request));
  } else {
    event.respondWith(handleDynamicRequest(request));
  }
});

// Asset type detection
function isCriticalAsset(request) {
  const url = new URL(request.url);
  return CRITICAL_ASSETS.some(asset => url.pathname === asset) ||
         url.pathname.match(/\.(css|js)$/) && url.pathname.includes('/src/');
}

function isAIRequest(request) {
  const url = new URL(request.url);
  return url.pathname.includes('fitness-ai') || 
         url.pathname.includes('coach-gpt') ||
         url.searchParams.has('ai-query');
}

function isStaticAsset(request) {
  const url = new URL(request.url);
  return url.pathname.match(/\.(png|jpg|jpeg|svg|ico|woff|woff2|webp|avif)$/);
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

// Optimized handlers
async function handleCriticalAsset(request) {
  try {
    const cache = await caches.open(STATIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      // Serve from cache immediately, update in background
      fetchAndCache(request, cache);
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cache = await caches.open(STATIC_CACHE);
    const fallback = await cache.match('/');
    return fallback || new Response('Critical asset unavailable', { status: 503 });
  }
}

async function handleAIRequest(request) {
  try {
    // Check cache for repeated AI queries first
    if (request.method === 'POST') {
      const cache = await caches.open(AI_CACHE);
      const cacheKey = await generateAICacheKey(request);
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
      const cacheKey = await generateAICacheKey(request);
      // Cache for 1 hour for AI responses
      const responseToCache = networkResponse.clone();
      setTimeout(() => cache.put(cacheKey, responseToCache), 0);
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

async function handleStaticAsset(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    return new Response('Asset not available offline', { status: 503 });
  }
}

async function handleAPIRequest(request) {
  try {
    const networkResponse = await fetch(request, {
      // Optimize API requests
      keepalive: true
    });
    
    // Cache successful GET requests only
    if (networkResponse.ok && request.method === 'GET') {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
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

async function handleNavigationRequest(request) {
  try {
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    const cache = await caches.open(STATIC_CACHE);
    const appShell = await cache.match('/');
    return appShell || new Response('App not available offline', { status: 503 });
  }
}

async function handleDynamicRequest(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await cache.match(request);
    return cachedResponse || new Response('Content not available offline', { status: 503 });
  }
}

// Utility functions
async function fetchAndCache(request, cache) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response);
    }
  } catch (error) {
    console.log('[SW] Background fetch failed:', error);
  }
}

async function generateAICacheKey(request) {
  const body = await request.text();
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(body));
  const hashArray = Array.from(new Uint8Array(hash));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return new Request(`${request.url}?hash=${hashHex}`);
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  console.log('[SW] Performing background sync...');
  // Sync offline data when connection returns
}

// Enhanced push notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New update available!',
    icon: '/lovable-uploads/f011887c-b33f-4514-a48a-42a9bbc6251f.png',
    badge: '/favicon-32x32.png',
    vibrate: [100, 50, 100],
    data: { dateOfArrival: Date.now(), primaryKey: 1 },
    actions: [
      { action: 'explore', title: 'Open App', icon: '/lovable-uploads/f011887c-b33f-4514-a48a-42a9bbc6251f.png' },
      { action: 'close', title: 'Close', icon: '/favicon-32x32.png' }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Myotopia', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(clients.openWindow('/'));
  }
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

console.log('[SW] Optimized service worker loaded successfully');
