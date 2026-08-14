(()=>{
'use strict';
function moveHistoryDelete(){
  const btn=document.getElementById('limparHistoricoBtn');
  const settings=document.getElementById('settingsPanel');
  if(!btn||!settings||document.getElementById('dangerZoneHistory')) return;

  const boxes=settings.querySelectorAll('.settings-box');
  const host=boxes.length?boxes[boxes.length-1]:settings.querySelector('.card')||settings;
  const zone=document.createElement('div');
  zone.id='dangerZoneHistory';
  zone.className='danger-zone';
  zone.innerHTML='<div class="danger-zone-title">Zona de risco</div><div class="danger-zone-text"><strong>Excluir todo o histórico</strong><span>Remove os registros de pré-venda. Use somente quando houver necessidade administrativa.</span></div>';
  host.appendChild(zone);
  btn.textContent='Excluir todo o histórico';
  btn.title='Ação administrativa protegida';
  btn.classList.add('danger-zone-btn');
  zone.appendChild(btn);
}

const style=document.createElement('style');
style.textContent=`
#historyPanel #limparHistoricoBtn{display:none!important}
.danger-zone{margin-top:22px;padding:16px;border:1px solid #fecdca;border-radius:14px;background:#fff7f6}
.danger-zone-title{font-size:11px;font-weight:900;letter-spacing:.7px;text-transform:uppercase;color:#b42318;margin-bottom:10px}
.danger-zone-text{display:flex;flex-direction:column;gap:4px;margin-bottom:12px}
.danger-zone-text strong{font-size:14px;color:#912018}
.danger-zone-text span{font-size:12px;line-height:1.45;color:#667085}
.danger-zone-btn{display:inline-flex!important;background:#fee4e2!important;color:#912018!important;border:1px solid #fecdca!important}
`;
document.head.appendChild(style);

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',moveHistoryDelete);
else moveHistoryDelete();
setTimeout(moveHistoryDelete,500);
})();