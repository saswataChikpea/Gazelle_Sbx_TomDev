public with sharing class DcfToQuote {
    @AuraEnabled
    public static String createQuote(String dcfId){
        System.debug('dcfId'+dcfId);
        DCF__c dcf =[Select id,name,Opportunity__c from DCF__c where id =:dcfId];
        Id oppId = dcf.Opportunity__c;
        Opportunity opp=[Select Id,AccountId from Opportunity where id = :oppId];

        List<DCF_Premises__c> dcfPremiseList = [Select id,name,Premise__c from DCF_Premises__c where DCF__c = :dcfId];
        Id qID;
        try {
                //creating quote
                ChikPeaTOM__Quote__c quote = new ChikPeaTOM__Quote__c();
                quote.ChikPeaTOM__Account__c = opp.AccountID; 
                quote.Opportunity__c = oppId;
                insert quote;

                qID = quote.id;
            //creating quote premise
            for(DCF_Premises__c dpL : dcfPremiseList){
                Quote_Premise__c qPremise = new Quote_Premise__c();
                qPremise.Quote__c = qID;
                qPremise.Premise__c = dpL.Premise__c;

                insert qPremise;
            }
        } catch (Exception e) {
            System.debug('Exception : '+e);
        }

        return qID;
    }
}