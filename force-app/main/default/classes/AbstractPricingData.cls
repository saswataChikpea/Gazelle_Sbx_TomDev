global abstract class AbstractPricingData{
	@AuraEnabled public Opportunity_Line__c oppLine{get;set;}
	//Config Id, Config Value
	public Map<String, String> config_value{get;set;}
	public Map<String, String> simple_config_value{get;set;}
	public Map<String, String> complex_config_value{get;set;}
	public String error_msg{get;set;}  
	public String soql{get;set;}  
	public Integer error_code{get;set;}  
	public Boolean isSuccess{get;set;}  
	public Boolean isCalculated{get;set;}	
	public Boolean isExternalPricing{get;set;}
	global abstract Integer pricingType();
}