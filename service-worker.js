const CACHE_NAME = 'pre-venda-samsung-v7-1-infra-2';
const APP_SHELL = [
  './','./index.html','./ecosystem-v454.js','./v5.js','./v5.css','./v51.js','./v51.css','./bulk-import.js','./history-multiselect.js','./admin-safety.js','./dashboard-v515.js','./dashboard-ranking-filter.js','./dashboard-calc-fix.js','./save-guard.js','./stability-v520.js','./dashboard-clean-v520.js','./professional-v540.js','./management-v560.js','./budget-v570.js','./budget-history-v600.js','./catalog-am-2025-2026.js','./budget-brand-20260820.js','./pre-sale-draft-v630.js','./professional-v640.js','./professional-v641-hardening.js','./professional-v642-finalization.js','./enterprise-v650.js','./ecosystem-offers-v657.js','./ecosystem-print-v700.js','./v7-release.js','./budget-catalog-refresh-v702.js','./pre-sale-watches-v7.js','./v7-smoke-test.js','./v71-config.js','./v71-data.js','./v71-budget-import.js','./v71-integration.js','./version.json','./manifest.webmanifest','./icon-192.png','./icon-512.png'
];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(APP_SHELL)));self.skipWaiting()});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',event=>{
 const req=event.request;if(req.method!=='GET')return;const url=new URL(req.url);
 if(url.hostname.includes('supabase.co')){event.respondWith(fetch(req));return}
 if(req.mode==='navigate'){event.respondWith(fetch(req,{cache:'no-store'}).then(response=>{const clone=response.clone();caches.open(CACHE_NAME).then(cache=>cache.put('./index.html',clone));return response}).catch(()=>caches.match('./index.html')));return}
 event.respondWith(fetch(req,{cache:'no-store'}).then(response=>{if(response.ok&&url.origin===self.location.origin){const clone=response.clone();caches.open(CACHE_NAME).then(cache=>cache.put(req,clone))}return response}).catch(()=>caches.match(req)))
});