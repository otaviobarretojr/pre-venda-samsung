(()=>{
'use strict';
const KEY='preSaleDraftV630';
const IDS=['valor','data','cliente','cpf','telefone','produto','capacidade','cor','vendedor','preregistro','trocafone','wearable','wearableColor'];
const $id=id=>document.getElementById(id);
let cleanSignature='';
function editing(){try{return!!editingId}catch{return false}}
function snapshot(){const values={};for(const id of IDS)if($id(id))values[id]=$id(id).value||'';values.productSearch=$id('productQuickSearch')?.value||'';return{at:Date.now(),editing:editing(),values}}
function signature(s=snapshot()){return JSON.stringify(s?.values||{})}
function meaningful(s=snapshot()){const v=s?.values||{};return['valor','cliente','cpf','telefone','produto','capacidade','cor','vendedor','preregistro','trocafone','wearable','productSearch'].some(k=>String(v[k]||'').trim())}
function persist(){const s=snapshot();if(meaningful(s))sessionStorage.setItem(KEY,JSON.stringify(s));else sessionStorage.removeItem(KEY)}
function read(){try{const s=JSON.parse(sessionStorage.getItem(KEY)||'null');return s&&Date.now()-Number(s.at||0)<21600000?s:null}catch{return null}}
function selectValue(id,value){const el=$id(id);if(!el||!value)return;if(![...el.options||[]].some(o=>o.value===value)){const o=document.createElement('option');o.value=value;o.textContent=value;el.appendChild(o)}el.value=value}
function restore(s){const v=s?.values||{};if(!meaningful(s))return false;for(const id of ['valor','data','cliente','cpf','telefone'])if($id(id)&&v[id]!=null)$id(id).value=v[id];if(v.produto&&typeof populateProducts==='function'){populateProducts(v.produto);selectValue('produto',v.produto);if(typeof onProductChange==='function')onProductChange();selectValue('capacidade',v.capacidade);selectValue('cor',v.cor)}else if($id('productQuickSearch')&&v.productSearch)$id('productQuickSearch').value=v.productSearch;selectValue('vendedor',v.vendedor);selectValue('preregistro',v.preregistro);selectValue('trocafone',v.trocafone);if($id('wearable')){selectValue('wearable',v.wearable);$id('wearable').dispatchEvent(new Event('change'));selectValue('wearableColor',v.wearableColor)}return true}
function clear(){sessionStorage.removeItem(KEY)}
window.preSaleHasUnsavedDraft=()=>{const s=snapshot();return meaningful(s)&&signature(s)!==cleanSignature};
const form=$id('formPanel');if(form){form.addEventListener('input',e=>{if(e.isTrusted!==false)persist()},true);form.addEventListener('change',e=>{if(e.isTrusted!==false)persist()},true)}
window.addEventListener('beforeunload',persist);
const saved=read();if(saved&&!editing())setTimeout(()=>restore(saved),900);
const baseSave=window.saveCurrent;if(typeof baseSave==='function'){window.saveCurrent=async function(){const result=await baseSave.apply(this,arguments);if(result){clear();cleanSignature=signature(snapshot())}else persist();return result};const button=$id('salvarBtn');if(button)button.onclick=window.saveCurrent}
const baseClear=window.clearForm;if(typeof baseClear==='function')window.clearForm=function(){const result=baseClear.apply(this,arguments);clear();cleanSignature=signature(snapshot());return result};
const baseNew=window.startNewSale;if(typeof baseNew==='function')window.startNewSale=function(){clear();const result=baseNew.apply(this,arguments);cleanSignature=signature(snapshot());return result};
window.preSaleDraft={snapshot,persist,restore,clear,meaningful,signature};
const professional=document.createElement('script');professional.src='./professional-v640.js?v=6.4.0';document.body.appendChild(professional);
})();