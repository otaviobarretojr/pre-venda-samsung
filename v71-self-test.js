(()=>{
'use strict';
const EXPECTED='8.5.0';
const report={version:EXPECTED,at:new Date().toISOString(),checks:[],ok:true};
const check=(name,ok,detail='')=>{report.checks.push({name,ok:!!ok,detail});if(!ok)report.ok=false};
async function run(){try{
 check('config',window.PRE_SALE_V71?.version===EXPECTED,window.PRE_SALE_V71?.version||'ausente');check('data-layer',!!window.V71Data);check('supply-layer',!!window.V81Supply);check('supply-online-layer',!!window.V82SupplyOnline);check('history-layer',!!window.V84History);check('supply-v85-layer',window.V85SupplyUI?.version===EXPECTED,window.V85SupplyUI?.version||'ausente');check('deploy-guard',window.V850DeployGuard?.version===EXPECTED,window.V850DeployGuard?.version||'ausente');
 try{const r=await fetch('./version.json?selftest='+Date.now(),{cache:'no-store'}),v=await r.json();check('version-manifest',v.version===EXPECTED&&v.stableBase==='8.4.0'&&v.channel==='stable'&&v.published===true,v.version||'ausente')}catch(e){check('version-manifest',false,e.message)}
 window.V85SupplyUI?.render?.();await new Promise(r=>setTimeout(r,50));check('compact-product-selector',!!document.getElementById('v85Products'));check('compact-link-buttons',!!document.querySelector('.v85-link-btn')||((window.V85SupplyUI?.rows?.()||[]).length===0));check('no-link-sentinel',window.V85SupplyUI?.NO_LINK==='__NO_STOCK__');check('history-presale-only',!document.getElementById('historyModeBar'));check('no-auth-layer',!window.supabaseAuth&&!window.PRE_SALE_AUTH,'auth disabled');
}catch(e){check('runtime',false,e.message)}
 document.documentElement.dataset.v850Smoke=report.ok?'pass':'fail';window.V850_SELF_TEST=report;console[report.ok?'info':'error']('[V8.5.0 self-test]',report);return report}
window.runV850SelfTest=run;window.runV840SelfTest=run;window.runV71SelfTest=run;setTimeout(run,2300);window.addEventListener('load',()=>setTimeout(run,1400),{once:true});
})();