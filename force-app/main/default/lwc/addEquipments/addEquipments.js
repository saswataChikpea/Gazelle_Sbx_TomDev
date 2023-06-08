/* eslint-disable array-callback-return */
/* eslint-disable no-console*/
import { LightningElement, track, api } from 'lwc'
import getEqpList from '@salesforce/apex/AddEquipments.getEqpList'
import getAddedEqpList from '@salesforce/apex/AddEquipments.getAddedEqpList'
import saveLineEquip from '@salesforce/apex/AddEquipments.saveLineEquip'
import { ShowToastEvent } from 'lightning/platformShowToastEvent'

export default class AddEquipments extends LightningElement {
    @api recordId
    @api objName = 'ChikPeaTOM__Service_Order__c'
    @api planIds
    @api selectedParentPlanId
    @api selectedParentPlanName
    @track tobeAddedRecords
    @track tempEqpRecords
    @track addedRecordsEqp
    @track draftValues = []
    @track selectedRows = []
    @track savedRows
    @track savedEqpIds
    @track tempSavedRows
    @track error
    @track planIdTemp = []
    @track bShowModal

    oldEqSet

    @track columns = [
        { label: 'Equipment Name', fieldName: 'equipmentName', type: 'text', editable: false },
        { label: 'QTY', fieldName: 'qty', type: 'number', editable: true, cellAttributes: { alignment: 'left' } },
        { label: 'Period (Months)', fieldName: 'term', type: 'number', editable: true, cellAttributes: { alignment: 'left' } },
        { label: 'One Time/Rental', fieldName: 'sellprice', type: 'number', editable: true, cellAttributes: { alignment: 'left' } },
        { label: 'Rental', fieldName: 'rental', type: 'boolean', editable: true }
    ]
    /*
    constructor(){
        super();
        console.log("1#****in connectedCallback planIds="+this.planIds)
        console.log("1#****in connectedCallback selectedParentPlanId="+this.selectedParentPlanId)
        
    }*/
    connectedCallback() {
        console.log("2#****in connectedCallback recordId=" + this.recordId)
        console.log("2#****in connectedCallback planIds=" + this.planIds)
        console.log("2#****in connectedCallback selectedParentPlanId=" + this.selectedParentPlanId)
        getAddedEqpList({ recordId: this.recordId, objName: this.objName }).then(data => {
            this.error = undefined
            if (data) {
                console.log("#****getAddedEqpList eqp = " + JSON.stringify(data, null, '\t'))
                this.addedRecordsEqp = data
                this.setSaved()

                this.fetchEqp()
            }
        })
            .catch(error => {
                //this.error1 = error
                console.error("#****1 getAddedEqpList error=" + error)
                if (Array.isArray(error.body)) {
                    this.error = error.body.map(e => e.message).join(', ')
                } else if (typeof error.body.message === 'string') {
                    this.error = error.body.message
                }
                console.error("#****2 getEqpList error=" + this.error)
            })


    }

    fetchEqp() {
        getEqpList({ planIds: this.planIds }).then(data => {
            this.error = undefined
            if (data) {
                console.log("#****related eqp received " + JSON.stringify(data, null, '\t'))
                this.tobeAddedRecords = []
                this.tempEqpRecords = []

                if (data.length > 0) {
                    for (let i = 0; i < data.length; i++) {
                        const reEqp = { ...data[i] }
                        this.tobeAddedRecords.push(reEqp)
                        const json = { rqId: reEqp.rqId, sellprice: reEqp.sellprice }
                        this.tempEqpRecords.push(json)
                    }
                    this.bShowModal = true
                } else {
                    //closing the quick action on getting no equipments
                    const event1 = new CustomEvent('handleclosemodal', {
                        // detail contains only primitives
                        detail: { close: true }
                    });
                    this.dispatchEvent(event1);
                }
                this.error = undefined
            }
        })
            .catch(error => {
                //this.error1 = error
                console.error("#****1 getEqpList error=" + error)
                if (Array.isArray(error.body)) {
                    this.error = error.body.map(e => e.message).join(', ')
                } else if (typeof error.body.message === 'string') {
                    this.error = error.body.message
                }
                console.error("#****2 getEqpList error=" + this.error)
            })
    }

    setSaved() {
        this.savedRows = []
        this.savedEqpIds = new Set()
        this.oldEqSet = new Set()
        if (this.addedRecordsEqp)//check already added eqp
            for (let j = 0; j < this.addedRecordsEqp.length; j++) {
                const eqp = this.addedRecordsEqp[j]
                if (eqp.ChikPeaTOM__Related_Equipment__c) {
                    this.savedRows.push(eqp.ChikPeaTOM__Related_Equipment__c)
                    this.oldEqSet.add(eqp.ChikPeaTOM__Related_Equipment__c)
                    this.savedEqpIds.add(eqp.ChikPeaTOM__Related_Equipment__c)
                }
            }
    }

    //@track planIds
    planIdshaveValue(evt) {
        console.log("#****in planIdshaveValue planIds=" + evt)
        //this.pageSize = evt.target.value;
    }

    handleSelected(event) {
        this.selectedRows = []
        console.log('>>>handleSelected called.' + event)
        const selectedRows = event.detail.selectedRows
        //console.log('Equip#****selectedRows=' + selectedRows)

        this.selectedRows = [...selectedRows]

        //restore saved rows
        this.setSaved()
        for (let i = 0; i < selectedRows.length; i++) {
            const row = selectedRows[i]
            console.log('row.equipmentName=', row.equipmentName, row.Id)
            if(!this.savedEqpIds.has(row.rqId)){
                //add only not saved rows
                console.log('not added')
                this.savedRows.push(row.rqId)
                this.savedEqpIds.add(row.rqId)
            }
        }
        console.log("selectedRows=" + JSON.stringify(this.selectedRows, null, '\t'))
    }


    // filterByID(item) {
    //     return !this.oldEqSet.has(e.rqId)
    // }

    handleSave(event) {
        debugger
        console.log('>>>handleSave called.' + event)
        //only not saved selected rows
        if (this.selectedRows && this.selectedRows.length > 0) {
            var self = this;
            const newSelRq = this.selectedRows.filter((item) => !self.oldEqSet.has(item.rqId))

            console.log('Filtered Array\n', JSON.stringify(newSelRq))
            console.log('Filtered Array\n', newSelRq.length)

            if (this.recordId) {
                saveLineEquip({objName: this.objName, parentLine: this.recordId, eqps: newSelRq}).then(result => {
                    console.log("add equip result="+JSON.stringify(result, null, '\t'))
                    // showing success message
                    if(result.statusCode === 100){
                        this.dispatchEvent(new ShowToastEvent({
                            title: 'Success!!',
                            message: 'Equipment added Successfully.',
                            variant: 'success'
                        }),)
                        const event1 = new CustomEvent('closequickaction', {
                            // detail contains only primitives
                            detail: {message:"Equipment added successfully",statusCode:100}
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
                    console.error("#****1add equip error="+JSON.stringify(error, null, '\t'))
                    if (Array.isArray(error.body)) {
                        this.addPlanError = error.body.map(e => e.message).join(', ')
                    } else if (typeof error.body.message === 'string') {
                        this.addPlanError = error.body.message
                    }
                    console.log('#****handleSave='+event)
                    this.dispatchEvent(new ShowToastEvent({
                        title: 'Error',
                        message: this.addPlanError,
                        variant: 'error',
                        mode: 'sticky'
                    }),)
                })
            }
            else {
                const event1 = new CustomEvent('handlesave', {
                    // detail contains only primitives
                    detail: { selectedEquipments: this.selectedRows }
                });
                this.dispatchEvent(event1);
            }
        } else {
            if (this.savedRows && this.savedRows.length === 0)
                this.dispatchEvent(new ShowToastEvent({
                    title: 'No equipment selected',
                    message: 'Select at least one Equipment',
                    variant: 'error'
                }))
            else
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Warning',
                    message: 'Select at least one new Equipment',
                    variant: 'warning'
                }))
        }
    }
    handleCellChange(event) {
        var i = 0
        var j = 0
        console.log('#****handleCellChange draft=' + JSON.stringify(event.detail.draftValues, null, '\t'))
        //console.log('#****handleCellChange plan to be added='+JSON.stringify(this.tobeAddedRecords, null, '\t'))
        if (event.detail.draftValues && this.tobeAddedRecords) {
            for (i = 0; i < event.detail.draftValues.length; i++) {
                const eqpDraft = event.detail.draftValues[i]
                for (j = 0; j < this.tobeAddedRecords.length; j++) {
                    const eqpTobeAdded = this.tobeAddedRecords[j]
                    const tempEqp = this.tempEqpRecords[j]
                    if (eqpDraft.rqId === eqpTobeAdded.rqId && eqpDraft.rqId === tempEqp.rqId) {
                        console.log('addEquip tempEqp=' + JSON.stringify(tempEqp, null, '\t'))
                        if (eqpDraft.term)
                            eqpTobeAdded.term = eqpDraft.term
                        if (eqpDraft.qty)
                            eqpTobeAdded.qty = eqpDraft.qty
                        if (eqpDraft.rental) {
                            eqpTobeAdded.rental = eqpDraft.rental
                            eqpTobeAdded.sellprice = eqpTobeAdded.rentalamt
                        }
                        if (eqpDraft.rental === false) {
                            eqpTobeAdded.rental = eqpDraft.rental
                            eqpTobeAdded.sellprice = tempEqp.sellprice
                        }
                        if (eqpDraft.sellprice && eqpTobeAdded.rental === false) {
                            eqpTobeAdded.sellprice = eqpDraft.sellprice
                            tempEqp.sellprice = eqpDraft.sellprice
                        }

                        break
                    }
                    console.log("----eqpDraft.rqId " + eqpDraft.rqId)
                    console.log("----eqpDraft.term " + eqpDraft.term)
                    console.log("----eqpDraft.qty " + eqpDraft.qty)
                    console.log("----eqpDraft.sellprice " + eqpDraft.sellprice)
                }
            }
        }
        console.log('#****handleCellChange re equipments to be added=' + JSON.stringify(this.selectedRows, null, '\t'))
        this.draftValues = []

    }
    // closing modal box
    handleCloseModal() {
        this.bShowModal = false
        const event1 = new CustomEvent('handleclosemodal', {
            // detail contains only primitives
            detail: { close: true }
        });
        this.dispatchEvent(event1);
        const event2 = new CustomEvent('closequickaction', {
            // detail contains only primitives
            detail: { message: "", statusCode: 200 }
        });
        this.dispatchEvent(event2);
    }
}