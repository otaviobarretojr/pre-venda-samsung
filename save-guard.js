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
function setSaveButtonBusy(on){
  const candidates=[...document.querySelectorAll('button')].filter(b=>/salvar/i.test(b.textContent||''));
  candidates.forEach(b=>{
    if(on){b.dataset.prevDisabled=b.disabled?'1':'0';b.disabled=true;b.setAttribute('aria-busy','true')}
    else{if(b.dataset.prevDisabled!=='1')b.disabled=false;b.removeAttribute('aria-busy');delete b.dataset.prevDisabled}
  });
}
function markChanged(e){
  if(!justSaved)return;
  if(e?.isTrusted===false)return;
  justSaved=false;
}
document.addEventListener('input',markChanged,true);
document.addEventListener('change',markChanged,true);

const base=window.saveCurrent;
if(typeof base!=='function')return;
window.saveCurrent=async function(){
  if(saving){
    alert('Esta pré-venda já está sendo salva. Aguarde a conclusão.');
    return null;
  }
  if(justSaved){
    alert('Esta pré-venda já foi salva. Nenhum novo registro foi criado. Para cadastrar outra, altere os dados do formulário.');
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
    if(result){
      lastSaved=result;
      justSaved=true;
    }
    return result;
  }finally{
    saving=false;
    setSaveButtonBusy(false);
  }
};

const f=document.querySelector('.footer-note');if(f)f.textContent='PRE VENDA • v5.1.12 ONLINE';
})();