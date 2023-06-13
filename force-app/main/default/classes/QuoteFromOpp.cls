public class QuoteFromOpp {
    @AuraEnabled
    public static String create(String oppId)
    { 
        Double version=0;
        Id qLineId;

         Opportunity opp=[Select Id,AccountId from Opportunity where id = :oppId];
         List<Opportunity_Line__c> oppLn =[Select id,Unit_MRC__c,Unit_NRC__c,Plan__c,Primary_Site__c  from Opportunity_Line__c where Opportunity__c = :oppId];       //  ChikPeaO2B__Price_Book__c pb=[Select id from ChikPeaO2B__Price_Book__c order by CreatedDate desc limit 1];
         List<ChikPeaTOM__Quote__c> quote=[Select Id from ChikPeaTOM__Quote__c where Opportunity__c=:oppId];

         ChikPeaTOM__Quote__c qt = new ChikPeaTOM__Quote__c();
            qt.ChikPeaTOM__Account__c = opp.AccountID; 
            qt.Opportunity__c = oppId;                                                                                           
            qt.Version__c=version+1;                                                                            
            insert qt;
        //quote line creation
          
        // List<ChikPeaTOM__Quote_Line__c> newQl  = new List<ChikPeaTOM__Quote_Line__c>();
        // List<ChikPeaTOM__Quote_Line_Premise__c> newQLP = new List<ChikPeaTOM__Quote_Line_Premise__c>();
        // try{
        // for(Opportunity_Line__c ol : oppLn){
        //   ChikPeaTOM__Quote_Line__c ql = new ChikPeaTOM__Quote_Line__c();
        //   ql.ChikPeaTOM__Quote__c = qt.id;
        //   ql.ChikPeaTOM__Service_Plan__c = ol.Plan__c;
        //   ql.ChikPeaTOM__Primary_Site__c = ol.Primary_Site__c;
        //   ql.ChikPeaTOM__Unit_MRC__c = ol.Unit_MRC__c;
        //   ql.ChikPeaTOM__Unit_NRC__c = ol.Unit_NRC__c;

          
        //   System.debug('ol id : '+ol.id);
          
          // newQl.add(ql);
        //   insert ql;
        //   qLineId = ql.id;
        //   System.debug('qLineId : '+qLineId);

        //   List<Opportunity_Line_Premise__c> opp_Line_Premise = [Select Id,Name,Premise__c,Primary__c from Opportunity_Line_Premise__c where Opportunity_Line__c = :ol.id];
      
        //   if(opp_Line_Premise.size()>0){
        //     for(Opportunity_Line_Premise__c oppLP : opp_Line_Premise){
        //       ChikPeaTOM__Quote_Line_Premise__c quote_line_premise = new ChikPeaTOM__Quote_Line_Premise__c();
              
        //       quote_line_premise.ChikPeaTOM__Quote_Line__c = qLineId;
        //       quote_line_premise.ChikPeaTOM__Premise__c = oppLP.Premise__c;
        //       quote_line_premise.ChikPeaTOM__Primary__c = oppLP.Primary__c;
        //       newQLP.add(quote_line_premise);
        //       }
        //   }
  
        // }
        // insert newQl;
        // if(newQLP.size()>0){
        //   insert newQLP;
        // }
      // }catch(Exception e){
      //   System.debug('Exception : '+e);
      // }

        return qt.id;
    }

}