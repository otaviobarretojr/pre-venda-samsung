(()=>{
'use strict';
const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let activeTab='overview';
let selectedProducts=new Set();

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
  let product=$('dashCleanProductMulti');
  if(!product){
    product=document.createElement('div');product.id='dashCleanProductMulti';product.className='dash-clean-product-multi';
    product.innerHTML='<button type="button" id="dashCleanProductBtn" class="dash-clean-product-btn">Todos os produtos</button><div id="dashCleanProductMenu" class="dash-clean-product-menu" hidden><div class="dash-clean-product-head"><strong>Selecionar produtos</strong><button type="button" id="dashCleanProductAll">Todos</button></div><div id="dashCleanProductChecks"></div></div>';
    const refresh=$('dashRefreshBtn');refresh?.parentNode?.insertBefore(product,refresh);
    $('dashCleanProductBtn').onclick=e=>{e.stopPropagation();$('dashCleanProductMenu').hidden=!$('dashCleanProductMenu').hidden};
    $('dashCleanProductAll').onclick=()=>{selectedProducts.clear();renderClean()};
    document.addEventListener('click',e=>{if(!product.contains(e.target))$('dashCleanProductMenu').hidden=true});
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
function filters(){return{start:$('dashStart')?.value||'',end:$('dashEnd')?.value||'',consultant:$('dashConsultant')?.value||''}}
function allRows(){return uniqueById(getHistory().filter(x=>String(x.produto||'').trim()))}
function refreshOptions(rows){
  const consultant=$('dashConsultant'),cv=consultant?.value||'';
  const consultants=[...new Set(rows.map(x=>x.vendedor).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'pt-BR'));
  const products=[...new Set(rows.map(x=>x.produto).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'pt-BR'));
  if(consultant){consultant.innerHTML='<option value="">Todos os consultores</option>'+consultants.map(x=>`<option>${esc(x)}</option>`).join('');if(consultants.includes(cv))consultant.value=cv}
  for(const name of [...selectedProducts])if(!products.includes(name))selectedProducts.delete(name);
  const checks=$('dashCleanProductChecks');
  if(checks){
    checks.innerHTML=products.map(name=>`<label class="dash-clean-product-option"><input type="checkbox" data-product="${esc(name)}" ${selectedProducts.has(name)?'checked':''}><span>${esc(name)}</span></label>`).join('')||'<div class="dash-clean-empty">Nenhum produto encontrado.</div>';
    checks.querySelectorAll('input').forEach(input=>input.onchange=()=>{input.checked?selectedProducts.add(input.dataset.product):selectedProducts.delete(input.dataset.product);renderClean()});
  }
  const button=$('dashCleanProductBtn');if(button)button.textContent=!selectedProducts.size?'Todos os produtos':selectedProducts.size===1?[...selectedProducts][0]:`${selectedProducts.size} produtos selecionados`;
}
function data(){
  const rows=allRows();refreshOptions(rows);const f=filters();
  return rows.filter(x=>(!f.start||x.data>=f.start)&&(!f.end||x.data<=f.end)&&(!f.consultant||x.vendedor===f.consultant)&&(!selectedProducts.size||selectedProducts.has(x.produto)));
}
function kpi(label,value,note=''){return`<div class="dash-clean-kpi"><span>${esc(label)}</span><strong>${esc(value)}</strong>${note?`<small>${esc(note)}</small>`:''}</div>`}
function renderOverview(rows){
  const eco=rows.filter(x=>x.wearable).length,pre=rows.filter(x=>String(x.preregistro).toUpperCase()==='SIM').length,trade=rows.filter(x=>String(x.trocafone).toUpperCase()==='SIM').length;
  return`<div class="dash-clean-kpis">${kpi('Pré-vendas',rows.length,'no período')}${kpi('Pré-registro',pre)}${kpi('Trade-in',trade)}${kpi('Taxa de ecossistema',rows.length?Math.round(eco/rows.length*100)+'%':'0%')}</div><div class="dash-clean-panel dash-clean-main"><div class="dash-clean-heading"><div><span>Desempenho</span><h3>Ranking por consultor</h3></div><small>${rows.length} pré-venda(s)</small></div>${bars(group(rows,x=>x.vendedor||'Não informado'))}</div>`;
}
function miniList(obj){
  const entries=Object.entries(obj).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0],'pt-BR'));
  if(!entries.length)return'<div class="dash-clean-empty">Sem informações.</div>';
  return entries.map(([label,value])=>`<div class="dash-product-mini"><span>${esc(label)}</span><strong>${value}</strong></div>`).join('');
}
function productAccordion(rows){
  const products=Object.entries(group(rows,x=>x.produto)).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0],'pt-BR'));
  if(!products.length)return'<div class="dash-clean-empty">Sem dados no período.</div>';
  return products.map(([product,total])=>{
    const own=rows.filter(x=>x.produto===product),colors=group(own,x=>x.cor||'Não informada'),memories=group(own,x=>/^não se aplica$/i.test(String(x.capacidade||''))?'':x.capacidade||'Não informada'),hasMemory=Object.keys(memories).length>0;
    return`<div class="dash-product-accordion"><button type="button" class="dash-product-expand" data-product-key="${encodeURIComponent(product)}" aria-expanded="false"><span class="dash-product-name">${esc(product)}<small>Clique para ver ${hasMemory?'cor e memória':'cores'}</small></span><span class="dash-product-total"><strong>${total}</strong><small>pré-venda${total===1?'':'s'}</small></span><span class="dash-product-chevron">⌄</span></button><div class="dash-product-breakdown${hasMemory?'':' single'}" hidden><div><h4>Quantidade por cor</h4>${miniList(colors)}</div>${hasMemory?`<div><h4>Quantidade por memória</h4>${miniList(memories)}</div>`:''}</div></div>`;
  }).join('');
}
function renderProducts(rows){
  const byDay=group(rows,x=>x.data?formatDateBR(x.data):'');
  return`<div class="dash-clean-panel"><div class="dash-clean-heading"><div><span>Produtos</span><h3>Pré-vendas por aparelho</h3></div><small>Clique em um modelo para detalhar</small></div>${productAccordion(rows)}</div><details class="dash-clean-details"><summary>Evolução diária</summary><div>${bars(byDay)}</div></details>`;
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
  content.querySelectorAll('.dash-product-expand').forEach(button=>button.onclick=()=>{
    const detail=button.nextElementSibling,open=button.getAttribute('aria-expanded')==='true';
    button.setAttribute('aria-expanded',String(!open));detail.hidden=open;
  });
}

const base=window.renderDashboard;
window.renderDashboard=function(){if(typeof base==='function')base();renderClean()};
ensure();renderClean();
const style=document.createElement('style');style.textContent=`
#dashboardPanel .card>.dashboard-grid,#dashboardPanel .card>.dash-section,#dashV5,#dashOpsV51{display:none!important}
#dashboardPanel .toolbar{padding:12px;background:#f8fafc;border:1px solid #e4e7ec;border-radius:14px;margin-bottom:14px}
#dashboardPanel .toolbar input,#dashboardPanel .toolbar select{min-width:155px;flex:1}
.dash-clean-product-multi{position:relative;min-width:220px;flex:1}.dash-clean-product-btn{width:100%;min-height:46px;padding:10px 36px 10px 12px;border:1px solid #d9dfeb;border-radius:12px;background:#fff;color:#344054;text-align:left;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;position:relative}.dash-clean-product-btn:after{content:'⌄';position:absolute;right:13px;top:50%;transform:translateY(-55%);font-size:16px;color:#667085}.dash-clean-product-menu{position:absolute;z-index:140;top:50px;left:0;width:380px;max-width:min(92vw,380px);max-height:360px;overflow-x:hidden;overflow-y:auto;background:#fff;border:1px solid #d0d5dd;border-radius:14px;box-shadow:0 16px 38px rgba(16,24,40,.18);padding:8px}.dash-clean-product-head{position:sticky;top:-8px;z-index:2;display:flex;justify-content:space-between;align-items:center;padding:10px 9px;background:#fff;border-bottom:1px solid #eaecf0}.dash-clean-product-head button{padding:5px 8px;background:transparent;color:#1428A0}.dash-clean-product-option{display:grid;grid-template-columns:18px minmax(0,1fr);gap:10px;align-items:center;width:100%;padding:10px 9px;border-radius:9px;font-size:12px;line-height:1.25;cursor:pointer}.dash-clean-product-option:hover{background:#f5f7fb}.dash-clean-product-option input,#dashboardPanel .toolbar .dash-clean-product-option input{appearance:auto!important;width:16px!important;height:16px!important;min-width:16px!important;min-height:16px!important;max-width:16px!important;margin:0!important;padding:0!important;flex:0 0 16px!important;accent-color:#1428A0;box-shadow:none!important}.dash-clean-product-option span{display:block;min-width:0;overflow-wrap:anywhere;color:#344054;font-weight:600}
.dash-clean-tabs{display:inline-flex;gap:4px;padding:4px;background:#eef2f6;border-radius:12px;margin:2px 0 16px}.dash-clean-tabs button{padding:9px 14px;background:transparent;color:#475467}.dash-clean-tabs button.active{background:#fff;color:#1428A0;box-shadow:0 1px 4px rgba(16,24,40,.12)}
.dash-clean-kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:14px}.dash-clean-kpis-two{grid-template-columns:repeat(2,1fr)}.dash-clean-kpi{padding:16px;background:#fff;border:1px solid #e4e7ec;border-radius:14px}.dash-clean-kpi span{display:block;font-size:12px;color:#667085}.dash-clean-kpi strong{display:block;margin-top:6px;font-size:25px;color:#101828}.dash-clean-kpi small{color:#98a2b3;font-size:11px}
.dash-clean-panel,.dash-clean-details{background:#fff;border:1px solid #e4e7ec;border-radius:16px;padding:17px}.dash-clean-heading{display:flex;justify-content:space-between;align-items:end;margin-bottom:15px}.dash-clean-heading span{font-size:10px;font-weight:900;letter-spacing:.8px;text-transform:uppercase;color:#1428A0}.dash-clean-heading h3{margin:3px 0 0;font-size:17px}.dash-clean-heading small{color:#667085}
.dash-clean-bar{display:grid;grid-template-columns:24px minmax(130px,1.3fr) minmax(100px,2fr) 35px;gap:10px;align-items:center;padding:8px 0;border-bottom:1px solid #f0f2f5;font-size:13px}.dash-clean-bar:last-child{border-bottom:0}.dash-clean-rank{width:22px;height:22px;display:grid;place-items:center;border-radius:7px;background:#eef2ff;color:#1428A0;font-size:11px;font-weight:900}.dash-clean-label{font-weight:700}.dash-clean-track{height:8px;background:#eef2f6;border-radius:999px;overflow:hidden}.dash-clean-track i{display:block;height:100%;background:#1428A0;border-radius:999px}.dash-clean-bar strong{text-align:right}.dash-clean-two{display:grid;grid-template-columns:1fr 1fr;gap:14px}.dash-clean-details{margin-top:14px}.dash-clean-details summary{cursor:pointer;font-weight:800;color:#344054}.dash-clean-details>div{margin-top:12px}.dash-clean-empty{padding:24px;text-align:center;color:#98a2b3}.dash-clean-warning{padding:11px 13px;margin-bottom:12px;border-radius:10px;background:#fffaeb;color:#b54708;font-size:13px}
.dash-product-accordion{margin-bottom:10px;padding:0 14px;background:#fbfcff;border-radius:14px;box-shadow:0 1px 4px rgba(16,24,40,.06)}.dash-product-accordion:last-child{margin-bottom:0}.dash-product-expand{width:100%;display:grid;grid-template-columns:minmax(170px,1fr) auto 22px;gap:14px;align-items:center;padding:14px 0;background:transparent;color:#101828;text-align:left}.dash-product-name{font-weight:800;font-size:13px}.dash-product-name small{display:block;margin-top:4px;color:#98a2b3;font-size:10px;font-weight:500}.dash-product-total{display:flex;align-items:baseline;gap:5px;white-space:nowrap;color:#667085}.dash-product-total strong{font-size:18px;color:#1428A0}.dash-product-total small{font-size:10px}.dash-product-chevron{width:22px;height:22px;display:grid;place-items:center;border-radius:7px;background:#eef2ff;font-size:17px;color:#1428A0;transition:transform .15s}.dash-product-expand[aria-expanded="true"] .dash-product-chevron{transform:rotate(180deg)}.dash-product-breakdown{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin:0 0 14px;padding:15px 16px;background:#f2f5fa;border-radius:12px}.dash-product-breakdown.single{grid-template-columns:1fr}.dash-product-breakdown h4{margin:0 0 10px;font-size:11px;text-transform:uppercase;letter-spacing:.35px;color:#475467}.dash-product-mini{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;align-items:center;padding:7px 9px;margin-bottom:5px;background:#fff;border-radius:8px;font-size:11px}.dash-product-mini:last-child{margin-bottom:0}.dash-product-mini span{font-weight:600;color:#344054}.dash-product-mini strong{min-width:26px;text-align:center;padding:3px 7px;border-radius:999px;background:#e9efff;color:#1428A0;font-size:12px}
@media(max-width:760px){.dash-clean-kpis,.dash-clean-kpis-two,.dash-clean-two{grid-template-columns:1fr 1fr}.dash-clean-tabs{display:grid;grid-template-columns:repeat(3,1fr);width:100%}.dash-clean-tabs button{padding:9px 5px;font-size:11px}.dash-clean-bar{grid-template-columns:24px minmax(110px,1fr) 35px}.dash-clean-track{display:none}.dash-clean-two{grid-template-columns:1fr}.dash-clean-kpi strong{font-size:22px}.dash-product-expand{grid-template-columns:minmax(120px,1fr) auto 22px;gap:9px}.dash-product-total small{display:none}.dash-product-breakdown{grid-template-columns:1fr;margin-left:0}.dash-clean-heading>small{display:none}.dash-clean-product-multi{width:100%;min-width:0}.dash-clean-product-menu{position:fixed;left:10px;right:10px;top:auto;bottom:76px;width:auto;max-width:none;max-height:58vh;padding:8px 10px}.dash-clean-product-option{padding:11px 8px}}
`;document.head.appendChild(style);
const f=document.querySelector('.footer-note');if(f)f.textContent='PRE VENDA • v5.2.7 ONLINE';
})();
