public with sharing class TOMPlanToSupplier {
    public class SupplierWrapper {
        @AuraEnabled
        public Id supplierId;
        @AuraEnabled
        public String supplierName;
        @AuraEnabled
        public List<PlanCostWrapper> planCosts;
        @AuraEnabled
        public Boolean isChecked;
        
        public SupplierWrapper(Id supplierId, String supplierName, List<PlanCostWrapper> planCosts) {
            this.supplierId = supplierId;
            this.supplierName = supplierName;
            this.planCosts = planCosts;
            this.isChecked = false;
        }
    }
    
    public class PlanCostWrapper {
        @AuraEnabled
        public Id planCostId;
        @AuraEnabled
        public String planCostName;
        @AuraEnabled
        public Decimal capex;
        @AuraEnabled
        public Decimal opex;
        @AuraEnabled
        public Decimal nrc;
        
        public PlanCostWrapper(Id planCostId, String planCostName, Decimal capex, Decimal opex, Decimal nrc) {
            this.planCostId = planCostId;
            this.planCostName = planCostName;
            this.capex = capex;
            this.opex = opex;
            this.nrc = nrc;
        }
    }
    
    @AuraEnabled(cacheable=true)
    public static List<SupplierWrapper> getSuppliers(String qLineId) {
        List<SupplierWrapper> supplierListToShow = new List<SupplierWrapper>();
        try {
            Set<Id> supplierSet = new Set<Id>();
            ChikPeaTOM__Quote_Line__c quoteLine = [SELECT Id, Name, ChikPeaTOM__Service_Plan__c FROM ChikPeaTOM__Quote_Line__c WHERE Id = :qLineId];

            List<Plan_Cost__c> planCostList = [SELECT Id, Name, Cost_Book__c, Supplier__c, Plan__c FROM Plan_Cost__c WHERE Plan__c = :quoteLine.ChikPeaTOM__Service_Plan__c];

            for (Plan_Cost__c pc : planCostList) {
                supplierSet.add(pc.Supplier__c);
            }

            List<Supplier__c> suppliers = [SELECT Id, Name, (SELECT Id, Name, Capex__c, Opex__c, NRC__c FROM Plan_Costs__r) FROM Supplier__c WHERE Id IN :supplierSet];
            
            for (Supplier__c supplier : suppliers) {
                List<PlanCostWrapper> planCosts = new List<PlanCostWrapper>();
                for (Plan_Cost__c planCost : supplier.Plan_Costs__r) {
                    planCosts.add(new PlanCostWrapper(planCost.Id, planCost.Name, planCost.Capex__c, planCost.Opex__c, planCost.NRC__c));
                }
                supplierListToShow.add(new SupplierWrapper(supplier.Id, supplier.Name, planCosts));
            }
            
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
        return supplierListToShow;
    
    // @AuraEnabled(cacheable=true)
    // public static List<Supplier__c> getSuppliers(String qLineId){
    //     List<Supplier__c> supplierListToShow = new List<Supplier__c>();
    //     try {
    //         Set<Id> supplierSet = new Set<Id>();
    //         ChikPeaTOM__Quote_Line__c quoteLine = [Select Id , Name , ChikPeaTOM__Service_Plan__c FROM ChikPeaTOM__Quote_Line__c WHERE Id = :qLineId];

    //         List<Plan_Cost__c> planCostList = [Select Id , name , Cost_Book__c , Supplier__c , Plan__c   FROM Plan_Cost__c WHERE Plan__c = :quoteLine.ChikPeaTOM__Service_Plan__c ];

    //         for(Plan_Cost__c pc :planCostList ){
    //             supplierSet.add(pc.Supplier__c);
    //         }

    //          supplierListToShow = [Select Id , Name , (Select Id , Name , Capex__c , Opex__c , NRC__c FROM Plan_Costs__r) FROM Supplier__c WHERE Id IN :supplierSet ];
            
            
    //     } catch (Exception e) {
    //         throw new AuraHandledException(e.getMessage());
    //     }
    //     return supplierListToShow ;
        
    // }
}
}