@isTest
/*
** Class         :  TestData
** Created by    :  Mehebub Hossain (chikpea Inc.)
** Crated On     :  27-Apr-15
** Description   :  Common data setup for test classes
*/


public with sharing class TestData {
	/*
		
	*/
	public static List<ChikPeaTOM__Service_Plan__c> plan_list;
	public static List<ChikPeaTOM__Bundled_Plan__c> bundle_list;
	public static ChikPeaTOM__Price_Book__c std_price_book;
	public static ChikpeaTOM__Config__c conf1;
	/*
	plan2 is bundled with plan1 as required and recommeded
	
	plan1
	  |
	  |
	 plan2(Required)
	  |    |
	  |    |
	  |   plan3(Required)
	  |      
	  |      
	 plan2(Recommened) 
	 |    |
	 |    |    
	 |    plan3(Required)
	 |
	 plan4(Required,External Pricing)       
	*/
	public static void PlanSetup(){
		 ChikPeaTOM__TOM_Setting__c tom_set=new ChikPeaTOM__TOM_Setting__c();
		 insert tom_set;
		 plan_list=new List<ChikPeaTOM__Service_Plan__c>(); 
		 ChikPeaTOM__Service_Plan__c plan1=new ChikPeaTOM__Service_Plan__c(ChikPeaTOM__MRC__c=2.08,ChikPeaTOM__NRC__c=1.81
        ,ChikPeaTOM__Active__c=true);
        plan1.ChikPeaTOM__Pricing_Type__c='Config Pricing';
        plan1.ChikPeaTOM__Service_Type__c='Bundle';
        plan_list.add(plan1);
        
        ChikPeaTOM__Service_Plan__c plan2=new ChikPeaTOM__Service_Plan__c(ChikPeaTOM__MRC__c=2.08,ChikPeaTOM__NRC__c=1.81
        ,ChikPeaTOM__Active__c=true);
        plan2.ChikPeaTOM__Service_Type__c='Data';
        plan2.ChikPeaTOM__Pricing_Type__c='Config Pricing';
        plan_list.add(plan2);
        
        ChikPeaTOM__Service_Plan__c plan3=new ChikPeaTOM__Service_Plan__c(ChikPeaTOM__MRC__c=2.08,ChikPeaTOM__NRC__c=1.81
        ,ChikPeaTOM__Active__c=true);
        plan3.ChikPeaTOM__Service_Type__c='Data';
        plan3.ChikPeaTOM__Pricing_Type__c='Config Pricing';
        plan_list.add(plan3);
        
        ChikPeaTOM__Service_Plan__c plan4=new ChikPeaTOM__Service_Plan__c(ChikPeaTOM__MRC__c=2.08,ChikPeaTOM__NRC__c=1.81
        ,ChikPeaTOM__Active__c=true);
        plan4.ChikPeaTOM__Service_Type__c='Data';
        plan4.ChikPeaTOM__Pricing_Type__c='External';
        plan_list.add(plan4);
        
        insert plan_list;
        
        bundle_list=new List<ChikPeaTOM__Bundled_Plan__c>();
        
        ChikPeaTOM__Bundled_Plan__c b_plan1=new ChikPeaTOM__Bundled_Plan__c(ChikPeaTOM__Bundle_Type__c='Required',
        ChikPeaTOM__Parent_Plan__c=plan1.Id, ChikPeaTOM__Child_Plan__c=plan2.Id);
        bundle_list.add(b_plan1);
        
        ChikPeaTOM__Bundled_Plan__c b_plan2=new ChikPeaTOM__Bundled_Plan__c(ChikPeaTOM__Bundle_Type__c='Recommended',
        ChikPeaTOM__Parent_Plan__c=plan1.Id, ChikPeaTOM__Child_Plan__c=plan2.Id);
        bundle_list.add(b_plan2);
        
        ChikPeaTOM__Bundled_Plan__c b_plan3=new ChikPeaTOM__Bundled_Plan__c(ChikPeaTOM__Bundle_Type__c='Required',
        ChikPeaTOM__Parent_Plan__c=plan2.Id, ChikPeaTOM__Child_Plan__c=plan3.Id);
        bundle_list.add(b_plan3);
        
        ChikPeaTOM__Bundled_Plan__c b_plan4=new ChikPeaTOM__Bundled_Plan__c(ChikPeaTOM__Bundle_Type__c='Required',
        ChikPeaTOM__Parent_Plan__c=plan1.Id, ChikPeaTOM__Child_Plan__c=plan4.Id);
        bundle_list.add(b_plan4);
        
        insert bundle_list;
        
        std_price_book=new ChikPeaTOM__Price_Book__c(Name='Standard');          
        insert std_price_book;
        
        ChikPeaTOM__Plan_Price_Book__c plan_price_book1=new ChikPeaTOM__Plan_Price_Book__c(ChikPeaTOM__Plan__c=plan1.Id,
         ChikPeaTOM__Price_Book__c=std_price_book.Id);
		
		List<ChikpeaTOM__Config__c> conf_list=new List<ChikpeaTOM__Config__c>();
        conf1=new ChikpeaTOM__Config__c();
        conf1.Name='conf1';
        conf1.ChikPeaTOM__Plan__c=plan1.Id; 
        conf1.ChikPeaTOM__Display_Seq__c=1;  
        conf1.ChikPeaTOM__Type__c='CPQ'; 
        conf1.ChikPeaTOM__Data_Type__c='Text';
        //conf1.Config_Question__c='?'; 
        conf_list.add(conf1);
        
        ChikpeaTOM__Config__c conf2=new ChikpeaTOM__Config__c();//external pricing
        conf2.Name='conf2';
        conf2.ChikPeaTOM__Plan__c=plan4.Id; 
        conf2.ChikPeaTOM__Display_Seq__c=1;  
        conf2.ChikPeaTOM__Type__c='CPQ'; 
        conf2.ChikPeaTOM__Data_Type__c='Text';
        conf_list.add(conf2);
       
        ChikpeaTOM__Config__c conf3=new ChikpeaTOM__Config__c();//external pricing
        conf3.Name='conf3';
        conf3.ChikPeaTOM__Plan__c=plan4.Id; 
        conf3.ChikPeaTOM__Display_Seq__c=1;  
        conf3.ChikPeaTOM__Type__c='CPQ'; 
        conf3.ChikPeaTOM__Data_Type__c='Text';
        //conf3.External_Parameter_Type__c='Simple';
        conf_list.add(conf3);
        
        ChikpeaTOM__Config__c conf4=new ChikpeaTOM__Config__c();//external pricing
        conf4.Name='conf3';
        conf4.ChikPeaTOM__Plan__c=plan4.Id; 
        conf4.ChikPeaTOM__Display_Seq__c=1;  
        conf4.ChikPeaTOM__Type__c='CPQ'; 
        conf4.ChikPeaTOM__Data_Type__c='Text';
        //conf4.External_Parameter_Type__c='Complex';
        conf_list.add(conf4);
        
        ChikpeaTOM__Config__c conf5=new ChikpeaTOM__Config__c();//external pricing
        conf5.Name='conf3';
        conf5.ChikPeaTOM__Plan__c=plan4.Id; 
        conf5.ChikPeaTOM__Display_Seq__c=1;  
        conf5.ChikPeaTOM__Type__c='CPQ'; 
        conf5.ChikPeaTOM__Data_Type__c='Text';
        //conf5.External_Parameter_Type__c='Both';
        conf_list.add(conf5);
        
        insert conf_list;
        
        ChikPeaTOM__Plan_Query__c plan_query1=new ChikPeaTOM__Plan_Query__c(name='PlanQ');
        plan_query1.ChikPeaTOM__Plan__c=plan1.Id;   
        
        insert plan_query1; 
		System.debug('#****plan_query1='+plan_query1);
		
        ChikPeaTOM__Query_Config__c query_config1=new ChikPeaTOM__Query_Config__c();
        query_config1.ChikPeaTOM__Config__c=conf1.Id;
        query_config1.ChikPeaTOM__Plan_Query__c=plan_query1.Id;   
        insert query_config1;
        
        ChikPeaTOM__Plan_Factor__c plan_factor1=new ChikPeaTOM__Plan_Factor__c();
        plan_factor1.ChikPeaTOM__MRC__c=1.00;
        plan_factor1.ChikPeaTOM__NRC__c=1.00;
        plan_factor1.ChikPeaTOM__COS__c=1.00;
        plan_factor1.ChikPeaTOM__CAPEX__c=1.00;
        plan_factor1.ChikPeaTOM__OPEX__c=1.00;
        plan_factor1.ChikPeaTOM__Plan_Query__c=plan_query1.Id;
        plan_factor1.ChikPeaTOM__Price_Book__c=std_price_book.Id;
        plan_factor1.ChikPeaTOM__Service_Plan__c=plan1.Id;
        insert plan_factor1;
        
        ChikPeaTOM__Rate_Element__c rate_ele1=new ChikPeaTOM__Rate_Element__c();
        rate_ele1.ChikPeaTOM__Config__c=conf1.Id;
        rate_ele1.ChikPeaTOM__Plan_Rates__c=plan_factor1.Id;
        rate_ele1.ChikPeaTOM__Value__c='conf1';
        insert rate_ele1;
	}
}