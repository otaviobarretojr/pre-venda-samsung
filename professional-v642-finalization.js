(()=>{
'use strict';
function enhanceFinalize(overlay){
  if(!overlay||overlay.dataset.reprintEnhanced==='1')return;
  const button=overlay.querySelector('[data-action="print"]');
  if(!button)return;
  overlay.dataset.reprintEnhanced='1';
  button.textContent='Reimprimir pré-venda';
  button.setAttribute('aria-label','Reimprimir a pré-venda salva');
  overlay.addEventListener('click',event=>{
    const target=event.target.closest('[data-action="print"]');
    if(!target)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const numero=overlay.querySelector('h2')?.textContent?.trim()||'';
    const record=getHistory().find(item=>String(item.numero||'').trim()===numero);
    if(record){
      printRecord(record.id);
      try{window.persistOnlineAudit?.({id:crypto.randomUUID(),action:'Sistema: pré-venda reimpressa',detail:record.numero||record.cliente||'',recordId:record.id,at:new Date().toISOString(),deviceId:localStorage.getItem('preVendaDeviceIdV1')||'Dispositivo'})}catch{}
      return;
    }
    alert('A pré-venda foi salva, mas não consegui localizar o registro para reimpressão. Abra o Histórico e tente novamente.');
  },true);
}
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
})();
