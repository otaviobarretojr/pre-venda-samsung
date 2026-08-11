const CACHE_NAME = "pre-venda-samsung-v4-3-6";
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./admin-lock.js?v=4.3.6"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    )).then(()=>self.clients.claim()))
  );
});

async function injectAdminLock(response){
  const text=await response.text();
  let injected=text;
  const hardHideStyle = '<style id="pv-hard-hide">@media screen{.doc-wrap,#printArea{display:none!important;visibility:hidden!important;height:0!important;min-height:0!important;margin:0!important;padding:0!important;overflow:hidden!important}}@media print{.doc-wrap,#printArea{display:block!important;visibility:visible!important;height:auto!important}}</style>';
  if(!injected.includes('id="pv-hard-hide"')){
    injected=injected.replace('</head>',hardHideStyle+'</head>');
  }
  if(!injected.includes('admin-lock.js?v=4.3.6')){
    injected=injected.replace('</body>','<script src="./admin-lock.js?v=4.3.6"></script></body>');
  }
  return new Response(injected,{
    status:response.status,
    statusText:response.statusText,
    headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store, no-cache, must-revalidate'}
  });
}

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  if (url.hostname.includes("supabase.co") || url.hostname.includes("jsdelivr.net")) {
    event.respondWith(fetch(req));
    return;
  }

  if(req.mode==='navigate' || url.pathname.endsWith('/index.html') || url.pathname.endsWith('/pre-venda-samsung/')){
    event.respondWith(
      fetch(req,{cache:'no-store'}).then(injectAdminLock).catch(async()=>{
        const cached=await caches.match('./index.html');
        return cached?injectAdminLock(cached):Response.error();
      })
    );
    return;
  }

  event.respondWith(
    fetch(req,{cache:'no-store'})
      .then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, clone));
        return response;
      })
      .catch(() => caches.match(req))
  );
});