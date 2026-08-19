(()=>{
'use strict';
const RELEASE='7.0.0-rc1';
const CACHE_EPOCH='v7-smoke1';
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
  setText(document.querySelector('#enterpriseSidebar .ent-sidebar-foot span'),'v'+RELEASE);
  setText(document.querySelector('.enterprise-sidebar-footer small, .sidebar-footer small, [data-system-version]'),'v'+RELEASE);
};
const scheduleIdentity=()=>{
  if(scheduled)return;
  scheduled=true;
  requestAnimationFrame(applyIdentity);
};
const loadSmoke=()=>{
  if(window.__V7_SMOKE_LOADED__)return;
  window.__V7_SMOKE_LOADED__=true;
  const script=document.createElement('script');
  script.src='./v7-smoke-test.js?release='+encodeURIComponent(RELEASE);
  script.async=true;
  script.dataset.v7SmokeLoader='1';
  script.onerror=()=>{document.documentElement.dataset.v7Smoke='load-error';console.error('[V7 smoke] validator failed to load');};
  document.head.appendChild(script);
};
applyIdentity();
const root=document.body||document.documentElement;
if(root)new MutationObserver(scheduleIdentity).observe(root,{childList:true,subtree:true});
window.addEventListener('load',()=>{scheduleIdentity();setTimeout(loadSmoke,350);},{once:true});
setTimeout(()=>{applyIdentity();window.preSaleReleaseBoot?.();},0);
setTimeout(applyIdentity,250);
setTimeout(applyIdentity,1000);
if(document.readyState==='complete')setTimeout(loadSmoke,350);
console.info('[Pré-Venda Samsung] release',RELEASE,'loaded');
})();
