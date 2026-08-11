from pathlib import Path

p = Path('index.html')
s = p.read_text(encoding='utf-8')

s = s.replace("CATALOG_KEY='samsung_product_catalog',HISTORY_KEY='samsung_pre_vendas',CONSULTANTS_KEY='samsung_consultants';", "CATALOG_KEY='samsung_product_catalog',HISTORY_KEY='samsung_pre_vendas',CONSULTANTS_KEY='samsung_consultants',HISTORY_BACKUP_KEY='samsung_pre_vendas_backup';")

old = "function clone(v){return JSON.parse(JSON.stringify(v))}function todayISO()"
new = "function clone(v){return JSON.parse(JSON.stringify(v))}function backupHistory(items=getHistory()){try{const current=Array.isArray(items)?items:[];const previous=JSON.parse(localStorage.getItem(HISTORY_BACKUP_KEY)||'[]');const merged=mergeHistory(previous,current);localStorage.setItem(HISTORY_BACKUP_KEY,JSON.stringify(merged));return merged}catch(e){console.warn('backupHistory',e);return[]}}function mergeHistory(...lists){const map=new Map();for(const list of lists){for(const item of (Array.isArray(list)?list:[])){if(!item||!item.id)continue;const prev=map.get(item.id);if(!prev||String(item.updatedAt||item.updated_at||'')>=String(prev.updatedAt||prev.updated_at||''))map.set(item.id,item)}}return [...map.values()].sort((a,b)=>String(b.updatedAt||b.updated_at||'').localeCompare(String(a.updatedAt||a.updated_at||'')))}function recoverLegacyHistory(){const candidates=['samsung_pre_vendas','pre_vendas','preVendas','pre-vendas','samsung_pre_vendas_backup'];let all=[];for(const key of candidates){try{const v=JSON.parse(localStorage.getItem(key)||'[]');if(Array.isArray(v))all=mergeHistory(all,v)}catch{}}if(all.length){localStorage.setItem(HISTORY_KEY,JSON.stringify(all));backupHistory(all)}return all}function todayISO()"
if old not in s:
    raise SystemExit('clone marker not found')
s = s.replace(old,new,1)

old = "function getHistory(){try{return JSON.parse(localStorage.getItem(HISTORY_KEY)||'[]')}catch{return[]}}function setHistory(x){localStorage.setItem(HISTORY_KEY,JSON.stringify(x))}"
new = "function getHistory(){try{const current=JSON.parse(localStorage.getItem(HISTORY_KEY)||'[]');if(Array.isArray(current)&&current.length)return current;return recoverLegacyHistory()}catch{return recoverLegacyHistory()}}function setHistory(x){const safe=Array.isArray(x)?x:[];localStorage.setItem(HISTORY_KEY,JSON.stringify(safe));backupHistory(safe)}"
if old not in s:
    raise SystemExit('history marker not found')
s = s.replace(old,new,1)

old = "async function upsertHistory(items){if(!items.length)return;await dbFetch('pre_vendas?on_conflict=id',{method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify(items.map(toDb))})}async function pullHistory(){const rows=await dbFetch('pre_vendas?select=*&order=updated_at.desc');setHistory((rows||[]).map(fromDb));renderHistory();renderDashboard()}"
new = "async function upsertHistory(items){if(!items.length)return;await dbFetch('pre_vendas?on_conflict=id',{method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify(items.map(toDb))})}async function pullHistory(){const local=getHistory();backupHistory(local);const rows=await dbFetch('pre_vendas?select=*&order=updated_at.desc');const remote=(rows||[]).map(fromDb);const merged=mergeHistory(local,remote);setHistory(merged);const remoteIds=new Set(remote.map(x=>x.id));const missing=merged.filter(x=>!remoteIds.has(x.id));if(missing.length)await upsertHistory(missing);renderHistory();renderDashboard()}"
if old not in s:
    raise SystemExit('pull marker not found')
s = s.replace(old,new,1)

old = "async function syncAll(showMessage=true){if(syncBusy)return;syncBusy=true;setOnlineState('busy','Sincronizando...');try{const localHistory=getHistory();if(localHistory.length)await upsertHistory(localHistory);"
new = "async function syncAll(showMessage=true){if(syncBusy)return;syncBusy=true;setOnlineState('busy','Sincronizando...');try{const localHistory=getHistory();backupHistory(localHistory);if(localHistory.length)await upsertHistory(localHistory);"
if old not in s:
    raise SystemExit('sync marker not found')
s = s.replace(old,new,1)

s = s.replace('PRE VENDA • v4.5.0','PRE VENDA • v4.5.1')
s = s.replace("navigator.serviceWorker.register('./service-worker.js?v=4.5.0')", "navigator.serviceWorker.register('./service-worker.js?v=4.5.1')")
p.write_text(s,encoding='utf-8')

sw=Path('service-worker.js')
w=sw.read_text(encoding='utf-8').replace("pre-venda-samsung-v4-5-0","pre-venda-samsung-v4-5-1")
sw.write_text(w,encoding='utf-8')
