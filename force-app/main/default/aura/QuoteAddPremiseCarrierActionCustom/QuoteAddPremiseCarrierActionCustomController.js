({
    closeQuickAction : function(component, event, helper) {
        console.log('close and refresh');
        var dismissActionPanel = $A.get("e.force:closeQuickAction");
        dismissActionPanel.fire();
    }
})