/* ═══════════════════════════════════════════════════════════════
   Service Worker — 스프링클러설비 펌프 용량 계산서
   Developer MANMIN · Ver-3.3

   ▣ Ver 3.3 — 재설치 문제 완전 해결 (최종판)
   -------------------------------------------------------
   Ver 3.2 문제점:
     reg.waiting 자동 skipWaiting → controllerchange 발생
     → location.reload() 즉시 실행
     → beforeinstallprompt 타이밍 소실 → FAB 미표시

   Ver 3.3 해결책:
   ① reg.waiting 자동 처리 완전 제거
      (사용자가 "업데이트" 버튼 직접 클릭 시에만 적용)
   ② index.html 캐시 전략: Network-First 유지
   ③ INSTALL  : skipWaiting 즉시 → 대기 없이 활성화
   ④ ACTIVATE : 현재 버전 외 모든 캐시 전부 삭제
                clients.claim() → 열린 탭 즉시 적용
   ⑤ MESSAGE  : SKIP_WAITING / CLEAR_CACHE
   -------------------------------------------------------
   ★ 다음 배포 시: CACHE_VER 숫자만 올리면 됨
═══════════════════════════════════════════════════════════════ */

const CACHE_VER    = 'v3.3';
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
      .then((cache) =>
        cache.addAll(PRECACHE_URLS)
          .catch((e) => console.warn(`[SW ${CACHE_VER}] Pre-cache 일부 실패:`, e))
      )
      .then(() => self.skipWaiting())
  );
});

/* ── ACTIVATE : 이전 버전 캐시 전부 삭제 ── */
self.addEventListener('activate', (event) => {
  console.log(`[SW ${CACHE_VER}] Activating...`);
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
      .then(() => self.clients.claim())
      .then(() => console.log(`[SW ${CACHE_VER}] 활성화 완료`))
  );
});

/* ── FETCH : Network-First (index.html 포함 항상 네트워크 우선) ──
   ★ Cache-First 절대 금지
   재설치 후 최신 앱이 즉시 반영되도록 보장                        */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  /* 외부 CDN (Google Fonts, unpkg 등) */
  if (url.origin !== self.location.origin) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (res && res.status === 200) {
            caches.open(CACHE_NAME).then((c) => c.put(request, res.clone()));
          }
          return res;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  /* 로컬 파일 — 항상 Network-First */
  event.respondWith(
    fetch(request)
      .then((res) => {
        if (res && res.status === 200 && res.type !== 'opaque') {
          caches.open(CACHE_NAME).then((c) => c.put(request, res.clone()));
        }
        return res;
      })
      .catch(() =>
        caches.match(request).then((cached) => cached || caches.match('./index.html'))
      )
  );
});

/* ── MESSAGE ── */
self.addEventListener('message', (event) => {
  if (!event.data) return;

  /* SKIP_WAITING: 업데이트 배너의 "업데이트" 버튼 클릭 시만 실행
     ★ reg.waiting 자동 호출 없음 — 사용자 의사결정 후에만 실행  */
  if (event.data.type === 'SKIP_WAITING') {
    console.log(`[SW ${CACHE_VER}] SKIP_WAITING → 즉시 활성화`);
    self.skipWaiting();
  }

  /* CLEAR_CACHE: 긴급 초기화 (콘솔 clearPwaCache() 호출 시) */
  if (event.data.type === 'CLEAR_CACHE') {
    console.log(`[SW ${CACHE_VER}] CLEAR_CACHE → 전체 캐시 삭제`);
    event.waitUntil(
      caches.keys()
        .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
        .then(() =>
          self.clients.matchAll().then((clients) =>
            clients.forEach((c) => c.postMessage({ type: 'CACHE_CLEARED' }))
          )
        )
    );
  }
});
