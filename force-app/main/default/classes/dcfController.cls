public without sharing class dcfController {
    @AuraEnabled(cacheable=true)
    public static List<DCF__c> getDcf(String dcfId) {
        List<DCF__c> dcfList = new List<DCF__c>();
        dcfList = [Select Id , Name , Location__c FROM DCF__c WHERE Opportunity__c = :dcfId];

        System.debug('dcfList'+dcfList);
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

    @AuraEnabled(cacheable=true)
    public static List<DCF_Line__c> getDcfLineRecords(String oppId){
        Set<Id> dcfId = new Set<Id>();

        List<DCF__c> dcfRecords = [Select Id , Name FROM DCF__c WHERE Opportunity__c = : oppId];
        System.debug('dcfRecord'+dcfRecords);
        
        for(DCF__c dcf : dcfRecords){
        dcfId.add(dcf.Id);
        }
        System.debug('dcfId Set'+dcfId);
        
        List<DCF_Line__c> dcfLineRecords = [Select Id , Name , Location__c,Requirement__c,Term__c,Availability__c,Premise__c,Premise__r.name,Premise__r.id,Plan__c,Plan__r.id,Plan__r.name ,DCF__c from DCF_Line__c WHERE DCF__c IN :dcfId];
        System.debug('dcfLineRecords'+dcfLineRecords);

        return dcfLineRecords;
    }

    @AuraEnabled
    public static string updatedDCFlines(Object dcfLine){
        try {
            List<DCF_Line__c> dcfListToUpdate = (List<DCF_Line__c>) JSON.deserialize(
                JSON.serialize(dcfLine) , List<DCF_Line__c>.class);

                if(!dcfListToUpdate.isEmpty()){
                    update dcfListToUpdate;
                    return 'Success';
                }
                return 'Failed';
            
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
        
    }


}