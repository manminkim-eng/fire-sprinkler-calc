// ═══════════════════════════════════════════════════════════════
//  Service Worker — 스프링클러설비 펌프 용량 계산서 PWA
// ═══════════════════════════════════════════════════════════════

const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME    = `sprinkler-app-${CACHE_VERSION}`;

const LOCAL_FILES = [
    './',
    './index.html',
    './manifest.json',
    './icons/icon-192.png',
    './icons/icon-512.png',
    './icons/apple-touch-icon.png',
    './icons/favicon-32.png',
    './icons/favicon-16.png'
];

const CDN_FILES = [
    'https://unpkg.com/react@18/umd/react.production.min.js',
    'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
    'https://unpkg.com/@babel/standalone/babel.min.js'
];

// ═══ 1. INSTALL ═══
self.addEventListener('install', (event) => {
    console.log(`[SW] 설치 시작 (${CACHE_VERSION})`);
    event.waitUntil(
        caches.open(CACHE_NAME).then(async (cache) => {
            await cache.addAll(LOCAL_FILES);
            for (const url of CDN_FILES) {
                try { await cache.add(url); }
                catch (err) { console.warn('[SW] CDN 캐시 실패:', url); }
            }
        })
    );
    self.skipWaiting();
});

// ═══ 2. ACTIVATE ═══
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.map((k) => k !== CACHE_NAME ? caches.delete(k) : undefined))
        )
    );
    self.clients.claim();
});

// ═══ 3. FETCH — Cache First ═══
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    if (event.request.url.includes('fonts.googleapis.com') ||
        event.request.url.includes('fonts.gstatic.com')) {
        event.respondWith(
            caches.open(CACHE_NAME).then(async (cache) => {
                const cached = await cache.match(event.request);
                const fetched = fetch(event.request).then((res) => {
                    if (res.ok) cache.put(event.request, res.clone());
                    return res;
                }).catch(() => cached);
                return cached || fetched;
            })
        );
        return;
    }

    event.respondWith(
        caches.match(event.request).then((cached) => {
            if (cached) return cached;
            return fetch(event.request).then((res) => {
                if (res && res.ok) {
                    const clone = res.clone();
                    caches.open(CACHE_NAME).then((c) => c.put(event.request, clone));
                }
                return res;
            }).catch(() => {
                if (event.request.headers.get('accept')?.includes('text/html'))
                    return caches.match('./index.html');
                return new Response('오프라인 상태입니다.', { status: 503 });
            });
        })
    );
});
