public with sharing class QuoteLineHierarchy {
    @AuraEnabled
    public static string getMapKey(){
        List<ChikPeaTOM__Tom_Setting__c> tsObj = new List<ChikPeaTOM__Tom_Setting__c>([SELECT ChikPeaTOM__Google_Map_API_Key__c FROM ChikPeaTOM__Tom_Setting__c ORDER BY CreatedDate LIMIT 1]);
        return tsObj[0].ChikPeaTOM__Google_Map_API_Key__c;
    }

    @AuraEnabled(cacheable=false)
    public static List<ChikPeaTOM__Quote_Line__c> getQuoteLines(String recordId) {

        System.debug('------recordId= '+recordId);
        List<ChikPeaTOM__Quote_Line__c> ql = new List<ChikPeaTOM__Quote_Line__c>();
        
        ql = [SELECT Id, Name, ChikPeaTOM__Quote__c, ChikPeaTOM__Quote__r.Name,
            ChikPeaTOM__Service_Plan__c, ChikPeaTOM__Service_Plan__r.Name,
            ChikPeaTOM__Related_Equipment__c, ChikPeaTOM__Related_Equipment__r.ChikPeaTOM__Equipment__c,
            ChikPeaTOM__Related_Equipment__r.ChikPeaTOM__Equipment__r.Name,
            ChikPeaTOM__Contract_Period__c,ChikPeaTOM__Primary_Site__c, ChikPeaTOM__Primary_Site__r.Name,
            ChikPeaTOM__Primary_Site__r.ChikPeaTOM__Street_Addess__c, ChikPeaTOM__Primary_Site__r.ChikPeaTOM__City__c,
            ChikPeaTOM__Primary_Site__r.ChikPeaTOM__State__c,
            ChikPeaTOM__Parent_Line__c, ChikPeaTOM__Parent_Line__r.Name, ChikPeaTOM__Bandwidth__c, ChikPeaTOM__MRC__c, ChikPeaTOM__NRC__c,
            (SELECT ID, Name, ChikPeaTOM__Quote_Line__c, ChikPeaTOM__Primary__c, ChikPeaTOM__Suite_No__c, ChikPeaTOM__Premise__c, ChikPeaTOM__Premise__r.Name, ChikPeaTOM__Premise__r.ChikPeaTOM__City__c FROM ChikPeaTOM__Quote_Line_Premises__r where ChikPeaTOM__Premise__c !=null ORDER BY ChikPeaTOM__Premise__r.Name), 
            (SELECT Id, Name, ChikPeaTOM__Config__c, ChikPeaTOM__Config_Value__c, ChikPeaTOM__Quote__c, ChikPeaTOM__Config__r.Name FROM ChikPeaTOM__Quote_Configs__r)
            FROM ChikPeaTOM__Quote_Line__c WHERE ((ChikPeaTOM__Quote__c =: recordId) AND (ChikPeaTOM__Service_Plan__c != null))];

        System.debug('------data= '+ql);

        return ql;
    }

    @AuraEnabled(cacheable=true)
    public static List<AggregateResult> getConfigCounts(List<Id> planIds) {
        Map<Id,Integer> configCountMap = new Map<Id,Integer>();
        Set<Id> plandIdSet = new Set<Id>();
        plandIdSet.addAll(planIds);
        List<AggregateResult> configsCounts = [SELECT count(id) config_count,ChikPeaTOM__Plan__c FROM ChikPeaTOM__Config__c WHERE ChikPeaTOM__Plan__c IN :plandIdSet AND ChikPeaTOM__Type__c = 'CPQ' GROUP BY ChikPeaTOM__Plan__c];
        return configsCounts;
    }
}