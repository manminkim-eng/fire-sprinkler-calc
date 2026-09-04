/* ═══════════════════════════════════════════════════════════════
   R25 회차 2026-09-04 — 자기 접두어 캐시 조회 · cors 프리캐시 · opaque 가드 · 캐시명 v5.0.2 (S10)
   Service Worker — 스프링클러설비 펌프 용량 계산서
   Developer MANMIN · Ver-5.0

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

/* §17-1 (2026-09-02) — 도구 고유 접두어. 종전 필터는 같은 origin 의 39종 캐시를 전부 지웠다 */
const PREFIX       = 'manmin-sprinkler-';
/* ═ R25 (2026-09-04) — SW 캐시 origin 오염 차단 (S10 · 지시서 §21-1 R25)
   전역 caches 의 match 는 origin 전체를 검색한다. manminkim-eng.github.io 는 34종이 한 origin 이라
   다른 도구 캐시의 opaque 응답이 <script crossorigin>(cors) 요청에 돌아가 스크립트가 폐기됐다
   (30 #root 빈 화면 · 40 html2canvas undefined). 자기 접두어 캐시만 조회하고, cross-origin
   프리캐시는 cors 로 받으며, opaque↔cors 불일치 시 캐시를 쓰지 않는다. */
const MM_EXCLUDE = [];   /* 내 접두어로 시작하지만 남의 캐시인 이름 (§17-1 충돌) */
const mmOwn   = (k) => k.indexOf(PREFIX) === 0 && !MM_EXCLUDE.some((x) => k.indexOf(x) === 0);
const mmReq   = (u) => (typeof u === 'string' && u.indexOf('http') === 0) ? new Request(u, { mode: 'cors' }) : u;
const mmMatch = (req, opt) => caches.keys()
  .then((ks) => ks.filter(mmOwn))
  .then((ks) => ks.reduce((p, k) => p.then((r) => r || caches.open(k).then((c) => c.match(req, opt))), Promise.resolve(undefined)))
  .then((r) => (r && r.type === 'opaque' && req && req.mode === 'cors') ? undefined : r);

const CACHE_VER    = 'v5.0.2';
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
  /* 로컬 폴백 폰트 — CDN 차단·오프라인 시 한글 깨짐 방지 */
  './assets/fonts/manmin-fonts.css',
  './assets/fonts/NotoSansKR-var.woff2',
];

/* ── INSTALL : 선캐싱 후 skipWaiting 즉시 호출 ── */
self.addEventListener('install', (event) => {
  console.log(`[SW ${CACHE_VER}] Installing...`);
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) =>
        Promise.allSettled(PRECACHE_URLS.map((u) => cache.add(mmReq(u)).catch((e) => console.warn('[SW] precache skip:', u, e))))
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
            .filter((k) => k !== CACHE_NAME && k !== STATIC_CACHE && mmOwn(k))
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
        .catch(() => mmMatch(request))
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
        mmMatch(request).then((cached) => cached || mmMatch('./index.html'))
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
