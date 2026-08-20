(()=>{
'use strict';
const report={version:'7.1.0-rc.1',at:new Date().toISOString(),checks:[],ok:true};
const check=(name,ok,detail='')=>{report.checks.push({name,ok:!!ok,detail});if(!ok)report.ok=false};
async function run(){
 try{
  check('config',!!window.PRE_SALE_V71,window.PRE_SALE_V71?.version||'ausente');
  check('data-layer',!!window.V71Data);
  check('budget-import',!!window.V71BudgetImport);
  check('pre-sale-history',typeof window.getHistory==='function');
  check('budget-catalog',typeof window.getBudgetCatalog==='function');
  check('ecosystem-catalog',typeof window.getPreSaleEcosystemCatalog==='function');
  check('budget-save',typeof window.saveBudgetRecord==='function');
  try{const r=await fetch('./version.json?selftest='+Date.now(),{cache:'no-store'});const v=await r.json();check('version-manifest',String(v.version||'').startsWith('7.1.0-rc.1'),v.version||'ausente')}catch(e){check('version-manifest',false,e.message)}
  if(window.V71Data&&window.PRE_SALE_V71){for(const name of ['preSale','budgets','budgetCatalog','ecosystem']){try{const repo=window.V71Data[name];const table=window.PRE_SALE_V71.data[name]?.table;await window.V71Data.request(`${table}?select=id&limit=1`);check('table:'+table,true)}catch(e){check('table:'+name,false,e.message)}}}
 }catch(e){check('runtime',false,e.message)}
 document.documentElement.dataset.v71Smoke=report.ok?'pass':'fail';window.V71_SELF_TEST=report;window.dispatchEvent(new CustomEvent('pre-sale:v71-self-test',{detail:report}));console[report.ok?'info':'error']('[V7.1 self-test]',report);
 return report;
}
window.runV71SelfTest=run;setTimeout(run,1700);window.addEventListener('load',()=>setTimeout(run,900),{once:true});
})();
