(()=>{
'use strict';
const RELEASE='7.0.0-rc1';
const REQUIRED_PANELS=['homePanel','formPanel','budgetPanel','ecosystemOffersPanel','historyPanel','dashboardPanel','settingsPanel'];
const REQUIRED_FUNCTIONS=['switchTab','getHistory','syncAll','openBudget','saveBudgetRecord'];
const report={release:RELEASE,at:new Date().toISOString(),checks:[],ok:true};
const check=(name,ok,detail='')=>{report.checks.push({name,ok:!!ok,detail});if(!ok)report.ok=false;};
function run(){
 check('release',window.PRE_SALE_RELEASE===RELEASE,String(window.PRE_SALE_RELEASE||''));
 REQUIRED_PANELS.forEach(id=>check('panel:'+id,!!document.getElementById(id)));
 REQUIRED_FUNCTIONS.forEach(name=>check('function:'+name,typeof window[name]==='function',typeof window[name]));
 const history=typeof window.getHistory==='function'?window.getHistory():null;
 check('history-readable',Array.isArray(history),Array.isArray(history)?String(history.length):'unavailable');
 check('history-mode',!!document.getElementById('historyMode'));
 check('budget-app',!!window.budgetApp && typeof window.budgetApp.collect==='function' && typeof window.budgetApp.load==='function' && typeof window.budgetApp.print==='function');
 check('ecosystem-readonly',!!document.querySelector('#ecosystemOffersPanel .eco-readonly'));
 check('enterprise-shell',!!document.getElementById('enterpriseSidebar'));
 check('version-label',document.querySelector('#enterpriseSidebar .ent-sidebar-foot span')?.textContent==='v'+RELEASE,document.querySelector('#enterpriseSidebar .ent-sidebar-foot span')?.textContent||'');
 check('sync-indicator',!!document.querySelector('#enterpriseSidebar') && typeof window.syncAll==='function');
 check('storage-presale',typeof localStorage!=='undefined');
 check('service-worker','serviceWorker' in navigator);
 window.__V7_SMOKE_REPORT__=Object.freeze(report);
 document.documentElement.dataset.v7Smoke=report.ok?'pass':'fail';
 console.info('[V7 smoke]',report.ok?'PASS':'FAIL',report);
 window.dispatchEvent(new CustomEvent('v7:smoke',{detail:report}));
}
if(document.readyState==='complete')setTimeout(run,500);else window.addEventListener('load',()=>setTimeout(run,500),{once:true});
})();
