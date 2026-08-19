(()=>{
'use strict';
const WATCHES=[
 {id:'pre-sale-galaxy-watch9-40mm-bt',name:'Galaxy Watch 9 40mm BT',capacities:['Não se aplica'],colors:['Creme','Preto'],category:'WEARABLE'},
 {id:'pre-sale-galaxy-watch9-40mm-lte',name:'Galaxy Watch 9 40mm LTE',capacities:['Não se aplica'],colors:['Creme','Preto'],category:'WEARABLE'},
 {id:'pre-sale-galaxy-watch9-44mm-bt',name:'Galaxy Watch 9 44mm BT',capacities:['Não se aplica'],colors:['Preto','Prata'],category:'WEARABLE'},
 {id:'pre-sale-galaxy-watch9-44mm-lte',name:'Galaxy Watch 9 44mm LTE',capacities:['Não se aplica'],colors:['Preto','Prata'],category:'WEARABLE'},
 {id:'pre-sale-galaxy-watch-ultra2-47mm-lte',name:'Galaxy Watch Ultra 2 47mm LTE',capacities:['Não se aplica'],colors:['Titânio Preto','Titânio Prata'],category:'WEARABLE'}
];
const clone=v=>JSON.parse(JSON.stringify(v));
const merge=base=>{const out=clone(Array.isArray(base)?base:[]);for(const item of WATCHES){const i=out.findIndex(p=>p.id===item.id||String(p.name||'').toLocaleLowerCase('pt-BR')===item.name.toLocaleLowerCase('pt-BR'));if(i<0)out.push(clone(item));else out[i]={...out[i],...clone(item)}}return out};
const baseGetter=typeof window.getPreSaleCatalog==='function'?window.getPreSaleCatalog.bind(window):(typeof window.getCatalog==='function'?window.getCatalog.bind(window):()=>[]);
const getOfficial=()=>merge(baseGetter());
window.getPreSaleCatalog=getOfficial;
window.getCatalog=getOfficial;
window.setCatalogLocal=()=>localStorage.setItem('samsung_product_catalog',JSON.stringify(getOfficial()));
window.saveCatalog=async()=>{const catalog=getOfficial();window.setCatalogLocal();if(typeof window.setRemoteSetting==='function')await window.setRemoteSetting('catalog',clone(catalog));return clone(catalog)};
const esc=s=>typeof window.escapeHtml==='function'?window.escapeHtml(s):String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function updateProductLabel(){const el=document.getElementById('produto');const label=el?.closest('.field')?.querySelector('label');if(label)label.textContent='Produto da pré-venda *'}
function standaloneProducts(selected=''){
 const el=document.getElementById('produto');if(!el)return;
 const list=getOfficial();
 el.innerHTML='<option value="">Selecione o produto</option>'+list.map(p=>`<option>${esc(p.name)}</option>`).join('');
 if(selected&&!list.some(p=>p.name===selected))el.insertAdjacentHTML('beforeend',`<option>${esc(selected)}</option>`);
 if(selected)el.value=selected;
 updateProductLabel();
 window.onProductChange?.();
 if(typeof window.models==='function')window.models();
}
window.populateProducts=standaloneProducts;
function normalizeWatchCapacity(){const el=document.getElementById('produto'),cap=document.getElementById('capacidade');if(!el||!cap)return;const p=getOfficial().find(x=>x.name===el.value);if(!p||p.category!=='WEARABLE')return;if(![...cap.options].some(o=>o.value==='Não se aplica'))cap.innerHTML='<option value="Não se aplica">Não se aplica</option>';cap.value='Não se aplica'}
document.getElementById('produto')?.addEventListener('change',()=>setTimeout(normalizeWatchCapacity,0));
try{window.setCatalogLocal()}catch(e){console.warn('[V7 watches] local catalog update pending',e)}
Promise.resolve().then(async()=>{try{await window.saveCatalog()}catch(e){console.warn('[V7 watches] remote catalog update pending',e)}finally{standaloneProducts(document.getElementById('produto')?.value||'');window.renderCatalog?.();window.dispatchEvent(new CustomEvent('samsung:pre-sale-watches-restored',{detail:{count:WATCHES.length,total:getOfficial().length}}))}});
window.V7_PRE_SALE_WATCHES=Object.freeze(clone(WATCHES));
console.info('[V7] standalone pre-sale catalog ready',getOfficial().length);
})();
