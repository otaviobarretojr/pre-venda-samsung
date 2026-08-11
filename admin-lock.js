// PRE VENDA — bloqueio administrativo por PIN local
(function(){
  const PIN_KEY='preVendaAdminPinHash';
  const UNLOCK_KEY='preVendaAdminUnlockedUntil';
  const UNLOCK_MS=10*60*1000;

  async function sha256(text){
    const data=new TextEncoder().encode(text);
    const digest=await crypto.subtle.digest('SHA-256',data);
    return [...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,'0')).join('');
  }
  function isUnlocked(){return Number(sessionStorage.getItem(UNLOCK_KEY)||0)>Date.now();}
  function lock(){sessionStorage.removeItem(UNLOCK_KEY);refreshAdminButton();}
  async function setupPin(){
    const p1=prompt('Crie o PIN gerencial (4 a 8 números):');
    if(p1===null)return false;
    if(!/^\d{4,8}$/.test(p1)){alert('Use um PIN de 4 a 8 números.');return false;}
    const p2=prompt('Confirme o PIN gerencial:');
    if(p2!==p1){alert('Os PINs não conferem.');return false;}
    localStorage.setItem(PIN_KEY,await sha256(p1));
    sessionStorage.setItem(UNLOCK_KEY,String(Date.now()+UNLOCK_MS));
    alert('PIN gerencial criado. Administração liberada por 10 minutos.');
    refreshAdminButton();
    return true;
  }
  async function requestAdmin(action='esta ação'){
    if(isUnlocked())return true;
    const saved=localStorage.getItem(PIN_KEY);
    if(!saved)return setupPin();
    const pin=prompt(`PIN gerencial necessário para ${action}:`);
    if(pin===null)return false;
    if(await sha256(pin)!==saved){alert('PIN incorreto.');return false;}
    sessionStorage.setItem(UNLOCK_KEY,String(Date.now()+UNLOCK_MS));
    refreshAdminButton();
    return true;
  }
  async function changePin(){
    if(!(await requestAdmin('alterar o PIN')))return;
    const p1=prompt('Novo PIN gerencial (4 a 8 números):');
    if(p1===null)return;
    if(!/^\d{4,8}$/.test(p1)){alert('Use um PIN de 4 a 8 números.');return;}
    const p2=prompt('Confirme o novo PIN:');
    if(p2!==p1){alert('Os PINs não conferem.');return;}
    localStorage.setItem(PIN_KEY,await sha256(p1));
    sessionStorage.setItem(UNLOCK_KEY,String(Date.now()+UNLOCK_MS));
    alert('PIN alterado com sucesso.');
  }

  function refreshAdminButton(){
    const btn=document.getElementById('adminLockBtn');if(!btn)return;
    btn.textContent=isUnlocked()?'🔓 Administração':'🔒 Administração';
    btn.title=isUnlocked()?'Administração liberada temporariamente':'Desbloquear funções administrativas';
  }
  function addAdminButton(){
    const tabs=document.querySelector('.tabs');if(!tabs||document.getElementById('adminLockBtn'))return;
    const btn=document.createElement('button');btn.id='adminLockBtn';btn.className='btn-light';
    btn.addEventListener('click',async()=>{if(isUnlocked()){if(confirm('Bloquear a administração agora?'))lock();}else await requestAdmin('desbloquear a administração');});
    tabs.appendChild(btn);refreshAdminButton();
  }

  // Proteção em nível de clique/captura para botões com listeners já existentes.
  document.addEventListener('click',async function(e){
    const target=e.target.closest('button,label');if(!target)return;
    const tab=target.closest('[data-tab="settingsPanel"]');
    const protectedId=target.id;
    const needs = tab ? 'abrir Configurações' :
      protectedId==='limparHistoricoBtn' ? 'limpar o histórico' :
      protectedId==='backupBtn' ? 'baixar backup' :
      protectedId==='addConsultantBtn' ? 'alterar consultores' : null;
    if(needs && !isUnlocked()){
      e.preventDefault();e.stopImmediatePropagation();
      if(await requestAdmin(needs)){
        if(tab && typeof switchTab==='function') switchTab('settingsPanel');
        else if(protectedId==='backupBtn' && typeof downloadBackup==='function') downloadBackup();
        else if(protectedId==='addConsultantBtn' && typeof addConsultant==='function') addConsultant();
        else if(protectedId==='limparHistoricoBtn') target.click();
      }
    }
  },true);

  document.addEventListener('change',async function(e){
    if(e.target?.id==='restoreInput'&&!isUnlocked()){
      const input=e.target;e.preventDefault();e.stopImmediatePropagation();
      const file=input.files?.[0];input.value='';
      if(file && await requestAdmin('restaurar backup') && typeof restoreBackup==='function') restoreBackup(file);
    }
  },true);

  function wrap(name,label){
    const original=window[name];if(typeof original!=='function'||original.__adminWrapped)return;
    const wrapped=async function(...args){if(!(await requestAdmin(label)))return;return original.apply(this,args)};
    wrapped.__adminWrapped=true;window[name]=wrapped;
  }
  function wrapProtectedFunctions(){
    wrap('loadRecord','editar uma pré-venda');
    wrap('deleteRecord','excluir uma pré-venda');
    wrap('renameConsultant','editar consultores');
    wrap('toggleConsultant','alterar consultores');
    wrap('removeConsultant','excluir consultores');
    wrap('restoreBackup','restaurar backup');
  }

  function addPinControls(){
    const panel=document.getElementById('settingsPanel');if(!panel||document.getElementById('adminPinBox'))return;
    const grid=panel.querySelector('.settings-grid');if(!grid)return;
    const box=document.createElement('div');box.id='adminPinBox';box.className='settings-box';
    box.innerHTML='<h3>Segurança administrativa</h3><div class="muted-box">Configurações, edição, exclusão, consultores e backup exigem PIN gerencial. Após desbloquear, o acesso permanece liberado por 10 minutos neste navegador.</div><div class="backup-row" style="margin-top:12px"><button id="changeAdminPinBtn" class="btn-outline">Alterar PIN</button><button id="lockAdminNowBtn" class="btn-light">Bloquear agora</button></div>';
    grid.appendChild(box);
    box.querySelector('#changeAdminPinBtn').onclick=changePin;
    box.querySelector('#lockAdminNowBtn').onclick=()=>{lock();alert('Administração bloqueada.');};
  }

  function init(){addAdminButton();wrapProtectedFunctions();addPinControls();setInterval(refreshAdminButton,15000);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,0));else setTimeout(init,0);
  setTimeout(init,500);
})();