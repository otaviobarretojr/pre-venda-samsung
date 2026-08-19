(()=>{
'use strict';
const VERSION='6.5.8';
const money=value=>typeof value==='number'?value.toLocaleString('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0}):'—';
const sections=[
 {id:'smartphone',title:'Bundle com Smartphone',subtitle:'Modelos válidos para qualquer cor.',columns:['S26 Ultra','Z Fold 7','S26+ / S26','S25 Edge','Z Flip 7','FE Family','A57','A37','A17 (5G/LTE)'],rows:[
  ['Watch Ultra 2025',1499,1499,null,null,null,null,null,null,null],
  ['Watch Ultra 2024',999,999,null,null,null,null,null,null,null,'focus'],
  ['Watch8 Classic',1499,1499,null,null,null,null,null,null,null],
  ['Watch8 LTE',899,899,899,899,899,899,null,null,null],
  ['Watch8 BT',699,699,699,699,699,699,null,null,null],
  ['Buds4 Pro',null,699,null,null,699,699,null,null,null],
  ['Buds4',null,599,null,null,599,599,599,599,null],
  ['Ring',399,399,null,399,399,399,null,null,null],
  ['Buds 3 Pro',null,null,null,null,null,null,null,null,null],
  ['Buds 3',null,null,null,null,null,null,null,null,null],
  ['Buds3 FE',null,null,null,null,null,399,399,399,null],
  ['Buds Core',null,null,null,null,null,null,99,99,99],
  ['Fit3',null,null,null,null,null,null,129,129,null]
 ]},
 {id:'watch',title:'Bundle com Watch',subtitle:'Combinações apresentadas na planilha.',columns:['Watch Ultra','Watch8 Classic','Watch8 40/44 LTE/BT','Buds4 Pro'],rows:[
  ['Watch8 44 LTE',null,null,null,null],['Buds Core',null,null,null,null],['Fit3',null,null,null,null]
 ]},
 {id:'charger',title:'Bundle com Carregador',subtitle:'Ação acumulativa.',columns:['S26 Ultra'],rows:[
  ['Carregador 60W',99],['Carregador 45W',null]
 ]},
 {id:'tablet',title:'Bundle com Tablet',subtitle:'Consulte o tablet na coluna e o item de ecossistema na linha.',columns:['S11 Ultra','S11','A11 / A11+ Wi‑Fi/5G','S10 Lite Wi‑Fi/5G','S10 FE / S10 FE+ Wi‑Fi/5G'],rows:[
  ['Watch Ultra 2025',1999,null,null,null,null],
  ['Watch Ultra 2024',1599,null,null,null,null,'focus'],
  ['Watch8 LTE',1199,1199,null,null,1199],
  ['Watch8 BT',999,999,null,null,999],
  ['Buds4 Pro',999,999,null,null,999],
  ['Buds4',null,null,null,599,null],
  ['Buds Core',null,null,99,99,null]
 ]}
];
function table(section){
 const rows=section.rows.map(raw=>{const values=raw.slice(1,section.columns.length+1),focus=raw[section.columns.length+1]==='focus';return`<tr class="${focus?'eco-focus':''}"><th>${raw[0]}${focus?'<span>Produto foco • limpa estoque</span>':''}</th>${values.map(value=>`<td class="${typeof value==='number'?'available':'unavailable'}">${money(value)}</td>`).join('')}</tr>`}).join('');
 return`<article class="eco-offer-card" id="eco-${section.id}"><header><div><small>AÇÕES SAMSUNG</small><h3>${section.title}</h3><p>${section.subtitle}</p></div></header><div class="eco-table-wrap"><table><thead><tr><th>Produto da oferta</th>${section.columns.map(column=>`<th>${column}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table></div><div class="eco-legend"><span><i class="ok"></i>Preço da oferta</span><span><i></i>Combinação indisponível</span></div></article>`;
}
function build(){
 if(document.getElementById('ecosystemOffersPanel'))return;
 const content=document.querySelector('.content');if(!content)return;
 const panel=document.createElement('section');panel.id='ecosystemOffersPanel';panel.className='panel screen-only eco-offers-panel';
 panel.innerHTML=`<div class="eco-hero"><div><small>CONSULTA DE OFERTAS</small><h2>Ecossistema Samsung</h2><p>Condições comerciais organizadas conforme a planilha PREÇO BRAND.</p></div><div class="eco-source"><span>Atualizado em</span><strong>10/08/2026</strong><small>Período informado: 20/07/2026 a 02/08/2026</small></div></div><div class="eco-alert"><strong>Atenção</strong><span>As ofertas são válidas individualmente e não podem ser combinadas. Não é permitido aplicar desconto nas ações abaixo.</span></div><nav class="eco-shortcuts">${sections.map(section=>`<a href="#eco-${section.id}">${section.title.replace('Bundle com ','')}</a>`).join('')}<a href="#eco-stock">Limpa estoque</a></nav><div class="eco-offers-list">${sections.map(table).join('')}<article class="eco-offer-card eco-stock" id="eco-stock"><header><div><small>AÇÕES INFO STORE</small><h3>Limpa Estoque — Fora de Linha / Linha S / Linha Z</h3></div></header><div class="eco-stock-rule"><b>Brinde de capa</b><p>Na venda de qualquer smartphone, incluir 1 capa fora de linha como brinde, com o objetivo de reduzir o estoque desses itens.</p></div></article></div><div class="eco-readonly">Tela independente e somente para visualização. Nenhum dado exibido aqui altera as bases de Pré-venda, Ecossistema da declaração ou Orçamentos.</div>`;
 content.appendChild(panel);
 document.querySelectorAll('.eco-shortcuts a').forEach(link=>link.onclick=event=>{event.preventDefault();document.querySelector(link.getAttribute('href'))?.scrollIntoView({behavior:'smooth',block:'start'})});
}
const style=document.createElement('style');style.id='ecosystem-offers-v657-style';style.textContent=`
.eco-offers-panel{display:none}.eco-offers-panel.active{display:block}.eco-hero{display:flex;justify-content:space-between;gap:20px;align-items:center;padding:24px;margin-bottom:14px;border-radius:16px;color:#fff;background:linear-gradient(125deg,#1428a0,#07164f);box-shadow:0 8px 26px rgba(20,40,160,.16)}.eco-hero small{font-size:9px;font-weight:900;letter-spacing:1.4px;color:#bec8ff}.eco-hero h2{margin:5px 0;font-size:25px}.eco-hero p{margin:0;color:#d8deff;font-size:12px}.eco-source{min-width:240px;padding:13px 15px;border:1px solid rgba(255,255,255,.2);border-radius:12px;background:rgba(255,255,255,.09)}.eco-source span,.eco-source strong,.eco-source small{display:block}.eco-source span{font-size:9px;color:#bec8ff;text-transform:uppercase;font-weight:800}.eco-source strong{font-size:17px;margin:4px 0}.eco-source small{font-size:10px;color:#d8deff}.eco-alert{display:flex;gap:13px;align-items:flex-start;padding:14px 16px;margin-bottom:12px;border:1px solid #fedf89;border-radius:12px;background:#fffaeb;color:#93370d}.eco-alert strong{flex:0 0 auto}.eco-alert span{font-size:12px;line-height:1.45}.eco-shortcuts{display:flex;gap:7px;overflow:auto;padding:2px 0 12px}.eco-shortcuts a{white-space:nowrap;padding:8px 11px;border:1px solid #d7deea;border-radius:999px;background:#fff;color:#1428a0;text-decoration:none;font-size:10px;font-weight:800}.eco-offers-list{display:grid;gap:14px}.eco-offer-card{scroll-margin-top:85px;padding:20px;border:1px solid #e2e7f0;border-radius:16px;background:#fff;box-shadow:0 5px 20px rgba(29,45,91,.05)}.eco-offer-card header small{font-size:9px;letter-spacing:1.2px;font-weight:900;color:#1428a0}.eco-offer-card h3{margin:4px 0;font-size:18px}.eco-offer-card header p{margin:0 0 13px;color:#667085;font-size:11px}.eco-table-wrap{overflow:auto;border:1px solid #e4e7ec;border-radius:12px}.eco-table-wrap table{min-width:max(720px,100%)}.eco-table-wrap th,.eco-table-wrap td{padding:11px 10px;text-align:center;font-size:11px;white-space:nowrap}.eco-table-wrap thead th{position:sticky;top:0;background:#eef2ff;color:#1428a0;font-size:10px}.eco-table-wrap thead th:first-child,.eco-table-wrap tbody th{position:sticky;left:0;z-index:2;text-align:left}.eco-table-wrap thead th:first-child{z-index:3}.eco-table-wrap tbody th{min-width:170px;background:#fff;color:#172033}.eco-table-wrap tbody th span{display:block;margin-top:3px;color:#b54708;font-size:8px;text-transform:uppercase}.eco-table-wrap td.available{background:#f0fdf4;color:#067647;font-weight:900}.eco-table-wrap td.unavailable{color:#98a2b3}.eco-table-wrap tr.eco-focus th{box-shadow:inset 3px 0 #f79009;background:#fffaeb}.eco-legend{display:flex;gap:15px;margin-top:10px;color:#667085;font-size:9px}.eco-legend span{display:flex;align-items:center;gap:5px}.eco-legend i{width:8px;height:8px;border-radius:50%;background:#d0d5dd}.eco-legend i.ok{background:#12b76a}.eco-stock-rule{margin-top:13px;padding:16px;border-radius:12px;background:#eff4ff;color:#1428a0}.eco-stock-rule b{font-size:14px}.eco-stock-rule p{margin:5px 0 0;color:#344054;font-size:12px;line-height:1.5}.eco-readonly{padding:13px;text-align:center;color:#667085;font-size:10px}
@media(max-width:700px){.eco-hero{align-items:flex-start;flex-direction:column;padding:18px}.eco-source{min-width:0;width:100%}.eco-alert{display:block}.eco-alert strong{display:block;margin-bottom:4px}.eco-offer-card{padding:13px}.eco-table-wrap th,.eco-table-wrap td{padding:10px 8px}.eco-table-wrap tbody th{min-width:145px}.eco-offers-panel{margin-top:0}}
`;document.head.appendChild(style);build();window.ECOSYSTEM_OFFERS={version:VERSION,sections};
})();
