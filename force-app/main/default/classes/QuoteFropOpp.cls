public class QuoteFropOpp {

    @AuraEnabled
    public static String create(String oppId)
    { 

        Double version=0;

         Opportunity opp=[Select Id,AccountId from Opportunity where id = :oppId];
         ChikPeaO2B__Price_Book__c pb=[Select id from ChikPeaO2B__Price_Book__c order by CreatedDate desc limit 1];
         List<ChikPeaTOM__Quote__c> quote=[Select Id from ChikPeaTOM__Quote__c where ChikPeaTelq__Opportunity__c=:oppId];

         if(quote.size()>0){                                                                                                
            for(ChikPeaTOM__Quote__c quote1 : quote){                                                                                                                                                                          
                 if(version<quote1.ChikPeaTelq__Version__c){
                     version=quote1.ChikPeaTelq__Version__c;
                 }                                                                                                        
            }                                                                                                             
        }
         ChikPeaTOM__Quote__c qt = new ChikPeaTOM__Quote__c();

            qt.ChikPeaTOM__Account__c = opp.AccountID; 
            //qt.ChikPeaO2B__Price_Book__c =pb.Id; 
            qt.ChikPeaTelq__Opportunity__c = oppId;                                                                                           
            qt.ChikPeaTelq__Version__c=version+1;   
           // qt.ChikPeaSSB__New_Payment_Term__c='NET30';                                                                            
            insert qt;

         return qt.id;
    }
}