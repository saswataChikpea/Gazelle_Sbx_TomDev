({
    doInit : function(component, event, helper) {
        //alert('project doInit called.');
        var record_id= component.get("v.pageReference").state.c__id;
        console.log('openSubchangehelper log doInit: '+record_id);
        
        component.set("v.recordId",record_id);
	},
    reInit : function(component, event, helper) {
    	$A.get('e.force:refreshView').fire();
	},
})