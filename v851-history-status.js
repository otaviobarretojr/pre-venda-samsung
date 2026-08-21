(()=>{
'use strict';
const VERSION='8.5.1';
const STATUS=['Aguardando produto','Cliente avisado','Retirado'];
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const find=id=>(typeof window.getHistory==='function'?window.getHistory():[]).find(x=>String(x.id)===String(id));
function recordIdFromNode(node){const html=node?.innerHTML||'';const m=html.match(/(?:loadRecord|printRecord)\(['"]([^'"]+)['"]\)/);return m?.[1]||''}
function label(status){return status||'Aguardando produto'}
async function persistStatus(id,status,select){
 if(!STATUS.includes(status))return;
 const current=find(id);if(!current)return alert('Pré-venda não encontrada. Sincronize e tente novamente.');
 const now=new Date().toISOString(),updated={...current,statusVenda:status,statusUpdatedAt:now,updatedAt:now};
 if(status==='Cliente avisado'&&!updated.clienteAvisadoAt)updated.clienteAvisadoAt=now;
 if(status==='Retirado'&&!updated.retiradoAt)updated.retiradoAt=now;
 if(status==='Aguardando produto'){delete updated.clienteAvisadoAt;delete updated.retiradoAt}
 const history=window.getHistory();const next=history.map(x=>String(x.id)===String(id)?updated:x);
 try{window.setHistory?.(next)}catch(e){console.warn('[V8.5.1] local status',e)}
 if(select){select.disabled=true;select.dataset.saving='1'}
 try{
   if(typeof window.upsertHistory==='function')await window.upsertHistory([updated]);
   else if(window.V71Data?.preSale?.upsert)await window.V71Data.preSale.upsert(updated);
   window.enterpriseAudit?.('Status do cliente atualizado',`${updated.numero||updated.cliente||id} • ${status}`,id);
 }catch(e){console.warn('[V8.5.1] status salvo localmente; sincronização pendente',e)}
 finally{if(select){select.disabled=false;delete select.dataset.saving}}
 window.updateMetrics?.();window.renderHistory?.();
}
function control(id,current,compact=false){return `<label class="v851-status ${compact?'compact':''}"><span>${compact?'Andamento':'Status do cliente'}</span><select data-v851-status="${esc(id)}" aria-label="Status do cliente"><option ${label(current)==='Aguardando produto'?'selected':''}>Aguardando produto</option><option ${label(current)==='Cliente avisado'?'selected':''}>Cliente avisado</option><option ${label(current)==='Retirado'?'selected':''}>Retirado</option></select></label>`}
function decorate(){
 const box=document.getElementById('historyContent');if(!box)return;
 box.querySelectorAll('.pro-history-desktop tbody tr').forEach(tr=>{if(tr.querySelector('[data-v851-status]'))return;const id=recordIdFromNode(tr),r=find(id),actions=tr.querySelector('.mini-actions')?.parentElement;if(!id||!r||!actions)return;const wrap=document.createElement('div');wrap.className='v851-desktop-control';wrap.innerHTML=control(id,r.statusVenda);actions.prepend(wrap)});
 box.querySelectorAll('.pro-history-mobile .pro-history-card').forEach(card=>{if(card.querySelector('[data-v851-status]'))return;const id=recordIdFromNode(card),r=find(id),actions=card.querySelector('.pro-card-actions');if(!id||!r||!actions)return;const wrap=document.createElement('div');wrap.className='v851-mobile-control';wrap.innerHTML=control(id,r.statusVenda,true);actions.before(wrap)});
 box.querySelectorAll('[data-v851-status]').forEach(sel=>sel.onchange=()=>persistStatus(sel.dataset.v851Status,sel.value,sel));
}
function wrapRender(){const old=window.renderHistory;if(typeof old!=='function'||old.__v851)return;const fn=function(){const result=old.apply(this,arguments);decorate();return result};fn.__v851=true;window.renderHistory=fn}
function styles(){if(document.getElementById('v851HistoryStatusStyle'))return;const s=document.createElement('style');s.id='v851HistoryStatusStyle';s.textContent=`.v851-desktop-control{margin-bottom:7px}.v851-status{display:flex;gap:5px;flex-direction:column;min-width:165px}.v851-status span{font-size:9px;font-weight:850;letter-spacing:.04em;text-transform:uppercase;color:#667085}.v851-status select{min-height:34px;border:1px solid #d5dce7;border-radius:9px;background:#fff;padding:6px 8px;font-size:11px;font-weight:750;color:#344054}.v851-status select:focus{outline:none;border-color:#1428a0;box-shadow:0 0 0 2px rgba(20,40,160,.09)}.v851-status select[data-saving="1"]{opacity:.55}.v851-mobile-control{margin:10px 0 4px;padding:10px 0;border-top:1px solid #eef1f5}.v851-status.compact{min-width:0;width:100%}.v851-status.compact select{min-height:42px;font-size:13px}.v851-status.compact span{font-size:10px}@media(max-width:700px){.v851-desktop-control{display:none}}`;document.head.appendChild(s)}
function boot(){styles();wrapRender();window.renderHistory?.();window.V851HistoryStatus={version:VERSION,persistStatus,decorate,statuses:[...STATUS]}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,2850),{once:true});else setTimeout(boot,2850);
})();
