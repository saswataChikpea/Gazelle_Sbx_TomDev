import { LightningElement,api,track } from 'lwc'
import getResults from '@salesforce/apex/LWCCustomLookupControllerCustom.getResults'
import getResultsForPremise from '@salesforce/apex/LWCCustomLookupControllerCustom.getResultsForPremise'
import getResultsForPremise2 from '@salesforce/apex/LWCCustomLookupControllerCustom.getResultsForPremise2'
import getResultsForSerial from '@salesforce/apex/LWCCustomLookupControllerCustom.getResultsForSerial'

export default class LwcCustomLookupCustom extends LightningElement {
    @api getIdFromParent;
    @api objectName
    @api objectLabel
    @api fieldName = 'Name'
    @api fieldName2 = 'Name'
    @api selectRecordId = ''
    @api selectRecordName
    @api lookuplabel
    @api searchRecords = []
    @api required = false
    @api iconName = 'action:new_account'
    @api LoadingText = false
    @api hidecreatenew = false
    @api forserial = false
    @track txtclassname = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click'
    @track messageFlag = false
    @track iconFlag =  true
    @track clearIconFlag = false
    @track inputReadOnly = false
    @track premiseObj = false
    timeoutId

    @api
    setRecordName(name,recordId){
        this.selectRecordName = name
        this.selectRecordId = recordId
    }

    connectedCallback(){
        if(this.objectName === "ChikPeaTOM__Premise__c")
            this.premiseObj = true
    }

    handleFocus(event){
        console.log("1==========handleFocus= "+event)
        console.log("record ID - ",this.getIdFromParent);
        var currentText='a'
        this.LoadingText = true
        this.searchRecords = undefined

        this.searchRecords = []
        if(!this.hidecreatenew){
            this.searchRecords.push({recName:'Create New', recId: undefined})
            this.txtclassname =  'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-is-open' 
        }
        if(this.objectName === "ChikPeaTOM__Premise__c"){
            console.log("Premise");
            getResultsForPremise2({ ObjectName: this.objectName, fieldName: this.fieldName2, value: currentText, hidecreatenew: this.hidecreatenew,qId: this.getIdFromParent })
            .then(result => {
                this.searchRecords= result
                console.log("1==========PsearchRecords= "+JSON.stringify(this.searchRecords, null, '\t'))
                this.LoadingText = false
                
                this.txtclassname =  result.length > 0 ? 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-is-open' : 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click'
                if(currentText.length > 0 && result.length === 0) {
                    this.messageFlag = true
                }
                else {
                    this.messageFlag = false
                }

                if(this.selectRecordId != null && this.selectRecordId.length > 0) {
                    this.iconFlag = false
                    this.clearIconFlag = true
                }
                else {
                    this.iconFlag = true
                    this.clearIconFlag = false
                }
            })
            .catch(error => {
                console.log('-------error-------------'+error)
                console.log(error)
            })
        }
    }
    handelFocusOut(event){
        event.preventDefault()
        const currentText = event.target.value
        
        if(currentText.length === 0 ) {
            console.log("1==========delay function= ")
            clearTimeout(this.timeoutId); // no-op if invalid id
            this.timeoutId = setTimeout(this.hideWithDelay.bind(this), 200);
        }
        console.log("1==========handelFocusOut= "+event)
    }
    hideWithDelay() {
        this.searchRecords = undefined
        this.txtclassname = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click'
    }
    searchField(event) {
        var currentText = event.target.value
        this.LoadingText = true
        this.searchRecords = undefined
        if(this.forserial){
            getResultsForSerial({ ObjectName: this.objectName, fieldName: this.fieldName, value: currentText  })
            .then(result => {
                this.searchRecords= result
                console.log("1==========searchRecords= "+JSON.stringify(this.searchRecords, null, '\t'))
                this.LoadingText = false
                
                this.txtclassname =  result.length > 0 ? 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-is-open' : 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click'
                if(currentText.length > 0 && result.length === 0) {
                    this.messageFlag = true
                }
                else {
                    this.messageFlag = false
                }

                if(this.selectRecordId != null && this.selectRecordId.length > 0) {
                    this.iconFlag = false
                    this.clearIconFlag = true
                }
                else {
                    this.iconFlag = true
                    this.clearIconFlag = false
                }
            })
            .catch(error => {
                console.log('-------error--------serial '+JSON.stringify(error))
                console.log(error)

            })
        }
        else if(this.objectName === "ChikPeaTOM__Premise__c"){
            getResultsForPremise({ ObjectName: this.objectName, fieldName: this.fieldName2, value: currentText, hidecreatenew: this.hidecreatenew,qId: this.getIdFromParent })
            .then(result => {
                this.searchRecords= result
                console.log("1==========PsearchRecords= "+JSON.stringify(this.searchRecords, null, '\t'))
                this.LoadingText = false
                
                this.txtclassname =  result.length > 0 ? 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-is-open' : 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click'
                if(currentText.length > 0 && result.length === 0) {
                    this.messageFlag = true
                }
                else {
                    this.messageFlag = false
                }

                if(this.selectRecordId != null && this.selectRecordId.length > 0) {
                    this.iconFlag = false
                    this.clearIconFlag = true
                }
                else {
                    this.iconFlag = true
                    this.clearIconFlag = false
                }
            })
            .catch(error => {
                console.log('-------error-------------'+error)
                console.log(error)
            })
        }
        else{
            getResults({ ObjectName: this.objectName, fieldName: this.fieldName, value: currentText, hidecreatenew: this.hidecreatenew  })
            .then(result => {
                this.searchRecords= result
                console.log("1==========searchRecords= "+JSON.stringify(this.searchRecords, null, '\t'))
                this.LoadingText = false
                
                this.txtclassname =  result.length > 0 ? 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-is-open' : 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click'
                if(currentText.length > 0 && result.length === 0) {
                    this.messageFlag = true
                }
                else {
                    this.messageFlag = false
                }

                if(this.selectRecordId != null && this.selectRecordId.length > 0) {
                    this.iconFlag = false
                    this.clearIconFlag = true
                }
                else {
                    this.iconFlag = true
                    this.clearIconFlag = false
                }
            })
            .catch(error => {
                console.log('-------error-------------'+error)
                console.log(error)
            })
        }   
    }
    
   setSelectedRecord(event) {
        var currentText = event.currentTarget.dataset.id
        var selectName = event.currentTarget.dataset.name
        console.log("-------setSelectedRecord ")
        if(currentText != null){
            this.txtclassname =  'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click'
            this.iconFlag = false
            this.clearIconFlag = true
            this.selectRecordName = event.currentTarget.dataset.name
            this.selectRecordId = currentText
            this.inputReadOnly = true
            const selectedEvent = new CustomEvent('selected', { 
                detail: {selectedName:selectName,selectedId:currentText}
            })
            // Dispatches the event.
            this.dispatchEvent(selectedEvent)
        }else{
            const selectedEvent = new CustomEvent('createnew', { 
                detail: {selectedName:selectName}
            })
            // Dispatches the event.
            this.dispatchEvent(selectedEvent)
        }
    }
    
    resetData(event) {
        console.log(event)
        this.selectRecordName = ""
        this.selectRecordId = ""
        this.inputReadOnly = false
        this.iconFlag = true
        this.clearIconFlag = false
       
    }

}