/* ═══════════════════════════════════════════════════════════════
   Service Worker — 스프링클러설비 펌프 용량 계산서
   Developer MANMIN · Ver-3.2

   ▣ Ver 3.2 핵심 개선 — 재설치 문제 원천 차단
   ① INSTALL  : skipWaiting() 즉시 호출 → 대기 없이 바로 활성화
   ② ACTIVATE : 현재 버전 외 모든 캐시 전부 삭제
                clients.claim() → 열린 탭 즉시 새 SW 적용
   ③ FETCH    : Network-First (오프라인 폴백)
   ④ MESSAGE  : SKIP_WAITING / CLEAR_CACHE 모두 처리
═══════════════════════════════════════════════════════════════ */

const CACHE_VER    = 'v3.2';
const CACHE_NAME   = `manmin-sprinkler-${CACHE_VER}`;
const STATIC_CACHE = `manmin-sprinkler-static-${CACHE_VER}`;

const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-32.png',
  './icons/favicon-16.png',
  './icons/favicon.ico',
];

/* ── INSTALL : 선캐싱 후 skipWaiting 즉시 호출 ── */
self.addEventListener('install', (event) => {
  console.log(`[SW ${CACHE_VER}] Installing...`);
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS).catch((e) => console.warn(`[SW ${CACHE_VER}] Pre-cache 일부 실패:`, e)))
      /* ★ 핵심: 즉시 skipWaiting → 이전 SW를 밀어내고 바로 activate */
      .then(() => self.skipWaiting())
  );
});

/* ── ACTIVATE : 이전 버전 캐시 전부 삭제 ── */
self.addEventListener('activate', (event) => {
  console.log(`[SW ${CACHE_VER}] Activating — cleaning old caches...`);
  event.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== CACHE_NAME && k !== STATIC_CACHE)
            .map((k) => {
              console.log(`[SW ${CACHE_VER}] 구버전 캐시 삭제:`, k);
              return caches.delete(k);
            })
        )
      )
      /* ★ 핵심: clients.claim() → 현재 열린 모든 탭에 즉시 적용 */
      .then(() => self.clients.claim())
      .then(() => console.log(`[SW ${CACHE_VER}] 활성화 완료`))
  );
});

/* ── FETCH : Network-First ── */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  /* 외부 CDN */
  if (url.origin !== self.location.origin) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(request, copy));
          }
          return res;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  /* 로컬 리소스 */
  event.respondWith(
    fetch(request)
      .then((res) => {
        if (!res || res.status !== 200 || res.type === 'opaque') return res;
        const copy = res.clone();
        caches.open(CACHE_NAME).then((c) => c.put(request, copy));
        return res;
      })
      .catch(() =>
        caches.match(request).then((cached) => cached || caches.match('./index.html'))
      )
  );
});

/* ── MESSAGE : SKIP_WAITING / CLEAR_CACHE ── */
self.addEventListener('message', (event) => {
  if (!event.data) return;

  if (event.data.type === 'SKIP_WAITING') {
    console.log(`[SW ${CACHE_VER}] SKIP_WAITING → 즉시 활성화`);
    self.skipWaiting();
  }

  if (event.data.type === 'CLEAR_CACHE') {
    console.log(`[SW ${CACHE_VER}] CLEAR_CACHE → 전체 캐시 삭제`);
    event.waitUntil(
      caches.keys()
        .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
        .then(() => {
          self.clients.matchAll().then((clients) =>
            clients.forEach((c) => c.postMessage({ type: 'CACHE_CLEARED' }))
          );
        })
    );
  }
});
