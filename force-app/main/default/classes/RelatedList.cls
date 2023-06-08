public with sharing class RelatedList {
    @AuraEnabled(Cacheable=true)
    public static List<SObject> getRelatedRecordList(String parentId, String parentApi, String childApi, String disaplayFields) {
	    System.debug('#****disaplayFields='+disaplayFields);
        String query = 'SELECT '+disaplayFields+' Id FROM '+childApi
            +' where '+parentApi+' = \''+parentId+'\' LIMIT 1000';
        System.debug('#****query='+query);    
        return Database.query(query);        
    }
    @AuraEnabled(Cacheable=false)
    public static List<SObject> getRelatedRecordListRefresh(String parentId, String parentApi, String childApi, String disaplayFields) {
	    System.debug('#****disaplayFields='+disaplayFields);
        String query = 'SELECT '+disaplayFields+' Id FROM '+childApi
            +' where '+parentApi+' = \''+parentId+'\' LIMIT 1000';
        System.debug('#****query='+query);    
        return Database.query(query);        
    }
    @AuraEnabled(Cacheable=false)
    public static void deleteRelatedRecordList(List<SObject> records){
      if(records.size()>0){
          try{
            delete records;           
          }
          catch (Exception exp) {
            throw new AuraHandledException(exp.getMessage());
        }
      }
    }
}