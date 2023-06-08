import { LightningElement,api, track } from 'lwc'
import CARIER_LOOKUP_FIELD from '@salesforce/schema/ChikPeaTOM__Quote_Line_Carrier__c.ChikPeaTOM__Carrier__c'
import addPremiseCarrier from '@salesforce/apex/AddLocCarrier.addPremiseCarrier'
import getMapKey from '@salesforce/apex/QuoteLineHierarchy.getMapKey'
// importing to show toast notifictions
import {ShowToastEvent} from 'lightning/platformShowToastEvent'
import { NavigationMixin } from 'lightning/navigation';

export default class QuoteAddPremiseCarrierCustom extends NavigationMixin(LightningElement) {
    @api recordId
    @track bShowModal
    @track bShowCreatePremise
    @track bShowCreateCarrier
    @track carierFields=[CARIER_LOOKUP_FIELD]
    @track bundleQL = false
    premiseName
    premiseId
    carrierName
    carrierId
    selectedQuoteLine
    inputObject = {isPrimary:true}//set is Primary default checked
    showSpinner=false;

    @track quoteColumns = [
        {
            type: 'url',
            fieldName: 'ql_id',
            label: 'Quote Line',
            initialWidth: 200,
            typeAttributes:{
                label: {fieldName:'Name'},
                target: '_blank'
            }
        },
        {
            type: 'text',
            fieldName: 'Plan_Equipemnt',
            label: 'Service Plan'
        },
        {
            type: 'number',
            fieldName: 'ChikPeaTOM__Contract_Period__c',
            label: 'Contract Period',
            cellAttributes: { alignment: 'left' },
            initialWidth: 150
        },
        {
            type: 'text',
            fieldName: 'suite',
            label: 'Suite',
            initialWidth: 150
        },
        {
            type: 'url',
            fieldName: 'primary_site_url',
            label: 'Primary Site',
            initialWidth: 200,
            typeAttributes:{
                label: {fieldName:'primary_site'},
                target: '_blank'
            }
        }
    ]

    gridColumns = [
        {
            type: 'url',
            fieldName: 'ql_id',
            label: 'Quote Line',
            typeAttributes:{
                label: {fieldName:'Name'},
                target: '_blank'
            }
        },
        {
            type: 'text',
            fieldName: 'Plan_Equipemnt',
            label: 'Service Plan'
        },
        {
            type: 'button',
            label: 'Action',
            typeAttributes: {
                label: 'Add', name: 'add_loc_carrier', title: 'Add'
            }
        }
    ]

    connectedCallback(){
        getMapKey({}).then(data=>{
            if(data && data.length > 0){
                this.quoteColumns.push({ 
                    type: 'image',
                    label: 'Premise', 
                    fieldName: 'map_url'
                })
                this.quoteColumns = [...this.quoteColumns]
            }
        })
        console.log('quote columns: '+JSON.stringify(this.quoteColumns, null, '\t'))
    }

    quoteLineRowAction(event){
        //let row = event.detail.row
        console.log('quoteLineRowAction event ====> ' + JSON.stringify(event))
        //console.log('quoteLineRowAction event.detail.action ====> ' + JSON.stringify(event.detail.event.action))
        console.log("#******quoteId= "+this.recordId)
        //console.log("1==========event= "+JSON.stringify(event, null, '\t'))
        //console.log("#******action= "+event.detail.action.name)
        if(event.detail.event.action.name === 'add_loc_carrier'){
            this.bShowModal = true
            this.selectedQuoteLine = event.detail.event.row
            console.log("1==========selectedQuoteLine= "+JSON.stringify(this.selectedQuoteLine, null, '\t'))
            if(this.selectedQuoteLine.hasChildren)
                this.bundleQL = true
        }
        
    }
    handleChange(event){
        //console.log("1==========event= "+event)
        console.log('Current value of the input: ' + event.target.value);
        console.log('Current type of the input: ' + event.target.name);
        
        //console.log("2==========event.detail= "+JSON.stringify(event.detail, null, '\t'))
        this.inputObject[event.target.name]=event.target.value
        console.log("2==========inputObject= "+JSON.stringify(this.inputObject, null, '\t'))
        //console.log("1==========inputObject= "+this.inputObject)
    }
    handleCheckBoxChange(event){
        console.log('1checkbox: ' + event.target.checked);
        this.inputObject[event.target.name]=event.target.checked
        console.log("2==========inputObject= "+JSON.stringify(this.inputObject, null, '\t'))
    }
    handleSubmit(event){
        var quoteLines = []
        event.preventDefault();       // stop the form from submitting
        //const fields = event.detail.fields
        //console.log("1==========event= "+JSON.stringify(event, null, '\t'))
        console.log("quoteId="+this.recordId)
        console.log("premiseId="+this.premiseId)
        const quoteLineHierarchy = this.template.querySelector('c-quote-line-hierarchy-custom')
        const allQuoteLines = quoteLineHierarchy.allQuoteLines
        
        if(this.inputObject.isForAll){
            quoteLines = allQuoteLines
        }else{
            quoteLines.push(this.selectedQuoteLine)
        }
        console.log("#****quoteLines="+JSON.stringify(quoteLines, null, '\t'))

        if(this.premiseId){
            var r = true
            console.log(r);
            if(!this.carrierId)
                r=confirm('Do you Want to Proceed without Saving Carrier?')
            if(r){
                this.showSpinner=true
                addPremiseCarrier({quoteLines: quoteLines, 
                    premiseId: this.premiseId,
                    suite: this.inputObject.suite_no,
                    primary: this.inputObject.isPrimary,
                    applyToAll: this.inputObject.isForAll,
                    applyToChild: this.inputObject.isForChild,
                    carrier: this.carrierId
                }).then(result => {
                    console.log("add loc carrier result="+JSON.stringify(result, null, '\t'))
                    // showing success message
                    if(result.statusCode === 100){
                        this.showSpinner=false
                        this.dispatchEvent(new ShowToastEvent({
                            title: 'Success!!',
                            message: 'Premise & Carrier added Successfully.',
                            variant: 'success'
                        }),)
                        const event1 = new CustomEvent('closequickaction', {
                            // detail contains only primitives
                            detail: {message:"Premise & Carrier added successfully",statusCode:100}
                        });
                        this.dispatchEvent(event1);

                    }else{
                        this.error = true
                    }
                    //refreshApex(this.records)
                    this.showLoadingSpinner = false
                })
                .catch(error => {
                    //this.error = true
                    console.error("#****1add location carrier error="+JSON.stringify(error, null, '\t'))
                    if (Array.isArray(error.body)) {
                        this.addPlanError = error.body.map(e => e.message).join(', ')
                    } else if (typeof error.body.message === 'string') {
                        this.addPlanError = error.body.message
                    }
                    console.log('#****location carrier event='+event)
                    this.dispatchEvent(new ShowToastEvent({
                        title: 'Error',
                        message: this.addPlanError,
                        variant: 'error',
                        mode: 'sticky'
                    }),)
                })
            }
        }else{
            this.dispatchEvent(new ShowToastEvent({
                title: 'Error',
                message: 'Premise needs to be selected',
                variant: 'error'
            }),)
        }
    }
    lookupSelected(event){
        console.log("1==========event= "+JSON.stringify(event, null, '\t'))
        this.premiseName = event.detail.selectedName
        this.premiseId = event.detail.selectedId
     }
    carrierLookupSelected(event){
        console.log("1==========event= "+JSON.stringify(event, null, '\t'))
        this.carrierName = event.detail.selectedName
        this.carrierId = event.detail.selectedId
     }
    createNewPremise(event){
        console.log("1==========event= "+JSON.stringify(event, null, '\t'))
        this.bShowCreatePremise = true
    }
    handleCreatePremise(event){
        console.log("1==========event= "+event)
        const quoteLineHierarchy = this.template.querySelector('c-create-premise')
        const res = quoteLineHierarchy.createPremiseRecord()
        console.log("1==========event= "+JSON.stringify(res, null, '\t'))
        this.closePremiseModal()
    }
    createNewCarrier(event){
        console.log("1==========event= "+JSON.stringify(event, null, '\t'))
        this.bShowCreateCarrier = true
    }
    handleCreateCarrier(event){
        console.log("1==========event= "+event)
        const quoteLineHierarchy = this.template.querySelector('c-create-carrier')
        const res = quoteLineHierarchy.createCarrier()
        console.log("1==========event= "+JSON.stringify(res, null, '\t'))
        this.closeCarrierModal()
    }
    // closing modal box
    closeModal() {
        this.bShowModal = false
    }
    closePremiseModal(event){
        console.log("1==========event data= "+JSON.stringify(event.detail.data, null, '\t'))
        if(event.detail.data){
            this.premiseName = event.detail.data.fields.Name.value
            this.premiseId = event.detail.data.id
            console.log("------close premiseId "+this.premiseId)
            console.log("------close premiseName "+this.premiseName)
            const lwcLookup = this.template.querySelectorAll('c-lwc-custom-lookup')
            lwcLookup[0].setRecordName(this.premiseName,this.premiseId)
        }
        this.bShowCreatePremise = false
    }
    closeCarrierModal(event){
        console.log("1==========event= "+JSON.stringify(event, null, '\t'))
        if(event.detail.data){
            this.carrierName = event.detail.data.fields.Name.value
            this.carrierId = event.detail.data.id
            const lwcLookup = this.template.querySelectorAll('c-lwc-custom-lookup')
            lwcLookup[1].setRecordName(this.carrierName,this.carrierId)
        }
        this.bShowCreateCarrier = false
    }
}