public with sharing class LWCCustomLookupController {
    public LWCCustomLookupController() {

    }

    @AuraEnabled(cacheable=true)
    public static List<SObJectResult> getResults(String ObjectName, String fieldName, String value, Boolean hidecreatenew) {
        List<SObJectResult> sObjectResultList = new List<SObJectResult>();
        system.debug(fieldName+'-------------'+ObjectName+'---++----------'+value);
        if(String.isNotEmpty(value))
            for(sObject so : Database.Query('Select Id,'+fieldName+' FROM '+ObjectName+' WHERE '+fieldName+' LIKE \'%' + value + '%\' LIMIT 200 ')) {
                String fieldvalue = (String)so.get(fieldName);
                sObjectResultList.add(new SObjectResult(fieldvalue, so.Id));
            }
            if(hidecreatenew == false)
                sObjectResultList.add(new SObjectResult('Create New', null));
        
        return sObjectResultList;
    }

    @AuraEnabled(cacheable=true)
    public static List<premiseResult> getResultsForPremise(String ObjectName, String fieldName, String value, Boolean hidecreatenew) {
        List<premiseResult> premiseList = new List<premiseResult>();
        system.debug(fieldName+'-------------'+ObjectName+'---++----------'+value);
        if(String.isNotEmpty(value))
            for(sObject so : Database.Query('Select Id, ChikPeaTOM__City__c, ChikPeaTOM__Street_Addess__c, ChikPeaTOM__State__c, ChikPeaTOM__Postal_Code__c, '+fieldName+' FROM '+ObjectName+' WHERE '+fieldName+' LIKE \'%' + value + '%\' LIMIT 200 ')) {
                String fieldvalue = (String)so.get(fieldName);
                ChikPeaTOM__Premise__c so1 = (ChikPeaTOM__Premise__c)so;
                String address = (String)so1.ChikPeaTOM__Street_Addess__c;
                // String city = (String)so1.ChikPeaTOM__City__c;
                String city = 'Hello world';
                String state = (String)so1.ChikPeaTOM__State__c;
                String postal = (String)so1.ChikPeaTOM__Postal_Code__c;
                premiseList.add(new premiseResult(fieldvalue, address, city, state, postal, so.Id));
            }
            if(hidecreatenew == false)
                premiseList.add(new premiseResult('Create New', null, null, null, null, null));
            
        return premiseList;
    }

    @AuraEnabled(cacheable=true)
    public static List<SObJectResult> getResultsForSerial(String ObjectName, String fieldName, String value) {
        List<SObJectResult> sObjectResultList = new List<SObJectResult>();
        system.debug(fieldName+'-------------'+ObjectName+'---++----------'+value);
        String own = 'Shared';
        if(String.isNotEmpty(value))
            for(sObject so : Database.Query('Select Id,'+fieldName+' FROM '+ObjectName+' WHERE '+fieldName+' LIKE \'%' + value + '%\' AND ChikPeaTOM__Equipment__c<>null and ChikPeaTOM__Ownership__c LIKE \'%' + own + '%\' order by LastModifiedDate limit 100')) {
                String fieldvalue = (String)so.get(fieldName);
                sObjectResultList.add(new SObjectResult(fieldvalue, so.Id));
            }
        return sObjectResultList;
    }

    public class SObJectResult {
        @AuraEnabled
        public String recName;
        @AuraEnabled
        public Id recId;
        
        public SObJectResult(String recNameTemp, Id recIdTemp) {
            recName = recNameTemp;
            recId = recIdTemp;
        }
    }

    public class premiseResult {
        @AuraEnabled
        public String recName;
        @AuraEnabled
        public String address;
        @AuraEnabled
        public String city;
        @AuraEnabled
        public String state;
        @AuraEnabled
        public String postal;
        @AuraEnabled
        public Id recId;
        
        public premiseResult(String recNameTemp, String addressTemp, String cityTemp, String stateTemp, String postalTemp, Id recIdTemp) {
            recName = recNameTemp;
            address = addressTemp;
            city = cityTemp;
            state = stateTemp;
            postal = postalTemp;
            recId = recIdTemp;
        }
    }
}