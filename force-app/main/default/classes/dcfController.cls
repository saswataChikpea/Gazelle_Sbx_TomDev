public with sharing class dcfController {
    @AuraEnabled(cacheable=true)
    public static DCF__c getDcf(String dcfId) {
        List<DCF__c> dcfList = new List<DCF__c>();
        dcfList = [Select Id , Name FROM DCF__c WHERE Opportunity__c = :dcfId LIMIT 1];
        return dcfList[0];

    }
}