trigger updatePrimarySiteinOppLine on Opportunity_Line_Premise__c (after insert,after update) {
    for(Opportunity_Line_Premise__c olp : Trigger.new){
        if(olp.Primary__c == true){
            Opportunity_Line__c getParentObj = [SELECT Id, Primary_Site__c FROM Opportunity_Line__c  ]; // removed WHERE Id = :olp.Opportunity_Line__c         
            Opportunity_Line_Premise__c getChildObj = [SELECT Id, Premise__c FROM Opportunity_Line_Premise__c WHERE Id = :olp.Id];
                getParentObj.Primary_Site__c = getChildObj.Premise__c;        
                update getParentObj;
            
        }
    }

}