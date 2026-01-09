// Service Worker for Finanzas App with Push Notifications

const CACHE_NAME = 'finanzas-v2';
const ASSETS_TO_CACHE = [
    '/finanzas-compartidas/',
    '/finanzas-compartidas/index.html',
    '/finanzas-compartidas/icon-192.png',
    '/finanzas-compartidas/icon-512.png',
    '/finanzas-compartidas/manifest.json',
];

// Install event - cache assets
self.addEventListener('install', (event) => {
    console.log('🔧 Service Worker installing...');
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('📦 Caching app assets');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
    console.log('✅ Service Worker activated');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('🗑️ Clearing old cache:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests and API calls
    if (event.request.method !== 'GET') return;
    if (event.request.url.includes('supabase') ||
        event.request.url.includes('googleapis') ||
        event.request.url.includes('generativelanguage')) {
        return;
    }

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(event.request).then((response) => {
                // Don't cache non-success responses
                if (!response || response.status !== 200) {
                    return response;
                }
                // Clone and cache the response
                const responseToCache = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseToCache);
                });
                return response;
            });
        })
    );
});

// Push notification event
self.addEventListener('push', (event) => {
    console.log('📬 Push notification received');

    const options = {
        icon: '/finanzas-compartidas/icon-192.png',
        badge: '/finanzas-compartidas/icon-192.png',
        vibrate: [100, 50, 100],
        requireInteraction: false,
    };

    if (event.data) {
        const data = event.data.json();
        event.waitUntil(
            self.registration.showNotification(data.title || 'Finanzas', {
                ...options,
                body: data.body || '',
            })
        );
    }
});

// Notification click event - open the app
self.addEventListener('notificationclick', (event) => {
    console.log('🖱️ Notification clicked');
    event.notification.close();

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // If app is already open, focus it
            for (const client of clientList) {
                if (client.url.includes('finanzas-compartidas') && 'focus' in client) {
                    return client.focus();
                }
            }
            // Otherwise open a new window
            if (clients.openWindow) {
                return clients.openWindow('/finanzas-compartidas/');
            }
        })
    );
});
