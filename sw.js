/* ═══════════════════════════════════════════════════════════════
   스프링클러설비 펌프 계산서 — Service Worker
   ENGINEER KIM MANMIN · Ver 3.0
   전략:
     · 정적 자산  → Cache-First
     · HTML 페이지 → Network-First (최신 버전 우선 + 오프라인 폴백)
     · CDN / 폰트  → Stale-While-Revalidate
     · 구버전 캐시 자동 삭제
   ═══════════════════════════════════════════════════════════════ */

const APP_ID     = 'manmin-sprinkler';
const CACHE_VER  = 'v3.0';
const C_STATIC   = `${APP_ID}-static-${CACHE_VER}`;
const C_DYNAMIC  = `${APP_ID}-dynamic-${CACHE_VER}`;
const C_FONTS    = `${APP_ID}-fonts-${CACHE_VER}`;
const ALL_CACHES = [C_STATIC, C_DYNAMIC, C_FONTS];
const DYN_MAX    = 60;

/* ── 사전 캐시 핵심 자산 ── */
const PRECACHE = [
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

/* ── CDN 호스트 (Stale-While-Revalidate) ── */
const CDN_HOSTS = [
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'unpkg.com',
];

/* ════════════════════════
   INSTALL
════════════════════════ */
self.addEventListener('install', e => {
  console.log(`[SW ${CACHE_VER}] install`);
  e.waitUntil(
    caches.open(C_STATIC)
      .then(c => c.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

/* ════════════════════════
   ACTIVATE — 구버전 삭제
════════════════════════ */
self.addEventListener('activate', e => {
  console.log(`[SW ${CACHE_VER}] activate`);
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(k => k.startsWith(APP_ID) && !ALL_CACHES.includes(k))
          .map(k => { console.log(`[SW] 구버전 삭제: ${k}`); return caches.delete(k); })
      ))
      .then(() => self.clients.claim())
  );
});

/* ════════════════════════
   FETCH
════════════════════════ */
self.addEventListener('fetch', e => {
  const req = e.request;
  const url = new URL(req.url);

  if (req.method !== 'GET') return;
  if (!['http:', 'https:'].includes(url.protocol)) return;

  /* CDN → Stale-While-Revalidate */
  if (CDN_HOSTS.some(h => url.hostname.includes(h))) {
    e.respondWith(swrStrategy(req, C_FONTS));
    return;
  }

  /* HTML 탐색 → Network-First */
  if (req.mode === 'navigate') {
    e.respondWith(networkFirst(req));
    return;
  }

  /* 정적 자산 → Cache-First */
  e.respondWith(cacheFirst(req));
});

/* ── Cache-First ── */
async function cacheFirst(req) {
  const hit = await caches.match(req);
  if (hit) return hit;
  try {
    const res = await fetch(req);
    if (res.ok) await putCache(C_DYNAMIC, req, res.clone());
    return res;
  } catch {
    return new Response('오프라인 상태입니다.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }
    });
  }
}

/* ── Network-First (HTML) ── */
async function networkFirst(req) {
  try {
    const res = await fetch(req);
    if (res.ok) await putCache(C_STATIC, req, res.clone());
    return res;
  } catch {
    const hit = await caches.match(req) || await caches.match('./index.html');
    return hit || new Response(offlinePage(), {
      status: 200,
      headers: { 'Content-Type': 'text/html;charset=utf-8' }
    });
  }
}

/* ── Stale-While-Revalidate ── */
async function swrStrategy(req, cacheName) {
  const cache  = await caches.open(cacheName);
  const cached = await cache.match(req);
  const fetchP = fetch(req).then(res => {
    if (res.ok) cache.put(req, res.clone());
    return res;
  }).catch(() => null);
  return cached || fetchP;
}

/* ── 캐시 저장 + 크기 관리 ── */
async function putCache(cacheName, req, res) {
  const cache = await caches.open(cacheName);
  await cache.put(req, res);
  const keys = await cache.keys();
  if (keys.length > DYN_MAX) await cache.delete(keys[0]);
}

/* ── 오프라인 폴백 HTML ── */
function offlinePage() {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>오프라인 — 스프링클러 계산서</title>
<style>
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'Noto Sans KR',sans-serif;background:#15803d;min-height:100vh;
  display:flex;align-items:center;justify-content:center;padding:24px;}
.card{background:white;border-radius:20px;padding:40px 36px;max-width:420px;
  width:100%;text-align:center;box-shadow:0 24px 64px rgba(0,0,0,0.3);}
.icon{font-size:64px;margin-bottom:16px;line-height:1;}
h1{font-size:20px;font-weight:900;color:#15803d;margin-bottom:8px;}
p{font-size:13px;color:#6b7280;line-height:1.8;margin-bottom:20px;}
.badge{display:inline-block;background:#f0fdf4;color:#15803d;
  border:1px solid #bbf7d0;border-radius:20px;padding:6px 16px;
  font-size:12px;font-weight:700;margin-bottom:24px;}
button{background:#15803d;color:white;border:none;border-radius:10px;
  padding:12px 28px;font-size:14px;font-weight:700;cursor:pointer;width:100%;}
button:active{background:#166534;}
.footer{margin-top:20px;font-size:10px;color:#9ca3af;
  font-family:'Courier New',monospace;letter-spacing:0.08em;}
</style>
</head>
<body>
<div class="card">
  <div class="icon">📡</div>
  <h1>인터넷 연결 없음</h1>
  <div class="badge">오프라인 모드</div>
  <p>네트워크 연결을 확인해 주세요.<br/>연결이 복구되면 자동으로 최신 버전이 로드됩니다.</p>
  <button onclick="location.reload()">🔄 다시 시도</button>
  <div class="footer">ENGINEER KIM MANMIN · Ver 3.0</div>
</div>
</body>
</html>`;
}

/* ════════════════════════
   MESSAGE — 클라이언트 통신
════════════════════════ */
self.addEventListener('message', e => {
  if (e.data?.type === 'SKIP_WAITING')  self.skipWaiting();
  if (e.data?.type === 'GET_VERSION')
    e.ports[0]?.postMessage({ version: CACHE_VER, caches: ALL_CACHES });
  if (e.data?.type === 'CLEAR_CACHE')
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith(APP_ID)).map(k => caches.delete(k))))
      .then(() => e.ports[0]?.postMessage({ cleared: true }));
});
