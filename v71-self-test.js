(()=>{
'use strict';
const EXPECTED='8.0.0';
const report={version:EXPECTED,at:new Date().toISOString(),checks:[],ok:true};
const check=(name,ok,detail='')=>{report.checks.push({name,ok:!!ok,detail});if(!ok)report.ok=false};
async function run(){try{
 check('config',window.PRE_SALE_V71?.version===EXPECTED,window.PRE_SALE_V71?.version||'ausente');
 check('data-layer',!!window.V71Data);check('budget-import',!!window.V71BudgetImport);check('stability-layer',!!window.V711_STABILITY);check('consolidation-core',!!window.V72Core);check('operations-layer',!!window.V73Operations);check('polish-layer',!!window.V74Polish);check('deploy-guard',window.V80DeployGuard?.version===EXPECTED,window.V80DeployGuard?.version||'ausente');check('maturity-layer',window.V80Maturity?.version===EXPECTED,window.V80Maturity?.version||'ausente');
 try{const r=await fetch('./version.json?selftest='+Date.now(),{cache:'no-store'}),v=await r.json();check('version-manifest',v.version===EXPECTED&&v.channel==='stable'&&v.published===true&&v.authentication===false,v.version||'ausente');check('canonical-host',v.canonicalHost==='https://otaviobarretojr.github.io/pre-venda-samsung/',v.canonicalHost||'ausente')}catch(e){check('version-manifest',false,e.message)}
 if(window.V71Data&&window.PRE_SALE_V71){for(const name of ['preSale','budgets','budgetCatalog','ecosystem']){try{const table=window.PRE_SALE_V71.data[name]?.table;await window.V71Data.request(`${table}?select=id&limit=1`);check('table:'+table,true)}catch(e){check('table:'+name,false,e.message)}}}
 check('quality-engine',typeof window.V80Maturity?.quality==='function');check('health-engine',typeof window.V80Maturity?.health==='function');check('no-auth-layer',!window.supabaseAuth&&!window.PRE_SALE_AUTH,'auth disabled');check('network-api',typeof fetch==='function');
}catch(e){check('runtime',false,e.message)}
 document.documentElement.dataset.v80Smoke=report.ok?'pass':'fail';window.V80_SELF_TEST=report;window.dispatchEvent(new CustomEvent('pre-sale:v80-self-test',{detail:report}));console[report.ok?'info':'error']('[V8.0 self-test]',report);return report}
window.runV80SelfTest=run;window.runV741SelfTest=run;window.runV74SelfTest=run;window.runV73SelfTest=run;window.runV72SelfTest=run;window.runV71SelfTest=run;setTimeout(run,1500);window.addEventListener('load',()=>setTimeout(run,800),{once:true});
})();
