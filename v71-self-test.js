(()=>{
'use strict';
const EXPECTED='7.3.0';
const report={version:EXPECTED,at:new Date().toISOString(),checks:[],ok:true};
const check=(name,ok,detail='')=>{report.checks.push({name,ok:!!ok,detail});if(!ok)report.ok=false};
async function run(){try{
 check('config',window.PRE_SALE_V71?.version===EXPECTED,window.PRE_SALE_V71?.version||'ausente');
 check('data-layer',!!window.V71Data);check('budget-import',!!window.V71BudgetImport);check('stability-layer',!!window.V711_STABILITY);check('consolidation-core',!!window.V72Core);check('operations-layer',window.V73Operations?.version===EXPECTED,window.V73Operations?.version||'ausente');
 check('pre-sale-history',typeof window.getHistory==='function');check('budget-catalog',typeof window.getBudgetCatalog==='function');check('ecosystem-catalog',typeof window.getPreSaleEcosystemCatalog==='function');check('budget-save',typeof window.saveBudgetRecord==='function');
 try{const r=await fetch('./version.json?selftest='+Date.now(),{cache:'no-store'}),v=await r.json();check('version-manifest',v.version===EXPECTED&&v.channel==='stable'&&v.published===true&&v.authentication===false,v.version||'ausente')}catch(e){check('version-manifest',false,e.message)}
 if(window.V71Data&&window.PRE_SALE_V71){for(const name of ['preSale','budgets','budgetCatalog','ecosystem']){try{const table=window.PRE_SALE_V71.data[name]?.table;await window.V71Data.request(`${table}?select=id&limit=1`);check('table:'+table,true)}catch(e){check('table:'+name,false,e.message)}}for(const table of ['sync_tombstones','data_backups','sync_events','audit_events','commercial_stages']){try{await window.V71Data.request(`${table}?select=*&limit=1`);check('table:'+table,true)}catch(e){check('table:'+table,false,e.message)}}}
 check('offline-queue',Array.isArray(JSON.parse(localStorage.getItem('preVendaV72Queue')||'[]')));check('no-auth-layer',!window.supabaseAuth&&!window.PRE_SALE_AUTH,'auth disabled');check('network-api',typeof fetch==='function');
}catch(e){check('runtime',false,e.message)}
 document.documentElement.dataset.v73Smoke=report.ok?'pass':'fail';window.V73_SELF_TEST=report;window.dispatchEvent(new CustomEvent('pre-sale:v73-self-test',{detail:report}));console[report.ok?'info':'error']('[V7.3 self-test]',report);return report}
window.runV73SelfTest=run;window.runV72SelfTest=run;window.runV71SelfTest=run;setTimeout(run,1800);window.addEventListener('load',()=>setTimeout(run,900),{once:true});
})();
