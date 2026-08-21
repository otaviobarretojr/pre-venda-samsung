(()=>{
'use strict';
const EXPECTED='8.5.1';
const report={version:EXPECTED,at:new Date().toISOString(),checks:[],ok:true};
const check=(name,ok,detail='')=>{report.checks.push({name,ok:!!ok,detail});if(!ok)report.ok=false};
async function run(){try{
 check('config',window.PRE_SALE_V71?.version===EXPECTED,window.PRE_SALE_V71?.version||'ausente');check('data-layer',!!window.V71Data);check('supply-layer',!!window.V81Supply);check('supply-online-layer',!!window.V82SupplyOnline);check('history-layer',!!window.V84History);check('supply-v85-layer',window.V85SupplyUI?.version==='8.5.0',window.V85SupplyUI?.version||'ausente');check('history-status-layer',window.V851HistoryStatus?.version===EXPECTED,window.V851HistoryStatus?.version||'ausente');check('deploy-guard',window.V851DeployGuard?.version===EXPECTED,window.V851DeployGuard?.version||'ausente');
 try{const r=await fetch('./version.json?selftest='+Date.now(),{cache:'no-store'}),v=await r.json();check('version-manifest',v.version===EXPECTED&&v.stableBase==='8.5.0'&&v.channel==='stable'&&v.published===true,v.version||'ausente')}catch(e){check('version-manifest',false,e.message)}
 window.renderHistory?.();await new Promise(r=>setTimeout(r,80));const hasRows=(typeof window.getHistory==='function'&&window.getHistory().length>0);check('history-status-control',!hasRows||!!document.querySelector('[data-v851-status]'));check('status-options',Array.isArray(window.V851HistoryStatus?.statuses)&&window.V851HistoryStatus.statuses.includes('Cliente avisado')&&window.V851HistoryStatus.statuses.includes('Retirado'));check('history-presale-only',!document.getElementById('historyModeBar'));check('no-auth-layer',!window.supabaseAuth&&!window.PRE_SALE_AUTH,'auth disabled');
}catch(e){check('runtime',false,e.message)}
 document.documentElement.dataset.v851Smoke=report.ok?'pass':'fail';window.V851_SELF_TEST=report;console[report.ok?'info':'error']('[V8.5.1 self-test]',report);return report}
window.runV851SelfTest=run;window.runV850SelfTest=run;window.runV840SelfTest=run;window.runV71SelfTest=run;setTimeout(run,2350);window.addEventListener('load',()=>setTimeout(run,1450),{once:true});
})();