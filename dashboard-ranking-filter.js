(()=>{
'use strict';
const $=id=>document.getElementById(id);
const RANKINGS=[
  {value:'all',label:'Todos os rankings'},
  {value:'consultant',label:'Ranking por consultor',match:'Ranking por consultor'},
  {value:'product',label:'Ranking por produto',match:'Produtos'},
  {value:'productColor',label:'Ranking por produto e cor',match:'Produtos por cor'},
  {value:'ecosystem',label:'Ranking de Ecossistema',match:'Ecossistema por modelo'}
];
function ensureSelector(){
  if($('dashRankingView'))return;
  const toolbar=$('dashboardPanel')?.querySelector('.toolbar');
  if(!toolbar)return;
  const select=document.createElement('select');
  select.id='dashRankingView';
  select.title='Escolha qual ranking deseja visualizar';
  select.innerHTML=RANKINGS.map(x=>`<option value="${x.value}">${x.label}</option>`).join('');
  const refresh=$('dashRefreshBtn');
  if(refresh)toolbar.insertBefore(select,refresh);else toolbar.appendChild(select);
  select.addEventListener('change',applyRankingFilter);
}
function rankingSections(){
  const sections=[...document.querySelectorAll('#dashboardPanel .dash-section')];
  return sections.filter(sec=>{
    const h=sec.querySelector('h3')?.textContent.trim()||'';
    return RANKINGS.some(x=>x.match===h);
  });
}
function applyRankingFilter(){
  ensureSelector();
  const val=$('dashRankingView')?.value||'all';
  const selected=RANKINGS.find(x=>x.value===val);
  rankingSections().forEach(sec=>{
    const h=sec.querySelector('h3')?.textContent.trim()||'';
    sec.style.display=val==='all'||h===selected?.match?'':'none';
  });
}
const base=window.renderDashboard;
window.renderDashboard=function(){
  if(typeof base==='function')base();
  ensureSelector();
  applyRankingFilter();
};
ensureSelector();
applyRankingFilter();
const f=document.querySelector('.footer-note');if(f)f.textContent='PRE VENDA • v5.1.7 ONLINE';
})();