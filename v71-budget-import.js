(()=>{
'use strict';
const norm=v=>String(v??'').trim();
const num=v=>Number(String(v??'').replace(/\./g,'').replace(',','.').replace(/[^\d.-]/g,''))||0;
function rowsToCatalog(rows){const map=new Map();for(const row of rows||[]){const name=norm(row.PRODUTO||row.Produto||row.produto||row.MODELO||row.Modelo||row.modelo);if(!name)continue;const capacity=norm(row.MEMORIA||row.Memoria||row.memoria||row.CAPACIDADE||row.Capacidade||row.capacidade)||'_default';const color=norm(row.COR||row.Cor||row.cor);const price=num(row['VALOR A PRAZO']||row['Valor a prazo']||row.PRECO||row.Preco||row.preco||row.VALOR||row.Valor);const key=name.toLocaleLowerCase('pt-BR');if(!map.has(key))map.set(key,{id:'budget-'+key.replace(/[^a-z0-9]+/gi,'-').replace(/^-|-$/g,''),name,capacities:[],colors:[],final_prices:{},price_history:{},source:'budget-import-v71',updated_at:new Date().toISOString()});const p=map.get(key);if(capacity!=='_default'&&!p.capacities.includes(capacity))p.capacities.push(capacity);if(color&&!p.colors.includes(color))p.colors.push(color);if(price>0)p.final_prices[capacity]=price}return[...map.values()]}
async function persist(catalog){if(!window.V71Data)throw Error('Infraestrutura V7.1 ainda não carregada.');await window.V71Data.budgetCatalog.upsert(catalog);localStorage.setItem('samsung_budget_catalog_v71',JSON.stringify(catalog));window.dispatchEvent(new CustomEvent('budget:catalog-updated',{detail:{count:catalog.length}}));return catalog}
window.V71BudgetImport=Object.freeze({rowsToCatalog,persist,async importRows(rows){const catalog=rowsToCatalog(rows);if(!catalog.length)throw Error('Nenhum produto válido encontrado na planilha.');return persist(catalog)}});
// Regra de segurança: este módulo nunca chama saveCatalog/getCatalog da Pré-venda.
})();
