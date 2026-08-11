// PRE VENDA v4.3.3 — uso livre + bloqueio administrativo por PIN
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

  function removeUserAccessUi(){
    // Remove de vez a interface antiga de usuário/login.
    ['authCard','loginCard','userCard'].forEach(id=>document.getElementById(id)?.remove());
    ['loginBtn','logoutBtn','syncBtn'].forEach(id=>document.getElementById(id)?.remove());
    document.querySelector('.online-badge')?.remove();
    document.querySelectorAll('[id*="currentUser"],[id*="roleBadge"]').forEach(el=>el.remove());
    document.querySelectorAll('input[type="email"],input[type="password"]').forEach(input=>{
      const card=input.closest('.auth-card');
      if(card)card.remove();
    });
  }

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
    refreshAdminButton();
  }

  function refreshAdminButton(){
    const btn=document.getElementById('adminLockBtn');if(!btn)return;
    btn.textContent=isUnlocked()?'🔓 Administração':'🔒 Administração';
    btn.title=isUnlocked()?'Administração liberada temporariamente':'Desbloquear funções administrativas';
  }

  function addAdminButton(){
    const tabs=document.querySelector('.tabs');if(!tabs||document.getElementById('adminLockBtn'))return;
    const btn=document.createElement('button');
    btn.id='adminLockBtn';
    btn.className='btn-light';
    btn.type='button';
    btn.addEventListener('click',async()=>{
      if(isUnlocked()){
        if(confirm('Bloquear a administração agora?'))lock();
      }else{
        await requestAdmin('desbloquear a administração');
      }
    });
    tabs.appendChild(btn);
    refreshAdminButton();
  }

  document.addEventListener('click',async function(e){
    const target=e.target.closest('button,label');if(!target)return;
    const tab=target.closest('[data-tab="settingsPanel"]');
    const id=target.id;
    let action=null;
    if(tab) action='abrir Configurações';
    else if(id==='limparHistoricoBtn') action='limpar o histórico';
    else if(id==='backupBtn') action='baixar backup';
    else if(id==='addConsultantBtn') action='alterar consultores';

    if(action && !isUnlocked()){
      e.preventDefault();
      e.stopImmediatePropagation();
      if(await requestAdmin(action)){
        if(tab && typeof window.switchTab==='function') window.switchTab('settingsPanel');
        else if(id==='backupBtn' && typeof window.downloadBackup==='function') window.downloadBackup();
        else if(id==='addConsultantBtn' && typeof window.addConsultant==='function') window.addConsultant();
        else if(id==='limparHistoricoBtn') target.click();
      }
    }
  },true);

  document.addEventListener('change',async function(e){
    if(e.target?.id==='restoreInput'&&!isUnlocked()){
      const input=e.target;
      e.preventDefault();
      e.stopImmediatePropagation();
      const file=input.files?.[0];
      input.value='';
      if(file && await requestAdmin('restaurar backup') && typeof window.restoreBackup==='function') window.restoreBackup(file);
    }
  },true);

  function wrap(name,label){
    const original=window[name];
    if(typeof original!=='function'||original.__adminWrapped)return;
    const wrapped=async function(...args){
      if(!(await requestAdmin(label)))return;
      return original.apply(this,args);
    };
    wrapped.__adminWrapped=true;
    window[name]=wrapped;
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
    const panel=document.getElementById('settingsPanel');
    if(!panel||document.getElementById('adminPinBox'))return;
    const grid=panel.querySelector('.settings-grid');if(!grid)return;
    const box=document.createElement('div');
    box.id='adminPinBox';
    box.className='settings-box';
    box.innerHTML='<h3>Segurança administrativa</h3><div class="muted-box">O uso normal do sistema é livre. Configurações, edição, exclusão, consultores e backup exigem PIN gerencial. Após desbloquear, o acesso fica liberado por 10 minutos neste navegador.</div><div class="backup-row" style="margin-top:12px"><button id="changeAdminPinBtn" class="btn-outline" type="button">Alterar PIN</button><button id="lockAdminNowBtn" class="btn-light" type="button">Bloquear agora</button></div>';
    grid.appendChild(box);
    box.querySelector('#changeAdminPinBtn').onclick=changePin;
    box.querySelector('#lockAdminNowBtn').onclick=()=>{lock();alert('Administração bloqueada.');};
  }

  function ensureSettingsClosed(){
    const settings=document.getElementById('settingsPanel');
    if(settings?.classList.contains('active') && !isUnlocked() && typeof window.switchTab==='function'){
      window.switchTab('homePanel');
    }
  }

  function init(){
    removeUserAccessUi();
    addAdminButton();
    wrapProtectedFunctions();
    addPinControls();
    ensureSettingsClosed();
    refreshAdminButton();
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>setTimeout(init,0));
  else setTimeout(init,0);
  setTimeout(init,300);
  setTimeout(init,1200);
  setInterval(()=>{removeUserAccessUi();refreshAdminButton();wrapProtectedFunctions();},5000);
})();