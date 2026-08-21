(()=>{
'use strict';
const EXPECTED='8.2.1';
const report={version:EXPECTED,at:new Date().toISOString(),checks:[],ok:true};
const check=(name,ok,detail='')=>{report.checks.push({name,ok:!!ok,detail});if(!ok)report.ok=false};
async function run(){try{
 check('config',window.PRE_SALE_V71?.version===EXPECTED,window.PRE_SALE_V71?.version||'ausente');
 check('data-layer',!!window.V71Data);check('maturity-layer',!!window.V80Maturity);check('supply-layer',!!window.V81Supply);check('supply-online-layer',!!window.V82SupplyOnline);check('deploy-guard',window.V821DeployGuard?.version===EXPECTED,window.V821DeployGuard?.version||'ausente');
 try{const r=await fetch('./version.json?selftest='+Date.now(),{cache:'no-store'}),v=await r.json();check('version-manifest',v.version===EXPECTED&&v.channel==='stable'&&v.published===true&&v.authentication===false,v.version||'ausente')}catch(e){check('version-manifest',false,e.message)}
 if(window.V71Data){for(const table of ['pre_vendas','budgets','budget_catalog','ecosystem_catalog','inventory_imports','inventory_items','inventory_links','supply_requests']){try{await window.V71Data.request(`${table}?select=*&limit=1`);check('table:'+table,true)}catch(e){check('table:'+table,false,e.message)}}}
 window.V81Supply?.ensureEnterpriseNav?.();
 const nav=document.querySelector('#enterpriseSidebar [data-panel="supplyPanel"]');check('supply-sidebar-nav',!!nav,nav?.textContent?.trim()||'ausente');check('supply-panel',!!document.getElementById('supplyPanel'));check('supply-reconcile',typeof window.V81Supply?.reconcile==='function');check('supply-import',typeof window.V81Supply?.importFile==='function');check('supply-online-sync',typeof window.V82SupplyOnline?.syncImport==='function');check('supply-request',typeof window.V82SupplyOnline?.createRequest==='function');check('no-auth-layer',!window.supabaseAuth&&!window.PRE_SALE_AUTH,'auth disabled');
}catch(e){check('runtime',false,e.message)}
 document.documentElement.dataset.v821Smoke=report.ok?'pass':'fail';window.V821_SELF_TEST=report;window.dispatchEvent(new CustomEvent('pre-sale:v821-self-test',{detail:report}));console[report.ok?'info':'error']('[V8.2.1 self-test]',report);return report}
window.runV821SelfTest=run;window.runV82SelfTest=run;window.runV81SelfTest=run;window.runV71SelfTest=run;setTimeout(run,2100);window.addEventListener('load',()=>setTimeout(run,1200),{once:true});
})();