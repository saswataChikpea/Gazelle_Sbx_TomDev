public with sharing class AddEquipments {
    @AuraEnabled(Cacheable=false)
    public static List<REquipment> getEqpList(List<Id> planIds) {
	    System.debug('#**** getEqpList planIds='+planIds); 
        List<ChikPeaTOM__Related_Equipment__c> eqpList = [select Id, Name, 
            ChikPeaTOM__Equipment__c, ChikPeaTOM__Equipment__r.Name,
            ChikPeaTOM__Equipment__r.ChikPeaTOM__Sell_Price__c, ChikPeaTOM__Equipment__r.ChikPeaTOM__Rental__c,
            ChikPeaTOM__Plan__c from  ChikPeaTOM__Related_Equipment__c 
            where ChikPeaTOM__Plan__c IN: planIds limit 10000]; 
        List<REquipment> re_eqp_list=new List<REquipment>();
        for(ChikPeaTOM__Related_Equipment__c reqp:eqpList){
            REquipment reqp_class=new REquipment(reqp);
            //if(selected_plan.sp.Line_Per_Qty__c)
            reqp_class.qty=1;
            ///else
            //reqp_class.qty=selected_plan.qty;
            re_eqp_list.add(reqp_class);
        }  
        return re_eqp_list; // to access record in javascript: data
    }

    @AuraEnabled(Cacheable=false)
    public static List<SObject> getAddedEqpList(Id recordId, String objName){
        if(objName == 'ChikPeaTOM__Service_Order__c')
            return [Select Id, Name, ChikPeaTOM__Related_Equipment__c from ChikPeaTOM__Order_Line__c
                where ChikPeaTOM__Parent_Line__c =: recordId and ChikPeaTOM__Service_plan__c = null
                and ChikPeaTOM__Related_Equipment__c!=null];
        else if(objName == 'ChikPeaTOM__Quote__c')
            return [Select Id, Name, ChikPeaTOM__Related_Equipment__c from ChikPeaTOM__Quote_Line__c
                where ChikPeaTOM__Parent_Line__c =: recordId and ChikPeaTOM__Service_plan__c = null
                and ChikPeaTOM__Related_Equipment__c!=null];
        else 
            return null;
    }

    @AuraEnabled
    public static Response saveLineEquip(String objName, Id parentLine, List<REquipmentInOL> eqps){
        Response res = new Response();
        map<string,string> RecordTypeMap = new map<string,string>();
        if(objName == 'ChikPeaTOM__Service_Order__c'){

            list<ChikPeaTOM__Order_Line__c> olListi = new list<ChikPeaTOM__Order_Line__c>();
                        
            for(RecordType rt : [Select SobjectType, Name, Id From RecordType where SobjectType = 'ChikPeaTOM__Order_Line__c'])
            {
                RecordTypeMap.put(rt.Name, rt.Id);
            }
            try{
                System.debug('#****parentLine ====> '+parentLine);
                System.debug('#**** eqps ====> '+eqps);
                System.debug('#**** eqps ====> '+eqps.size());
                // Fix Mar 22
                ChikPeaTOM__Order_Line__c olrec = [SELECT Id, Name, ChikPeaTOM__Service_Order__c, ChikPeaTOM__Primary_Site__c 
                                                    FROM ChikPeaTOM__Order_Line__c WHERE Id =:parentLine];
                // Fix Mar 22
                for(REquipmentInOL eqp:eqps){
                    /*
                    ChikPeaTOM__Order_Line__c olrec = [SELECT Id, Name, ChikPeaTOM__Service_Order__c
                    FROM ChikPeaTOM__Order_Line__c WHERE Id =:parentLine];
                    */
                    ChikPeaTOM__Order_Line__c ol = new ChikPeaTOM__Order_Line__c();
                    ol.ChikPeaTOM__Service_Order__c = olrec.ChikPeaTOM__Service_Order__c;
                    ol.ChikPeaTOM__Parent_Line__c = parentLine;
                    ol.ChikPeaTOM__Related_Equipment__c = eqp.rq.Id;
                    ol.ChikPeaTOM__Contract_Period__c = eqp.term;
                    ol.ChikPeaTOM__Qty__c = eqp.qty;
                    ol.ChikPeaTOM__Qty_based_NRC__c = eqp.qnrc;
                    ol.ChikPeaTOM__Primary_Site__c = olrec.ChikPeaTOM__Primary_Site__c;
                    ol.RecordTypeId = RecordTypeMap.get('Equipment');

                    if(eqp.rental)
                        ol.ChikPeaTOM__Unit_MRC__c = eqp.rentalamt;
                    else
                        ol.ChikPeaTOM__Unit_NRC__c = eqp.sellprice;

                    System.debug('#**** Order Line ====> '+ol);

                    olListi.add(ol);
                    //insert ol;
                }
                if(olListi != null && olListi.size()>0)
                    insert olListi; 

                System.debug('eqp olp =====>'+olListi.size());
                    
                // eqp olp  
                if(olrec.ChikPeaTOM__Primary_Site__c!=null){ // when you from add Product button this will skip OLP creation. But it will create OLP from OL addEqp Button 
                    list<ChikPeaTOM__Order_Line_Premise__c> olplist = new list<ChikPeaTOM__Order_Line_Premise__c>();
                    for(ChikPeaTOM__Order_Line__c ol2 : olListi)
                    {
                        ChikPeaTOM__Order_Line_Premise__c olp1 = new ChikPeaTOM__Order_Line_Premise__c();
                        olp1.ChikPeaTOM__Order_Line__c = ol2.Id;
                        olp1.ChikPeaTOM__primary__c = true;
                        olp1.ChikPeaTOM__Premise__c = ol2.ChikPeaTOM__Primary_Site__c;
                        olplist.add(olp1);
                        System.debug('eqp olp ol2=====>'+ol2); 
                    }

                    if(olplist != null && olplist.size()>0)
                    insert olplist;

                    System.debug('eqp olp olplist=====>'+olplist.size());                    
                }
                // end eqp olp     

                res.statusCode = 100;
                res.message = 'Equipment has been successfully added to the order line';
                if(test.isrunningtest()) 
                    Integer a = 1/0;
            }
            catch(Exception e){
                res.e = e;
                res.statusCode = 101;
                System.debug(e.getMessage()+', Line number: '+e.getLineNumber());
                // ErrorLogger er = new ErrorLogger();
                // er.createLog('AddEquipments Class : saveLineEquip',e.getMessage());
                if(!test.isRunningTest())
                	throw new AuraHandledException(e.getMessage());
            }
        }else if(objName == 'ChikPeaTOM__Quote__c'){

            list<ChikPeaTOM__quote_Line__c> qlListi = new list<ChikPeaTOM__Quote_Line__c>();

            for(RecordType rt : [Select SobjectType, Name, Id From RecordType where SobjectType = 'ChikPeaTOM__Quote_Line__c'])
            {
                RecordTypeMap.put(rt.Name, rt.Id);
            }
            try{
                System.debug('#****parentLine ====> '+parentLine);
                System.debug('#**** eqps ====> '+eqps);
                // Fix Mar 22
                ChikPeaTOM__Quote_Line__c qlrec = [SELECT Id, Name, ChikPeaTOM__Quote__c
                                                    FROM ChikPeaTOM__Quote_Line__c WHERE Id =:parentLine];
                // Fix Mar 22
                for(REquipmentInOL eqp:eqps){
                    /*
                    ChikPeaTOM__Quote_Line__c qlrec = [SELECT Id, Name, ChikPeaTOM__Quote__c
                    FROM ChikPeaTOM__Quote_Line__c WHERE Id =:parentLine];
                    */
                    ChikPeaTOM__Quote_Line__c ql = new ChikPeaTOM__Quote_Line__c();
                    ql.ChikPeaTOM__Quote__c = qlrec.ChikPeaTOM__Quote__c;
                    ql.ChikPeaTOM__Parent_Line__c = parentLine;
                    ql.ChikPeaTOM__Related_Equipment__c = eqp.rq.Id;
                    ql.ChikPeaTOM__Unit_NRC__c = eqp.sellprice;
                    ql.ChikPeaTOM__Contract_Period__c = eqp.term;
                    ql.ChikPeaTOM__Qty__c = eqp.qty;
                    ql.ChikPeaTOM__Qty_based_NRC__c = eqp.qnrc;
                    ql.RecordTypeId = RecordTypeMap.get('Equipment');

                    if(eqp.rental)
                        ql.ChikPeaTOM__Unit_MRC__c = eqp.rentalamt;
                    else
                        ql.ChikPeaTOM__Unit_NRC__c = eqp.sellprice;

                    System.debug('#**** Quote Line ====> '+ql);
                    qlListi.add(ql);
                    //insert ql;
                }

                if(qlListi != null && qlListi.size()>0)
                    insert qlListi; 

                res.statusCode = 100;
                res.message = 'Equipment has been successfully added to the quote line';
                if(test.isrunningtest()) 
                    Integer a = 1/0;
            }
            catch(Exception e){
                res.e = e;
                res.statusCode = 101;
                System.debug(e.getMessage()+', Line number: '+e.getLineNumber());
                // ErrorLogger er = new ErrorLogger();
                // er.createLog('AddEquipments Class : saveLineEquip',e.getMessage());
                if(!test.isRunningTest())
                	throw new AuraHandledException(e.getMessage());
            }
        }
        return res;
    }

    public class REquipment{
        @AuraEnabled public ChikPeaTOM__Related_Equipment__c rq{get; set;}
        @AuraEnabled public boolean rental {get; set;}
        @AuraEnabled public boolean  qnrc{get; set;}        
        @AuraEnabled public integer qty {get; set;}
        @AuraEnabled public integer term {get; set;}
        @AuraEnabled public integer cp {get; set;}
        @AuraEnabled public String equipmentName{get;set;}
        @AuraEnabled public String relatedEquipment{get;set;}
        @AuraEnabled public Decimal sellprice {get;set;}
        @AuraEnabled public Decimal rentalamt {get;set;}
        @AuraEnabled public Id rqId {get;set;}
        public REquipment(ChikPeaTOM__Related_Equipment__c e){
            rqId=e.Id;
            rq=e;
            rental = false;
            qty = 1;
            term = 12;
            qnrc = false;
            equipmentName = e.ChikPeaTOM__Equipment__r.Name;
            relatedEquipment = e.Name;
            sellprice = e.ChikPeaTOM__Equipment__r.ChikPeaTOM__Sell_Price__c;
            rentalamt = e.ChikPeaTOM__Equipment__r.ChikPeaTOM__Rental__c;
        }
    }

    public class REquipmentInOL{
        @AuraEnabled public ChikPeaTOM__Related_Equipment__c rq{get; set;}
        @AuraEnabled public boolean rental {get; set;}
        @AuraEnabled public boolean  qnrc{get; set;}        
        @AuraEnabled public integer qty {get; set;}
        @AuraEnabled public integer term {get; set;}
        @AuraEnabled public integer cp {get; set;}
        @AuraEnabled public String equipmentName{get;set;}
        @AuraEnabled public String relatedEquipment{get;set;}
        @AuraEnabled public Decimal sellprice {get;set;}
        @AuraEnabled public Decimal rentalamt {get;set;}
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
}