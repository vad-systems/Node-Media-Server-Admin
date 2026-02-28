import { api } from './api/service';

const channel = new BroadcastChannel('server-stats');

async function fetchStats() {
    try {
        const stats = await api.getServerInfo();
        channel.postMessage({ type: 'STATS_UPDATE', payload: stats });
    } catch (error) {
        // Silently fail as the server might be down temporarily
        // console.error('Service Worker fetch error:', error);
    }
}

// Initial fetch
fetchStats();

// Poll every 2 seconds
setInterval(fetchStats, 2000);

// Service Worker lifecycle
self.addEventListener('install', () => {
    (self as any).skipWaiting();
});

self.addEventListener('activate', (event: any) => {
    event.waitUntil((self as any).clients.claim());
});
