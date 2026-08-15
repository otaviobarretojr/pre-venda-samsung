(()=>{
'use strict';
const TOMBSTONE_KEY='preVendaDeletedRecordsV1';
const HISTORY_STORAGE_KEY='samsung_pre_vendas';
const DELETION_PREFIX='deleted-pre-sale-v2:';
let deletionSyncPromise=null;

function getDeleted(){
  try{const x=JSON.parse(localStorage.getItem(TOMBSTONE_KEY)||'{}');return x&&typeof x==='object'&&!Array.isArray(x)?x:{}}catch{return{}}
}
function saveDeleted(x){localStorage.setItem(TOMBSTONE_KEY,JSON.stringify(x||{}))}
function mergeDeleted(...items){
  const out={};
  for(const item of items){
    if(!item||typeof item!=='object')continue;
    for(const[id,at]of Object.entries(item))if(id&&(!out[id]||String(at)>String(out[id])))out[id]=at;
  }
  return out;
}
function filterDeleted(rows){const deleted=getDeleted();return(Array.isArray(rows)?rows:[]).filter(x=>x?.id&&!deleted[x.id])}

const baseGetHistory=window.getHistory;
const baseSetHistory=window.setHistory;
if(typeof baseGetHistory==='function')window.getHistory=function(){return filterDeleted(baseGetHistory())};
if(typeof baseSetHistory==='function')window.setHistory=function(rows){return baseSetHistory(filterDeleted(rows))};

async function getRemoteDeleted(){
  const legacy=await getRemoteSetting('deleted_pre_sales_v1');
  const rows=await dbFetch(`app_settings?key=like.${encodeURIComponent(DELETION_PREFIX+'%')}&select=key,value`);
  const individual={};
  for(const row of rows||[]){const id=String(row?.key||'').slice(DELETION_PREFIX.length),at=row?.value?.deleted_at||row?.value?.at;if(id&&at)individual[id]=at}
  return{legacy:legacy&&typeof legacy==='object'?legacy:{},individual};
}
async function persistIndividualDeleted(merged,remote){
  const rows=[];
  for(const[id,at]of Object.entries(merged))if(!remote[id]||String(at)>String(remote[id]))rows.push({key:DELETION_PREFIX+id,value:{id,deleted_at:at},updated_at:new Date().toISOString()});
  if(rows.length)await dbFetch('app_settings?on_conflict=key',{method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify(rows)});
}
async function runDeletedSync(extra={}){
  const local=mergeDeleted(getDeleted(),extra);saveDeleted(local);
  try{
    const remote=await getRemoteDeleted();
    const merged=mergeDeleted(remote.legacy,remote.individual,local);
    saveDeleted(merged);
    await persistIndividualDeleted(merged,remote.individual);
    await setRemoteSetting('deleted_pre_sales_v1',merged);
    const ids=Object.keys(merged).filter(id=>/^[a-zA-Z0-9-]+$/.test(id));
    for(let i=0;i<ids.length;i+=100){
      const batch=ids.slice(i,i+100);
      if(batch.length)await dbFetch(`pre_vendas?id=in.(${batch.join(',')})`,{method:'DELETE',headers:{Prefer:'return=minimal'}});
    }
    return merged;
  }catch(err){
    console.warn('Tombstones pendentes de sincronização',err);
    return local;
  }
}
function syncDeleted(extra={}){
  const task=async()=>runDeletedSync(extra);
  const current=deletionSyncPromise?deletionSyncPromise.then(task,task):task();
  deletionSyncPromise=current;
  return current.finally(()=>{if(deletionSyncPromise===current)deletionSyncPromise=null});
}
async function markDeleted(ids){
  const at=new Date().toISOString(),extra={};
  for(const id of ids||[])if(id)extra[id]=at;
  await syncDeleted(extra);
  const visible=window.getHistory();
  if(typeof baseSetHistory==='function')baseSetHistory(visible);
  return extra;
}

const baseDeleteCloudRecord=window.deleteCloudRecord;
if(typeof baseDeleteCloudRecord==='function')window.deleteCloudRecord=async function(id){
  await markDeleted([id]);
  return baseDeleteCloudRecord(id);
};

const basePullHistory=window.pullHistory;
if(typeof basePullHistory==='function')window.pullHistory=async function(){
  await syncDeleted();
  const result=await basePullHistory.apply(this,arguments);
  if(typeof baseSetHistory==='function')baseSetHistory(window.getHistory());
  return result;
};

const baseSyncAll=window.syncAll;
if(typeof baseSyncAll==='function')window.syncAll=async function(){
  await syncDeleted();
  return baseSyncAll.apply(this,arguments);
};

const clearButton=document.getElementById('limparHistoricoBtn');
if(clearButton)clearButton.onclick=async()=>{
  if(!(await requestAdmin('limpar o histórico')))return;
  if(!confirm('Apagar TODO o histórico online e local?'))return;
  const ids=window.getHistory().map(x=>x.id).filter(Boolean);
  try{
    await markDeleted(ids);
    await dbFetch('pre_vendas?id=not.is.null',{method:'DELETE',headers:{Prefer:'return=minimal'}});
    localStorage.setItem(HISTORY_STORAGE_KEY,'[]');
    if(typeof baseSetHistory==='function')baseSetHistory([]);
    renderHistory();renderDashboard();
    if(typeof renderWithdrawals==='function')renderWithdrawals();
    setOnlineState('ok','Online');
  }catch(err){
    console.error(err);
    alert('Não foi possível concluir a exclusão online. Os registros foram ocultados neste aparelho e a sincronização será tentada novamente.');
  }
};

syncDeleted().then(()=>{
  if(typeof baseSetHistory==='function')baseSetHistory(window.getHistory());
  renderHistory();renderDashboard();
  if(typeof renderWithdrawals==='function')renderWithdrawals();
  window.preSaleSyncReady=true;
  if(typeof window.syncAll==='function')window.syncAll(false);
}).catch(console.error);
})();
