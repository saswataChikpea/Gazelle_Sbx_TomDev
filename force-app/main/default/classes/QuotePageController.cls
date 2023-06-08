public with sharing class QuotePageController {
    public String recordID {get;set;}
    public String accountName {get;set;}    
    public String oppName {get;set;}    
    public String quoteType {get;set;}    
    public String ExpDate {get;set;}

    public String quoteName {get;set;}
    public Decimal TotalMRC {get;set;}
    public Decimal TotalNRC {get;set;}

    public ChikPeaTOM__Quote__c quoteDetails{get;set;}
    public List<ChikPeaTOM__Quote_Line__c> quoteLineDetail{get;set;} 
    public Map<String, List<ChikPeaTOM__Quote_Line__c>> premiseIdToQuoteLineMap{get;set;}
    public Map<String, List<ChikPeaTOM__Quote_Line__c>> premiseIdToQuoteLineMap2{get;set;}
    public Map<String, Decimal> NRCsumsByKey {get;set;}
    public Map<String, Decimal> MRCsumsByKey {get;set;}


    public QuotePageController(Apexpages.StandardController controller) {
        recordID = controller.getid();
        System.debug(recordID);
        TotalMRC=0;
        TotalNRC=0;
        //quote
        quoteDetails=[Select Id,name,ChikPeaTOM__Account__r.name,Opportunity__r.name,Quote_Type__c,ChikPeaTOM__Expiration__c from ChikPeaTOM__Quote__c WHERE Id =:recordID];
        System.debug(quoteDetails);
        accountName=quoteDetails.ChikPeaTOM__Account__r.name;
        quoteName=quoteDetails.name;
        oppName=quoteDetails.Opportunity__r.name;
        quoteType=quoteDetails.Quote_Type__c;
        ExpDate=string.valueof(quoteDetails.ChikPeaTOM__Expiration__c);

        //quote line
        quoteLineDetail=new List<ChikPeaTOM__Quote_Line__c>();
        quoteLineDetail=[Select id,name,ChikPeaTOM__Primary_Site__c,ChikPeaTOM__Primary_Site__r.name,ChikPeaTOM__Qty__c,ChikPeaTOM__Service_Plan__r.name,ChikPeaTOM__Service_Plan__r.ChikPeaTOM__Description__c,ChikPeaTOM__MRC__c,ChikPeaTOM__NRC__c 
        from ChikPeaTOM__Quote_Line__c where ChikPeaTOM__Quote__c =:recordID];
        
        for(ChikPeaTOM__Quote_Line__c ql : quoteLineDetail){
            TotalMRC=TotalMRC+ql.ChikPeaTOM__MRC__c;
            TotalNRC=TotalNRC+ql.ChikPeaTOM__NRC__c;
        }
            

        if(quoteType == 'Multi Site Quote'){
         premiseIdToQuoteLineMap = new Map<String, List<ChikPeaTOM__Quote_Line__c>>();
         NRCsumsByKey = new Map<String, Decimal>();
         MRCsumsByKey = new Map<String, Decimal>();

            for(ChikPeaTOM__Quote_Line__c ql : quoteLineDetail){

                if (ql.ChikPeaTOM__Primary_Site__r.name != null) {
                    if (!premiseIdToQuoteLineMap.containsKey(ql.ChikPeaTOM__Primary_Site__r.name)) {
                        premiseIdToQuoteLineMap.put(ql.ChikPeaTOM__Primary_Site__r.name, new List<ChikPeaTOM__Quote_Line__c>());
                    }
                    premiseIdToQuoteLineMap.get(ql.ChikPeaTOM__Primary_Site__r.name).add(ql);
                }
            }
            System.debug('premiseIdToQuoteLineMap  '+premiseIdToQuoteLineMap);
            // calculating subtotal of NRC
            for (String key : premiseIdToQuoteLineMap.keySet()) {
                List<ChikPeaTOM__Quote_Line__c> QLkeyValueNRC = premiseIdToQuoteLineMap.get(key);
                Decimal sum = 0;
                for (ChikPeaTOM__Quote_Line__c customObject : QLkeyValueNRC) {
                    sum += customObject.ChikPeaTOM__NRC__c;
                }
                NRCsumsByKey.put(key, sum);
            }
            System.debug('NRCsumsByKey '+NRCsumsByKey);

            // calculating subtotal of MRC
            for (String key : premiseIdToQuoteLineMap.keySet()) {
                List<ChikPeaTOM__Quote_Line__c> QLkeyValueMRC = premiseIdToQuoteLineMap.get(key);
                Decimal sum = 0;
                for (ChikPeaTOM__Quote_Line__c customObject : QLkeyValueMRC) {
                    sum += customObject.ChikPeaTOM__MRC__c;
                }
                MRCsumsByKey.put(key, sum);
            }
            System.debug('MRCsumsByKey '+MRCsumsByKey);

        }else{
           premiseIdToQuoteLineMap2 = new Map<String, List<ChikPeaTOM__Quote_Line__c>>();

            for(ChikPeaTOM__Quote_Line__c ql : quoteLineDetail){

                // Check if the premiseId is already in the Map
                if (premiseIdToQuoteLineMap2.containsKey(ql.ChikPeaTOM__Primary_Site__r.name)) {
                    // Add the current Quote Line to the List associated with the premiseId
                    premiseIdToQuoteLineMap2.get(ql.ChikPeaTOM__Primary_Site__r.name).add(ql);
                } else {
                    // Create a new List with the current Quote Line and associate the List with the premiseId in the Map
                    List<ChikPeaTOM__Quote_Line__c> quoteLineList = new List<ChikPeaTOM__Quote_Line__c>{ql};
                    premiseIdToQuoteLineMap2.put(ql.ChikPeaTOM__Primary_Site__r.name, quoteLineList);
                }
                System.debug('primary site name '+ql.ChikPeaTOM__Primary_Site__r.name);
            }
            System.debug('premiseIdToQuoteLineMap  '+premiseIdToQuoteLineMap2);
     }
    }
}