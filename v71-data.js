(()=>{
'use strict';
const cfg=window.PRE_SALE_V71;if(!cfg)return console.error('V7.1 config ausente');
const SUPABASE_URL='https://thhhpzxlletdhhhprawv.supabase.co';
const SUPABASE_KEY='sb_publishable_kKuaZGT4lyA8kh1Sq2CCrA_VEJAXLKZ';
const bus=typeof BroadcastChannel==='function'?new BroadcastChannel('pre-sale-v711'):null;
const headers=(extra={})=>({'apikey':SUPABASE_KEY,'Authorization':'Bearer '+SUPABASE_KEY,'Content-Type':'application/json',...extra});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function request(path,options={}){let last;for(let attempt=0;attempt<3;attempt++){const ctl=new AbortController(),timer=setTimeout(()=>ctl.abort(),9000);try{const r=await fetch(`${SUPABASE_URL}/rest/v1/${path}`,{...options,signal:ctl.signal,headers:headers(options.headers),cache:'no-store'});clearTimeout(timer);if(!r.ok)throw new Error(`V7.1 data ${r.status}: ${await r.text()}`);if(r.status===204)return null;const text=await r.text();return text?JSON.parse(text):null}catch(e){clearTimeout(timer);last=e;if(attempt<2)await sleep(350*(attempt+1))}}throw last}
const local={get(key,fallback=[]){try{return JSON.parse(localStorage.getItem(key)||'null')??fallback}catch{return fallback}},set(key,value){localStorage.setItem(key,JSON.stringify(value));bus?.postMessage({type:'cache',key,at:Date.now()});return value}};
function repository(def){return Object.freeze({
 async list(order='updated_at.desc'){try{const rows=await request(`${def.table}?select=*&order=${order}`);local.set(def.localKey,rows||[]);return rows||[]}catch(e){console.warn(e);return local.get(def.localKey,[])}},
 async upsert(rows){const data=Array.isArray(rows)?rows:[rows];if(!data.length)return[];const stamped=data.map(x=>({...x,updated_at:x.updated_at||new Date().toISOString()}));await request(`${def.table}?on_conflict=id`,{method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=representation'},body:JSON.stringify(stamped)});const cached=local.get(def.localKey,[]),map=new Map(cached.map(x=>[x.id,x]));stamped.forEach(x=>map.set(x.id,{...(map.get(x.id)||{}),...x}));local.set(def.localKey,[...map.values()]);bus?.postMessage({type:'sync',table:def.table,at:Date.now()});return stamped},
 async remove(id){await request(`${def.table}?id=eq.${encodeURIComponent(id)}`,{method:'DELETE',headers:{Prefer:'return=minimal'}});local.set(def.localKey,local.get(def.localKey,[]).filter(x=>x.id!==id));bus?.postMessage({type:'sync',table:def.table,at:Date.now()})},
 cached(){return local.get(def.localKey,[])}
})}
window.V71Data=Object.freeze({preSale:repository(cfg.data.preSale),budgets:repository(cfg.data.budgets),budgetCatalog:repository(cfg.data.budgetCatalog),ecosystem:repository(cfg.data.ecosystem),request,local,bus});
})();
