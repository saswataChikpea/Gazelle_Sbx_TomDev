import { LightningElement, track } from 'lwc';
import { createRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import CARRIER_OBJECT from '@salesforce/schema/ChikPeaTOM__Carrier__c';
import NAME_FIELD from '@salesforce/schema/ChikPeaTOM__Carrier__c.Name';
import CONTACT_FIELD from '@salesforce/schema/ChikPeaTOM__Carrier__c.ChikPeaTOM__Carrier_Contact__c';
import ADDRESS_FIELD from '@salesforce/schema/ChikPeaTOM__Carrier__c.ChikPeaTOM__Address__c';
export default class CreateCarrierCustom extends LightningElement {
    @track carrierId
    name = ''
    contact = ''
    address = ''
    contactName
    carrier

    handleNameChange(event) {
        this.carrierId = undefined
        this.name = event.target.value
    }
    handleContactChange(event) {
        /*this.carrierId = undefined
        this.contact = event.target.value*/
        this.contactName = event.detail.selectedName
        this.contact = event.detail.selectedId
    }
    handleAddressChange(event) {
        this.carrierId = undefined
        this.address = event.target.value
    }
    createCarrier() {
        const fields = {}
        if(this.name){
            fields[NAME_FIELD.fieldApiName] = this.name
        }
        if(this.contact){
            fields[CONTACT_FIELD.fieldApiName] = this.contact
        }
        if(this.address){
            fields[ADDRESS_FIELD.fieldApiName] = this.address
        }
        const recordInput = { apiName: CARRIER_OBJECT.objectApiName, fields }
        //console.log("------fields "+JSON.stringify(fields, null, '\t'))
        console.log("------recordInput "+JSON.stringify(recordInput, null, '\t'))
        createRecord(recordInput).then(carrier => {
            this.carrierId = carrier.id
            this.carrier = carrier
            this.closeCarrierModal()
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Carrier created',
                    variant: 'success',
                }),
            );
        })
        .catch(error => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error creating record',
                    message: error.body.message,
                    variant: 'error',
                }),
            );
        })
    }
    closeCarrierModal(){
        const event1 = new CustomEvent('handlecarrierclosemodal', {
            // detail contains only primitives
            detail: {close:true, data:this.carrier}
        });
        this.dispatchEvent(event1);
    }

}