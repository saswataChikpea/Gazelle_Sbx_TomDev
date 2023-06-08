/* eslint-disable array-callback-return */
/* eslint-disable no-console*/
import { LightningElement,wire,api, track } from 'lwc'
//import { refreshApex } from '@salesforce/apex';
import getPlanList from '@salesforce/apex/SearchProduct.getPlanList'
import { getPicklistValues } from 'lightning/uiObjectInfoApi'
import CATEGORY_FIELD from '@salesforce/schema/ChikPeaTOM__Service_Plan__c.ChikPeaTOM__Plan_Category__c'
import SERVICE_TYPE_FIELD from '@salesforce/schema/ChikPeaTOM__Service_Plan__c.ChikPeaTOM__Service_Type__c'
// importing to show toast notifictions
import {ShowToastEvent} from 'lightning/platformShowToastEvent'

export default class searchProduct extends LightningElement {
    @api recordId
    @api searchQuery = ""
    @track records
    @track recordFound = false
    @track picklistValues
    @track serviceTypePicklistValues
    @track error
    @track showLoadingSpinner = false
    @track bShowModal = false
    @track isActive = true
    @track selectedParentPlanName
    @track selectedParentPlanId
    @track selectedRows = []
    namePart = ""
    name = ""
    planCategory = ""
    serviceType = ""
    keyNone="none"
    @track draftValues = [];
    
    @track columns = [
    {
        label: 'Select',
        type: 'button',
        typeAttributes: {
            label: 'Select', name: 'add_plan', title: 'Select'
        }
    },
    { label: 'Name', fieldName: 'Name', editable: false },
    { label: 'Plan Category', fieldName: 'ChikPeaTOM__Plan_Category__c', editable: false },
    { label: 'Service Type', fieldName: 'ChikPeaTOM__Service_Type__c', editable: false },
    { label: 'Pricing Type', fieldName: 'ChikPeaTOM__Pricing_Type__c', editable: false },
    { label: 'UNIT MRC', fieldName: 'ChikPeaTOM__MRC__c', type: 'currency', editable: false, cellAttributes: { alignment: 'left' }},
    { label: 'UNIT NRC', fieldName: 'ChikPeaTOM__NRC__c', type: 'currency', editable: false, cellAttributes: { alignment: 'left' }}]

    @track reqChildColumns = [
        
        { label: 'Service Plan', fieldName: 'planName', type: 'text', editable: false },
        { label: 'UNIT MRC', fieldName: 'mrc', type: 'currency', editable: false, cellAttributes: { alignment: 'left' }},
        { label: 'Change MRC', fieldName: 'changeMRC', type: 'boolean', editable: true },
        { label: 'UNIT NRC', fieldName: 'nrc', type: 'currency', editable: false, cellAttributes: { alignment: 'left' }},
        { label: 'Change NRC', fieldName: 'changeNRC', type: 'boolean', editable: true },
        { label: 'Bandwidth', fieldName: 'bandwidth', type: 'number', editable: true },
        { label: 'Qty', fieldName: 'qty', type: 'number', editable: true },
        { label: 'Term', fieldName: 'term', type: 'number', editable: true,cellAttributes: { alignment: 'left' } },
        { label: 'Plan Type', fieldName: 'planType', type: 'text', editable: false }
        
    ]

    @wire(getPicklistValues, {
        recordTypeId: '012000000000000AAA',
        fieldApiName: CATEGORY_FIELD
    })
    categoryPickListValues(result){
        //let abc = this.recordTypeId()
        //console.log("#****abc="+abc)
        if (result.data) {
            console.log("#****pick list data received")
            let tempPicklistValues = [{label: '-Select-',value: ''},
            {label: 'None',value: 'none'}] 
            this.picklistValues = tempPicklistValues.concat(result.data.values)
        }else if(result.error){
            console.error("#****error getting pick list values="+result.error)
            this.picklistValues = undefined
        }
    }
    @wire(getPicklistValues, {
        recordTypeId: '012000000000000AAA',
        fieldApiName: SERVICE_TYPE_FIELD
    })
    serviceTypePickListValues(result){
        //let abc = this.recordTypeId()
        //console.log("#****abc="+abc)
        if (result.data) {
            console.log("#****service type pick list data received")
            let tempPicklistValues = [{label: '-Select-',value: ''}] 
            this.serviceTypePicklistValues = tempPicklistValues.concat(result.data.values)
        }else if(result.error){
            console.error("#****error getting service type pick list values="+result.error)
            this.serviceTypePicklistValues = undefined
        }
    }

    @wire (getPlanList, { wherePart: '$searchQuery', limitTxt: '30'})
    handleGetPlan(result){
        this.showLoadingSpinner = false
        if (result.data) {
            console.log("#****plan data received")
            this.records = result.data
            this.recordFound = result.data.length > 0
            this.error = undefined
        }else if(result.error){
            console.error("#****error in plan data="+result.error)
            this.error = result.error
            this.records = undefined
            this.recordFound = false
        }
    }

    handleRowActions(event) {
        let actionName = event.detail.action.name

        window.console.log('actionName ====> ' + actionName)

        let row = event.detail.row

        window.console.log('row ====> ' + row)
        // eslint-disable-next-line default-case
        switch (actionName) {
            case 'add_plan':
                this.handleAddPlan(event)
                break
            case 'edit':
                this.editCurrentRecord(row)
                break
            case 'delete':
                this.deleteCons(row)
                break
        }
    }
    
        
    handlePlanNameChange(event){
        console.log("handlePlanNameChange="+event)
        if(event && event.target && event.target.value){
            console.log("handlePlanNameChange="+event.target.value)
            this.name = event.target.value
            this.createSearchQuery()
        }
    }
    handleCategorySelected(event){
        
        console.log("handleCategorySelected="+event)
        /*if(event.target.checked){
            console.log("add selected category to filter="+event.target.name)
        }else{
            console.log("remove selected category from filter="+event.target.name)
        } */
        if(event && event.target){
            console.log("#****handleCategorySelected="+event.target.value)
            this.planCategory = event.target.value
            this.createSearchQuery()
        }
        
    }
    handleServiceTypeSelected(event){
        
        console.log("handleServiceTypeSelected="+event)
        /*if(event.target.checked){
            console.log("add selected category to filter="+event.target.name)
        }else{
            console.log("remove selected category from filter="+event.target.name)
        } */
        if(event && event.target){
            console.log("#****handleServiceTypeSelected="+event.target.value)
            this.serviceType = event.target.value
            this.createSearchQuery()
        }
        
    }
    handleChangeIsPlanActive(event){
        console.log("handleChangeIsPlanActive="+event) 
        if(event && event.target){
            console.log("handleChangeIsPlanActive="+event.target.checked)
            this.isActive = event.target.checked
            this.createSearchQuery()
        }
    }
    createSearchQuery(){
        var tempQuery = ""
        this.searchQuery = ""
        console.log("#****createSearchQuery")
        
        if(this.name !== ""){
            console.log("#****adding name to filter")
            tempQuery = "name like '%"+this.name+"%'"
        }
        if(this.planCategory !== ""){
            if(tempQuery !== ""){
                tempQuery += " and"
            }
            if(this.planCategory === "none"){
                tempQuery += " ChikPeaTOM__Plan_Category__c = '' "
            }else{
                tempQuery += " ChikPeaTOM__Plan_Category__c = '"+this.planCategory+"' "
            }
        }
        if(this.serviceType !== ""){
            if(tempQuery !== ""){
                tempQuery += " and"
            }
            if(this.serviceType !== ""){
                tempQuery += " ChikPeaTOM__Service_Type__c = '"+this.serviceType+"' "
            }
        }
        if(this.isActive !== undefined){
            if(tempQuery !== ""){
                tempQuery += " and"
            }
            tempQuery += " ChikPeaTOM__Active__c = "+this.isActive+" "
        }

        if(tempQuery !== ""){
            this.searchQuery = " where "+tempQuery
            console.log("#****createSearchQuery="+this.searchQuery) 
        }
        this.showLoadingSpinner = true
        this.recordFound = false
        getPlanList({ wherePart: this.searchQuery, limitTxt: '10'})
    }
    handleAddPlan(event){
        console.log('>>>handleAddPlan called.'+event)
        const selectedRows = event.detail.row
        console.log('#****selectedRows='+selectedRows)
        const selectedPlanId = selectedRows.Id
        const selectedPlanName = selectedRows.Name
        console.log('#****selectedPlanId='+selectedPlanId)
        console.log('#****is selected Plan active='+selectedRows.ChikPeaTOM__Active__c)
        if(selectedRows.ChikPeaTOM__Active__c){
            const event1 = new CustomEvent('handleplanselected', {
                // detail contains only primitives
                detail: {selectedPlanId:selectedPlanId, selectedPlanName:selectedPlanName}
            });
            this.dispatchEvent(event1);
        }else{
            this.dispatchEvent(new ShowToastEvent({
                title: 'Inactive plan',
                message: 'Plan is not active.',
                variant: 'error'
            }),)
        }
    }

    handleSelected(event) {
        console.log('>>>handleSelected called.'+event)  
        const selectedRows = event.detail.selectedRows
        console.log('#****selectedRows='+selectedRows)
        this.selectedRows = []
        if(selectedRows.length>0){
            if(selectedRows[0].ChikPeaTOM__Active__c){
                const selectedPlanId = selectedRows[0].Id
                const selectedPlanName = selectedRows[0].Name
                console.log('#****selectedPlanId='+selectedPlanId)
                const event1 = new CustomEvent('handleplanselected', {
                    // detail contains only primitives
                    detail: {selectedPlanId:selectedPlanId, selectedPlanName:selectedPlanName,
                        recordId:this.recordId}
                });
                this.dispatchEvent(event1);
            }else{
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Inactive plan',
                    message: 'Plan is not active.',
                    variant: 'error'
                }),)
            }
        }
    }
    
    // closing modal box
    closeModal() {
        this.bShowModal = false
    }
    /*
    changeHandler(event) {
        this.greeting = event.target.value
    }*/
}