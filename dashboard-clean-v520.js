(()=>{
'use strict';
const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let activeTab='overview';

function isGalaxyZ(name){return/galaxy\s*z\s*(flip|fold)/i.test(String(name||''))}
function uniqueById(rows){const seen=new Set();return rows.filter(x=>{const k=x?.id||crypto.randomUUID();if(seen.has(k))return false;seen.add(k);return true})}
function bars(obj){
  const entries=Object.entries(obj).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0],'pt-BR'));
  if(!entries.length)return'<div class="dash-clean-empty">Sem dados no período.</div>';
  const max=Math.max(...entries.map(x=>x[1]),1);
  return entries.map(([label,value],i)=>`<div class="dash-clean-bar"><span class="dash-clean-rank">${i+1}</span><span class="dash-clean-label">${esc(label)}</span><span class="dash-clean-track"><i style="width:${Math.round(value/max*100)}%"></i></span><strong>${value}</strong></div>`).join('');
}
function group(rows,key){const out={};for(const x of rows){const k=key(x);if(k)out[k]=(out[k]||0)+1}return out}
function ensure(){
  const card=$('dashboardPanel')?.querySelector('.card');if(!card)return null;
  $('dashProductMulti')?.style.setProperty('display','none','important');
  let product=$('dashCleanProduct');
  if(!product){
    product=document.createElement('select');product.id='dashCleanProduct';product.innerHTML='<option value="">Todos os aparelhos</option>';
    const refresh=$('dashRefreshBtn');refresh?.parentNode?.insertBefore(product,refresh);
    product.addEventListener('change',()=>window.renderDashboard());
  }
  let root=$('dashCleanRoot');
  if(!root){
    root=document.createElement('div');root.id='dashCleanRoot';
    root.innerHTML='<div class="dash-clean-tabs"><button data-clean-tab="overview" class="active">Visão geral</button><button data-clean-tab="products">Produtos</button><button data-clean-tab="ecosystem">Ecossistema</button></div><div id="dashCleanMessage"></div><div id="dashCleanContent"></div>';
    card.appendChild(root);
    root.querySelectorAll('[data-clean-tab]').forEach(b=>b.onclick=()=>{activeTab=b.dataset.cleanTab;root.querySelectorAll('[data-clean-tab]').forEach(x=>x.classList.toggle('active',x===b));renderClean()});
  }
  return root;
}
function filters(){return{start:$('dashStart')?.value||'',end:$('dashEnd')?.value||'',consultant:$('dashConsultant')?.value||'',product:$('dashCleanProduct')?.value||''}}
function allRows(){return uniqueById(getHistory().filter(x=>isGalaxyZ(x.produto)))}
function refreshOptions(rows){
  const consultant=$('dashConsultant'),product=$('dashCleanProduct');
  const cv=consultant?.value||'',pv=product?.value||'';
  const consultants=[...new Set(rows.map(x=>x.vendedor).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'pt-BR'));
  const products=[...new Set(rows.map(x=>x.produto).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'pt-BR'));
  if(consultant){consultant.innerHTML='<option value="">Todos os consultores</option>'+consultants.map(x=>`<option>${esc(x)}</option>`).join('');if(consultants.includes(cv))consultant.value=cv}
  if(product){product.innerHTML='<option value="">Todos os aparelhos</option>'+products.map(x=>`<option>${esc(x)}</option>`).join('');if(products.includes(pv))product.value=pv}
}
function data(){
  const rows=allRows();refreshOptions(rows);const f=filters();
  return rows.filter(x=>(!f.start||x.data>=f.start)&&(!f.end||x.data<=f.end)&&(!f.consultant||x.vendedor===f.consultant)&&(!f.product||x.produto===f.product));
}
function kpi(label,value,note=''){return`<div class="dash-clean-kpi"><span>${esc(label)}</span><strong>${esc(value)}</strong>${note?`<small>${esc(note)}</small>`:''}</div>`}
function renderOverview(rows){
  const eco=rows.filter(x=>x.wearable).length,pre=rows.filter(x=>String(x.preregistro).toUpperCase()==='SIM').length,trade=rows.filter(x=>String(x.trocafone).toUpperCase()==='SIM').length;
  return`<div class="dash-clean-kpis">${kpi('Pré-vendas',rows.length,'no período')}${kpi('Pré-registro',pre)}${kpi('Trade-in',trade)}${kpi('Taxa de ecossistema',rows.length?Math.round(eco/rows.length*100)+'%':'0%')}</div><div class="dash-clean-panel dash-clean-main"><div class="dash-clean-heading"><div><span>Desempenho</span><h3>Ranking por consultor</h3></div><small>${rows.length} pré-venda(s)</small></div>${bars(group(rows,x=>x.vendedor||'Não informado'))}</div>`;
}
function renderProducts(rows){
  const byProduct=group(rows,x=>x.produto),byColor=group(rows,x=>[x.produto,x.cor].filter(Boolean).join(' • ')),byDay=group(rows,x=>x.data?formatDateBR(x.data):'');
  return`<div class="dash-clean-two"><div class="dash-clean-panel"><div class="dash-clean-heading"><div><span>Mix</span><h3>Por aparelho</h3></div></div>${bars(byProduct)}</div><div class="dash-clean-panel"><div class="dash-clean-heading"><div><span>Preferências</span><h3>Por cor</h3></div></div>${bars(byColor)}</div></div><details class="dash-clean-details"><summary>Evolução diária</summary><div>${bars(byDay)}</div></details>`;
}
function renderEcosystem(rows){
  const ecoRows=rows.filter(x=>x.wearable),rate=rows.length?Math.round(ecoRows.length/rows.length*100):0;
  return`<div class="dash-clean-kpis dash-clean-kpis-two">${kpi('Com ecossistema',ecoRows.length)}${kpi('Taxa de adesão',rate+'%')}</div><div class="dash-clean-panel"><div class="dash-clean-heading"><div><span>Ecossistema</span><h3>Modelos vinculados</h3></div></div>${bars(group(ecoRows,x=>x.wearable))}</div>`;
}
function renderClean(){
  if(!ensure())return;const f=filters(),message=$('dashCleanMessage'),content=$('dashCleanContent');
  if(f.start&&f.end&&f.start>f.end){message.innerHTML='<div class="dash-clean-warning">A data inicial não pode ser posterior à data final.</div>';content.innerHTML='';return}
  message.innerHTML='';const rows=data();
  content.innerHTML=activeTab==='products'?renderProducts(rows):activeTab==='ecosystem'?renderEcosystem(rows):renderOverview(rows);
}

const base=window.renderDashboard;
window.renderDashboard=function(){if(typeof base==='function')base();renderClean()};
ensure();renderClean();
const style=document.createElement('style');style.textContent=`
#dashboardPanel .card>.dashboard-grid,#dashboardPanel .card>.dash-section,#dashV5,#dashOpsV51{display:none!important}
#dashboardPanel .toolbar{padding:12px;background:#f8fafc;border:1px solid #e4e7ec;border-radius:14px;margin-bottom:14px}
#dashboardPanel .toolbar input,#dashboardPanel .toolbar select{min-width:155px;flex:1}
.dash-clean-tabs{display:inline-flex;gap:4px;padding:4px;background:#eef2f6;border-radius:12px;margin:2px 0 16px}.dash-clean-tabs button{padding:9px 14px;background:transparent;color:#475467}.dash-clean-tabs button.active{background:#fff;color:#1428A0;box-shadow:0 1px 4px rgba(16,24,40,.12)}
.dash-clean-kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:14px}.dash-clean-kpis-two{grid-template-columns:repeat(2,1fr)}.dash-clean-kpi{padding:16px;background:#fff;border:1px solid #e4e7ec;border-radius:14px}.dash-clean-kpi span{display:block;font-size:12px;color:#667085}.dash-clean-kpi strong{display:block;margin-top:6px;font-size:25px;color:#101828}.dash-clean-kpi small{color:#98a2b3;font-size:11px}
.dash-clean-panel,.dash-clean-details{background:#fff;border:1px solid #e4e7ec;border-radius:16px;padding:17px}.dash-clean-heading{display:flex;justify-content:space-between;align-items:end;margin-bottom:15px}.dash-clean-heading span{font-size:10px;font-weight:900;letter-spacing:.8px;text-transform:uppercase;color:#1428A0}.dash-clean-heading h3{margin:3px 0 0;font-size:17px}.dash-clean-heading small{color:#667085}
.dash-clean-bar{display:grid;grid-template-columns:24px minmax(130px,1.3fr) minmax(100px,2fr) 35px;gap:10px;align-items:center;padding:8px 0;border-bottom:1px solid #f0f2f5;font-size:13px}.dash-clean-bar:last-child{border-bottom:0}.dash-clean-rank{width:22px;height:22px;display:grid;place-items:center;border-radius:7px;background:#eef2ff;color:#1428A0;font-size:11px;font-weight:900}.dash-clean-label{font-weight:700}.dash-clean-track{height:8px;background:#eef2f6;border-radius:999px;overflow:hidden}.dash-clean-track i{display:block;height:100%;background:#1428A0;border-radius:999px}.dash-clean-bar strong{text-align:right}.dash-clean-two{display:grid;grid-template-columns:1fr 1fr;gap:14px}.dash-clean-details{margin-top:14px}.dash-clean-details summary{cursor:pointer;font-weight:800;color:#344054}.dash-clean-details>div{margin-top:12px}.dash-clean-empty{padding:24px;text-align:center;color:#98a2b3}.dash-clean-warning{padding:11px 13px;margin-bottom:12px;border-radius:10px;background:#fffaeb;color:#b54708;font-size:13px}
@media(max-width:760px){.dash-clean-kpis,.dash-clean-kpis-two,.dash-clean-two{grid-template-columns:1fr 1fr}.dash-clean-tabs{display:grid;grid-template-columns:repeat(3,1fr);width:100%}.dash-clean-tabs button{padding:9px 5px;font-size:11px}.dash-clean-bar{grid-template-columns:24px minmax(110px,1fr) 35px}.dash-clean-track{display:none}.dash-clean-two{grid-template-columns:1fr}.dash-clean-kpi strong{font-size:22px}}
`;document.head.appendChild(style);
const f=document.querySelector('.footer-note');if(f)f.textContent='PRE VENDA • v5.2.0 ONLINE';
})();
