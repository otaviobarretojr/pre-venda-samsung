(()=>{
'use strict';
let saving=false;
let justSaved=false;
let lastSaved=null;

const norm=v=>String(v??'').trim();
const digits=v=>norm(v).replace(/\D/g,'');
const lower=v=>norm(v).toLocaleLowerCase('pt-BR');

function editingRecordId(){
  try{return typeof editingId!=='undefined'&&editingId?String(editingId):''}catch{return''}
}
function currentDraft(){
  try{return typeof collect==='function'?collect():null}catch{return null}
}
function findCpfMatches(d){
  const cpf=digits(d?.cpf);
  if(!cpf)return [];
  const editId=editingRecordId();
  return (typeof getHistory==='function'?getHistory():[]).filter(x=>digits(x.cpf)===cpf&&String(x.id||'')!==editId);
}
function sameProduct(a,b){
  return lower(a?.produto)===lower(b?.produto)&&lower(a?.capacidade)===lower(b?.capacidade);
}
function fmt(d){
  const parts=[d?.cliente,d?.produto,d?.capacidade,d?.cor].filter(Boolean);
  return parts.join(' • ');
}
function formSaveButtons(){
  const primary=document.getElementById('salvarBtn');
  if(primary)return[primary];
  const scope=document.getElementById('formPanel')||document;
  return [...scope.querySelectorAll('button')].filter(b=>/^\s*salvar/i.test(b.textContent||''));
}
function setSaveButtonBusy(on){
  formSaveButtons().forEach(b=>{
    if(on){b.dataset.prevDisabled=b.disabled?'1':'0';b.disabled=true;b.setAttribute('aria-busy','true');b.textContent='Salvando...'}
    else{if(b.dataset.prevDisabled!=='1')b.disabled=false;b.removeAttribute('aria-busy');delete b.dataset.prevDisabled;b.textContent='Salvar e imprimir'}
  });
}
function labelSaveButton(){formSaveButtons().forEach(b=>b.textContent='Salvar e imprimir')}
function resetSaveState(){
  saving=false;
  justSaved=false;
  lastSaved=null;
  setSaveButtonBusy(false);
  labelSaveButton();
}
function markChanged(e){
  if(!justSaved)return;
  if(e?.isTrusted===false)return;
  justSaved=false;
}
document.addEventListener('input',markChanged,true);
document.addEventListener('change',markChanged,true);

function printSaved(result){
  try{
    if(typeof renderDoc==='function')renderDoc(result);
    window.print();
  }catch(err){
    console.error('Falha ao abrir impressão',err);
    alert('A pré-venda foi salva, mas não foi possível abrir a tela de impressão. Você pode imprimir novamente pelo Histórico.');
  }
}

const base=window.saveCurrent;
if(typeof base!=='function')return;
window.afterLocalPreSaleSave=function(result){
  if(!saving||!result)return;
  lastSaved=result;
  justSaved=true;
  printSaved(result);
};
window.saveCurrent=async function(){
  if(saving){
    alert('Esta pré-venda já está sendo salva. Aguarde a conclusão.');
    return null;
  }
  if(justSaved){
    alert('Esta pré-venda já foi salva. Nenhum novo registro foi criado. Para imprimir novamente, utilize o Histórico.');
    return lastSaved;
  }

  const draft=currentDraft();
  const isEdit=!!editingRecordId();
  if(draft&&!isEdit){
    const matches=findCpfMatches(draft);
    const duplicate=matches.find(x=>sameProduct(x,draft));
    if(duplicate){
      alert(`Esta pré-venda já está salva e não será cadastrada novamente.\n\n${fmt(duplicate)}`);
      return null;
    }
    if(matches.length){
      const existing=matches[0];
      const ok=confirm(`Já existe uma pré-venda salva com este CPF.\n\n${fmt(existing)}\n\nDeseja continuar e salvar uma nova pré-venda para este cliente?`);
      if(!ok)return null;
    }
  }

  saving=true;
  setSaveButtonBusy(true);
  try{
    const result=await base.apply(this,arguments);
    if(result&&!justSaved){
      lastSaved=result;
      justSaved=true;
      printSaved(result);
    }
    return result;
  }finally{
    saving=false;
    setSaveButtonBusy(false);
  }
};

const saveButton=document.getElementById('salvarBtn');
if(saveButton)saveButton.onclick=window.saveCurrent;
const newButton=document.getElementById('novoBtn');
if(newButton)newButton.addEventListener('click',resetSaveState,true);
const baseStartNewSale=window.startNewSale;
if(typeof baseStartNewSale==='function')window.startNewSale=function(){resetSaveState();return baseStartNewSale.apply(this,arguments)};
labelSaveButton();
setTimeout(labelSaveButton,300);
const f=document.querySelector('.footer-note');if(f)f.textContent='PRE VENDA • v5.2.2 ONLINE';
})();
