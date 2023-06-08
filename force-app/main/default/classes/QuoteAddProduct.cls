public with sharing class QuoteAddProduct {
    @AuraEnabled
    public static Response createQuote(ChikPeaTOM__Quote_Line__c parentQuoteLine, List<ChikPeaTOM__Quote_Line__c> quoteLines){
        Response res = new Response();
        try{
            System.debug('#****parentQuoteLine ====> '+parentQuoteLine);
            System.debug('#****quoteLines ====> '+quoteLines);
            if(parentQuoteLine != null){
                insert parentQuoteLine;
                res.savedQL.add(parentQuoteLine);
            }else {
                res.statusCode = 102;
                res.message = 'Quote line(s) is null';
            }
            if(quoteLines != null){
                for(ChikPeaTOM__Quote_Line__c ql:quoteLines){
                    ql.ChikPeaTOM__Parent_Line__c = parentQuoteLine.id;
                }
                insert quoteLines;
                res.savedQL.addAll(quoteLines);
            }
            System.debug('#****inserted parentQuoteLine ====> '+parentQuoteLine);
            System.debug('#**** quoteLines ====> '+quoteLines);
            res.statusCode = 100;
            res.message = 'Product has been successfully added to the quote';
        }catch(Exception e){
            res.e = e;
            res.statusCode = 101;
            System.debug(e.getMessage());
            // ErrorLogger er = new ErrorLogger();
            // er.createLog('quoteAddProduct Class : createQuote',e.getMessage());
            throw new AuraHandledException(e.getMessage());
        }
        return res;
    }
    @AuraEnabled
    public static Response createQuoteLPQ(ChikPeaTOM__Quote_Line__c parentQuoteLine, 
    List<ChikPeaTOM__Quote_Line__c> quoteLines, Integer qty){
        Response res = new Response();
        List<ChikPeaTOM__Quote_Line__c> parentQuoteLines = new List<ChikPeaTOM__Quote_Line__c>();
        List<ChikPeaTOM__Quote_Line__c> childQuoteLines = new List<ChikPeaTOM__Quote_Line__c>();
        try{
            System.debug('#****parentQuoteLine ====> '+parentQuoteLine);
            System.debug('#****quoteLines ====> '+quoteLines);
            for(Integer i = 0; i<qty; i++){
                ChikPeaTOM__Quote_Line__c pql = parentQuoteLine.clone();
                pql.ChikPeaTOM__Qty__c = 1;
                parentQuoteLines.add(pql);
            }
            if(parentQuoteLines != null){
                insert parentQuoteLines;
                res.savedQL.addAll(parentQuoteLines);
            }else {
                res.statusCode = 102;
                res.message = 'Quote line(s) is null';
            }
            if(quoteLines != null){
                for(Integer i = 0; i<qty; i++){
                    ChikPeaTOM__Quote_Line__c parentQuoteLine1 = parentQuoteLines[i];
                    List<ChikPeaTOM__Quote_Line__c> orderLineClones = getChildList(quoteLines);
                    if(orderLineClones != null){
                        for(ChikPeaTOM__Quote_Line__c ol:orderLineClones){
                            ol.ChikPeaTOM__Parent_Line__c = parentQuoteLine1.id;
                            ol.ChikPeaTOM__Qty__c = 1;
                            childQuoteLines.add(ol);
                        }
                        res.savedQL.addAll(orderLineClones);
                    }
                }
                insert childQuoteLines;
                res.savedQL.addAll(childQuoteLines);
            }
            System.debug('#****inserted parentQuoteLine ====> '+parentQuoteLine);
            System.debug('#**** quoteLines ====> '+quoteLines);
            res.statusCode = 100;
            res.message = 'Product has been successfully added to the Quote';
        }catch(Exception e){
            res.e = e;
            res.statusCode = 101;
            System.debug(e.getMessage());
            // ErrorLogger er = new ErrorLogger();
            // er.createLog('quoteAddProduct Class : createQuoteLPQ',e.getMessage());
            throw new AuraHandledException(e.getMessage());
        }
        return res;
    }
    private static List<ChikPeaTOM__Quote_Line__c> getChildList(List<ChikPeaTOM__Quote_Line__c> quoteLines){
        List<ChikPeaTOM__Quote_Line__c> orderLineClones = new List<ChikPeaTOM__Quote_Line__c>();
        for(ChikPeaTOM__Quote_Line__c ol:quoteLines){
            orderLineClones.add(ol.clone(false));
        }    
        return orderLineClones;
    }
    @AuraEnabled
    public static Response saveQuoteLineEquip(ChikPeaTOM__Quote_Line__c parentQuoteLine, List<REquipmentInQuote> eqps){
        Response res = new Response();
        map<string,string> RecordTypeMap = new map<string,string>();
        for(RecordType rt : [Select SobjectType, Name, Id From RecordType where SobjectType = 'ChikPeaTOM__Quote_Line__c'])
        {
            RecordTypeMap.put(rt.Name, rt.Id);
        }
        try{
            System.debug('#****parentQuoteLine ====> '+parentQuoteLine);
            System.debug('#**** eqps ====> '+eqps);
            for(REquipmentInQuote eqp:eqps){
                ChikPeaTOM__Quote_Line__c qlrec = [SELECT Id, Name, ChikPeaTOM__Quote__c
                FROM ChikPeaTOM__Quote_Line__c WHERE ChikPeaTOM__Quote__c =:parentQuoteLine.ChikPeaTOM__Quote__c ORDER BY CreatedDate DESC LIMIT 1];

                ChikPeaTOM__Quote_Line__c ql = new ChikPeaTOM__Quote_Line__c();
                ql.ChikPeaTOM__Quote__c = parentQuoteLine.ChikPeaTOM__Quote__c;
                ql.ChikPeaTOM__Parent_Line__c = qlrec.Id;
                ql.ChikPeaTOM__Related_Equipment__c = eqp.rq.Id;
                ql.ChikPeaTOM__Contract_Period__c = eqp.term;
                ql.ChikPeaTOM__Qty__c = eqp.qty;
                ql.ChikPeaTOM__Qty_based_NRC__c = eqp.qnrc;
                ql.RecordTypeId = RecordTypeMap.get('Equipment');

                if(eqp.rental)
                    ql.ChikPeaTOM__Unit_MRC__c = eqp.rentalamt;
                else
                    ql.ChikPeaTOM__Unit_NRC__c = eqp.sellprice;

                System.debug('#**** Quote Line ====> '+ql);
                insert ql;
            }
            res.statusCode = 100;
            res.message = 'Product has been successfully added to the quote';
        }
        catch(Exception e){
            res.e = e;
            res.statusCode = 101;
            System.debug(e.getMessage());
            // ErrorLogger er = new ErrorLogger();
            // er.createLog('quoteAddProduct Class : saveQuoteLineEquip',e.getMessage());
            throw new AuraHandledException(e.getMessage());
        }
        return res;
    }
    @AuraEnabled
    public static ChikPeaTOM__Plan_Factor__c getPlanRate(Id planId, 
        Integer bandWidth, Integer contractPeriod){
        System.debug('#****planId, bandWidth, contractPeriod====> '+planId+', '+bandWidth+', '+contractPeriod); 
        List<ChikPeaTOM__Plan_Factor__c> planFactors = [select Id, ChikPeaTOM__bandwidth__c, 
        ChikPeaTOM__Contract_Period_Month__c, ChikPeaTOM__Mrc__c, ChikPeaTOM__Nrc__c from ChikPeaTOM__Plan_Factor__c 
                where ChikPeaTOM__service_plan__c =: planId and ChikPeaTOM__bandwidth__c =: bandWidth and ChikPeaTOM__Contract_Period_Month__c =: contractPeriod limit 1];
        System.debug('#****planFactors====> '+planFactors);                 
        if(planFactors.size()>0){
            return planFactors[0];
        }else{
            return null;
        }
    }
    @AuraEnabled
    public static List<QuoteLinePlan> getQuoteLinePlans(Id quoteId, Id parentPlanId){
        
        System.debug('#****quoteId ====> '+quoteId);                
        System.debug('#****parentPlanId ====> '+parentPlanId);

        List<ChikPeaTOM__Bundled_Plan__c> bundle_list=[select Id, Name,
                ChikPeaTOM__Child_Plan__c, ChikPeaTOM__Parent_Plan__c, ChikPeaTOM__Bundle_Type__c, 
                    ChikPeaTOM__Child_Plan__r.ChikPeaTOM__MRC__c,ChikPeaTOM__Child_Plan__r.ChikPeaTOM__NRC__c,ChikPeaTOM__Qty__c,
                        ChikPeaTOM__Child_Plan__r.ChikPeaTOM__Description__c from ChikPeaTOM__Bundled_Plan__c 
                        where ChikPeaTOM__Parent_Plan__c =:parentPlanId limit 2000];
        System.debug('#****bundle size='+bundle_list.size());                                        
        
        Set<Id> reqChildPlanId = new Set<Id>();    
        reqChildPlanId.add(parentPlanId);   

        Set<Id> recChildPlanId = new Set<Id>();                                        
        for(ChikPeaTOM__Bundled_Plan__c bundle:bundle_list){
            if(bundle.ChikPeaTOM__Bundle_Type__c == 'Required')
            reqChildPlanId.add(bundle.ChikPeaTOM__Child_Plan__c);
            else if(bundle.ChikPeaTOM__Bundle_Type__c == 'Recommended')
            recChildPlanId.add(bundle.ChikPeaTOM__Child_Plan__c);
        }

        List<ChikPeaTOM__Service_Plan__c> reqChildRecords = [Select Id,Name,ChikPeaTOM__Plan_Category__c,ChikPeaTOM__Service_Type__c, 
        ChikPeaTOM__Pricing_Type__c, ChikPeaTOM__MRC__c,ChikPeaTOM__NRC__c, ChikPeaTOM__Active__c,
        ChikPeaTOM__Line_Per_Qty__c From ChikPeaTOM__Service_Plan__c 
                where ChikPeaTOM__Active__c = true and Id In:reqChildPlanId Order by Name limit 10000];

        System.debug('#****reqChildRecords size='+reqChildRecords.size());   

        List<QuoteLinePlan> qlpList = new List<QuoteLinePlan>();

        for(ChikPeaTOM__Service_Plan__c plan:reqChildRecords){
            QuoteLinePlan qlp = createQuoteLinePlan(quoteId, plan);
            qlp.planType = 'Required';
            qlp.added = true;
            //adding parent quote line
            if(plan.id == parentPlanId){
                qlp.isParent = true;
            }
            qlpList.add(qlp);
        }

        List<ChikPeaTOM__Service_Plan__c> recChildRecords = [Select Id,Name,ChikPeaTOM__Plan_Category__c,ChikPeaTOM__Service_Type__c, 
        ChikPeaTOM__Pricing_Type__c, ChikPeaTOM__MRC__c,ChikPeaTOM__NRC__c, ChikPeaTOM__Active__c,
        ChikPeaTOM__Line_Per_Qty__c From ChikPeaTOM__Service_Plan__c 
                where ChikPeaTOM__Active__c = true and Id In:recChildPlanId Order by Name limit 10000];

        System.debug('#****recChildRecords size='+recChildRecords.size());   
        
    
        for(ChikPeaTOM__Service_Plan__c plan:recChildRecords){
            QuoteLinePlan qlp = createQuoteLinePlan(quoteId, plan);
            qlp.planType = 'Recommended';
            qlp.added = false;
            qlpList.add(qlp);
        }  
        return qlpList;
    }
    public static QuoteLinePlan createQuoteLinePlan(Id quoteId, ChikPeaTOM__Service_Plan__c plan){
        QuoteLinePlan qlp = new QuoteLinePlan();
        qlp.plan = plan;
        qlp.planId = plan.id;
        qlp.term = 12;
        qlp.bandwidth = 0;
        qlp.qty = 1;
        qlp.linePerQty = plan.ChikPeaTOM__Line_Per_Qty__c;
        qlp.mrc = plan.ChikPeaTOM__MRC__c;
        qlp.nrc = plan.ChikPeaTOM__NRC__c;
        qlp.changeMRC = false;
        qlp.changeNRC = false;
        qlp.planName = plan.name;

        ChikPeaTOM__Quote_Line__c ql = new ChikPeaTOM__Quote_Line__c();
        ql.ChikPeaTOM__Quote__c = quoteId;
        ql.ChikPeaTOM__Service_Plan__c = plan.Id;
        
        qlp.ql = ql;

        return qlp;
    }
    //combination of required and recomended plan
    public class QuoteLinePlan{
        public QuoteLinePlan(){
            isParent = false;
        }
        @AuraEnabled public ChikPeaTOM__Quote_Line__c ql{get;set;}
        @AuraEnabled public ChikPeaTOM__Service_Plan__c plan{get;set;}
        @AuraEnabled public Boolean isParent{get;set;}
        //@AuraEnabled public  List<Options> term{get;set;}
        @AuraEnabled public String planName{get;set;}
        @AuraEnabled public Integer term{get;set;}
        @AuraEnabled public String planId {get;set;}
        @AuraEnabled public String planType {get;set;}
        @AuraEnabled public Boolean added {get;set;}
        @AuraEnabled public Decimal mrc {get;set;}
        @AuraEnabled public Decimal nrc {get;set;}
        @AuraEnabled public Boolean changeMRC{get;set;}
        @AuraEnabled public Boolean changeNRC{get;set;}
        @AuraEnabled public Integer bandwidth {get;set;}
        @AuraEnabled public Integer qty {get;set;}
        @AuraEnabled public Boolean linePerQty {get;set;}
    }

    public class REquipmentInQuote{
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
            savedQL = new List<ChikPeaTOM__Quote_Line__c>();
        }
        public Exception e;
        @AuraEnabled public Integer statusCode{ get; set; }
        @AuraEnabled public String message{ get; set; }
        @AuraEnabled public List<ChikPeaTOM__Quote_Line__c> savedQL{get; set;}
    }
}