public with sharing class QuotePageController {
    public String recordID {get;set;}
    public String accountName {get;set;}    
    public String oppName {get;set;}    
    public String quoteType {get;set;}    

    public String quoteName {get;set;}
    public Decimal TotalMRC {get;set;}
    public Decimal TotalNRC {get;set;}

    public ChikPeaTOM__Quote__c quoteDetails{get;set;}
    public List<ChikPeaTOM__Quote_Line__c> quoteLineDetail{get;set;} 

    public QuotePageController(Apexpages.StandardController controller) {
        recordID = controller.getid();
        System.debug(recordID);
        //quote
        quoteDetails=[Select Id,name,ChikPeaTOM__Account__r.name,Opportunity__r.name,Quote_Type__c from ChikPeaTOM__Quote__c WHERE Id =:recordID];
        System.debug(quoteDetails);
        accountName=quoteDetails.ChikPeaTOM__Account__r.name;
        quoteName=quoteDetails.name;
        oppName=quoteDetails.Opportunity__r.name;
        quoteType=quoteDetails.Quote_Type__c;

        //quote line
        quoteLineDetail=new List<ChikPeaTOM__Quote_Line__c>();
        quoteLineDetail=[Select id,name,ChikPeaTOM__Qty__c,ChikPeaTOM__Service_Plan__r.name,ChikPeaTOM__Service_Plan__r.ChikPeaTOM__Description__c,ChikPeaTOM__MRC__c,ChikPeaTOM__NRC__c 
        from ChikPeaTOM__Quote_Line__c where ChikPeaTOM__Quote__c =:recordID];

        Set<ChikPeaTOM__Quote_Line_Premise__c> qLinePremise = new Set<ChikPeaTOM__Quote_Line_Premise__c>();

        TotalMRC=0;
        TotalNRC=0;
        for(ChikPeaTOM__Quote_Line__c ql : quoteLineDetail){
            TotalMRC=TotalMRC+ql.ChikPeaTOM__MRC__c;
            TotalNRC=TotalNRC+ql.ChikPeaTOM__NRC__c;

            for(ChikPeaTOM__Quote_Line_Premise__c qlp :[Select id,name,ChikPeaTOM__Premise__c from ChikPeaTOM__Quote_Line_Premise__c where ChikPeaTOM__Quote_Line__c = :ql.id]){
                qLinePremise.add(qlp);
            }

        }
        System.debug('qLinePremise  '+qLinePremise);
    }
}