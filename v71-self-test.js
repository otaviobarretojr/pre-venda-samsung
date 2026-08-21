(()=>{
'use strict';
const EXPECTED='7.4.1';
const report={version:EXPECTED,at:new Date().toISOString(),checks:[],ok:true};
const check=(name,ok,detail='')=>{report.checks.push({name,ok:!!ok,detail});if(!ok)report.ok=false};
async function run(){try{
 check('config',window.PRE_SALE_V71?.version===EXPECTED,window.PRE_SALE_V71?.version||'ausente');
 check('data-layer',!!window.V71Data);check('budget-import',!!window.V71BudgetImport);check('stability-layer',!!window.V711_STABILITY);check('consolidation-core',!!window.V72Core);check('operations-layer',!!window.V73Operations);check('polish-layer',!!window.V74Polish);check('deploy-guard',window.V741DeployGuard?.version===EXPECTED,window.V741DeployGuard?.version||'ausente');
 try{const r=await fetch('./version.json?selftest='+Date.now(),{cache:'no-store'}),v=await r.json();check('version-manifest',v.version===EXPECTED&&v.channel==='stable'&&v.published===true&&v.authentication===false,v.version||'ausente');check('canonical-host',v.canonicalHost==='https://otaviobarretojr.github.io/pre-venda-samsung/',v.canonicalHost||'ausente')}catch(e){check('version-manifest',false,e.message)}
 if(window.V71Data&&window.PRE_SALE_V71){for(const name of ['preSale','budgets','budgetCatalog','ecosystem']){try{const table=window.PRE_SALE_V71.data[name]?.table;await window.V71Data.request(`${table}?select=id&limit=1`);check('table:'+table,true)}catch(e){check('table:'+name,false,e.message)}}}
 check('no-auth-layer',!window.supabaseAuth&&!window.PRE_SALE_AUTH,'auth disabled');check('network-api',typeof fetch==='function');
}catch(e){check('runtime',false,e.message)}
 document.documentElement.dataset.v741Smoke=report.ok?'pass':'fail';window.V741_SELF_TEST=report;window.dispatchEvent(new CustomEvent('pre-sale:v741-self-test',{detail:report}));console[report.ok?'info':'error']('[V7.4.1 self-test]',report);return report}
window.runV741SelfTest=run;window.runV74SelfTest=run;window.runV73SelfTest=run;window.runV72SelfTest=run;window.runV71SelfTest=run;setTimeout(run,1400);window.addEventListener('load',()=>setTimeout(run,700),{once:true});
})();
