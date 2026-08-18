(()=>{
'use strict';
const VERSION='6.5.5';
const $=id=>document.getElementById(id);
const AUDIT_KEY='preVendaEnterpriseAuditV650';
const CATALOG_BACKUP_KEY='preVendaCatalogSnapshotsV650';
const HISTORY_BACKUP_KEY='preVendaHistorySnapshotV650';
const LAST_SYNC_KEY='preVendaEnterpriseLastSyncV650';
const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key)||'null')??fallback}catch{return fallback}};
const write=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));return true}catch(e){console.warn('enterprise storage',e);return false}};
const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const iso=()=>new Date().toISOString();
const today=()=>typeof todayISO==='function'?todayISO():new Date().toISOString().slice(0,10);
const clone=value=>JSON.parse(JSON.stringify(value));

function audit(action,detail='',recordId=''){
 const list=read(AUDIT_KEY,[]);
 const event={id:crypto.randomUUID?.()||String(Date.now()+Math.random()),action,detail,recordId,at:iso(),online:navigator.onLine,device:localStorage.getItem('preVendaDeviceIdV1')||'Dispositivo'};
 list.unshift(event);write(AUDIT_KEY,list.slice(0,500));
 try{window.persistOnlineAudit?.({...event,action:'Operação: '+action,deviceId:event.device})}catch{}
 renderAudit();
 return event;
}
window.enterpriseAudit=audit;

function backupHistory(){
 const history=typeof getHistory==='function'?getHistory():[];
 if(history.length)write(HISTORY_BACKUP_KEY,{at:iso(),count:history.length,items:clone(history)});
}
backupHistory();

const NAV=[
 ['homePanel','Visão geral','▦'],
 ['formPanel','Nova pré-venda','＋'],
 ['budgetPanel','Novo orçamento','▤'],
 ['historyPanel','Histórico','◫'],
 ['dashboardPanel','Relatórios','▥'],
 ['settingsPanel','Configurações','⚙']
];
function availableNav(){return NAV.filter(([id])=>$(id))}
function pageTitle(id){return availableNav().find(x=>x[0]===id)?.[1]||'Visão geral'}
function currentPanel(){return document.querySelector('.panel.active')?.id||'homePanel'}

function buildShell(){
 if($('enterpriseSidebar'))return;
 document.body.classList.add('enterprise-mode');
 const aside=document.createElement('aside');aside.id='enterpriseSidebar';aside.className='enterprise-sidebar screen-only';
 aside.innerHTML=`<div class="ent-brand"><strong>SAMSUNG</strong><span>Manauara Shopping</span></div><nav class="ent-nav">${availableNav().map(([id,label,icon])=>`<button type="button" data-panel="${id}"><b>${icon}</b><span>${label}</span></button>`).join('')}</nav><div class="ent-sidebar-foot"><small>SISTEMA OPERACIONAL</small><strong>Pré‑Venda Samsung</strong><span>v${VERSION}</span></div>`;
 const header=document.createElement('header');header.id='enterpriseHeader';header.className='enterprise-header screen-only';
 header.innerHTML=`<div class="ent-head-left"><button type="button" id="enterpriseMenuToggle" aria-label="Abrir menu">☰</button><div><small>OPERAÇÃO SAMSUNG MANAUARA</small><h1 id="enterprisePageTitle">${pageTitle(currentPanel())}</h1></div></div><div class="ent-head-actions"><div id="enterpriseSyncState" class="ent-sync"></div><button type="button" id="enterpriseSyncButton" class="ent-icon-button" title="Sincronizar">↻</button></div>`;
 document.body.prepend(header);document.body.prepend(aside);
 aside.querySelectorAll('[data-panel]').forEach(button=>button.onclick=()=>{switchTab(button.dataset.panel);document.body.classList.remove('enterprise-menu-open')});
 $('enterpriseMenuToggle').onclick=()=>document.body.classList.toggle('enterprise-menu-open');
 $('enterpriseSyncButton').onclick=()=>window.syncAll?.(true);
 updateShell(currentPanel());updateConnection();
}
function updateShell(id=currentPanel()){
 if($('enterprisePageTitle'))$('enterprisePageTitle').textContent=pageTitle(id);
 document.querySelectorAll('#enterpriseSidebar [data-panel]').forEach(button=>button.classList.toggle('active',button.dataset.panel===id));
}

function updateConnection(state=''){
 const box=$('enterpriseSyncState');if(!box)return;
 const last=localStorage.getItem(LAST_SYNC_KEY);
 const online=navigator.onLine;
 const label=state==='busy'?'Sincronizando…':state==='error'?'Falha na sincronização':online?'Online e sincronizado':'Modo offline';
 box.className='ent-sync '+(state||(!online?'offline':'online'));
 box.innerHTML=`<i></i><span><strong>${label}</strong>${last&&online?`<small>Última: ${new Date(last).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}</small>`:''}</span>`;
}

function startOfLastDays(days){const d=new Date();d.setDate(d.getDate()-(days-1));return d.toISOString().slice(0,10)}
function monthStart(){const d=new Date();return new Date(d.getFullYear(),d.getMonth(),1).toISOString().slice(0,10)}
function openHistory(filter={}){
 switchTab('historyPanel');
 setTimeout(()=>{
  if($('histStart'))$('histStart').value=filter.start||'';
  if($('histEnd'))$('histEnd').value=filter.end||'';
  if($('histStatus'))$('histStatus').value=filter.status||'';
  window.renderHistory?.();
 },0);
}
function renderCockpit(){
 const home=$('homePanel');if(!home)return;
 let cockpit=$('enterpriseCockpit');
 if(!cockpit){cockpit=document.createElement('div');cockpit.id='enterpriseCockpit';cockpit.className='ent-cockpit';home.prepend(cockpit)}
 const history=typeof getHistory==='function'?getHistory():[],day=today();
 const todayRows=history.filter(x=>x.data===day);
 const waiting=history.filter(x=>(x.statusVenda||'Aguardando produto')==='Aguardando produto').length;
 const advised=history.filter(x=>x.statusVenda==='Cliente avisado').length;
 const retired=history.filter(x=>x.statusVenda==='Retirado').length;
 const recent=[...history].sort((a,b)=>String(b.data||'').localeCompare(String(a.data||''))||String(b.updatedAt||'').localeCompare(String(a.updatedAt||''))).slice(0,5);
 cockpit.innerHTML=`<div class="ent-kpis"><button data-today><small>PRÉ-VENDAS HOJE</small><strong>${todayRows.length}</strong><span>Ver registros de hoje →</span></button><button data-status="Aguardando produto"><small>AGUARDANDO PRODUTO</small><strong>${waiting}</strong><span>Acompanhar pendências →</span></button><button data-status="Cliente avisado"><small>CLIENTES AVISADOS</small><strong>${advised}</strong><span>Consultar clientes →</span></button><button data-status="Retirado"><small>PRODUTOS RETIRADOS</small><strong>${retired}</strong><span>Ver retiradas →</span></button></div><div class="ent-recent"><div class="ent-block-title"><div><small>ATIVIDADE RECENTE</small><h3>Últimas pré-vendas</h3></div><button class="btn-outline" data-history>Ver histórico completo</button></div><div class="ent-recent-list">${recent.length?recent.map(row=>`<button data-record="${esc(row.id)}"><span><b>${esc(row.numero||'Pré-venda')}</b><small>${esc(row.cliente||'Consumidor')} • ${esc(row.vendedor||'Sem consultor')}</small></span><span><b>${esc(row.produto||'Produto')}</b><small>${typeof formatDateBR==='function'?formatDateBR(row.data):esc(row.data||'')}</small></span><i>›</i></button>`).join(''):'<div class="empty">Nenhuma pré-venda registrada.</div>'}</div></div>`;
 cockpit.querySelector('[data-today]').onclick=()=>openHistory({start:day,end:day});
 cockpit.querySelectorAll('[data-status]').forEach(button=>button.onclick=()=>openHistory({status:button.dataset.status}));
 cockpit.querySelector('[data-history]').onclick=()=>openHistory();
 cockpit.querySelectorAll('[data-record]').forEach(button=>button.onclick=()=>window.loadRecord?.(button.dataset.record));
}

function ensureHistoryTools(){
 const panel=$('historyPanel'),card=panel?.querySelector('.card');if(!card||$('enterpriseHistoryTools'))return;
 const title=document.createElement('div');title.className='ent-section-head';title.innerHTML='<div><small>CENTRAL DOCUMENTAL</small><h2>Histórico de documentos</h2><p>Pesquise, filtre, exporte e acompanhe as pré-vendas registradas.</p></div>';
 card.prepend(title);
 const tools=document.createElement('div');tools.id='enterpriseHistoryTools';tools.className='ent-history-tools';
 tools.innerHTML='<span>Período rápido</span><button data-range="today">Hoje</button><button data-range="7">7 dias</button><button data-range="month">Este mês</button><button data-range="all">Todo o período</button>';
 const filters=card.querySelector('.history-filters')||card.querySelector('.toolbar');filters?.insertAdjacentElement('afterend',tools);
 tools.querySelectorAll('[data-range]').forEach(button=>button.onclick=()=>{
  const range=button.dataset.range,end=today();let start='';
  if(range==='today')start=end;if(range==='7')start=startOfLastDays(7);if(range==='month')start=monthStart();
  if($('histStart'))$('histStart').value=start;if($('histEnd'))$('histEnd').value=range==='all'?'':end;
  tools.querySelectorAll('button').forEach(x=>x.classList.toggle('active',x===button));
  window.renderHistory?.();
 });
}

function catalogStatus(){
 const catalog=typeof getCatalog==='function'?getCatalog():[];
 const normalize=v=>String(v||'').trim().toLocaleLowerCase('pt-BR').replace(/\s+/g,' ');
 const names=new Map(),duplicates=[];
 for(const p of catalog){const key=normalize(p.name);if(names.has(key))duplicates.push(p.name);else names.set(key,true)}
 const noPrice=catalog.filter(p=>!Object.values(p.finalPrices||{}).some(v=>Number(v)>0));
 return{catalog,duplicates,noPrice};
}
function snapshots(){return read(CATALOG_BACKUP_KEY,[])}
function snapshotCatalog(reason='Snapshot manual'){
 const catalog=typeof getCatalog==='function'?getCatalog():[];if(!catalog.length)return false;
 const list=snapshots();list.unshift({id:crypto.randomUUID?.()||String(Date.now()),at:iso(),reason,count:catalog.length,items:clone(catalog)});
 write(CATALOG_BACKUP_KEY,list.slice(0,6));audit('Catálogo protegido',`${reason} • ${catalog.length} produto(s)`);renderCatalogSafety();return true;
}
async function restoreCatalogSnapshot(){
 const snapshot=snapshots()[0];if(!snapshot)return alert('Ainda não existe uma cópia anterior do catálogo.');
 if(typeof requestAdmin==='function'&&!(await requestAdmin('restaurar o catálogo anterior')))return;
 if(!confirm(`Restaurar a cópia de ${new Date(snapshot.at).toLocaleString('pt-BR')} com ${snapshot.count} produtos?\n\nO catálogo atual será guardado antes da restauração.`))return;
 snapshotCatalog('Antes da restauração');
 await window.saveCatalog(clone(snapshot.items));audit('Catálogo restaurado',`${snapshot.count} produto(s)`);renderCatalogSafety();alert('Catálogo restaurado com sucesso.');
}
function renderCatalogSafety(){
 const box=$('enterpriseCatalogSafetyContent');if(!box)return;
 const state=catalogStatus(),last=snapshots()[0];
 box.innerHTML=`<div class="ent-audit-grid"><span><small>PRODUTOS</small><b>${state.catalog.length}</b></span><span class="${state.duplicates.length?'warn':'ok'}"><small>DUPLICADOS</small><b>${state.duplicates.length}</b></span><span class="${state.noPrice.length?'warn':'ok'}"><small>SEM PREÇO</small><b>${state.noPrice.length}</b></span><span><small>ÚLTIMA CÓPIA</small><b>${last?new Date(last.at).toLocaleDateString('pt-BR'):'—'}</b></span></div>${state.duplicates.length||state.noPrice.length?`<div class="ent-warning">A auditoria encontrou ${state.duplicates.length} duplicidade(s) e ${state.noPrice.length} produto(s) sem preço. Nenhum item será removido automaticamente.</div>`:'<div class="ent-success">Catálogo validado. Nenhuma inconsistência estrutural encontrada.</div>'}`;
}
function ensureCatalogSafety(){
 const grid=$('settingsPanel')?.querySelector('.settings-grid');if(!grid||$('enterpriseCatalogSafety'))return;
 const box=document.createElement('div');box.id='enterpriseCatalogSafety';box.className='settings-box ent-wide';
 box.innerHTML='<div class="ent-block-title"><div><small>PROTEÇÃO DE DADOS</small><h3>Segurança do catálogo</h3></div></div><div id="enterpriseCatalogSafetyContent"></div><div class="row-actions"><button id="enterpriseCatalogSnapshot" class="btn-outline">Criar cópia agora</button><button id="enterpriseCatalogRestore" class="btn-outline">Restaurar última cópia</button></div>';
 grid.appendChild(box);$('enterpriseCatalogSnapshot').onclick=()=>snapshotCatalog();$('enterpriseCatalogRestore').onclick=restoreCatalogSnapshot;renderCatalogSafety();
}

function renderAudit(){
 const content=$('enterpriseAuditContent');if(!content)return;
 const rows=read(AUDIT_KEY,[]).slice(0,12);
 content.innerHTML=rows.length?rows.map(row=>`<div class="ent-audit-row"><span><b>${esc(row.action)}</b><small>${esc(row.detail||'')}</small></span><time>${new Date(row.at).toLocaleString('pt-BR')}</time></div>`).join(''):'<div class="empty">Nenhuma atividade registrada neste dispositivo.</div>';
}
function ensureAudit(){
 const grid=$('settingsPanel')?.querySelector('.settings-grid');if(!grid||$('enterpriseAudit'))return;
 const box=document.createElement('div');box.id='enterpriseAudit';box.className='settings-box ent-wide';
 box.innerHTML='<div class="ent-block-title"><div><small>RASTREABILIDADE</small><h3>Atividades operacionais</h3></div><button id="enterpriseAuditRefresh" class="btn-outline">Atualizar</button></div><div id="enterpriseAuditContent"></div>';
 grid.appendChild(box);$('enterpriseAuditRefresh').onclick=renderAudit;renderAudit();
}

function installWrappers(){
 const renderHistory0=window.renderHistory;if(typeof renderHistory0==='function'){window.renderHistory=function(){const provider=window.getFilteredHistoryView;const filtered=typeof provider==='function'?provider():null;if(!Array.isArray(filtered)){const result=renderHistory0.apply(this,arguments);window.refreshHistoryProductFilters?.();ensureHistoryTools();return result}const oldGet=window.getHistory;window.getHistory=()=>filtered;try{return renderHistory0.apply(this,arguments)}finally{window.getHistory=oldGet;window.refreshHistoryProductFilters?.();ensureHistoryTools()}}}
 const export0=window.exportCSV;if(typeof export0==='function'){window.exportCSV=function(){const provider=window.getFilteredHistoryView,filtered=typeof provider==='function'?provider():getHistory();if(!filtered.length)return alert('Nenhuma pré-venda encontrada com os filtros selecionados.');const oldGet=window.getHistory;window.getHistory=()=>filtered;try{audit('Histórico exportado',`${filtered.length} registro(s)`);return export0.apply(this,arguments)}finally{window.getHistory=oldGet}};if($('exportarBtn'))$('exportarBtn').onclick=window.exportCSV}
 const switch0=window.switchTab;window.switchTab=function(id){const result=switch0.apply(this,arguments);updateShell(id);if(id==='homePanel')renderCockpit();if(id==='historyPanel')setTimeout(ensureHistoryTools,0);if(id==='settingsPanel')setTimeout(()=>{ensureCatalogSafety();ensureAudit();renderCatalogSafety();renderAudit()},0);return result};
 const metrics0=window.updateMetrics;window.updateMetrics=function(){const result=metrics0?.apply(this,arguments);renderCockpit();return result};
 const sync0=window.syncAll;if(typeof sync0==='function'){window.syncAll=async function(){updateConnection('busy');audit('Sincronização iniciada');try{const result=await sync0.apply(this,arguments);localStorage.setItem(LAST_SYNC_KEY,iso());updateConnection('online');audit('Sincronização concluída');return result}catch(error){updateConnection('error');audit('Falha na sincronização',error?.message||'Erro não informado');throw error}}}
 const saveCatalog0=window.saveCatalog;if(typeof saveCatalog0==='function'){window.saveCatalog=async function(next){snapshotCatalog('Antes de alterar o catálogo');const result=await saveCatalog0.apply(this,arguments);audit('Catálogo atualizado',`${Array.isArray(next)?next.length:0} produto(s)`);renderCatalogSafety();return result}}
 const save0=window.saveCurrent;if(typeof save0==='function'){window.saveCurrent=async function(){const result=await save0.apply(this,arguments);if(result){audit('Pré-venda salva',result.numero||result.cliente||'',result.id);backupHistory();renderCockpit()}return result};if($('salvarBtn'))$('salvarBtn').onclick=window.saveCurrent}
 const del0=window.deleteRecord;if(typeof del0==='function'){window.deleteRecord=async function(id){const before=getHistory().find(x=>x.id===id);const result=await del0.apply(this,arguments);if(before&&!getHistory().some(x=>x.id===id)){audit('Pré-venda excluída',before.numero||before.cliente||'',id);backupHistory();renderCockpit()}return result}}
 if($('syncBtn'))$('syncBtn').onclick=()=>window.syncAll?.(true);if($('settingsSyncBtn'))$('settingsSyncBtn').onclick=()=>window.syncAll?.(true);
}

const css=document.createElement('style');css.id='enterprise-v650-style';css.textContent=`
:root{--ent-blue:#1428a0;--ent-blue2:#0b1f83;--ent-bg:#f3f5f9;--ent-line:#e2e7f0;--ent-text:#172033;--ent-muted:#667085;--ent-green:#067647;--ent-orange:#b54708}
body.enterprise-mode{background:var(--ent-bg);color:var(--ent-text)}
body.enterprise-mode .app{max-width:none;margin:0;padding:88px 24px 34px 284px}
body.enterprise-mode .app>.topbar{display:none!important}
.enterprise-sidebar{position:fixed;z-index:9000;left:0;top:0;bottom:0;width:252px;background:linear-gradient(180deg,#101f72,#07164f);color:#fff;padding:24px 16px;display:flex;flex-direction:column;box-shadow:12px 0 32px rgba(13,28,91,.12)}
.ent-brand{padding:4px 12px 25px;border-bottom:1px solid rgba(255,255,255,.13)}.ent-brand strong{display:block;font-size:21px;letter-spacing:2px}.ent-brand span{display:block;margin-top:5px;font-size:12px;color:#cbd3ff}
.ent-nav{display:grid;gap:5px;margin-top:20px}.ent-nav button{display:flex;align-items:center;gap:12px;width:100%;padding:12px;border:0;border-radius:10px;background:transparent;color:#cbd3ff;text-align:left;font-weight:700;cursor:pointer}.ent-nav button b{width:25px;font-size:18px;text-align:center}.ent-nav button:hover,.ent-nav button.active{background:rgba(255,255,255,.13);color:#fff}.ent-nav button.active{box-shadow:inset 3px 0 #8ea1ff}
.ent-sidebar-foot{margin-top:auto;padding:16px 12px;border-top:1px solid rgba(255,255,255,.13)}.ent-sidebar-foot small,.ent-sidebar-foot strong,.ent-sidebar-foot span{display:block}.ent-sidebar-foot small{font-size:9px;letter-spacing:1.2px;color:#99a9ee}.ent-sidebar-foot strong{margin-top:5px;font-size:12px}.ent-sidebar-foot span{margin-top:3px;font-size:10px;color:#99a9ee}
.enterprise-header{position:fixed;z-index:8500;left:252px;right:0;top:0;height:70px;padding:0 25px;background:rgba(255,255,255,.96);border-bottom:1px solid var(--ent-line);display:flex;align-items:center;justify-content:space-between;backdrop-filter:blur(12px)}
.ent-head-left,.ent-head-actions{display:flex;align-items:center;gap:13px}.ent-head-left small{display:block;font-size:9px;letter-spacing:1.1px;color:#7f8ba5;font-weight:800}.ent-head-left h1{font-size:20px;margin:2px 0 0}.ent-head-actions{gap:9px}#enterpriseMenuToggle{display:none;border:0;background:transparent;font-size:22px}.ent-icon-button{width:40px;height:40px;border:1px solid var(--ent-line);border-radius:10px;background:#fff;color:var(--ent-blue);font-size:19px}
.ent-sync{display:flex;align-items:center;gap:8px;padding:7px 11px;border:1px solid var(--ent-line);border-radius:10px;background:#fff}.ent-sync i{width:8px;height:8px;border-radius:50%;background:#12b76a}.ent-sync.offline i,.ent-sync.error i{background:#f04438}.ent-sync.busy i{background:#f79009}.ent-sync span,.ent-sync strong,.ent-sync small{display:block}.ent-sync strong{font-size:10px}.ent-sync small{font-size:9px;color:#98a2b3;margin-top:1px}
body.enterprise-mode .content{max-width:1500px;margin:0 auto}body.enterprise-mode .quick-info,body.enterprise-mode #onlineBanner,body.enterprise-mode #professionalSyncChip{display:none!important}body.enterprise-mode .card{border:1px solid var(--ent-line);border-radius:16px;box-shadow:0 5px 20px rgba(29,45,91,.05);padding:22px}body.enterprise-mode input,body.enterprise-mode select,body.enterprise-mode textarea{border-color:#d7deea;border-radius:10px;min-height:43px}body.enterprise-mode label{color:#3b465d;font-size:11px;letter-spacing:.25px}body.enterprise-mode .btn{background:var(--ent-blue);border-radius:10px;box-shadow:none}body.enterprise-mode .btn:hover{background:var(--ent-blue2)}
.ent-cockpit{display:grid;gap:16px;margin-bottom:16px}.ent-block-title small,.ent-section-head small{font-size:9px;letter-spacing:1.2px;font-weight:900}
.ent-kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.ent-kpis button{min-width:0;padding:17px;border:1px solid var(--ent-line);border-radius:14px;background:#fff;text-align:left;box-shadow:0 4px 15px rgba(29,45,91,.04);cursor:pointer}.ent-kpis button:hover{transform:translateY(-1px);border-color:#bcc7e4}.ent-kpis small,.ent-kpis strong,.ent-kpis span{display:block}.ent-kpis small{font-size:9px;color:#69758c;font-weight:900;letter-spacing:.65px}.ent-kpis strong{font-size:27px;margin:8px 0;color:#1428a0}.ent-kpis span{font-size:10px;color:#8b96aa}
.ent-recent{padding:20px;border:1px solid var(--ent-line);border-radius:15px;background:#fff}.ent-block-title{display:flex;align-items:center;justify-content:space-between;gap:12px}.ent-block-title small,.ent-section-head small{color:#1428a0}.ent-block-title h3,.ent-section-head h2{margin:4px 0}.ent-recent-list{margin-top:13px}.ent-recent-list>button{display:grid;grid-template-columns:1fr 1fr 20px;gap:12px;align-items:center;width:100%;padding:12px 5px;border:0;border-top:1px solid #edf0f5;background:#fff;text-align:left}.ent-recent-list span b,.ent-recent-list span small{display:block}.ent-recent-list span b{font-size:12px}.ent-recent-list span small{font-size:10px;color:#7f8ba5;margin-top:3px}.ent-recent-list i{font-size:20px;color:#1428a0}
#homePanel>.home-hero,#homePanel>.home-grid{display:none!important}.ent-section-head{margin-bottom:17px}.ent-section-head p{margin:4px 0 0;color:#7f8ba5;font-size:12px}.ent-history-tools{display:flex;align-items:center;gap:7px;margin:10px 0 15px}.ent-history-tools span{font-size:10px;font-weight:800;color:#667085}.ent-history-tools button{border:1px solid var(--ent-line);border-radius:9px;background:#fff;padding:8px 11px;color:#475467;font-size:11px;font-weight:700}.ent-history-tools button.active{background:#eef2ff;color:#1428a0;border-color:#c7d0ff}
.ent-wide{grid-column:1/-1}.ent-audit-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:12px 0}.ent-audit-grid span{padding:12px;border:1px solid var(--ent-line);border-radius:10px}.ent-audit-grid small,.ent-audit-grid b{display:block}.ent-audit-grid small{font-size:9px;color:#7f8ba5;font-weight:800}.ent-audit-grid b{font-size:18px;margin-top:4px}.ent-audit-grid .warn b{color:var(--ent-orange)}.ent-audit-grid .ok b{color:var(--ent-green)}.ent-warning,.ent-success{padding:11px;border-radius:9px;font-size:11px}.ent-warning{background:#fffaeb;color:#b54708}.ent-success{background:#ecfdf3;color:#067647}.ent-audit-row{display:flex;justify-content:space-between;gap:15px;padding:10px 0;border-bottom:1px solid #edf0f5}.ent-audit-row span b,.ent-audit-row span small{display:block}.ent-audit-row span b{font-size:11px}.ent-audit-row span small{font-size:10px;color:#7f8ba5;margin-top:2px}.ent-audit-row time{font-size:9px;color:#98a2b3;white-space:nowrap}
@media(max-width:1100px){.ent-kpis{grid-template-columns:1fr 1fr}}
@media(max-width:920px){body.enterprise-mode .app{padding:76px 10px 24px}.enterprise-sidebar{transform:translateX(-105%);transition:.2s;width:260px}.enterprise-menu-open .enterprise-sidebar{transform:translateX(0)}.enterprise-header{left:0;height:64px;padding:0 12px}.ent-head-left small{display:none}.ent-head-left h1{font-size:17px}#enterpriseMenuToggle{display:block}.ent-sync span{display:none}.ent-sync{padding:9px}.ent-kpis{grid-template-columns:1fr 1fr}.ent-recent-list>button{grid-template-columns:1fr 1fr 14px}.ent-audit-grid{grid-template-columns:1fr 1fr}.ent-history-tools{overflow:auto;padding-bottom:4px}.ent-history-tools span{display:none}}
@media(max-width:540px){.ent-kpis{grid-template-columns:1fr 1fr;gap:8px}.ent-kpis button{padding:13px}.ent-kpis strong{font-size:22px}.ent-recent{padding:15px}.ent-recent-list>button{grid-template-columns:1fr 14px}.ent-recent-list>button>span:nth-child(2){display:none}.ent-block-title{align-items:flex-start}.ent-block-title .btn-outline{font-size:10px;padding:8px}.ent-audit-row{flex-direction:column;gap:4px}}
@media print{.enterprise-sidebar,.enterprise-header{display:none!important}body.enterprise-mode .app{padding:0!important}}
`;document.head.appendChild(css);

buildShell();installWrappers();renderCockpit();ensureHistoryTools();ensureCatalogSafety();ensureAudit();renderCatalogSafety();renderAudit();updateConnection();window.renderDashboard?.();
window.addEventListener('online',()=>{updateConnection();audit('Conexão restabelecida')});
window.addEventListener('offline',()=>{updateConnection();audit('Modo offline ativado')});
window.addEventListener('storage',event=>{if(event.key===AUDIT_KEY)renderAudit();if(event.key===CATALOG_BACKUP_KEY)renderCatalogSafety()});
setInterval(()=>{updateConnection();renderCockpit()},60000);
const footer=document.querySelector('.footer-note');if(footer)footer.textContent=`PRE VENDA • v${VERSION} ENTERPRISE`;
audit('Camada empresarial carregada',`v${VERSION}`);
})();
