// Service Worker lifecycle
self.addEventListener('install', () => {
    (self as any).skipWaiting();
});

self.addEventListener('activate', (event: any) => {
    event.waitUntil((self as any).clients.claim());
});
