(()=>{
'use strict';
const RELEASE='7.1.0-infra.2';
const STABLE_BASE='7.0.2';
const CACHE_EPOCH='v7-1-infra-2-separated-data';
window.PRE_SALE_RELEASE=RELEASE;
window.PRE_SALE_STABLE_BASE=STABLE_BASE;
window.PRE_SALE_CACHE_EPOCH=CACHE_EPOCH;
document.documentElement.dataset.preSaleRelease=RELEASE;
let scheduled=false;
const setText=(el,value)=>{if(el&&el.textContent!==value)el.textContent=value};
const applyIdentity=()=>{scheduled=false;const title='Pré-Venda Samsung • v'+RELEASE;if(document.title!==title)document.title=title;setText(document.querySelector('.footer-note'),'PRÉ-VENDA SAMSUNG • v'+RELEASE.toUpperCase());setText(document.querySelector('#enterpriseSidebar .ent-sidebar-foot span'),'v'+RELEASE);setText(document.querySelector('.enterprise-sidebar-footer small, .sidebar-footer small, [data-system-version]'),'v'+RELEASE)};
const scheduleIdentity=()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(applyIdentity)};
const loadScript=(src,marker)=>new Promise((resolve,reject)=>{if(document.querySelector('script[data-v7-module="'+marker+'"]'))return resolve();const script=document.createElement('script');script.src=src;script.async=false;script.dataset.v7Module=marker;script.onload=resolve;script.onerror=reject;document.head.appendChild(script)});
const loadInfrastructure=async()=>{if(window.__V71_INFRA_LOADED__)return;window.__V71_INFRA_LOADED__=true;try{await loadScript('./v71-config.js?release='+encodeURIComponent(RELEASE),'v71-config');await loadScript('./v71-data.js?release='+encodeURIComponent(RELEASE),'v71-data');await loadScript('./v71-budget-import.js?release='+encodeURIComponent(RELEASE),'v71-budget-import');await loadScript('./v71-integration.js?release='+encodeURIComponent(RELEASE),'v71-integration')}catch(e){document.documentElement.dataset.v71Infra='load-error';console.error('[V7.1] infrastructure module failed to load',e)}};
const loadValidation=async()=>{if(window.__V7_VALIDATION_LOADED__)return;window.__V7_VALIDATION_LOADED__=true;try{await loadScript('./budget-catalog-refresh-v702.js?release='+encodeURIComponent(STABLE_BASE),'budget-refresh');await loadScript('./pre-sale-watches-v7.js?release='+encodeURIComponent(STABLE_BASE),'watches');await loadInfrastructure();await loadScript('./v7-smoke-test.js?release='+encodeURIComponent(RELEASE),'smoke')}catch(e){document.documentElement.dataset.v7Smoke='load-error';console.error('[V7] validation module failed to load',e)}};
applyIdentity();const root=document.body||document.documentElement;if(root)new MutationObserver(scheduleIdentity).observe(root,{childList:true,subtree:true});window.addEventListener('load',()=>{scheduleIdentity();setTimeout(loadValidation,350)},{once:true});setTimeout(()=>{applyIdentity();window.preSaleReleaseBoot?.()},0);setTimeout(applyIdentity,250);setTimeout(applyIdentity,1000);if(document.readyState==='complete')setTimeout(loadValidation,350);console.info('[Pré-Venda Samsung] release',RELEASE,'stable base',STABLE_BASE,'loaded');
})();
