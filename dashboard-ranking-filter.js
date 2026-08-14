(()=>{
'use strict';
const $=id=>document.getElementById(id);
const PRODUCTS=['Galaxy Z Flip 8','Galaxy Z Fold 8','Galaxy Z Fold 8 Ultra'];
let selected=new Set(PRODUCTS);
window.getDashboardSelectedProducts=()=>new Set(selected);
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function ensureSelector(){
  const old=$('dashProductFilter');if(old)old.remove();
  const oldRank=$('dashRankingView');if(oldRank)oldRank.remove();
  let box=$('dashProductMulti');if(box)return box;
  const toolbar=$('dashboardPanel')?.querySelector('.toolbar');if(!toolbar)return null;
  box=document.createElement('div');box.id='dashProductMulti';box.className='dash-product-multi';
  box.innerHTML='<button type="button" id="dashProductMultiBtn" class="dash-product-btn">Todos os aparelhos</button><div id="dashProductMultiMenu" class="dash-product-menu" hidden><div class="dash-product-head"><strong>Aparelhos</strong><button type="button" id="dashProductAll">Todos</button></div><div id="dashProductChecks"></div></div>';
  const refresh=$('dashRefreshBtn');if(refresh)toolbar.insertBefore(box,refresh);else toolbar.appendChild(box);
  $('dashProductMultiBtn').onclick=e=>{e.stopPropagation();$('dashProductMultiMenu').hidden=!$('dashProductMultiMenu').hidden};
  $('dashProductAll').onclick=()=>{selected=new Set(PRODUCTS);renderOptions();window.renderDashboard()};
  document.addEventListener('click',e=>{if(!box.contains(e.target))$('dashProductMultiMenu').hidden=true});
  renderOptions();return box;
}
function renderOptions(){
  ensureSelector();const wrap=$('dashProductChecks');if(!wrap)return;
  wrap.innerHTML=PRODUCTS.map(p=>`<label class="dash-product-option"><input type="checkbox" data-product="${esc(p)}" ${selected.has(p)?'checked':''}><span>${esc(p)}</span></label>`).join('');
  wrap.querySelectorAll('input').forEach(i=>i.onchange=()=>{i.checked?selected.add(i.dataset.product):selected.delete(i.dataset.product);updateLabel();window.renderDashboard()});
  updateLabel();
}
function updateLabel(){
  const b=$('dashProductMultiBtn');if(!b)return;
  if(selected.size===PRODUCTS.length)b.textContent='Todos os aparelhos';
  else if(selected.size===0)b.textContent='Nenhum aparelho';
  else if(selected.size===1)b.textContent=[...selected][0];
  else b.textContent=`${selected.size} aparelhos selecionados`;
}
function isGalaxyZSale(d){
  const p=String(d?.produto||'').trim().toLowerCase();
  return PRODUCTS.some(x=>x.toLowerCase()===p);
}
function matchesSelected(d){
  const p=String(d?.produto||'').trim();
  return isGalaxyZSale(d)&&selected.has(PRODUCTS.find(x=>x.toLowerCase()===p.toLowerCase()));
}
const base=window.renderDashboard;
window.renderDashboard=function(){
  ensureSelector();
  const originalGetHistory=window.getHistory;
  if(typeof originalGetHistory!=='function')return typeof base==='function'?base():undefined;
  window.getHistory=function(){return originalGetHistory().filter(matchesSelected)};
  try{if(typeof base==='function')base();}
  finally{window.getHistory=originalGetHistory;}
};
const style=document.createElement('style');style.textContent='.dash-product-multi{position:relative;min-width:210px}.dash-product-btn{width:100%;min-height:46px;padding:10px 12px;border:1px solid #d9dfeb;border-radius:12px;background:#fff;color:#344054;text-align:left;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.dash-product-menu{position:absolute;z-index:120;top:50px;left:0;min-width:310px;background:#fff;border:1px solid #d0d5dd;border-radius:12px;box-shadow:0 12px 30px rgba(16,24,40,.16);padding:8px}.dash-product-head{display:flex;justify-content:space-between;align-items:center;padding:7px 8px 10px;border-bottom:1px solid #eaecf0}.dash-product-head button{background:transparent;color:#1428A0;padding:4px 6px}.dash-product-option{display:flex;align-items:center;gap:10px;padding:10px 8px;border-radius:8px;cursor:pointer;font-size:13px}.dash-product-option:hover{background:#f5f7fb}.dash-product-option input{width:15px;height:15px;accent-color:#1428A0}@media(max-width:760px){.dash-product-multi{width:100%}.dash-product-menu{position:fixed;left:12px;right:12px;top:auto;bottom:78px;min-width:0}}';document.head.appendChild(style);
ensureSelector();window.renderDashboard();const f=document.querySelector('.footer-note');if(f)f.textContent='PRE VENDA • v5.1.10 ONLINE';
})();