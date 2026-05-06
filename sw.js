// ============================================================================
// SERVICE WORKER - Toko Selvi PWA
// ============================================================================

const CACHE_NAME = 'toko-selvi-v2';

// Hanya file STATIS yang boleh di-cache
const STATIC_ASSETS = [
  './',
  './index.html',
  './app.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// URL pattern yang TIDAK BOLEH di-cache (selalu ambil dari network)
const API_PATTERNS = [
  /\.php(\?.*)?$/,      // semua file .php (termasuk dengan query string)
  /\/api-toko\//,       // semua request ke folder api-toko
];

function isApiRequest(url) {
  return API_PATTERNS.some(pattern => pattern.test(url));
}

// ============================================================================
// 1. INSTALL EVENT
// ============================================================================
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
      .catch(err => console.error('[SW] Install error:', err))
  );
});

// ============================================================================
// 2. ACTIVATE EVENT - Hapus cache lama
// ============================================================================
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          })
      ))
      .then(() => self.clients.claim())
  );
});

// ============================================================================
// 3. FETCH EVENT
//    - API / PHP  → NETWORK ONLY  (selalu fresh dari server)
//    - Static     → CACHE FIRST   (cepat, offline-ready)
// ============================================================================
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = event.request.url;

  // ── STRATEGY A: Network Only untuk semua request API/PHP ──────────────────
  if (isApiRequest(url)) {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' })
        .catch(() => {
          console.warn('[SW] API offline, tidak ada fallback:', url);
          return new Response(
            JSON.stringify({ status: 'error', message: 'Tidak ada koneksi internet.' }),
            { headers: { 'Content-Type': 'application/json' } }
          );
        })
    );
    return;
  }

  // ── STRATEGY B: Cache First untuk static assets ───────────────────────────
  event.respondWith(
    caches.match(event.request)
      .then(cached => {
        if (cached) {
          console.log('[SW] From cache:', url);
          return cached;
        }

        return fetch(event.request)
          .then(response => {
            if (!response || response.status !== 200 || response.type === 'opaque') {
              return response;
            }
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
            return response;
          })
          .catch(() => caches.match('./index.html'));
      })
  );
});

// ============================================================================
// MESSAGE EVENT
// ============================================================================
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('[SW] Service Worker loaded - v2 (Network Only for API)');