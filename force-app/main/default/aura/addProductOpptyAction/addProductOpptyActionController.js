({
	
	closeQuickAction : function(component, event, helper) {
		console.log('close and refresh')
		var dismissActionPanel = $A.get("e.force:closeQuickAction")
		dismissActionPanel.fire()
		$A.get('e.force:refreshView').fire()
		//console.log('second quote id ' +qId)
		//var navEvt = $A.get("e.force:navigateToSObject")
		/*navEvt.setParams({
			"recordId": qId
		})
		navEvt.fire()*/ 
	},
	handleplanselected : function(component, event, helper) {
		var recordId = component.get("v.recordId")
		var selectedPlanId = event.getParam("selectedPlanId")
		console.log('aura handleplanselected selectedPlanId : '+selectedPlanId)
		console.log('aura handleplanselected controller id : '+recordId)
    	var pageReference = component.find("navigation")
        var pageReferenceNav = {
    		"type": "standard__component",
    		"attributes": {
				"componentName": "addProductOpptyMaster",
				"detail": {
					"recordId" : recordId,
					"planId":selectedPlanId
				}
			},
    		"state": {
    		}
		}
    	pageReference.navigate(pageReferenceNav)
	}
})