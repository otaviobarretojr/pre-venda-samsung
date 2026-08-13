(()=>{
  const byId=id=>document.getElementById(id);
  const isWearable=p=>/galaxy\s*(watch|buds|ring|fit)|\bwatch\d|\bbuds\b|\bring\b|\bfit\b/i.test(String(p?.name||''));
  const unique=a=>[...new Set((a||[]).filter(Boolean))];

  function ensureFields(){
    if(byId('ecosystemProduct')) return;
    const colorField=byId('cor')?.closest('.field');
    if(!colorField) return;
    const title=document.createElement('div');
    title.className='eco-title';
    title.innerHTML='Ecossistema<small>Opcional — deixe em branco caso o cliente não leve um Galaxy Wearable.</small>';
    const model=document.createElement('div');
    model.className='field';
    model.innerHTML='<label for="ecosystemProduct">Galaxy Wearable</label><select id="ecosystemProduct"><option value="">Nenhum wearable</option></select>';
    const color=document.createElement('div');
    color.className='field';
    color.innerHTML='<label for="ecosystemColor">Cor</label><select id="ecosystemColor" disabled><option value="">Selecione o wearable primeiro</option></select>';
    colorField.after(title,model,color);
    byId('ecosystemProduct').addEventListener('change',()=>populateColors());
    populateProducts();
  }

  function populateProducts(selected=''){
    const el=byId('ecosystemProduct'); if(!el) return;
    const items=getCatalog().filter(isWearable).sort((a,b)=>String(a.name).localeCompare(String(b.name),'pt-BR'));
    el.innerHTML='<option value="">Nenhum wearable</option>'+items.map(p=>`<option>${escapeHtml(p.name)}</option>`).join('');
    if(selected&&items.some(p=>p.name===selected)) el.value=selected;
    populateColors();
  }

  function populateColors(selected=''){
    const model=byId('ecosystemProduct'), color=byId('ecosystemColor'); if(!model||!color) return;
    const p=getCatalog().find(x=>x.name===model.value);
    if(!p){color.disabled=true;color.innerHTML='<option value="">Selecione o wearable primeiro</option>';return}
    let colors=unique(p.colors||[]);
    if(!colors.length){
      const m=String(p.name).match(/\b(Creme|Preto|Preta|Prata|Prateado|Branco|Branca|Azul|Verde|Rosa|Dourado|Grafite|Cinza|Vermelho|Vermelha)\b/i);
      if(m) colors=[m[1]];
    }
    color.disabled=false;
    color.innerHTML='<option value="">Selecione</option>'+colors.map(c=>`<option>${escapeHtml(c)}</option>`).join('');
    if(selected&&colors.includes(selected)) color.value=selected; else if(colors.length===1) color.value=colors[0];
  }

  const originalCollect=window.collect;
  window.collect=function(){
    const d=originalCollect();
    d.ecossistema=byId('ecosystemProduct')?.value||'';
    d.ecossistemaCor=byId('ecosystemColor')?.value||'';
    if(d.ecossistema){
      const marker=`[ECOSSISTEMA] ${d.ecossistema}${d.ecossistemaCor?' | Cor: '+d.ecossistemaCor:''}`;
      d.obsInterna=[String(d.obsInterna||'').replace(/\n?\[ECOSSISTEMA\].*$/m,'').trim(),marker].filter(Boolean).join('\n');
    } else d.obsInterna=String(d.obsInterna||'').replace(/\n?\[ECOSSISTEMA\].*$/m,'').trim();
    return d;
  };

  const originalLoad=window.loadRecord;
  window.loadRecord=async function(id){
    await originalLoad(id);
    const d=getHistory().find(x=>x.id===id);
    const txt=String(d?.obsInterna||'');
    const m=txt.match(/\[ECOSSISTEMA\]\s*([^\n|]+?)(?:\s*\|\s*Cor:\s*([^\n]+))?$/m);
    populateProducts(m?m[1].trim():'');
    populateColors(m&&m[2]?m[2].trim():'');
  };

  const originalClear=window.clearForm;
  window.clearForm=function(){originalClear();if(byId('ecosystemProduct')){byId('ecosystemProduct').value='';populateColors()}};

  const originalRenderDoc=window.renderDoc;
  window.renderDoc=function(d){
    originalRenderDoc(d);
    const txt=String(d.obsInterna||'');
    const m=txt.match(/\[ECOSSISTEMA\]\s*([^\n|]+?)(?:\s*\|\s*Cor:\s*([^\n]+))?$/m);
    let row=byId('docEcoRow');
    if(!row){const grid=byId('docProduto')?.closest('.pv-grid');if(grid){row=document.createElement('div');row.id='docEcoRow';row.className='pv-row full';row.innerHTML='<div class="pv-label">Ecossistema</div><div class="pv-value" id="docEcossistema">—</div>';grid.appendChild(row)}}
    if(row){row.style.display=m?'':'none';if(m)byId('docEcossistema').textContent=m[2]?`${m[1].trim()} • ${m[2].trim()}`:m[1].trim()}
  };

  const originalSetCatalog=window.setCatalogLocal;
  window.setCatalogLocal=function(x){originalSetCatalog(x);setTimeout(()=>populateProducts(byId('ecosystemProduct')?.value||''),0)};

  const style=document.createElement('style');
  style.textContent='.eco-title{grid-column:1/-1;margin-top:4px;padding-top:20px;border-top:1px solid #e4e7ec;font-size:13px;font-weight:900;letter-spacing:.65px;text-transform:uppercase;color:#1428A0}.eco-title small{display:block;margin-top:4px;font-size:11px;font-weight:500;letter-spacing:0;text-transform:none;color:#667085}';
  document.head.appendChild(style);
  ensureFields();
  populateProducts();
  const footer=document.querySelector('.footer-note');if(footer)footer.textContent='PRE VENDA • v4.5.4';
})();
