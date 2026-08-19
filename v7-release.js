(()=>{
'use strict';
const RELEASE='7.0.0-rc1';
const CACHE_EPOCH='v7';
window.PRE_SALE_RELEASE=RELEASE;
window.PRE_SALE_CACHE_EPOCH=CACHE_EPOCH;
document.documentElement.dataset.preSaleRelease=RELEASE;
const applyIdentity=()=>{
  document.title='Pré-Venda Samsung • v'+RELEASE;
  const footer=document.querySelector('.footer-note');
  if(footer) footer.textContent='PRÉ-VENDA SAMSUNG • v'+RELEASE.toUpperCase()+' • PREVIEW';
  const systemVersion=document.querySelector('.enterprise-sidebar-footer small, .sidebar-footer small, [data-system-version]');
  if(systemVersion) systemVersion.textContent='v'+RELEASE;
};
applyIdentity();
new MutationObserver(applyIdentity).observe(document.body,{childList:true,subtree:true});
window.addEventListener('load',applyIdentity,{once:true});
// RC1 must never expose the legacy screen while modules finish composing.
requestAnimationFrame(()=>requestAnimationFrame(()=>{
  applyIdentity();
  window.preSaleReleaseBoot?.();
}));
console.info('[Pré-Venda Samsung] release',RELEASE,'loaded');
})();
