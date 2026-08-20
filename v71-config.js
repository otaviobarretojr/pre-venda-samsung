(()=>{
'use strict';
const config=Object.freeze({
 version:'7.1.0-infra.1',
 stableBase:'7.0.2',
 data:{
  preSale:{table:'pre_vendas',localKey:'samsung_pre_vendas'},
  budgets:{table:'budgets',localKey:'samsung_budget_history_v71'},
  budgetCatalog:{table:'budget_catalog',localKey:'samsung_budget_catalog_v71'},
  ecosystem:{table:'ecosystem_catalog',localKey:'samsung_ecosystem_catalog_v71'},
  consultants:{setting:'consultants',localKey:'samsung_consultants'}
 },
 release:{manifest:'version.json',health:'health.json'}
});
window.PRE_SALE_V71=config;
window.dispatchEvent(new CustomEvent('pre-sale:v71-config',{detail:config}));
})();
