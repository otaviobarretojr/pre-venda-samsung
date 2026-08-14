(()=>{
'use strict';
const $=id=>document.getElementById(id);
const PRODUCTS=[
  {value:'',label:'Todos os aparelhos'},
  {value:'Galaxy Z Flip 8',label:'Galaxy Z Flip 8'},
  {value:'Galaxy Z Fold 8',label:'Galaxy Z Fold 8'},
  {value:'Galaxy Z Fold 8 Ultra',label:'Galaxy Z Fold 8 Ultra'}
];
function ensureSelector(){
  let select=$('dashProductFilter');
  const old=$('dashRankingView');
  if(old)old.remove();
  if(select)return select;
  const toolbar=$('dashboardPanel')?.querySelector('.toolbar');
  if(!toolbar)return null;
  select=document.createElement('select');
  select.id='dashProductFilter';
  select.title='Filtrar o Dashboard por aparelho';
  select.innerHTML=PRODUCTS.map(x=>`<option value="${x.value}">${x.label}</option>`).join('');
  const refresh=$('dashRefreshBtn');
  if(refresh)toolbar.insertBefore(select,refresh);else toolbar.appendChild(select);
  select.addEventListener('change',()=>window.renderDashboard());
  return select;
}
function matchesProduct(d,selected){
  if(!selected)return true;
  return String(d?.produto||'').trim().toLowerCase()===selected.trim().toLowerCase();
}
const base=window.renderDashboard;
window.renderDashboard=function(){
  const select=ensureSelector();
  const selected=select?.value||'';
  const originalGetHistory=window.getHistory;
  if(typeof originalGetHistory!=='function')return typeof base==='function'?base():undefined;
  window.getHistory=function(){return originalGetHistory().filter(d=>matchesProduct(d,selected))};
  try{
    if(typeof base==='function')base();
  }finally{
    window.getHistory=originalGetHistory;
  }
};
ensureSelector();
window.renderDashboard();
const f=document.querySelector('.footer-note');if(f)f.textContent='PRE VENDA • v5.1.8 ONLINE';
})();