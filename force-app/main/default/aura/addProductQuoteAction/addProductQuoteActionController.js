({
	closeQuickAction : function(component, event, helper) {
		console.log('close and refresh');
		$A.get("e.force:closeQuickAction").fire();
        $A.get('e.force:refreshView').fire();
	}
})