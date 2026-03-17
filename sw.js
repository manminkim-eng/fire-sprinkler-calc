/* ═══════════════════════════════════════════════════════════════
   스프링클러설비 펌프 용량 계산서 — Service Worker
   NFPC 103 / NFTC 103 / NFTC 604 기준 | ENGINEER KIM MANMIN
   전략: Cache-First (로컬 자산) + Network-First (외부 CDN)
   ═══════════════════════════════════════════════════════════════ */

const CACHE_NAME   = 'sprinkler-pump-v1.0';
const CDN_CACHE    = 'sprinkler-pump-cdn-v1.0';
const OFFLINE_PAGE = './index.html';

const APP_SHELL = [
  './index.html','./manifest.json',
  './icons/icon-72.png','./icons/icon-96.png','./icons/icon-128.png',
  './icons/icon-144.png','./icons/icon-152.png','./icons/icon-192.png',
  './icons/icon-384.png','./icons/icon-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-32.png','./icons/favicon-16.png','./icons/favicon.ico',
];

const CDN_ORIGINS = [
  'https://fonts.googleapis.com','https://fonts.gstatic.com',
  'https://cdn.jsdelivr.net','https://cdnjs.cloudflare.com','https://unpkg.com',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(c=>c.addAll(APP_SHELL))
      .then(()=>{ console.log('[SW] 프리캐시 완료'); return self.skipWaiting(); })
      .catch(()=>self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys=>Promise.all(
      keys.filter(k=>![CACHE_NAME,CDN_CACHE].includes(k)).map(k=>caches.delete(k))
    )).then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const {request}=event;
  if(request.method!=='GET'||!request.url.startsWith('http')) return;
  const url=new URL(request.url);
  const isCDN=CDN_ORIGINS.some(o=>url.origin===new URL(o).origin||request.url.startsWith(o));
  event.respondWith(isCDN?networkFirstCDN(request):cacheFirstLocal(request));
});

async function cacheFirstLocal(request){
  const cached=await caches.match(request);
  if(cached) return cached;
  try{
    const res=await fetch(request);
    if(res&&res.status===200&&res.type!=='opaque')
      (await caches.open(CACHE_NAME)).put(request,res.clone());
    return res;
  }catch(_){
    if(request.headers.get('accept')?.includes('text/html')){
      const offline=await caches.match(OFFLINE_PAGE);
      if(offline) return offline;
    }
    return new Response('오프라인 상태입니다.',{status:503,headers:{'Content-Type':'text/plain;charset=utf-8'}});
  }
}

async function networkFirstCDN(request){
  try{
    const res=await fetch(request);
    if(res&&res.status===200)(await caches.open(CDN_CACHE)).put(request,res.clone());
    return res;
  }catch(_){
    return (await caches.match(request,{cacheName:CDN_CACHE}))||new Response('',{status:503});
  }
}

/* SKIP_WAITING — type/action 양쪽 호환 */
self.addEventListener('message',(event)=>{
  if(event.data?.type==='SKIP_WAITING'||event.data?.action==='SKIP_WAITING') self.skipWaiting();
  if(event.data?.action==='CLEAR_CACHE')
    caches.keys().then(keys=>Promise.all(keys.map(k=>caches.delete(k))));
});

self.addEventListener('push',(event)=>{
  const data=event.data?.json()??{title:'스프링클러 계산서',body:'업데이트가 있습니다.'};
  event.waitUntil(self.registration.showNotification(data.title,{
    body:data.body,icon:'./icons/icon-192.png',badge:'./icons/icon-72.png'
  }));
});
