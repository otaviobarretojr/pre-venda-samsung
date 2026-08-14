(()=>{
'use strict';
const $=id=>document.getElementById(id);
const Z_PRODUCTS=['Galaxy Z Flip 8','Galaxy Z Fold 8','Galaxy Z Fold 8 Ultra'];
const esc=v=>typeof escapeHtml==='function'?escapeHtml(String(v??'')):String(v??'');
function norm(v){return String(v??'').trim()}
function digits(v){return norm(v).replace(/\D/g,'')}
function selectedProducts(){
  const s=typeof window.getDashboardSelectedProducts==='function'?window.getDashboardSelectedProducts():new Set(Z_PRODUCTS);
  return s instanceof Set?s:new Set(Z_PRODUCTS);
}
function uniqueGalaxyZ(){
  const selected=selectedProducts();
  const s=$('dashStart')?.value||'',e=$('dashEnd')?.value||'',c=$('dashConsultant')?.value||'';
  const rows=getHistory().filter(d=>selected.has(norm(d.produto))&&(!s||d.data>=s)&&(!e||d.data<=e)&&(!c||d.vendedor===c));
  const seen=new Set(),out=[];
  for(const d of rows){
    const cpf=digits(d.cpf),client=norm(d.cliente).toLowerCase();
    const key=(cpf||client)+'|'+norm(d.data);
    if(seen.has(key))continue;
    seen.add(key);out.push(d);
  }
  return out;
}
function bars(id,obj,sorter){
  const box=$(id);if(!box)return;
  let entries=Object.entries(obj);
  entries.sort(sorter||((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0],'pt-BR')));
  if(!entries.length){box.innerHTML='<div class="empty">Sem dados no período.</div>';return}
  const max=Math.max(...entries.map(x=>x[1]),1);
  box.innerHTML=entries.map(([k,v])=>`<div class="bar-row"><div>${esc(k)}</div><div class="bar-track"><div class="bar-fill" style="width:${Math.round(v/max*100)}%"></div></div><strong>${v}</strong></div>`).join('');
}
function productOrder(name){const p=norm(name).toLowerCase();if(p.includes('z flip'))return 1;if(p.includes('z fold')&&!p.includes('ultra'))return 2;if(p.includes('z fold')&&p.includes('ultra'))return 3;return 99}
function refresh(){
  const data=uniqueGalaxyZ(),today=typeof todayISO==='function'?todayISO():new Date().toISOString().slice(0,10);
  if($('dashTotal'))$('dashTotal').textContent=data.length;
  if($('dashToday'))$('dashToday').textContent=data.filter(x=>x.data===today).length;
  if($('dashPre'))$('dashPre').textContent=data.filter(x=>String(x.preregistro).toUpperCase()==='SIM').length;
  if($('dashTroca'))$('dashTroca').textContent=data.filter(x=>String(x.trocafone).toUpperCase()==='SIM').length;
  const byConsultant={},byProduct={},byProductColor={},byDay={},byEco={};
  for(const d of data){
    if(d.vendedor)byConsultant[d.vendedor]=(byConsultant[d.vendedor]||0)+1;
    if(d.produto)byProduct[d.produto]=(byProduct[d.produto]||0)+1;
    if(d.produto&&d.cor){const k=d.produto+' '+d.cor;byProductColor[k]=(byProductColor[k]||0)+1}
    if(d.data)byDay[d.data]=(byDay[d.data]||0)+1;
    if(d.wearable)byEco[d.wearable]=(byEco[d.wearable]||0)+1;
  }
  bars('dashByConsultant',byConsultant);
  bars('dashByProduct',byProduct,(a,b)=>productOrder(a[0])-productOrder(b[0])||a[0].localeCompare(b[0],'pt-BR'));
  bars('dashByProductColor',byProductColor,(a,b)=>productOrder(a[0])-productOrder(b[0])||a[0].localeCompare(b[0],'pt-BR'));
  const daily=Object.fromEntries(Object.entries(byDay).sort((a,b)=>a[0].localeCompare(b[0])).map(([iso,v])=>[typeof formatDateBR==='function'?formatDateBR(iso):iso,v]));
  bars('dashByDay',daily,()=>0);
  bars('dashEcoModels',byEco);
  const eco=data.filter(x=>x.wearable).length,ret=data.filter(x=>x.statusVenda==='Retirado').length,avis=data.filter(x=>x.statusVenda==='Cliente avisado').length;
  const v5=$('dashV5');if(v5)v5.innerHTML=`<div class="dash-card"><span>Com Ecossistema</span><strong>${eco}</strong></div><div class="dash-card"><span>Taxa de Ecossistema</span><strong>${data.length?Math.round(eco/data.length*100):0}%</strong></div><div class="dash-card"><span>Clientes avisados</span><strong>${avis}</strong></div><div class="dash-card"><span>Retirados</span><strong>${ret}</strong></div>`;
  const ops=$('dashOpsV51');if(ops){const open=data.filter(x=>(x.statusVenda||'Aguardando produto')!=='Retirado').length;ops.innerHTML=`<div class="dash-card"><span>Em aberto</span><strong>${open}</strong></div><div class="dash-card"><span>Taxa de retirada</span><strong>${data.length?Math.round(ret/data.length*100):0}%</strong></div>`}
}
const base=window.renderDashboard;
window.renderDashboard=function(){if(typeof base==='function')base();refresh()};
['dashStart','dashEnd','dashConsultant','dashRefreshBtn'].forEach(id=>$(id)?.addEventListener(id==='dashRefreshBtn'?'click':'change',refresh));
setTimeout(()=>window.renderDashboard(),0);
const f=document.querySelector('.footer-note');if(f)f.textContent='PRE VENDA • v5.1.10 ONLINE';
})();