/* eslint-disable array-callback-return */
/* eslint-disable no-console*/
import { LightningElement,api, track } from 'lwc'
// importing to refresh the apex if any record changes the datas
//import { refreshApex } from '@salesforce/apex'
import getQuoteLinePlans from '@salesforce/apex/QuoteAddProduct.getQuoteLinePlans'
import getPlanRate from '@salesforce/apex/QuoteAddProduct.getPlanRate'
import createQuote from '@salesforce/apex/QuoteAddProduct.createQuote'
import createQuoteLPQ from '@salesforce/apex/QuoteAddProduct.createQuoteLPQ'
import saveQuoteLineEquip from '@salesforce/apex/QuoteAddProduct.saveQuoteLineEquip'
// importing to show toast notifictions
import {ShowToastEvent} from 'lightning/platformShowToastEvent'

export default class quoteAddProduct extends LightningElement {
    @api recordId
    @track preselectedRows = []//For preselection of required plans
    @track draftValues = []
    @track tobeAddedRecords
    @track tempPlans
    @track bShowModal = false
    @track showEquipments = false
    @track tobeAddedEquips
    @track planIds
    @track selPlan
    @track savedQL 
    @track checkLinePerQty = false
    @track linePerQty = false
    @track displaySelectedFieldsDetails = "'"+'[{"fieldName":"Name","label":"Line ID","type":"text","editable":false},{"fieldName":"ChikPeaTOM__Service_Plan__r.Name","label":"Service Plan","type":"text","editable":false},{"fieldName":"ChikPeaTOM__Equipment__c","label":"Equipment","type":"text","editable":false},{"fieldName":"ChikPeaTOM__Qty__c","label":"Qty","type":"number","editable":false,"cellAttributes": { "alignment": "left" }},{"fieldName":"ChikPeaTOM__Contract_Period__c","label":"Contract Period","type":"number","editable":false,"cellAttributes": { "alignment": "left" }},{"fieldName":"ChikPeaTOM__Parent_Line__r.Name","label":"Parent Line","type":"text","editable":false},{"fieldName":"ChikPeaTOM__MRC__c","label":"MRC","type":"currency","editable":false,"cellAttributes": { "alignment": "left" }},{"fieldName":"ChikPeaTOM__NRC__c","label":"NRC","type":"currency","editable":false,"cellAttributes": { "alignment": "left" }},{"fieldName":"ChikPeaTOM__Bandwidth__c","label":"Bandwidth","type":"number","editable":false,"cellAttributes": { "alignment": "left" }},{"type":"action","typeAttributes":{"rowActions":[{"label":"Edit","name":"edit"},{"label":"Delete","name":"delete"}]},"menuAlignment":"right"}]'+"'"
    
    @track columns = [       
        { label: 'Service Plan', fieldName: 'planName', type: 'text', editable: false },
        { label: 'Line Per Qty', fieldName: 'linePerQty', type: 'boolean', editable: true },
        { label: 'UNIT MRC', fieldName: 'mrc', type: 'currency', editable: true, cellAttributes: { alignment: 'left' }},
        { label: 'UNIT NRC', fieldName: 'nrc', type: 'currency', editable: true, cellAttributes: { alignment: 'left' }},
        { label: 'Bandwidth', fieldName: 'bandwidth', type: 'number', editable: true, cellAttributes: { alignment: 'left' }},
        { label: 'Get Rates', fieldName: 'getRates', type: 'boolean', editable: true },
        { label: 'Qty', fieldName: 'qty', type: 'number', editable: true, cellAttributes: { alignment: 'left' }},
        { label: 'Period (Months)', fieldName: 'term', type: 'number', editable: true,cellAttributes: { alignment: 'left' } },
        { label: 'Plan Type', fieldName: 'planType', type: 'text', editable: false }
    ]

    handlePlanSelected(event) {
        //var requiredListComplete = false
        //var recommentedListComplete = false
        var i =0
        console.log('>>>handlePlanSelected called from Quote Page')
        const selectedPlanId = event.detail.selectedPlanId
        const selectedPlanName = event.detail.selectedPlanName
        console.log('#****selectedPlanId='+selectedPlanId)

        if(selectedPlanId){
            this.bShowModal = true
            this.selectedParentPlanId = "/"+selectedPlanId
            this.selectedParentPlanName = selectedPlanName
            this.planIds = selectedPlanId
            console.log("#****Quote id="+this.recordId)
            getQuoteLinePlans({quoteId: this.recordId, parentPlanId: selectedPlanId}).then(result => {
                if (result) {
                    console.log("#****getOrderLinePlans="+JSON.stringify(result, null, '\t'))
                    this.tobeAddedRecords = []
                    this.tempPlans = []
                    
                    if(result.length>0){
                        for(let i=0; i<result.length;i++){
                            const rePlan = {...result[i]}
                            this.tobeAddedRecords.push(rePlan)
                            const json = {planId: rePlan.planId, mrc: rePlan.mrc, nrc: rePlan.nrc}
                            this.tempPlans.push(json)
                        }
                    }
                }
                console.log('1 addProduct tempPlans= '+JSON.stringify(this.tempPlans, null, '\t'))
                for(;i<result.length;i++){
                    if(result[i].planType === "Required"){
                        this.preselectedRows.push(result[i].planId)
                    }
                }
                this.showLoadingSpinner = false
            })
            .catch(error => {
                //this.error1 = error
                console.error("#****1 getQuoteLinePlans error="+error)
                if (Array.isArray(error.body)) {
                    this.addPlanError = error.body.map(e => e.message).join(', ')
                } else if (typeof error.body.message === 'string') {
                    this.addPlanError = error.body.message
                }
                console.error("#****2 getQuoteLinePlans error="+this.addPlanError)
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Error',
                    message: this.addPlanError,
                    variant: 'error',
                    mode: 'sticky'
                }),)
            })            
        }else{
            this.bShowModal = false
        }               
    }    
    callGetPlanRate(selectedPlanId, bandWidth1, contractPeriod) {
        //var requiredListComplete = false
        //var recommentedListComplete = false
        console.log('#****selectedPlanId, bandwidth1, ='+selectedPlanId)

        if(selectedPlanId){
            getPlanRate({planId: selectedPlanId, bandWidth: bandWidth1,contractPeriod: contractPeriod}).then(result => {
                //this.searcherResult = result
                //console.log("get child plan result="+result)
                console.log("#****getPlanRate="+JSON.stringify(result, null, '\t'))
                
                if(result){
                    for(let i=0;i<this.tobeAddedRecords.length;i++){
                        const selPlan = this.tobeAddedRecords[i]
                        if(selPlan.plan.Id === selectedPlanId){
                            selPlan.mrc = result.ChikPeaTOM__MRC__c
                            selPlan.nrc = result.ChikPeaTOM__NRC__c
                        }
                    }
                    this.dispatchEvent(new ShowToastEvent({
                        title: 'Success',
                        message: 'Pricing updated with Plan Rates',
                        variant: 'success'
                    }),)
                }else{
                    this.dispatchEvent(new ShowToastEvent({
                        title: 'Warning',
                        message: 'Enter appropriate Bandwidth & Contract Period to Get Plan Rate',
                        variant: 'warning'
                    }),)
                }
                this.showLoadingSpinner = false
                this.tobeAddedRecords = [...this.tobeAddedRecords]
            })
            .catch(error => {
                //this.error1 = error
                console.error("1 callGetPlanRate error="+error)
                if (Array.isArray(error.body)) {
                    this.addPlanError = error.body.map(e => e.message).join(', ')
                } else if (typeof error.body.message === 'string') {
                    this.addPlanError = error.body.message
                }
                console.error("2 callGetPlanRate error="+this.addPlanError)
            })
            
        }else{
            this.bShowModal = false 
        }        
        
    }
    handleToBeAddedSelection(event) {
        var i = 0
        var newSelectedRecordIds = []
        this.selectedChildRows = event.detail.selectedRows
        console.log('#****handleToBeAddedSelection called.' , this.selectedChildRows)
        
        for(i=0;i<this.tobeAddedRecords.length;i++){
            if(this.tobeAddedRecords[i].planType === "Required"){
                newSelectedRecordIds.push(this.tobeAddedRecords[i].planId)
            }
         }
         
        if(this.selectedChildRows.length > 0){
            for(i=0;i<this.selectedChildRows.length;i++){
                const eachRow = this.selectedChildRows[i]
                if(eachRow.planType !== 'Required'){
                    newSelectedRecordIds.push(eachRow.planId)
                }
            }
        }else{
            if(this.is_all_select_enabled){
                for(i=0;i<this.tobeAddedRecords.length;i++){
                    if(this.tobeAddedRecords[i].planType !== "Required"){
                        newSelectedRecordIds.push(this.tobeAddedRecords[i].planId)
                    }
                }
            }
            this.is_all_select_enabled = !this.is_all_select_enabled
            
        }
        this.preselectedRows = []
        this.preselectedRows = newSelectedRecordIds
    }
    handleCellChange(event){
        var i = 0
        var j = 0
        console.log('#****handleCellChange draft='+JSON.stringify(event.detail.draftValues, null, '\t'))
        //console.log('#****handleCellChange plan to be added='+JSON.stringify(this.tobeAddedRecords, null, '\t'))
        
        for(i=0;i<event.detail.draftValues.length;i++){
            const planDraft = event.detail.draftValues[i]
            for(j=0;j<this.tobeAddedRecords.length;j++){
                const planTobeAdded = this.tobeAddedRecords[j]
                const tempPlan = this.tempPlans[j]
                console.log('addProduct tempPlan='+JSON.stringify(tempPlan, null, '\t'))
                if(planDraft.planId === planTobeAdded.planId && planDraft.planId === tempPlan.planId){                    
                    if(planDraft.qty)
                        planTobeAdded.qty = planDraft.qty
                    if(planDraft.bandwidth)
                        planTobeAdded.bandwidth = planDraft.bandwidth
                    if(planDraft.term)
                        planTobeAdded.term = planDraft.term
                    
                    if(planDraft.linePerQty){
                        planTobeAdded.linePerQty = planDraft.linePerQty
                        if(planTobeAdded.qty === 1){
                            planTobeAdded.qty = 2 //making similar as classic
                            this.checkLinePerQty = true
                        }
                    }
                    if(planDraft.linePerQty === false){
                        planTobeAdded.linePerQty = planDraft.linePerQty
                        if(this.checkLinePerQty){
                            planTobeAdded.qty = 1
                            this.checkLinePerQty = false
                        }
                    }

                    if(planTobeAdded.linePerQty && planTobeAdded.qty && planTobeAdded.qty>500){
                        planTobeAdded.qty = 500
                        this.dispatchEvent(new ShowToastEvent({
                            title: 'Warning',
                            message: 'For Line Per Qty, Maximum Product Qty should be 500',
                            variant: 'warning'
                        }),)
                    }

                    if(planDraft.getRates){
                        planTobeAdded.getRates = planDraft.getRates    
                        this.callGetPlanRate(planDraft.planId, planTobeAdded.bandwidth, planTobeAdded.term)
                    }

                    if(planDraft.bandwidth && planTobeAdded.getRates === true){
                        planTobeAdded.bandwidth = planDraft.bandwidth
                        this.callGetPlanRate(planDraft.planId, planTobeAdded.bandwidth, planTobeAdded.term)
                    }
                        
                    if(planDraft.term && planTobeAdded.getRates === true){
                        planTobeAdded.term = planDraft.term
                        this.callGetPlanRate(planDraft.planId, planTobeAdded.bandwidth, planTobeAdded.term)
                    }

                    if(planDraft.getRates === false){
                        planTobeAdded.getRates = planDraft.getRates
                        planTobeAdded.mrc = tempPlan.mrc
                        planTobeAdded.nrc = tempPlan.nrc
                    }

                    if(planDraft.mrc){
                        planTobeAdded.mrc = planDraft.mrc
                        tempPlan.mrc = planDraft.mrc
                    }
                    if(planDraft.nrc){
                        planTobeAdded.nrc = planDraft.nrc
                        tempPlan.nrc = planDraft.nrc
                    }
                    break
                }
            }
        }
        console.log('#****handleCellChange plan to be added='+JSON.stringify(this.tobeAddedRecords, null, '\t'))
        this.draftValues = []
    }

    handleSave(event){
        var i = 0
        var parentLine 
        var quoteLines = []
        var qty
        //console.log('#****handleSave plan to be added='+JSON.stringify(this.tobeAddedRecords, null, '\t'))
        if(this.tobeAddedRecords){     
            if(this.tobeAddedRecords[0].linePerQty)
                this.linePerQty = true
            qty = this.tobeAddedRecords[0].qty

            for(i=0;i<this.tobeAddedRecords.length;i++){
                const quotePlan = this.tobeAddedRecords[i]
                //adding only selected plans
                if(this.preselectedRows.includes(quotePlan.planId)){
                    const quoteLine = quotePlan.ql
                    if(quotePlan.isParent){
                        parentLine = quoteLine
                    }else{
                        quoteLines.push(quoteLine)
                    }
                }
                quotePlan.ql.ChikPeaTOM__Unit_MRC__c =  quotePlan.mrc
                quotePlan.ql.ChikPeaTOM__Unit_NRC__c =  quotePlan.nrc
                quotePlan.ql.ChikPeaTOM__Bandwidth__c =  quotePlan.bandwidth
                quotePlan.ql.ChikPeaTOM__Contract_Period__c = quotePlan.term
                quotePlan.ql.ChikPeaTOM__Qty__c = quotePlan.qty
                //console.log('#****quoteLine='+JSON.stringify(quoteLine, null, '\t'))
            }
            console.log('#****handleSave parentLine='+JSON.stringify(parentLine, null, '\t'))
            console.log('#****handleSave quoteLines='+JSON.stringify(quoteLines, null, '\t'))
            if(parentLine){
                this.selPlan = parentLine
                if(this.linePerQty){
                    createQuoteLPQ({parentQuoteLine: parentLine, quoteLines: quoteLines, qty: qty}).then(result => {
                        //this.searcherResult = result
                        console.log("add plan result="+JSON.stringify(result, null, '\t'))
                        // showing success message
                        if(result.statusCode === 100){
                            if(result.savedQL && result.savedQL.length > 0)
                                this.savedQL = result.savedQL[0].Id
                            this.dispatchEvent(new ShowToastEvent({
                                title: 'Success!!',
                                message: 'Plan added Successfully.',
                                variant: 'success'
                            }),)
                            this.showEquipments = true
                        }else{
                            this.error = true
                        }
                        //refreshApex(this.records)
                        this.showLoadingSpinner = false
                    })
                    .catch(error => {
                        //this.error = true
                        console.error("#****1add plan error="+JSON.stringify(error, null, '\t'))
                        if (Array.isArray(error.body)) {
                            this.addPlanError = error.body.map(e => e.message).join(', ')
                        } else if (typeof error.body.message === 'string') {
                            this.addPlanError = error.body.message
                        }
                        console.error("#****2add plan error="+this.error1)
                        console.log('#****handleSave='+event)
                        this.dispatchEvent(new ShowToastEvent({
                            title: 'Error',
                            message: this.addPlanError,
                            variant: 'error',
                            mode: 'sticky'
                        }),)
                    })
                }else{
                    createQuote({parentQuoteLine: parentLine, quoteLines: quoteLines}).then(result => {
                        //this.searcherResult = result
                        console.log("add plan result="+JSON.stringify(result, null, '\t'))
                        // showing success message
                        if(result.statusCode === 100){
                            if(result.savedQL && result.savedQL.length > 0)
                                this.savedQL = result.savedQL[0].Id
                            this.dispatchEvent(new ShowToastEvent({
                                title: 'Success!!',
                                message: 'Plan added Successfully.',
                                variant: 'success'
                            }),)
                            this.showEquipments = true
                        }else{
                            this.error = true
                        }
                        //refreshApex(this.records)
                        this.showLoadingSpinner = false
                    })
                    .catch(error => {
                        //this.error = true
                        console.error("#****1add plan error="+JSON.stringify(error, null, '\t'))
                        if (Array.isArray(error.body)) {
                            this.addPlanError = error.body.map(e => e.message).join(', ')
                        } else if (typeof error.body.message === 'string') {
                            this.addPlanError = error.body.message
                        }
                        console.error("#****2add plan error="+this.error1)
                        console.log('#****handleSave='+event)
                        this.dispatchEvent(new ShowToastEvent({
                            title: 'Error',
                            message: this.addPlanError,
                            variant: 'error',
                            mode: 'sticky'
                        }),)
                    })
                }	
            }
        }
        this.bShowModal = false
    }
    
    handleEqpSave(event){
        const parentLine = this.selPlan
        const selectedEquipments = event.detail.selectedEquipments
        console.log('Quote#****handleEQPSave selectedEquipments='+JSON.stringify(selectedEquipments, null, '\t'))
        if(selectedEquipments){            
            console.log('#****handleEqpSave parentLine='+JSON.stringify(parentLine, null, '\t'))
            console.log('#****handleEqpSave parentLine.ChikPeaTOM__Quote__c='+JSON.stringify(parentLine.ChikPeaTOM__Quote__c, null, '\t'))
            if(parentLine){
                saveQuoteLineEquip({parentQuoteLine: parentLine, eqps: selectedEquipments}).then(result => {
                    console.log("add equip result="+JSON.stringify(result, null, '\t'))
                    // showing success message
                    if(result.statusCode === 100){
                        this.dispatchEvent(new ShowToastEvent({
                            title: 'Success!!',
                            message: 'Equipment added Successfully.',
                            variant: 'success'
                        }),)
                    }else{
                        this.error = true
                    }
                    //refreshApex(this.records)
                    this.showLoadingSpinner = false
                })
                .catch(error => {
                    //this.error = true
                    console.error("#****1add equip error="+JSON.stringify(error, null, '\t'))
                    if (Array.isArray(error.body)) {
                        this.addPlanError = error.body.map(e => e.message).join(', ')
                    } else if (typeof error.body.message === 'string') {
                        this.addPlanError = error.body.message
                    }
                    console.log('#****handleEqpSave='+event)
                    this.dispatchEvent(new ShowToastEvent({
                        title: 'Error',
                        message: this.addPlanError,
                        variant: 'error',
                        mode: 'sticky'
                    }),)
                })	
            }
        }
        const event1 = new CustomEvent('closequickaction', {
            // detail contains only primitives
            detail: {message:"Equipment added successfully",statusCode:100}
        })
        this.dispatchEvent(event1)
    }
    // closing modal box
    closeModal() {
        this.bShowModal = false
        this.tobeAddedRecords = undefined
        this.preselectedRows = []
    }
    hideEqp(event){
        console.log('#****hideEqp='+event)
        this.showEquipments = false
        const event1 = new CustomEvent('closequickaction', {
            // detail contains only primitives
            detail: {message:"",statusCode:200}
        })
        this.dispatchEvent(event1)
    }
}