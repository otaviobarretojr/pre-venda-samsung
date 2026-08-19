(()=>{
'use strict';
const RELEASE='7.0.0-rc1';
const CACHE_EPOCH='v7';
window.PRE_SALE_RELEASE=RELEASE;
window.PRE_SALE_CACHE_EPOCH=CACHE_EPOCH;
document.documentElement.dataset.preSaleRelease=RELEASE;
let scheduled=false;
const setText=(el,value)=>{if(el&&el.textContent!==value)el.textContent=value};
const applyIdentity=()=>{
  scheduled=false;
  const title='Pré-Venda Samsung • v'+RELEASE;
  if(document.title!==title)document.title=title;
  setText(document.querySelector('.footer-note'),'PRÉ-VENDA SAMSUNG • v'+RELEASE.toUpperCase()+' • PREVIEW');
  // Enterprise shell created by enterprise-v650 uses .ent-sidebar-foot > span.
  setText(document.querySelector('#enterpriseSidebar .ent-sidebar-foot span'),'v'+RELEASE);
  setText(document.querySelector('.enterprise-sidebar-footer small, .sidebar-footer small, [data-system-version]'),'v'+RELEASE);
};
const scheduleIdentity=()=>{
  if(scheduled)return;
  scheduled=true;
  requestAnimationFrame(applyIdentity);
};
applyIdentity();
const root=document.body||document.documentElement;
if(root)new MutationObserver(scheduleIdentity).observe(root,{childList:true,subtree:true});
window.addEventListener('load',scheduleIdentity,{once:true});
setTimeout(()=>{applyIdentity();window.preSaleReleaseBoot?.();},0);
setTimeout(applyIdentity,250);
setTimeout(applyIdentity,1000);
console.info('[Pré-Venda Samsung] release',RELEASE,'loaded');
})();