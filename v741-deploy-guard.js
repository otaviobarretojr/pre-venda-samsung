(()=>{
'use strict';
const EXPECTED='8.2.0',ONCE_KEY='preVendaV82Recovery';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function fetchJson(path){const r=await fetch(`${path}?t=${Date.now()}`,{cache:'no-store',headers:{'cache-control':'no-cache'}});if(!r.ok)throw Error(`${path} HTTP ${r.status}`);return r.json()}
async function clearRuntimeCaches(){if('serviceWorker'in navigator){const regs=await navigator.serviceWorker.getRegistrations();await Promise.all(regs.map(r=>r.update().catch(()=>null)))}if('caches'in window){const keys=await caches.keys();await Promise.all(keys.filter(k=>k.startsWith('pre-venda-samsung-')&&!k.includes('v8-2-0')).map(k=>caches.delete(k)))}}
async function verify(){for(let i=0;i<3;i++){try{const [v,h]=await Promise.all([fetchJson('./version.json'),fetchJson('./health.json')]);const ok=v.version===EXPECTED&&v.channel==='stable'&&v.published===true&&h.version===EXPECTED;document.documentElement.dataset.deployHealth=ok?'pass':'mismatch';window.V82_DEPLOY_HEALTH={ok,version:v.version,health:h.version,checkedAt:new Date().toISOString()};if(ok){sessionStorage.removeItem(ONCE_KEY);return true}break}catch(e){window.V82_DEPLOY_HEALTH={ok:false,error:e.message,checkedAt:new Date().toISOString()};await sleep(500)}}return false}
async function recover(){if(sessionStorage.getItem(ONCE_KEY)==='1')return false;sessionStorage.setItem(ONCE_KEY,'1');await clearRuntimeCaches();const u=new URL(location.href);u.searchParams.set('release',EXPECTED);u.searchParams.set('_refresh',Date.now());location.replace(u.toString());return true}
async function boot(){const ok=await verify();if(!ok)await recover()}
window.V741DeployGuard=window.V80DeployGuard=window.V81DeployGuard=window.V82DeployGuard={version:EXPECTED,verify,recover,clearRuntimeCaches};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,50),{once:true});else setTimeout(boot,50);
})();
