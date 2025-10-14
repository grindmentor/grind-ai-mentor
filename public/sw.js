const CACHE_NAME = 'myotopia-v6-native-feel';
const STATIC_CACHE = 'myotopia-static-v6';
const DYNAMIC_CACHE = 'myotopia-dynamic-v6';
const AI_CACHE = 'myotopia-ai-responses-v4';
const IMAGE_CACHE = 'myotopia-images-v4';
const INSTANT_CACHE = 'myotopia-instant-v2';
const API_CACHE_TTL = 5 * 60 * 1000; // 5 minutes for API responses

let aggressiveCacheEnabled = false;

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

// Ultra-fast install with instant cache initialization
self.addEventListener('install', (event) => {
  console.log('[SW] Installing ultra-fast service worker...');
  
  event.waitUntil(
    Promise.all([
      // Instant shell cache
      caches.open(INSTANT_CACHE).then((cache) => {
        return cache.addAll(['/']);
      }),
      // Initialize all caches simultaneously
      caches.open(STATIC_CACHE),
      caches.open(DYNAMIC_CACHE),
      caches.open(AI_CACHE),
      caches.open(IMAGE_CACHE)
    ]).then(() => {
      console.log('[SW] Instant installation complete');
      return self.skipWaiting();
    })
  );
  
  // Aggressive background preloading without blocking
  if ('requestIdleCallback' in self) {
    requestIdleCallback(() => {
      Promise.all([
        caches.open(STATIC_CACHE).then(cache => cache.addAll(CRITICAL_ASSETS)),
        caches.open(STATIC_CACHE).then(cache => cache.addAll(STATIC_ASSETS))
      ]).catch(() => console.log('[SW] Background preload completed'));
    });
  }
});

// Stale-While-Revalidate helper for instant-feel navigation
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse && networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => cachedResponse); // Fallback to cache on network error

  // Return cached response immediately if available, otherwise wait for network
  return cachedResponse || fetchPromise;
}

// Activate with aggressive cleanup
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating native-feel service worker...');
  
  event.waitUntil(
    Promise.all([
      // Clean old caches more aggressively
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!cacheName.includes('v6') && !cacheName.includes('v5')) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control immediately
      self.clients.claim()
    ]).then(() => {
      console.log('[SW] Activation complete - native-feel mode enabled');
    })
  );
});

// Ultra-optimized fetch handling with performance priorities
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-HTTP requests and extension requests
  if (!request.url.startsWith('http') || url.protocol === 'chrome-extension:') return;
  
  // Handle PWA special features first
  if (url.pathname === '/app' && url.searchParams.has('share') && request.method === 'POST') {
    event.respondWith(handleShareTarget(request));
    return;
  }
  
  if (url.pathname === '/app' && url.searchParams.has('handler')) {
    event.respondWith(handleFileOpen(request));
    return;
  }
  
  if (url.pathname === '/app' && url.searchParams.has('protocol')) {
    event.respondWith(handleProtocolOpen(request));
    return;
  }
  
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
      fetchAndCacheBackground(request.clone(), cache);
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request.clone());
    if (networkResponse.ok) {
      cache.put(request.clone(), networkResponse.clone());
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
    const networkResponse = await fetch(request.clone());
    if (networkResponse.ok) {
      // Cache images for longer period
      const responseToCache = networkResponse.clone();
      cache.put(request.clone(), responseToCache);
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
      const cacheKey = await generateAICacheKeyFast(request.clone());
      const cachedResponse = await cache.match(cacheKey);
      
      if (cachedResponse) {
        console.log('[SW] Serving cached AI response');
        return cachedResponse;
      }
    }
    
    const networkResponse = await fetch(request.clone());
    
    // Cache successful AI responses for repeated queries
    if (networkResponse.ok && request.method === 'POST') {
      const cache = await caches.open(AI_CACHE);
      const cacheKey = await generateAICacheKeyFast(request.clone());
      // Cache for shorter time for AI responses (30 minutes)
      const responseToCache = networkResponse.clone();
      cache.put(cacheKey, responseToCache);
      
      // Clean old AI cache entries to prevent memory issues
      setTimeout(() => cleanAICache(), 0);
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] AI request failed:', error);
    // Return a proper network-first fallback
    return fetch(request);
  }
}

async function handleAPIRequestFast(request) {
  // For GET requests, use stale-while-revalidate for instant responses
  if (request.method === 'GET') {
    return staleWhileRevalidate(request, DYNAMIC_CACHE);
  }
  
  // For non-GET requests, always go to network
  try {
    const networkResponse = await fetch(request.clone(), {
      keepalive: true
    });
    
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
    const networkResponse = await fetch(request.clone());
    if (networkResponse.ok && request.method === 'GET') {
      // Only cache GET requests and smaller responses to avoid memory issues
      const contentLength = networkResponse.headers.get('content-length');
      if (!contentLength || parseInt(contentLength) < 1048576) { // 1MB limit
        cache.put(request.clone(), networkResponse.clone());
      }
    }
    return networkResponse;
  } catch (error) {
    if (request.method === 'GET') {
      const cachedResponse = await cache.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }
    }
    return new Response('Content not available offline', { status: 503 });
  }
}

// Utility functions (optimized)
async function fetchAndCacheBackground(request, cache) {
  try {
    const response = await fetch(request.clone());
    if (response.ok) {
      cache.put(request.clone(), response);
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

// Background Sync for offline data persistence
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'workout-sync') {
    event.waitUntil(syncWorkouts());
  } else if (event.tag === 'food-log-sync') {
    event.waitUntil(syncFoodLogs());
  } else if (event.tag === 'progress-sync') {
    event.waitUntil(syncProgress());
  } else if (event.tag === 'goal-sync') {
    event.waitUntil(syncGoals());
  } else if (event.tag === 'preference-sync') {
    event.waitUntil(syncPreferences());
  }
});

// Periodic Background Sync for data refresh
self.addEventListener('periodicsync', (event) => {
  console.log('[SW] Periodic sync triggered:', event.tag);
  
  if (event.tag === 'data-refresh') {
    event.waitUntil(refreshAppData());
  }
});


// Share target implementation
async function handleShareTarget(request) {
  try {
    const formData = await request.formData();
    const title = formData.get('title') || '';
    const text = formData.get('text') || '';
    const url = formData.get('url') || '';
    const files = formData.getAll('photos');
    
    // Store shared data for the app to process
    const shareData = {
      title,
      text,
      url,
      files: files.map(file => ({
        name: file.name,
        type: file.type,
        size: file.size
      })),
      timestamp: Date.now()
    };
    
    // Store in IndexedDB or cache for the app to retrieve
    const cache = await caches.open(DYNAMIC_CACHE);
    await cache.put('/share-data', new Response(JSON.stringify(shareData)));
    
    // Redirect to app with share indicator
    return Response.redirect('/app?shared=true', 302);
  } catch (error) {
    console.error('[SW] Share target error:', error);
    return Response.redirect('/app', 302);
  }
}

// File handler implementation
async function handleFileOpen(request) {
  const url = new URL(request.url);
  const handler = url.searchParams.get('handler');
  
  // Redirect to appropriate app section based on file type
  if (handler === 'workout') {
    return Response.redirect('/app?module=workout-logger&import=true', 302);
  }
  
  return Response.redirect('/app', 302);
}

// Protocol handler implementation
async function handleProtocolOpen(request) {
  const url = new URL(request.url);
  const protocol = url.searchParams.get('protocol');
  
  // Parse myotopia:// protocol URLs
  if (protocol && protocol.startsWith('myotopia://')) {
    const protocolUrl = new URL(protocol);
    const action = protocolUrl.pathname.substring(1); // Remove leading /
    
    switch (action) {
      case 'workout':
        return Response.redirect('/app?module=workout-logger', 302);
      case 'nutrition':
        return Response.redirect('/app?module=food-log', 302);
      case 'progress':
        return Response.redirect('/app?module=progress-hub', 302);
      case 'coach':
        return Response.redirect('/app?module=coachgpt', 302);
      case 'timer':
        return Response.redirect('/app?module=timer', 302);
      case 'training':
        return Response.redirect('/app?module=smart-training', 302);
      default:
        return Response.redirect('/app', 302);
    }
  }
  
  return Response.redirect('/app', 302);
}

// Background sync functions
async function syncWorkouts() {
  const syncQueue = JSON.parse(localStorage.getItem('syncQueue') || '[]');
  const workoutItems = syncQueue.filter(item => item.action === 'workout-save');
  
  for (const item of workoutItems) {
    try {
      await fetch('/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item.data)
      });
      
      // Remove from queue on success
      removeFromSyncQueue(item);
    } catch (error) {
      console.error('[SW] Workout sync failed:', error);
    }
  }
}

async function syncFoodLogs() {
  const syncQueue = JSON.parse(localStorage.getItem('syncQueue') || '[]');
  const foodItems = syncQueue.filter(item => item.action === 'food-log');
  
  for (const item of foodItems) {
    try {
      await fetch('/api/food-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item.data)
      });
      
      removeFromSyncQueue(item);
    } catch (error) {
      console.error('[SW] Food log sync failed:', error);
    }
  }
}

async function syncProgress() {
  const syncQueue = JSON.parse(localStorage.getItem('syncQueue') || '[]');
  const progressItems = syncQueue.filter(item => item.action === 'progress-update');
  
  for (const item of progressItems) {
    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item.data)
      });
      
      removeFromSyncQueue(item);
    } catch (error) {
      console.error('[SW] Progress sync failed:', error);
    }
  }
}

async function syncGoals() {
  const syncQueue = JSON.parse(localStorage.getItem('syncQueue') || '[]');
  const goalItems = syncQueue.filter(item => item.action === 'goal-update');
  
  for (const item of goalItems) {
    try {
      await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item.data)
      });
      
      removeFromSyncQueue(item);
    } catch (error) {
      console.error('[SW] Goal sync failed:', error);
    }
  }
}

async function syncPreferences() {
  const syncQueue = JSON.parse(localStorage.getItem('syncQueue') || '[]');
  const preferenceItems = syncQueue.filter(item => item.action === 'preference-update');
  
  for (const item of preferenceItems) {
    try {
      await fetch('/api/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item.data)
      });
      
      removeFromSyncQueue(item);
    } catch (error) {
      console.error('[SW] Preferences sync failed:', error);
    }
  }
}

async function refreshAppData() {
  try {
    // Refresh critical app data in background
    const endpoints = [
      '/api/user/profile',
      '/api/workouts/recent',
      '/api/progress/summary',
      '/api/goals/active'
    ];
    
    await Promise.all(
      endpoints.map(async (endpoint) => {
        try {
          const response = await fetch(endpoint);
          if (response.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            await cache.put(endpoint, response);
          }
        } catch (error) {
          console.warn(`[SW] Failed to refresh ${endpoint}:`, error);
        }
      })
    );
    
    console.log('[SW] Periodic data refresh completed');
  } catch (error) {
    console.error('[SW] Periodic sync failed:', error);
  }
}

function removeFromSyncQueue(item) {
  const syncQueue = JSON.parse(localStorage.getItem('syncQueue') || '[]');
  const updatedQueue = syncQueue.filter(queueItem => 
    queueItem.timestamp !== item.timestamp || queueItem.action !== item.action
  );
  localStorage.setItem('syncQueue', JSON.stringify(updatedQueue));
}

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
  
  if (event.data && event.data.type === 'QUEUE_FOR_SYNC') {
    const { action, data } = event.data;
    const syncQueue = JSON.parse(localStorage.getItem('syncQueue') || '[]');
    syncQueue.push({
      action,
      data,
      timestamp: Date.now(),
      retries: 0
    });
    localStorage.setItem('syncQueue', JSON.stringify(syncQueue));
  }
});

console.log('[SW] PWA-optimized service worker with background sync loaded successfully');
