public without sharing class dcfController {
    @AuraEnabled(cacheable=true)
    public static List<DCF__c> getDcf(String dcfId) {
        List<DCF__c> dcfList = new List<DCF__c>();
        dcfList = [Select Id , Name , Location__c FROM DCF__c WHERE Opportunity__c = :dcfId LIMIT 1];
        return dcfList;
    }

    @AuraEnabled(cacheable=true)
    public static List<DCF__c> getDcfLines(String oppId){
       List<DCF__c> dcfRecords =new List<DCF__c>();
        //List<DCF_Line__c> dcfLineRecords =new List<DCF_Line__c>();

        try {
            dcfRecords = [Select id,name,(select id,name,Location__c,Requirement__c,Term__c,Availability__c from DCF_Lines__r) from DCF__c where Opportunity__c = :oppId];
           // dcfLineRecords = [Select Id,name,Location__c,Requirement__c,Term__c,Availability__c FROM DCF_Line__c where DCF__c = :oppId];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
        return dcfRecords;
    }
}