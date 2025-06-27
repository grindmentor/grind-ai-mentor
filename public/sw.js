
const CACHE_NAME = 'myotopia-v3';
const STATIC_CACHE = 'myotopia-static-v3';
const DYNAMIC_CACHE = 'myotopia-dynamic-v3';
const OFFLINE_QUEUE_CACHE = 'myotopia-offline-queue-v1';

// Critical assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/src/main.tsx',
  '/src/index.css',
  '/manifest.json',
  '/favicon-32x32.png',
  '/favicon-16x16.png',
  '/apple-touch-icon.png',
  '/icon-192.png',
  '/icon-256.png',
  '/icon-512.png',
  '/icon-1024.png'
];

// Offline queue for failed requests
let offlineQueue = [];

// Install event - cache static assets and register for background sync
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      caches.open(DYNAMIC_CACHE).then((cache) => {
        console.log('[SW] Dynamic cache initialized');
        return cache;
      }),
      caches.open(OFFLINE_QUEUE_CACHE).then((cache) => {
        console.log('[SW] Offline queue cache initialized');
        return cache;
      }),
      // Register for periodic background sync
      self.registration.periodicSync?.register('background-sync', {
        minInterval: 24 * 60 * 60 * 1000, // 24 hours
      }).catch(() => {
        console.log('[SW] Periodic background sync not supported');
      })
    ]).then(() => {
      console.log('[SW] Installation complete');
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheName.includes('myotopia-v3') && !cacheName.includes('myotopia-offline-queue-v1')) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Activation complete');
      return self.clients.claim();
    })
  );
});

// Enhanced fetch event with better offline support
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Skip non-HTTP requests
  if (!request.url.startsWith('http')) {
    return;
  }

  // Handle different types of requests
  if (isStaticAsset(request)) {
    event.respondWith(handleStaticAsset(request));
  } else if (isAPIRequest(request)) {
    event.respondWith(handleAPIRequest(request));
  } else if (isNavigationRequest(request)) {
    event.respondWith(handleNavigationRequest(request));
  } else {
    event.respondWith(handleDynamicRequest(request));
  }
});

// Check if request is for static assets
function isStaticAsset(request) {
  const url = new URL(request.url);
  return STATIC_ASSETS.some(asset => url.pathname.endsWith(asset)) ||
         url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|ico|woff|woff2)$/);
}

// Check if request is for API
function isAPIRequest(request) {
  const url = new URL(request.url);
  return url.pathname.startsWith('/api/') || 
         url.hostname.includes('supabase') ||
         url.hostname.includes('stripe');
}

// Check if request is navigation
function isNavigationRequest(request) {
  return request.mode === 'navigate';
}

// Handle static assets with cache-first strategy
async function handleStaticAsset(request) {
  try {
    const cache = await caches.open(STATIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      // Try to update cache in background
      fetch(request).then(response => {
        if (response.ok) {
          cache.put(request, response.clone());
        }
      }).catch(() => {});
      
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('[SW] Static asset fetch failed:', error);
    return new Response('Asset not available offline', { 
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// Enhanced API request handling with offline queue
async function handleAPIRequest(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful GET requests
    if (networkResponse.ok && request.method === 'GET') {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] API request failed:', error);
    
    // For GET requests, try cache
    if (request.method === 'GET') {
      const cache = await caches.open(DYNAMIC_CACHE);
      const cachedResponse = await cache.match(request);
      
      if (cachedResponse) {
        return cachedResponse;
      }
    } else {
      // For POST/PUT/DELETE, queue for background sync
      await queueOfflineRequest(request);
      
      return new Response(JSON.stringify({ 
        success: true,
        message: 'Request queued for when you\'re back online',
        offline: true 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
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

// Queue offline requests for background sync
async function queueOfflineRequest(request) {
  const requestData = {
    url: request.url,
    method: request.method,
    headers: Object.fromEntries(request.headers.entries()),
    body: request.method !== 'GET' ? await request.text() : null,
    timestamp: Date.now()
  };
  
  const cache = await caches.open(OFFLINE_QUEUE_CACHE);
  const queueKey = `offline-${Date.now()}-${Math.random()}`;
  
  await cache.put(queueKey, new Response(JSON.stringify(requestData)));
  
  // Try to register for background sync
  if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
    try {
      await self.registration.sync.register('offline-sync');
    } catch (err) {
      console.log('[SW] Background sync registration failed:', err);
    }
  }
}

// Handle navigation requests with offline support
async function handleNavigationRequest(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful navigation responses
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Navigation request failed, serving cached version or app shell:', error);
    
    // Try cached version first
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fall back to app shell
    const appShell = await cache.match('/');
    return appShell || new Response(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Myotopia - Offline</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { 
              font-family: system-ui, -apple-system, sans-serif; 
              text-align: center; 
              padding: 2rem;
              background: linear-gradient(135deg, #000 0%, #f97316 100%);
              color: white;
              min-height: 100vh;
              margin: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              flex-direction: column;
            }
            .offline-icon { font-size: 4rem; margin-bottom: 1rem; }
            h1 { margin-bottom: 1rem; }
            p { opacity: 0.8; max-width: 400px; line-height: 1.6; }
          </style>
        </head>
        <body>
          <div class="offline-icon">🏋️‍♂️</div>
          <h1>You're Offline</h1>
          <p>Myotopia is not available right now. Check your connection and try again.</p>
          <button onclick="location.reload()" style="
            background: #f97316; 
            color: white; 
            border: none; 
            padding: 12px 24px; 
            border-radius: 8px; 
            cursor: pointer;
            margin-top: 1rem;
          ">Try Again</button>
        </body>
      </html>
    `, {
      status: 200,
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

// Handle other dynamic requests with stale-while-revalidate
async function handleDynamicRequest(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => cachedResponse);
  
  return cachedResponse || await fetchPromise;
}

// Enhanced background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'offline-sync') {
    event.waitUntil(processOfflineQueue());
  } else if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

// Process queued offline requests
async function processOfflineQueue() {
  console.log('[SW] Processing offline queue...');
  
  const cache = await caches.open(OFFLINE_QUEUE_CACHE);
  const requests = await cache.keys();
  
  for (const request of requests) {
    try {
      const response = await cache.match(request);
      const requestData = JSON.parse(await response.text());
      
      // Recreate and send the request
      const originalRequest = new Request(requestData.url, {
        method: requestData.method,
        headers: requestData.headers,
        body: requestData.body
      });
      
      const networkResponse = await fetch(originalRequest);
      
      if (networkResponse.ok) {
        await cache.delete(request);
        console.log('[SW] Offline request processed successfully:', requestData.url);
        
        // Notify the app about successful sync
        self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'OFFLINE_REQUEST_SYNCED',
              url: requestData.url,
              method: requestData.method
            });
          });
        });
      }
    } catch (error) {
      console.log('[SW] Failed to process offline request:', error);
    }
  }
}

// Regular background sync for app updates
async function doBackgroundSync() {
  console.log('[SW] Performing background sync...');
  
  try {
    // Update static assets
    const cache = await caches.open(STATIC_CACHE);
    await Promise.allSettled(
      STATIC_ASSETS.map(async (asset) => {
        try {
          const response = await fetch(asset);
          if (response.ok) {
            await cache.put(asset, response);
          }
        } catch (error) {
          console.log('[SW] Failed to update asset:', asset, error);
        }
      })
    );
    
    // Notify clients about updates
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'BACKGROUND_SYNC_COMPLETE',
          timestamp: Date.now()
        });
      });
    });
    
  } catch (error) {
    console.log('[SW] Background sync failed:', error);
  }
}

// Periodic background sync
self.addEventListener('periodicsync', (event) => {
  console.log('[SW] Periodic background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

// Enhanced push notifications support
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  let notificationData = {
    title: 'Myotopia',
    body: 'New update available!',
    icon: '/icon-192.png',
    badge: '/favicon-32x32.png'
  };
  
  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = { ...notificationData, ...data };
    } catch (error) {
      notificationData.body = event.data.text();
    }
  }
  
  const options = {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: notificationData.badge,
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: notificationData.id || 1,
      url: notificationData.url || '/'
    },
    actions: [
      {
        action: 'open',
        title: 'Open App',
        icon: '/icon-192.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/favicon-32x32.png'
      }
    ],
    requireInteraction: true,
    silent: false
  };
  
  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);
  
  event.notification.close();
  
  const urlToOpen = event.notification.data.url || '/';
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.matchAll({
        type: 'window',
        includeUncontrolled: true
      }).then((clientList) => {
        // Try to focus existing window
        for (const client of clientList) {
          if (client.url.includes(self.location.origin)) {
            return client.focus();
          }
        }
        // Open new window if none exists
        return clients.openWindow(urlToOpen);
      })
    );
  }
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed:', event.notification.data);
  
  // Track notification dismissal
  event.waitUntil(
    fetch('/api/analytics/notification-dismissed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        notificationId: event.notification.data.primaryKey,
        timestamp: Date.now()
      })
    }).catch(() => {
      // Fail silently for analytics
    })
  );
});

// Message handling for communication with the app
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }).then(() => {
        event.ports[0].postMessage({ success: true });
      })
    );
  }
});

console.log('[SW] Myotopia Service Worker registered successfully with enhanced offline capabilities');
