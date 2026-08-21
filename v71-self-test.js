(()=>{
'use strict';
const EXPECTED='8.2.4';
const report={version:EXPECTED,at:new Date().toISOString(),checks:[],ok:true};
const check=(name,ok,detail='')=>{report.checks.push({name,ok:!!ok,detail});if(!ok)report.ok=false};
async function run(){try{
 check('config',window.PRE_SALE_V71?.version===EXPECTED,window.PRE_SALE_V71?.version||'ausente');check('data-layer',!!window.V71Data);check('supply-layer',window.V81Supply?.version===EXPECTED,window.V81Supply?.version||'ausente');check('supply-online-layer',window.V82SupplyOnline?.version===EXPECTED,window.V82SupplyOnline?.version||'ausente');check('deploy-guard',window.V824DeployGuard?.version===EXPECTED,window.V824DeployGuard?.version||'ausente');
 try{const r=await fetch('./version.json?selftest='+Date.now(),{cache:'no-store'}),v=await r.json();check('version-manifest',v.version===EXPECTED&&v.stableBase==='8.2.3'&&v.channel==='stable'&&v.published===true,v.version||'ausente')}catch(e){check('version-manifest',false,e.message)}
 if(window.V71Data){for(const table of ['pre_vendas','inventory_imports','inventory_items','inventory_links','supply_requests']){try{await window.V71Data.request(`${table}?select=*&limit=1`);check('table:'+table,true)}catch(e){check('table:'+table,false,e.message)}}}
 check('inventory-parser',typeof window.V81Supply?.parseHtmlInventory==='function');check('authoritative-import',typeof window.V81Supply?.importFile==='function');check('wearable-demand',String(window.V81Supply?.uniqueSales||'').length>0);check('online-latest-snapshot',typeof window.V82SupplyOnline?.hydrateOnline==='function');check('no-auth-layer',!window.supabaseAuth&&!window.PRE_SALE_AUTH,'auth disabled');
}catch(e){check('runtime',false,e.message)}
 document.documentElement.dataset.v824Smoke=report.ok?'pass':'fail';window.V824_SELF_TEST=report;console[report.ok?'info':'error']('[V8.2.4 self-test]',report);return report}
window.runV824SelfTest=run;window.runV823SelfTest=run;window.runV82SelfTest=run;window.runV71SelfTest=run;setTimeout(run,2100);window.addEventListener('load',()=>setTimeout(run,1200),{once:true});
})();