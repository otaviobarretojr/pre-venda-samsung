(()=>{
'use strict';
const EXPECTED='8.4.0';
const report={version:EXPECTED,at:new Date().toISOString(),checks:[],ok:true};
const check=(name,ok,detail='')=>{report.checks.push({name,ok:!!ok,detail});if(!ok)report.ok=false};
async function run(){try{
 check('config',window.PRE_SALE_V71?.version===EXPECTED,window.PRE_SALE_V71?.version||'ausente');check('data-layer',!!window.V71Data);check('supply-layer',window.V81Supply?.version===EXPECTED,window.V81Supply?.version||'ausente');check('supply-online-layer',window.V82SupplyOnline?.version===EXPECTED,window.V82SupplyOnline?.version||'ausente');check('history-layer',window.V84History?.version===EXPECTED,window.V84History?.version||'ausente');check('deploy-guard',window.V840DeployGuard?.version===EXPECTED,window.V840DeployGuard?.version||'ausente');
 try{const r=await fetch('./version.json?selftest='+Date.now(),{cache:'no-store'}),v=await r.json();check('version-manifest',v.version===EXPECTED&&v.stableBase==='8.3.0'&&v.channel==='stable'&&v.published===true,v.version||'ausente')}catch(e){check('version-manifest',false,e.message)}
 if(window.V71Data){for(const table of ['pre_vendas','inventory_imports','inventory_items','inventory_links','supply_requests']){try{await window.V71Data.request(`${table}?select=*&limit=1`);check('table:'+table,true)}catch(e){check('table:'+table,false,e.message)}}}
 window.V84History?.removeBudgetHistory?.();check('budget-history-removed',!document.getElementById('historyModeBar')&&!document.getElementById('budgetHistoryContent'));check('budget-save-hidden',!document.getElementById('budgetSave')||document.getElementById('budgetSave').hidden||document.getElementById('budgetSave').style.display==='none');check('history-title',!!document.getElementById('v84HistoryHead'));check('history-kpis',!!document.getElementById('v84HistoryKpis'));check('history-quick-filters',!!document.getElementById('v84QuickFilters'));check('no-auth-layer',!window.supabaseAuth&&!window.PRE_SALE_AUTH,'auth disabled');
}catch(e){check('runtime',false,e.message)}
 document.documentElement.dataset.v840Smoke=report.ok?'pass':'fail';window.V840_SELF_TEST=report;console[report.ok?'info':'error']('[V8.4.0 self-test]',report);return report}
window.runV840SelfTest=run;window.runV830SelfTest=run;window.runV824SelfTest=run;window.runV82SelfTest=run;window.runV71SelfTest=run;setTimeout(run,2200);window.addEventListener('load',()=>setTimeout(run,1300),{once:true});
})();