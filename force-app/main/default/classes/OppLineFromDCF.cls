public with sharing class OppLineFromDCF {
    @AuraEnabled
    public static String createOppLine(String dcfId){
        System.debug('dcfID '+dcfId);

        DCF__c dcf =[Select id,name,Opportunity__c from DCF__c where id =:dcfId];
        Id oppId = dcf.Opportunity__c;
        System.debug('oppId '+oppId);
        
        Id olId;

        List<Dcf_Line__c> dcfLine = [Select id,name,Premise__c,Plan__c from Dcf_Line__c where DCF__c =:dcfID];
        try {
            for(Dcf_Line__c dcfLlist : dcfLine){
                //creating opportunity Line
                Opportunity_Line__c ol = new Opportunity_Line__c();
                ol.Opportunity__c = oppId;
                ol.Plan__c = dcfLlist.Plan__c;
                ol.Primary_Site__c = dcfLlist.Premise__c;
                ol.Qty__c = 1; //has to come from dcfLine
    
                insert ol;

                olId = ol.id;
                System.debug('ol id'+olId);
                
                //creating opportunity Line premise
                Opportunity_Line_Premise__c olp =new Opportunity_Line_Premise__c();
                
                olp.Premise__c = dcfLlist.Premise__c;
    
                insert olp;
            }
        } catch (Exception e) {
            System.debug('Exception : '+e);
        }

        
        return oppId;
    }
}