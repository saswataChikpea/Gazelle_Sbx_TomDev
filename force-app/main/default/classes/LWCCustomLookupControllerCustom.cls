public with sharing class LWCCustomLookupControllerCustom {
    public LWCCustomLookupControllerCustom() {

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
    public static List<premiseResult> getResultsForPremise(String ObjectName, String fieldName, String value, Boolean hidecreatenew,String qId) {
        System.debug('qId' + qId);
        ChikPeaTOM__Quote__c quote = [SELECT Id, Name, Opportunity__c FROM ChikPeaTOM__Quote__c WHERE Id = :qId];
        String oppId = quote.Opportunity__c;
        System.debug('oppId' + oppId);

        List<premiseResult> premiseList = new List<premiseResult>();
        system.debug(fieldName + '-------------' + ObjectName + '---++----------' + value);
        try {
            if (String.isNotEmpty(value)) {
                String queryString = 'SELECT Id, Premise__r.ChikPeaTOM__City__c, Premise__r.ChikPeaTOM__Street_Addess__c, Premise__r.ChikPeaTOM__State__c, Premise__r.ChikPeaTOM__Postal_Code__c,'+fieldName+' FROM Opportunity_Line_Premise__c WHERE Opportunity__c = :oppId AND Premise__r.Name LIKE \'%' + value + '%\' LIMIT 100';
                List<Opportunity_Line_Premise__c> results = Database.query(queryString);
                Set<Id> oppP = new Set<Id>();
                System.debug('oppLP '+results);
                for(Opportunity_Line_Premise__c r : results){
                    oppP.add(r.Premise__c);
                }
                List<ChikPeaTOM__Premise__c> premise = [Select id,Name,ChikPeaTOM__City__c,ChikPeaTOM__Street_Addess__c,ChikPeaTOM__State__c,ChikPeaTOM__Postal_Code__c from ChikPeaTOM__Premise__c where id IN :oppP];
                System.debug('premise'+premise);
                for(ChikPeaTOM__Premise__c record : premise) {
                    String fieldvalue = (String) record.get('Name');
                    // String fieldvalue = 'Hello world';

                    ChikPeaTOM__Premise__c so1 = (ChikPeaTOM__Premise__c) record;
                    
                    String address = (String) so1.ChikPeaTOM__Street_Addess__c;
                    String city = (String) so1.ChikPeaTOM__City__c;
                    String state = (String) so1.ChikPeaTOM__State__c;
                    String postal = (String) so1.ChikPeaTOM__Postal_Code__c;
                    premiseList.add(new premiseResult(fieldvalue, address, city, state, postal, so1.Id));
                    System.debug('strings = '+fieldvalue+address+city+state+postal);
                }
                // for(Opportunity_Line_Premise__c record : results) {
                //     String fieldvalue = (String) record.get(fieldName);
                //     Opportunity_Line_Premise__c so1 = (Opportunity_Line_Premise__c) record;
                //     String address = (String) so1.Premise__r.ChikPeaTOM__Street_Addess__c;
                //     String city = (String) so1.Premise__r.ChikPeaTOM__City__c;
                //     String state = (String) so1.Premise__r.ChikPeaTOM__State__c;
                //     String postal = (String) so1.Premise__r.ChikPeaTOM__Postal_Code__c;
                //     premiseList.add(new premiseResult(fieldvalue, address, city, state, postal, so1.Id));
                //     System.debug('strings = '+fieldvalue+address+city+state+postal);
                // }
            }

            // Other code sections...

            if (hidecreatenew == false) {
                premiseList.add(new premiseResult('Create New', null, null, null, null, null));
            }
        } catch (Exception e) {
            System.debug(e);
        }

        return premiseList;
    }

    @AuraEnabled(cacheable=true)
    public static List<premiseResult> getResultsForPremise2(String ObjectName, String fieldName, String value, Boolean hidecreatenew,String qId) {
        System.debug('qId' + qId);
        ChikPeaTOM__Quote__c quote = [SELECT Id, Name, Opportunity__c FROM ChikPeaTOM__Quote__c WHERE Id = :qId];
        String oppId = quote.Opportunity__c;
        System.debug('oppId' + oppId);

        List<premiseResult> premiseList = new List<premiseResult>();
        system.debug(fieldName + '-------------' + ObjectName + '---++----------' + value);
        try {
            if (String.isNotEmpty(value)) {
                String queryString = 'SELECT Id, Premise__r.ChikPeaTOM__City__c, Premise__r.ChikPeaTOM__Street_Addess__c, Premise__r.ChikPeaTOM__State__c, Premise__r.ChikPeaTOM__Postal_Code__c,'+fieldName+' FROM Opportunity_Line_Premise__c WHERE Opportunity__c = :oppId LIMIT 100';
                List<Opportunity_Line_Premise__c> results = Database.query(queryString);
                Set<Id> oppP = new Set<Id>();
                System.debug('oppLP '+results);
                for(Opportunity_Line_Premise__c r : results){
                    oppP.add(r.Premise__c);
                }
                List<ChikPeaTOM__Premise__c> premise = [Select id,Name,ChikPeaTOM__City__c,ChikPeaTOM__Street_Addess__c,ChikPeaTOM__State__c,ChikPeaTOM__Postal_Code__c from ChikPeaTOM__Premise__c where id IN :oppP];
                System.debug('premise'+premise);
                for(ChikPeaTOM__Premise__c record : premise) {
                    String fieldvalue = (String) record.get('Name');
                    // String fieldvalue = 'Hello world';

                    ChikPeaTOM__Premise__c so1 = (ChikPeaTOM__Premise__c) record;
                    
                    String address = (String) so1.ChikPeaTOM__Street_Addess__c;
                    String city = (String) so1.ChikPeaTOM__City__c;
                    String state = (String) so1.ChikPeaTOM__State__c;
                    String postal = (String) so1.ChikPeaTOM__Postal_Code__c;
                    premiseList.add(new premiseResult(fieldvalue, address, city, state, postal, so1.Id));
                    System.debug('strings = '+fieldvalue+address+city+state+postal);
                }
                // for(Opportunity_Line_Premise__c record : results) {
                //     String fieldvalue = (String) record.get(fieldName);
                //     Opportunity_Line_Premise__c so1 = (Opportunity_Line_Premise__c) record;
                //     String address = (String) so1.Premise__r.ChikPeaTOM__Street_Addess__c;
                //     String city = (String) so1.Premise__r.ChikPeaTOM__City__c;
                //     String state = (String) so1.Premise__r.ChikPeaTOM__State__c;
                //     String postal = (String) so1.Premise__r.ChikPeaTOM__Postal_Code__c;
                //     premiseList.add(new premiseResult(fieldvalue, address, city, state, postal, so1.Id));
                //     System.debug('strings = '+fieldvalue+address+city+state+postal);
                // }
            }

            // Other code sections...

            if (hidecreatenew == false) {
                premiseList.add(new premiseResult('Create New', null, null, null, null, null));
            }
        } catch (Exception e) {
            System.debug(e);
        }

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