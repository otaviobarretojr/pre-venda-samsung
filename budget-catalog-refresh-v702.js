(()=>{
'use strict';
const VERSION='7.0.2';
function key(v){return String(v||'').trim().toLocaleLowerCase('pt-BR')}
function merge(current,incoming){
 const map=new Map();
 for(const p of Array.isArray(current)?current:[]) if(p?.name) map.set(key(p.name),p);
 for(const p of Array.isArray(incoming)?incoming:[]) if(p?.name){
   const old=map.get(key(p.name))||{};
   map.set(key(p.name),{...old,...p,capacities:Array.isArray(p.capacities)?p.capacities:(old.capacities||[]),colors:Array.isArray(p.colors)?p.colors:(old.colors||[]),finalPrices:{...(old.finalPrices||{}),...(p.finalPrices||{})}});
 }
 return [...map.values()];
}
async function refresh(){
 const source=window.SAMSUNG_AM_CATALOG?.products||[];
 if(!source.length||typeof window.getBudgetCatalog!=='function')return false;
 const current=window.getBudgetCatalog()||[];
 const next=merge(current,source);
 if(typeof window.saveBudgetCatalog==='function') await window.saveBudgetCatalog(next);
 else localStorage.setItem('samsung_budget_catalog_v1',JSON.stringify(next));
 window.dispatchEvent(new CustomEvent('samsung:budget-catalog-refreshed',{detail:{version:VERSION,count:next.length,imported:source.length}}));
 console.info('[Budget catalog]',source.length,'produtos promocionais AM mesclados; total',next.length);
 return true;
}
window.refreshBudgetCatalogV702=refresh;
let tries=0;const timer=setInterval(async()=>{tries++;try{if(await refresh()){clearInterval(timer)}}catch(e){console.warn('[Budget catalog] refresh pendente',e)}if(tries>=20)clearInterval(timer)},300);
setTimeout(()=>refresh().catch(()=>{}),1500);
})();