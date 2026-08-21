(()=>{
'use strict';
const VERSION='8.5.3';
function makeBudgetImportHookable(){
 const current=window.V71BudgetImport;
 if(!current)return false;
 if(Object.isFrozen(current)||Object.isSealed(current)||!Object.getOwnPropertyDescriptor(current,'importRows')?.writable){
   window.V71BudgetImport={...current};
 }
 return true;
}
makeBudgetImportHookable();
window.V853Compat={version:VERSION,makeBudgetImportHookable};
})();
