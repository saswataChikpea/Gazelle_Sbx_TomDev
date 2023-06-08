import { LightningElement,track,wire} from 'lwc'
import { createRecord } from 'lightning/uiRecordApi'
import { ShowToastEvent } from 'lightning/platformShowToastEvent'
import PREMISE_OBJECT from '@salesforce/schema/ChikPeaTOM__Premise__c'
import COUNTRY from '@salesforce/schema/ChikPeaTOM__Premise__c.ChikPeaTOM__Country__c'
import NET_CATEGORY from '@salesforce/schema/ChikPeaTOM__Premise__c.ChikPeaTOM__Net_Category__c'
//import NAME_FIELD from '@salesforce/schema/Premise__c.Name'
import { getObjectInfo } from 'lightning/uiObjectInfoApi'
import {getPicklistValues} from 'lightning/uiObjectInfoApi'
//import STREET_ADDRESS_FIELD from '@salesforce/schema/Premise__c.ChikPeaTOM__Street_Addess__c'

export default class CreatePremiseCustom extends LightningElement {
    @track premiseId
    @track fieldsInfo
    @track CountryPicklistValues
    @track NetCategoryPicklistValues
    @track objectInfo1
    @track error

    @track hideSpinner = false
    wire1Done
    wire2Done
    wire3Done

    
    inputObject = {}
     name = ''
     street
     newPremise
     handleChange(event) {
        this.premiseId = undefined
        this.inputObject[event.target.name]=event.target.value
    }
    @wire(getObjectInfo, { objectApiName: PREMISE_OBJECT })
    oppInfo({ data, error }) {
        if (data) {
            //console.log('getObjectInfo => '+JSON.stringify(data))
            this.wire1Done = true
            this.hideLoadSpinner()
            this.objectInfo1 = data
            this.fieldsInfo = data.fields
        }
        if (error) {
            console.log('Error => '+error)
        }
    }
    // @wire(getObjectInfo, { objectApiName: PREMISE_OBJECT })
    // objectInfo

    @wire(getPicklistValues, { recordTypeId: '$objectInfo1.defaultRecordTypeId', fieldApiName: COUNTRY})
    handleGetCountry({ data, error }) {
        if (data) {
            this.wire2Done = true
            this.hideLoadSpinner()
            this.CountryPicklistValues = data
            //console.log('CountryPicklistValues => '+JSON.stringify(data))
        }
        if (error) {
            console.log('Error => '+error)
        }
    }
    

    @wire(getPicklistValues, { recordTypeId: '$objectInfo1.defaultRecordTypeId', fieldApiName: NET_CATEGORY})
    handleGetNetCat({ data, error }) {
        if (data) {
            this.wire3Done = true
            this.hideLoadSpinner()
            this.NetCategoryPicklistValues = data
            //console.log('NetCategoryPicklistValues => '+JSON.stringify(data))
        }
        if (error) {
            console.log('Error => '+error)
        }
    }
    hideLoadSpinner(){
        console.log('hideLoadSpinner => ',this.wire1Done, this.wire2Done, this.wire3Done)
        if(this.wire1Done && this.wire2Done && this.wire3Done)
            this.hideSpinner = true
    }
    
    createPremiseRecord() {
        const fields = this.inputObject
        //fields[NAME_FIELD.fieldApiName] = this.name
        console.log('fields info='+JSON.stringify(fields))

        const recordInput = { apiName: PREMISE_OBJECT.objectApiName, fields}
        createRecord(recordInput).then(record => {
            this.premiseId = record.id
            this.newPremise = record
            this.closePremiseModal()
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Premise created',
                    variant: 'success',
                }),
            )
        })
        .catch(error => {
            console.error("#****error="+error)
            this.error = 'Something is wrong'
            
            if(error.body){
                if (Array.isArray(error.body)) {
                    this.error = error.body.map(e => e.message).join(', ')
                } else if (typeof error.body.message === 'string') {
                    this.error = error.body.message
                }
            }
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error creating record',
                    message: this.error,
                    variant: 'error',
                }),
            )
        })
    }
    closePremiseModal(){
        const event1 = new CustomEvent('handlepremiseclosemodal', {
            // detail contains only primitives
            detail: {close:true,data:this.newPremise}
        });
        this.dispatchEvent(event1);
    }
}