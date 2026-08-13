const CACHE_NAME = 'pre-venda-samsung-v4-5-4';
const APP_SHELL = [
  './',
  './index.html',
  './ecosystem-v454.js',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (url.hostname.includes('supabase.co')) {
    event.respondWith(fetch(req));
    return;
  }

  if (req.mode === 'navigate') {
    event.respondWith((async()=>{
      try {
        const response=await fetch(req,{cache:'no-store'});
        let html=await response.text();
        html=html.replace(/<script src="\.\/dual-lines\.js[^>]*><\/script>/g,'');
        if(!html.includes('ecosystem-v454.js')) html=html.replace('</body>','<script src="./ecosystem-v454.js?v=4.5.4"></script></body>');
        const out=new Response(html,{status:response.status,statusText:response.statusText,headers:{'Content-Type':'text/html; charset=utf-8'}});
        const clone=out.clone();caches.open(CACHE_NAME).then(cache=>cache.put('./index.html',clone));
        return out;
      } catch(e) {
        const cached=await caches.match('./index.html');
        if(!cached) throw e;
        let html=await cached.text();
        html=html.replace(/<script src="\.\/dual-lines\.js[^>]*><\/script>/g,'');
        if(!html.includes('ecosystem-v454.js')) html=html.replace('</body>','<script src="./ecosystem-v454.js?v=4.5.4"></script></body>');
        return new Response(html,{headers:{'Content-Type':'text/html; charset=utf-8'}});
      }
    })());
    return;
  }

  event.respondWith(
    fetch(req, { cache: 'no-store' })
      .then(response => {
        if (response.ok && url.origin === self.location.origin) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, clone));
        }
        return response;
      })
      .catch(() => caches.match(req))
  );
});