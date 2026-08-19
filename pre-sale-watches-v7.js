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
const merge=base=>{
 const out=clone(Array.isArray(base)?base:[]);
 for(const item of WATCHES){
  const i=out.findIndex(p=>p.id===item.id||String(p.name||'').toLocaleLowerCase('pt-BR')===item.name.toLocaleLowerCase('pt-BR'));
  if(i<0)out.push(clone(item)); else out[i]={...out[i],...clone(item)};
 }
 return out;
};
const baseGetter=typeof window.getPreSaleCatalog==='function'?window.getPreSaleCatalog.bind(window):(typeof window.getCatalog==='function'?window.getCatalog.bind(window):()=>[]);
const getOfficial=()=>merge(baseGetter());
window.getPreSaleCatalog=getOfficial;
window.getCatalog=getOfficial;
window.setCatalogLocal=()=>localStorage.setItem('samsung_product_catalog',JSON.stringify(getOfficial()));
window.saveCatalog=async()=>{
 const catalog=getOfficial();
 window.setCatalogLocal();
 if(typeof window.setRemoteSetting==='function')await window.setRemoteSetting('catalog',clone(catalog));
 return clone(catalog);
};
try{window.setCatalogLocal();}catch(e){console.warn('[V7 watches] local catalog update pending',e)}
Promise.resolve().then(async()=>{try{await window.saveCatalog();}catch(e){console.warn('[V7 watches] remote catalog update pending',e)}finally{window.populateProducts?.();window.renderCatalog?.();window.dispatchEvent(new CustomEvent('samsung:pre-sale-watches-restored',{detail:{count:WATCHES.length}}));}});
window.V7_PRE_SALE_WATCHES=Object.freeze(clone(WATCHES));
console.info('[V7] standalone pre-sale watches restored',WATCHES.length);
})();
