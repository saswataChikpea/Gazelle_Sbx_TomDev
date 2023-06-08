public with sharing class SearchProduct {
    @AuraEnabled(Cacheable=true)
    public static List<ChikPeaTOM__Service_Plan__c> getPlanList(String wherePart, String limitTxt) {
	    System.debug('#****wherePart='+wherePart +'limit='+limitTxt); 
        //where '+parentApi+' = \''+parentId+'\'  
        String query = '';
        if(wherePart == ''){
            //Select Name, NRC__c, RecordType.Name,ChikPeaTOM__Line_Per_Qty__c, MRC__c, Id, Active__c,ChikPeaTOM__Plan_Category__c  From Service_Plan__c where Active__c = true order by name limit 10000
            query = 'SELECT Id,Name,ChikPeaTOM__Plan_Category__c,ChikPeaTOM__Service_Type__c,'+
                'ChikPeaTOM__Pricing_Type__c, ChikPeaTOM__MRC__c,ChikPeaTOM__NRC__c, ChikPeaTOM__Active__c'+
                ' FROM ChikPeaTOM__Service_Plan__c where ChikPeaTOM__Active__c = true order by ChikPeaTOM__Plan_Category__c,Name LIMIT 30';
        }else {
            query = 'SELECT Id,Name,ChikPeaTOM__Plan_Category__c,ChikPeaTOM__Service_Type__c,'+
            'ChikPeaTOM__Pricing_Type__c, ChikPeaTOM__MRC__c,ChikPeaTOM__NRC__c, ChikPeaTOM__Active__c'+
            ' FROM ChikPeaTOM__Service_Plan__c '+wherePart+' order by ChikPeaTOM__Plan_Category__c,Name';
            if(limitTxt != ''){
                query = query + ' LIMIT ' +limitTxt;
            }else {
                query = query + ' LIMIT 1000';
            }
        }
        System.debug('#****query='+query);    
        return Database.query(query);  // to access record in javascript: result.data
    }

    
    public class Response{
		public Response(){
			statusCode =0; 
    		message='';
		}
        public Exception e;
        @AuraEnabled public Integer statusCode{ get; set; }
        @AuraEnabled public String message{ get; set; }
    }
    /*
    public class Options{
        @AuraEnabled
        public String label{get;set;}
        @AuraEnabled
        public String value{get;set;}
    }*/
}