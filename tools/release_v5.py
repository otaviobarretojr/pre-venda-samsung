from pathlib import Path
import re
p=Path('index.html')
s=p.read_text(encoding='utf-8')
s=re.sub(r'<link rel="stylesheet" href="\./v5\.css[^>]*>','',s)
s=re.sub(r'<script src="\./v5\.js[^>]*></script>','',s)
s=s.replace('</head>','<link rel="stylesheet" href="./v5.css?v=5.0">\n</head>')
s=s.replace('</body>','<script src="./v5.js?v=5.0"></script>\n</body>')
s=s.replace('service-worker.js?v=4.5.2','service-worker.js?v=5.0')
p.write_text(s,encoding='utf-8')
Path('service-worker.js').write_text("""const CACHE_NAME='pre-venda-samsung-v5-0';
const APP_SHELL=['./','./index.html','./ecosystem-v454.js','./v5.js','./v5.css','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(APP_SHELL)));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);if(u.hostname.includes('supabase.co')){e.respondWith(fetch(r));return;}if(r.mode==='navigate'){e.respondWith(fetch(r,{cache:'no-store'}).then(resp=>{const c=resp.clone();caches.open(CACHE_NAME).then(cache=>cache.put('./index.html',c));return resp;}).catch(()=>caches.match('./index.html')));return;}e.respondWith(fetch(r,{cache:'no-store'}).then(resp=>{if(resp.ok&&u.origin===self.location.origin){const c=resp.clone();caches.open(CACHE_NAME).then(cache=>cache.put(r,c));}return resp;}).catch(()=>caches.match(r)));});
""",encoding='utf-8')
