public with sharing class AddLocCarrier {
    @AuraEnabled
    public static Response addLocationCarrier(List<ChikPeaTOM__Order_Line__c> orderLines, 
        Id premiseId, String suite, Boolean primary, Boolean applyToAll, Boolean applyToChild, Id carrier){
        Response res = new Response();
        try{
            if(primary == null)
                primary = false;
            if(applyToChild == null)
                applyToChild = false;
            System.debug('#****orderLines ====> '+orderLines);
            System.debug('#****premise ====> '+premiseId);
            System.debug('#****suite ====> '+suite);
            System.debug('#****primary ====> '+primary);
            System.debug('#****applyToAll ====> '+applyToAll);//handled in lwc js
            System.debug('#****applyToChild ====> '+applyToChild);
            List<ChikPeaTOM__Order_Line_Premise__c> olpList = new List<ChikPeaTOM__Order_Line_Premise__c>();
            Set<Id> planOlIds = new Set<Id>();
            for(ChikPeaTOM__Order_Line__c orderLine:orderLines){
                planOlIds.add(orderLine.Id);
            }
            System.debug('#****planOlIds ====> '+planOlIds);
            System.debug('#****orderLines.size ====> '+planOlIds.size());

            //get all child plan ols
            if(applyToChild){
                List<ChikPeaTOM__Order_Line__c> childOls = [SELECT id, name, ChikPeaTOM__Parent_Line__c, ChikPeaTOM__Service_Plan__c, ChikPeaTOM__Service_Plan__r.name, ChikPeaTOM__Primary_Site__c FROM ChikPeaTOM__Order_Line__c WHERE ChikPeaTOM__Parent_Line__c IN :planOlIds and ChikPeaTOM__Service_Plan__c != null and ChikPeaTOM__Related_Equipment__c = null];
                System.debug('#****childOls.size ====> '+childOls.size());
                //add all child ol to plan ol
                for(ChikPeaTOM__Order_Line__c ol : childOls){
                    if(!planOlIds.contains(ol.id))
                        orderLines.add(ol);
                }
                System.debug('#****orderLines.size after child ol list add ====> '+orderLines.size());
            }

            //get all equipment ols
            List<ChikPeaTOM__Order_Line__c> eqpOls = [SELECT id, name, ChikPeaTOM__Parent_Line__c, ChikPeaTOM__Parent_Line__r.ChikPeaTOM__Parent_Line__c , ChikPeaTOM__Service_Plan__c, ChikPeaTOM__Service_Plan__r.name, ChikPeaTOM__Primary_Site__c, ChikPeaTOM__Related_Equipment__c, ChikPeaTOM__Related_Equipment__r.ChikPeaTOM__Equipment__r.name, ChikPeaTOM__Related_Equipment__r.ChikPeaTOM__Equipment__r.Id, ChikPeaTOM__Related_Equipment__r.ChikPeaTOM__Plan__c, ChikPeaTOM__Related_Equipment__r.ChikPeaTOM__Plan__r.name FROM ChikPeaTOM__Order_Line__c WHERE ChikPeaTOM__Parent_Line__c IN :planOlIds AND ChikPeaTOM__Service_plan__c = null AND ChikPeaTOM__Related_Equipment__c != null];
            System.debug('#****eqpOls.size ====> '+eqpOls.size());
            //add all equipment ol to plan ol
            orderLines.addAll(eqpOls);
            System.debug('#****orderLines.size after eqp ol list add ====> '+orderLines.size());
            //end of get all equipment ols

            //if Primary = true, previous OLPs should be updated with Primary = false
            List<ChikPeaTOM__Order_Line_Premise__c> olpListUpdate = new List<ChikPeaTOM__Order_Line_Premise__c>();
            if(primary == true){
                Set<Id> allOlIds = new Set<Id>();
                for(ChikPeaTOM__Order_Line__c orderLine:orderLines){
                    allOlIds.add(orderLine.Id);
                }
                List<ChikPeaTOM__Order_Line_Premise__c> olpList2 = new List<ChikPeaTOM__Order_Line_Premise__c>();
                olpList2 = [SELECT Id, Name, ChikPeaTOM__Order_Line__c, ChikPeaTOM__Primary__c FROM ChikPeaTOM__Order_Line_Premise__c
                            WHERE ChikPeaTOM__Order_Line__c IN :allOlIds];
                for(ChikPeaTOM__Order_Line_Premise__c olp : olpList2){
                    olp.ChikPeaTOM__Primary__c = false;
                    olpListUpdate.add(olp);
                }
            }
            update olpListUpdate;
            for(ChikPeaTOM__Order_Line__c orderLine:orderLines){
                ChikPeaTOM__Order_Line_Premise__c olp = new ChikPeaTOM__Order_Line_Premise__c(
                    ChikPeaTOM__Order_Line__c = orderLine.Id, ChikPeaTOM__Suite_No__c = suite, 
                    ChikPeaTOM__Premise__c = premiseId, ChikPeaTOM__Primary__c = primary);
                olpList.add(olp);
                if(primary != null && primary){
                    orderLine.ChikPeaTOM__Primary_Site__c = premiseId;
                }
            }
            insert olpList;
            update orderLines;
            
            List<ChikPeaTOM__Order_Line_Carrier__c> olcList = new List<ChikPeaTOM__Order_Line_Carrier__c>();  
            if(carrier!=null){
                for(ChikPeaTOM__Order_Line_Premise__c olp:olpList){    
                    ChikPeaTOM__Order_Line_Carrier__c olc = new ChikPeaTOM__Order_Line_Carrier__c(
                        ChikPeaTOM__Order_Line__c = olp.ChikPeaTOM__Order_Line__c, ChikPeaTOM__Carrier__c = carrier,
                        ChikPeaTOM__Order_Line_Premise__c = olp.Id
                    );
                    olcList.add(olc);
                }
                insert olcList;
            }
            res.statusCode = 100;
            res.message = 'Premise and Carrier has been successfully seleted for the Order Line';
        }catch(Exception e){
            res.e = e;
            res.statusCode = 101;
            System.debug(e.getMessage() + ', Line Number: ' + e.getLineNumber());
            // new ErrorLogger().createLog('OrderAddProduct Class : createOrder',e.getMessage());
            throw new AuraHandledException(e.getMessage());
        }
        return res;
    }

    @AuraEnabled
    public static Response addPremiseCarrier(List<ChikPeaTOM__Quote_Line__c> quoteLines,
        Id premiseId, String suite, Boolean primary, Boolean applyToAll, Boolean applyToChild, Id carrier){
        Response res = new Response();
        try{
            if(primary == null)
                primary = false;
            if(applyToChild == null)
                applyToChild = false;
            System.debug('#****quoteLines ====> '+quoteLines);
            System.debug('#****premise ====> '+premiseId);
            System.debug('#****suite ====> '+suite);
            System.debug('#****primary ====> '+primary);
            System.debug('#****applyToAll ====> '+applyToAll);//handled in lwc js
            System.debug('#****applyToChild ====> '+applyToChild);
            List<ChikPeaTOM__Quote_Line_Premise__c> qlpList = new List<ChikPeaTOM__Quote_Line_Premise__c>();

            Set<Id> planQlIds = new Set<Id>();
            for(ChikPeaTOM__Quote_Line__c quoteLine:quoteLines){
                planQlIds.add(quoteLine.Id);
            }
            System.debug('#****planQlIds ====> '+planQlIds);
            System.debug('#****quoteLines.size ====> '+planQlIds.size());

            //get all child plan qls
            if(applyToChild){
                List<ChikPeaTOM__Quote_Line__c> childQls = [SELECT id, name, ChikPeaTOM__Parent_Line__c, ChikPeaTOM__Service_plan__c, ChikPeaTOM__Service_plan__r.name, ChikPeaTOM__Primary_site__c FROM ChikPeaTOM__Quote_line__c WHERE ChikPeaTOM__Parent_Line__c IN :planQlIds and ChikPeaTOM__Service_plan__c != null and ChikPeaTOM__Related_Equipment__c = null];
                System.debug('#****childQls.size ====> '+childQls.size());
                //add all child ql to plan ql
                for(ChikPeaTOM__Quote_Line__c ql : childQls){
                    if(!planQlIds.contains(ql.id))
                        quoteLines.add(ql);
                }
                System.debug('#****quoteLines.size after child ql list add ====> '+quoteLines.size());
            }

            //get all equipment qls
            List<ChikPeaTOM__Quote_Line__c> eqpQls = [SELECT id, name, ChikPeaTOM__Parent_Line__c, ChikPeaTOM__Parent_Line__r.ChikPeaTOM__Parent_Line__c , ChikPeaTOM__Service_plan__c, ChikPeaTOM__Service_plan__r.name, ChikPeaTOM__Primary_site__c, ChikPeaTOM__Related_Equipment__c, ChikPeaTOM__Related_Equipment__r.ChikPeaTOM__Equipment__r.name, ChikPeaTOM__Related_Equipment__r.ChikPeaTOM__Equipment__r.Id, ChikPeaTOM__Related_Equipment__r.ChikPeaTOM__Plan__c, ChikPeaTOM__Related_Equipment__r.ChikPeaTOM__Plan__r.name FROM ChikPeaTOM__Quote_line__c WHERE ChikPeaTOM__Parent_Line__c IN :planQlIds AND ChikPeaTOM__Service_plan__c = null AND ChikPeaTOM__Related_Equipment__c != null];
            System.debug('#****eqpQls.size ====> '+eqpQls.size());
            //add all equipment ql to plan ql
            quoteLines.addAll(eqpQls);
            System.debug('#****quoteLines.size after eqp ql list add ====> '+quoteLines.size());
            //end of get all equipment qls


            //if Primary = true, previous QLPs should be updated with Primary = false
            List<ChikPeaTOM__Quote_Line_Premise__c> qlpListUpdate = new List<ChikPeaTOM__Quote_Line_Premise__c>();
            if(primary == true){
                Set<Id> allQlIds = new Set<Id>();
                for(ChikPeaTOM__Quote_Line__c quoteLine:quoteLines){
                    allQlIds.add(quoteLine.Id);
                }
                List<ChikPeaTOM__Quote_Line_Premise__c> qlpList2 = new List<ChikPeaTOM__Quote_Line_Premise__c>();
                qlpList2 = [SELECT Id, Name, ChikPeaTOM__Quote_Line__c, ChikPeaTOM__Primary__c FROM ChikPeaTOM__Quote_Line_Premise__c
                            WHERE ChikPeaTOM__Quote_Line__c IN :allQlIds];
                for(ChikPeaTOM__Quote_Line_Premise__c qlp : qlpList2){
                    qlp.ChikPeaTOM__Primary__c = false;
                    qlpListUpdate.add(qlp);
                }
            }
            update qlpListUpdate;
            
            for(ChikPeaTOM__Quote_Line__c quoteLine:quoteLines){
                ChikPeaTOM__Quote_Line_Premise__c qlp = new ChikPeaTOM__Quote_Line_Premise__c(
                    ChikPeaTOM__Quote_Line__c = quoteLine.Id, ChikPeaTOM__Suite_No__c = suite, 
                    ChikPeaTOM__Premise__c = premiseId, ChikPeaTOM__Primary__c = primary);
                qlpList.add(qlp);
                if(primary != null && primary){
                    quoteLine.ChikPeaTOM__Primary_Site__c = premiseId;
                }
            }
            insert qlpList;
            update quoteLines;
            
            List<ChikPeaTOM__Quote_Line_Carrier__c> qlcList = new List<ChikPeaTOM__Quote_Line_Carrier__c>();  
            if(carrier!=null){
                for(ChikPeaTOM__Quote_Line_Premise__c qlp:qlpList){    
                    ChikPeaTOM__Quote_Line_Carrier__c qlc = new ChikPeaTOM__Quote_Line_Carrier__c(
                        ChikPeaTOM__Quote_Line__c = qlp.ChikPeaTOM__Quote_Line__c, ChikPeaTOM__Carrier__c = carrier,
                        ChikPeaTOM__Quote_Line_Premise__c = qlp.Id
                    );
                    qlcList.add(qlc);
                }
                insert qlcList;
            }
            res.statusCode = 100;
            res.message = 'Premise and Carrier has been successfully seleted for the Quote Line';
        }catch(Exception e){
            res.e = e;
            res.statusCode = 101;
            System.debug(e.getMessage());
            // new ErrorLogger().createLog('quoteAddProduct Class : createQuote',e.getMessage());
            throw new AuraHandledException(e.getMessage());
        }
        return res;
    }

    public class Response{
        public Response(){
            statusCode =0; 
            message='';
        }
        public Exception e;
        @AuraEnabled public Integer statusCode{ get; set; }
        @AuraEnabled public String message{ get; set; }
        //@AuraEnabled public List<Id> olpId{ get; set; }
        //@AuraEnabled public List<Id> olcId{ get; set; }
    }
}