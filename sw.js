/**
 * Service Worker for Harness the Spark Website
 * Provides offline capabilities and performance optimisation
 */

const CACHE_NAME = 'harness-the-spark-v1.0.0';
const RUNTIME_CACHE = 'harness-the-spark-runtime-v1.0.0';

// Assets to cache immediately when service worker installs
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
    '/manifest.json',
    '/favicon.ico',
    '/favicon.svg',
    '/apple-touch-icon.png',
    // Add other critical assets here
];

// Assets to cache on first request (runtime caching)
const RUNTIME_CACHE_PATTERNS = [
    /^https:\/\/cdnjs\.cloudflare\.com\//,
    /^https:\/\/fonts\.googleapis\.com\//,
    /^https:\/\/fonts\.gstatic\.com\//,
    /^https:\/\/images\.unsplash\.com\//,
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('Service Worker installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Caching static assets...');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('Static assets cached successfully');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('Error caching static assets:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker activating...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
                            console.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker activated');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Only handle GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Handle navigation requests (HTML pages)
    if (request.mode === 'navigate') {
        event.respondWith(
            caches.match(request)
                .then((cachedResponse) => {
                    if (cachedResponse) {
                        console.log('Serving from cache:', request.url);
                        return cachedResponse;
                    }
                    
                    return fetch(request)
                        .then((response) => {
                            // Only cache successful responses
                            if (response.status === 200) {
                                const responseClone = response.clone();
                                caches.open(CACHE_NAME)
                                    .then((cache) => {
                                        cache.put(request, responseClone);
                                    });
                            }
                            return response;
                        })
                        .catch(() => {
                            // Return offline page if available
                            return caches.match('/offline.html') || 
                                   new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
                        });
                })
        );
        return;
    }
    
    // Handle static assets
    if (url.origin === location.origin) {
        event.respondWith(
            caches.match(request)
                .then((cachedResponse) => {
                    if (cachedResponse) {
                        console.log('Serving static asset from cache:', request.url);
                        return cachedResponse;
                    }
                    
                    return fetch(request)
                        .then((response) => {
                            if (response.status === 200) {
                                const responseClone = response.clone();
                                caches.open(CACHE_NAME)
                                    .then((cache) => {
                                        cache.put(request, responseClone);
                                    });
                            }
                            return response;
                        });
                })
        );
        return;
    }
    
    // Handle external resources (fonts, CDN assets, etc.)
    if (RUNTIME_CACHE_PATTERNS.some(pattern => pattern.test(request.url))) {
        event.respondWith(
            caches.match(request)
                .then((cachedResponse) => {
                    if (cachedResponse) {
                        console.log('Serving external asset from cache:', request.url);
                        // Return cached version but also update cache in background
                        fetch(request)
                            .then((response) => {
                                if (response.status === 200) {
                                    const responseClone = response.clone();
                                    caches.open(RUNTIME_CACHE)
                                        .then((cache) => {
                                            cache.put(request, responseClone);
                                        });
                                }
                            })
                            .catch(() => {
                                // Ignore network errors for background updates
                            });
                        return cachedResponse;
                    }
                    
                    return fetch(request)
                        .then((response) => {
                            if (response.status === 200) {
                                const responseClone = response.clone();
                                caches.open(RUNTIME_CACHE)
                                    .then((cache) => {
                                        cache.put(request, responseClone);
                                    });
                            }
                            return response;
                        });
                })
        );
        return;
    }
    
    // For all other requests, just pass through to network
    event.respondWith(fetch(request));
});

// Background sync for offline form submissions
self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync') {
        console.log('Background sync triggered');
        event.waitUntil(syncOfflineData());
    }
});

// Push notification handler
self.addEventListener('push', (event) => {
    console.log('Push notification received');
    
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body || 'New update from Harness the Spark',
            icon: '/favicon.svg',
            badge: '/favicon.svg',
            data: data.url || '/',
            actions: [
                {
                    action: 'view',
                    title: 'View',
                    icon: '/favicon.svg'
                },
                {
                    action: 'dismiss',
                    title: 'Dismiss'
                }
            ]
        };
        
        event.waitUntil(
            self.registration.showNotification(
                data.title || 'Harness the Spark',
                options
            )
        );
    }
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    if (event.action === 'view' || !event.action) {
        const urlToOpen = event.notification.data || '/';
        
        event.waitUntil(
            clients.matchAll({ type: 'window', includeUncontrolled: true })
                .then((clientList) => {
                    // Check if there's already a window/tab open with the target URL
                    for (const client of clientList) {
                        if (client.url === urlToOpen && 'focus' in client) {
                            return client.focus();
                        }
                    }
                    
                    // If no existing window, open a new one
                    if (clients.openWindow) {
                        return clients.openWindow(urlToOpen);
                    }
                })
        );
    }
});

// Helper function to sync offline data
async function syncOfflineData() {
    try {
        // Get offline form submissions from IndexedDB or localStorage
        const offlineData = await getOfflineFormSubmissions();
        
        for (const data of offlineData) {
            try {
                const response = await fetch(data.url, {
                    method: data.method,
                    headers: data.headers,
                    body: JSON.stringify(data.body)
                });
                
                if (response.ok) {
                    // Remove successfully synced data
                    await removeOfflineFormSubmission(data.id);
                    console.log('Offline data synced successfully');
                } else {
                    console.error('Failed to sync offline data:', response.status);
                }
            } catch (error) {
                console.error('Error syncing offline data:', error);
            }
        }
    } catch (error) {
        console.error('Error in background sync:', error);
    }
}

// Helper function to get offline form submissions
async function getOfflineFormSubmissions() {
    // This would typically use IndexedDB
    // For now, return empty array as placeholder
    return [];
}

// Helper function to remove synced offline data
async function removeOfflineFormSubmission(id) {
    // This would typically remove from IndexedDB
    // Placeholder for now
    console.log('Removing offline submission:', id);
}

// Update notification
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// Performance monitoring
self.addEventListener('fetch', (event) => {
    const start = performance.now();
    
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                const duration = performance.now() - start;
                
                // Log slow requests for monitoring
                if (duration > 2000) {
                    console.warn(`Slow request detected: ${event.request.url} took ${duration}ms`);
                }
                
                return response;
            })
            .catch((error) => {
                console.error('Fetch error:', error);
                throw error;
            })
    );
});

console.log('Service Worker loaded successfully');