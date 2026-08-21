(()=>{
'use strict';
const EXPECTED='8.1.0';
const report={version:EXPECTED,at:new Date().toISOString(),checks:[],ok:true};
const check=(name,ok,detail='')=>{report.checks.push({name,ok:!!ok,detail});if(!ok)report.ok=false};
async function run(){try{
 check('config',window.PRE_SALE_V71?.version===EXPECTED,window.PRE_SALE_V71?.version||'ausente');
 check('data-layer',!!window.V71Data);check('maturity-layer',!!window.V80Maturity);check('supply-layer',window.V81Supply?.version===EXPECTED,window.V81Supply?.version||'ausente');check('deploy-guard',window.V81DeployGuard?.version===EXPECTED,window.V81DeployGuard?.version||'ausente');
 try{const r=await fetch('./version.json?selftest='+Date.now(),{cache:'no-store'}),v=await r.json();check('version-manifest',v.version===EXPECTED&&v.channel==='stable'&&v.published===true&&v.authentication===false,v.version||'ausente')}catch(e){check('version-manifest',false,e.message)}
 if(window.V71Data&&window.PRE_SALE_V71){for(const name of ['preSale','budgets','budgetCatalog','ecosystem']){try{const table=window.PRE_SALE_V71.data[name]?.table;await window.V71Data.request(`${table}?select=id&limit=1`);check('table:'+table,true)}catch(e){check('table:'+name,false,e.message)}}}
 check('supply-reconcile',typeof window.V81Supply?.reconcile==='function');check('supply-import',typeof window.V81Supply?.importFile==='function');check('supply-bind',typeof window.V81Supply?.bind==='function');check('no-auth-layer',!window.supabaseAuth&&!window.PRE_SALE_AUTH,'auth disabled');
}catch(e){check('runtime',false,e.message)}
 document.documentElement.dataset.v81Smoke=report.ok?'pass':'fail';window.V81_SELF_TEST=report;window.dispatchEvent(new CustomEvent('pre-sale:v81-self-test',{detail:report}));console[report.ok?'info':'error']('[V8.1 self-test]',report);return report}
window.runV81SelfTest=run;window.runV80SelfTest=run;window.runV741SelfTest=run;window.runV71SelfTest=run;setTimeout(run,1700);window.addEventListener('load',()=>setTimeout(run,900),{once:true});
})();
