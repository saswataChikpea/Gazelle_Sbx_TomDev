({
    doInit : function(component, event, helper) {
        var recordId = component.get('v.recordId');
        var pageReference = component.find("navigation");
        var pageReferenceNav = {
            type: 'standard__component',
            attributes: {
                componentName: 'c__dcfUpdateHelper'
            },
            state: {
                c__id : recordId
            }
        };
        pageReference.navigate(pageReferenceNav);
    }
})