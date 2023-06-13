public class SOWController {
	Public String recordID {get;set;}
    public Opportunity SOWDetail{get;set;}
    Public String oppName {get;set;}
    Public String accountName {get;set;}
    public Account accList {get;set;}
    
    public Opportunity_Line_Premise__c oppLinePremise{get;set;}
    public String contactAddressPremiseName {get;set;}
    
    public SOWController(Apexpages.StandardController controller){
        recordID = controller.getid();
        
        SOWDetail=[SELECT Id, name,AccountId from Opportunity WHERE Id =:recordID];
        
        accList=[SELECT Id,name from Account WHERE Id =:SOWDetail.AccountId];
        oppName=SOWDetail.name;
        accountName=accList.name;
        
        oppLinePremise=[SELECT Id, name, Premise__r.name, Premise__r.Suite_Building__c, Premise__r.ChikPeaTOM__City__c, Premise__r.ChikPeaTOM__State__c, Premise__r.ChikPeaTOM__Postal_Code__c 
                        							FROM Opportunity_Line_Premise__c 
                        							WHERE Primary__c=true and Opportunity__c=:recordID];
        contactAddressPremiseName=oppLinePremise.Premise__r.name;
        
    }
}