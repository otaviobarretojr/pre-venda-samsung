(()=>{
'use strict';
function printSavedPreSale(record){
  if(!record)return false;
  try{
    // Reconstroi explicitamente o documento A4 da pré-venda salva.
    // Não reutiliza qualquer conteúdo visual/modal que esteja na tela.
    if(typeof window.renderDoc!=='function')throw new Error('renderDoc indisponível');
    window.renderDoc(record);
    const printArea=document.getElementById('printArea');
    if(!printArea)throw new Error('formulário de impressão indisponível');
    document.body.classList.add('professional-reprinting-form');
    setTimeout(()=>{
      try{window.print()}finally{setTimeout(()=>document.body.classList.remove('professional-reprinting-form'),250)}
    },80);
    return true;
  }catch(e){
    console.error('[reprint pre-sale form]',e);
    document.body.classList.remove('professional-reprinting-form');
    return false;
  }
}
function enhanceFinalize(overlay){
  if(!overlay||overlay.dataset.reprintEnhanced==='2')return;
  const button=overlay.querySelector('[data-action="print"]');
  if(!button)return;
  overlay.dataset.reprintEnhanced='2';
  button.textContent='Reimprimir pré-venda';
  button.setAttribute('aria-label','Reimprimir o formulário completo da pré-venda salva');
  overlay.addEventListener('click',event=>{
    const target=event.target.closest('[data-action="print"]');
    if(!target)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const numero=overlay.querySelector('h2')?.textContent?.trim()||'';
    const record=getHistory().find(item=>String(item.numero||'').trim()===numero);
    if(record){
      const ok=printSavedPreSale(record);
      if(!ok)return alert('Não consegui montar o formulário da pré-venda para reimpressão. Abra o Histórico e tente novamente.');
      try{window.persistOnlineAudit?.({id:crypto.randomUUID(),action:'Sistema: formulário de pré-venda reimpresso',detail:record.numero||record.cliente||'',recordId:record.id,at:new Date().toISOString(),deviceId:localStorage.getItem('preVendaDeviceIdV1')||'Dispositivo'})}catch{}
      return;
    }
    alert('A pré-venda foi salva, mas não consegui localizar o registro para reimpressão. Abra o Histórico e tente novamente.');
  },true);
}
const style=document.createElement('style');
style.id='professional-v642-reprint-style';
style.textContent='@media print{body.professional-reprinting-form #professionalFinalize{display:none!important}}';
document.head.appendChild(style);
const observer=new MutationObserver(mutations=>{
  for(const mutation of mutations){
    for(const node of mutation.addedNodes){
      if(!(node instanceof HTMLElement))continue;
      if(node.id==='professionalFinalize')enhanceFinalize(node);
      else enhanceFinalize(node.querySelector?.('#professionalFinalize'));
    }
  }
});
observer.observe(document.body,{childList:true,subtree:true});
enhanceFinalize(document.getElementById('professionalFinalize'));
window.reprintSavedPreSaleForm=printSavedPreSale;
})();
