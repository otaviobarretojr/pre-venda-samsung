(()=>{
'use strict';
const $=id=>document.getElementById(id);
const wearableRx=/galaxy\s*(watch|buds|ring|fit)/i;
const galaxyZRx=/galaxy\s*z\s*(flip|fold)/i;
const isWearable=p=>wearableRx.test(p?.name||'');
const isGalaxyZ=p=>galaxyZRx.test(p?.name||'');
const esc=s=>typeof escapeHtml==='function'?escapeHtml(s):String(s||'');

function ensureWearableField(){
  if($('wearable'))return;
  const product=$('produto')?.closest('.field');
  const color=$('cor')?.closest('.field');
  if(!product||!color)return;
  product.querySelector('label').textContent='Galaxy Z *';
  const field=document.createElement('div');
  field.className='field full wearable-field';
  field.innerHTML='<label for="wearable">Galaxy Wearables <span class="optional-label">(opcional)</span></label><select id="wearable"><option value="">Nenhum wearable</option></select><div class="field-help">Deixe vazio quando o cliente não incluir um Galaxy Wearable.</div>';
  color.insertAdjacentElement('afterend',field);
}
function populateWearables(selected=''){
  ensureWearableField();const el=$('wearable');if(!el)return;
  const items=getCatalog().filter(isWearable);
  el.innerHTML='<option value="">Nenhum wearable</option>'+items.map(p=>`<option>${esc(p.name)}</option>`).join('');
  if(selected&&!items.some(p=>p.name===selected))el.insertAdjacentHTML('beforeend',`<option>${esc(selected)}</option>`);
  if(selected)el.value=selected;
}
const originalPopulate=window.populateProducts;
window.populateProducts=function(selected=''){
  ensureWearableField();
  const el=$('produto'),items=getCatalog().filter(isGalaxyZ);
  el.innerHTML='<option value="">Selecione um Galaxy Z</option>'+items.map(p=>`<option>${esc(p.name)}</option>`).join('');
  if(selected&&!items.some(p=>p.name===selected))el.insertAdjacentHTML('beforeend',`<option>${esc(selected)}</option>`);
  if(selected)el.value=selected;
  onProductChange();populateWearables();
};

const baseCollect=window.collect;
window.collect=function(){const d=baseCollect();d.wearable=$('wearable')?.value||'';return d};

const baseToDb=window.toDb;
window.toDb=function(d){const r=baseToDb(d);const clean=String(d.obsInterna||'').replace(/\n?\[\[WEARABLE:.*?\]\]/g,'').trim();r.obs_interna=clean+(d.wearable?'\n[[WEARABLE:'+d.wearable+']]':'');return r};
const baseFromDb=window.fromDb;
window.fromDb=function(r){const d=baseFromDb(r),m=String(r.obs_interna||'').match(/\[\[WEARABLE:(.*?)\]\]/);d.wearable=m?m[1]:'';d.obsInterna=String(d.obsInterna||'').replace(/\n?\[\[WEARABLE:.*?\]\]/g,'').trim();return d};

const baseLoad=window.loadRecord;
window.loadRecord=async function(id){await baseLoad(id);const d=getHistory().find(x=>x.id===id);populateWearables(d?.wearable||'')};
const baseClear=window.clearForm;
window.clearForm=function(){baseClear();populateWearables('')};

const baseRenderDoc=window.renderDoc;
window.renderDoc=function(d){baseRenderDoc(d);let row=$('docWearableRow');if(!row){const product=$('docProduto')?.closest('.pv-block');const grid=product?.querySelector('.pv-grid');if(grid){row=document.createElement('div');row.id='docWearableRow';row.className='pv-row full';row.innerHTML='<div class="pv-label">Galaxy Wearable</div><div class="pv-value" id="docWearable">—</div>';grid.appendChild(row)}}if(row){row.style.display=d.wearable?'':'none';const v=$('docWearable');if(v)v.textContent=d.wearable||'—'}};

const baseRenderHistory=window.renderHistory;
window.renderHistory=function(){baseRenderHistory();document.querySelectorAll('#historyContent tbody tr').forEach((tr,i)=>{const rows=getHistory();const q=$('busca')?.value.trim().toLowerCase()||'';const filtered=q?rows.filter(d=>[d.cliente,d.cpf,d.produto,d.capacidade,d.cor,d.wearable,d.vendedor].some(v=>String(v||'').toLowerCase().includes(q))):rows;const d=filtered[i];if(d?.wearable){const cell=tr.children[3];if(cell&&!cell.textContent.includes(d.wearable))cell.innerHTML+=`<br><small>+ ${esc(d.wearable)}</small>`}})};

ensureWearableField();populateProducts();populateWearables();
const footer=document.querySelector('.footer-note');if(footer)footer.textContent='PRE VENDA • v4.5.3';
})();