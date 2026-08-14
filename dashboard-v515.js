(()=>{
'use strict';
const $=id=>document.getElementById(id);
const esc=v=>typeof escapeHtml==='function'?escapeHtml(String(v??'')):String(v??'');
function currentData(){
  const s=$('dashStart')?.value||'',e=$('dashEnd')?.value||'',c=$('dashConsultant')?.value||'';
  return getHistory().filter(x=>(!s||x.data>=s)&&(!e||x.data<=e)&&(!c||x.vendedor===c));
}
function ensureColorSection(){
  let box=$('dashByProductColor');
  if(box)return box;
  const productSection=[...document.querySelectorAll('#dashboardPanel .dash-section')].find(x=>x.querySelector('h3')?.textContent.trim()==='Produtos');
  if(!productSection)return null;
  const sec=document.createElement('div');sec.className='dash-section';sec.innerHTML='<h3>Produtos por cor</h3><div id="dashByProductColor"></div>';
  productSection.insertAdjacentElement('afterend',sec);return $('dashByProductColor');
}
function barsHtml(entries){
  if(!entries.length)return '<div class="empty">Sem dados no período.</div>';
  const max=Math.max(...entries.map(([,v])=>v),1);
  return entries.map(([k,v])=>`<div class="bar-row"><div>${esc(k)}</div><div class="bar-track"><div class="bar-fill" style="width:${Math.round(v/max*100)}%"></div></div><strong>${v}</strong></div>`).join('');
}
function familyOrder(product){
  const p=String(product||'').toLowerCase();
  if(p.includes('z flip'))return 1;
  if(p.includes('z fold')&&!p.includes('ultra'))return 2;
  if(p.includes('z fold')&&p.includes('ultra'))return 3;
  return 99;
}
function renderProductColors(data){
  const map=new Map();
  for(const d of data){
    const product=String(d.produto||'').trim(),color=String(d.cor||'').trim();
    if(!product||!color)continue;
    const key=`${product} ${color}`;
    if(!map.has(key))map.set(key,{count:0,product,color});
    map.get(key).count++;
  }
  const rows=[...map.values()].sort((a,b)=>familyOrder(a.product)-familyOrder(b.product)||a.product.localeCompare(b.product,'pt-BR',{numeric:true})||a.color.localeCompare(b.color,'pt-BR'));
  const entries=rows.map(x=>[`${x.product} ${x.color}`,x.count]);
  const box=ensureColorSection();if(box)box.innerHTML=barsHtml(entries);
}
function renderDailyAscending(data){
  const box=$('dashByDay');if(!box)return;
  const map=new Map();
  for(const d of data){if(!d.data)continue;map.set(d.data,(map.get(d.data)||0)+1)}
  const entries=[...map.entries()].sort((a,b)=>a[0].localeCompare(b[0])).map(([iso,v])=>[typeof formatDateBR==='function'?formatDateBR(iso):iso,v]);
  box.innerHTML=barsHtml(entries);
}
const base=window.renderDashboard;
window.renderDashboard=function(){
  if(typeof base==='function')base();
  const data=currentData();
  renderProductColors(data);
  renderDailyAscending(data);
};
['dashStart','dashEnd','dashConsultant'].forEach(id=>$(id)?.addEventListener('change',()=>window.renderDashboard()));
$('dashRefreshBtn')?.addEventListener('click',()=>window.renderDashboard());
window.renderDashboard();
const f=document.querySelector('.footer-note');if(f)f.textContent='PRE VENDA • v5.1.6 ONLINE';
})();