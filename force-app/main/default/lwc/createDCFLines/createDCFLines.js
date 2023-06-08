import { LightningElement, track, wire, api } from 'lwc';
import fetchDcf from '@salesforce/apex/dcfController.getDcf';
import dcfLines from '@salesforce/apex/dcfController.getDcfLines';
import DCF from '@salesforce/schema/DCF__c';
import DCF_LINE from '@salesforce/schema/DCF_Line__c';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class CreateDCFLines extends LightningElement {
    @track phaseDetails = true;
    @track record;
    @api recordId;
    @track newDCFRecord = true;
    @track showNewDcfLine;
    @track dcfLineId;
    @track dcfLines;
    @track existingDCF = false;
    @track DCFId;
    wiredDcfLinesResult;
    @track newDCF = DCF;
    @track newDCFline = DCF_LINE

    @wire(fetchDcf, { dcfId: '$recordId' })
    wiredFetchDcf({ error, data }) {
        if (data) {
            this.record = data;
                console.log("data",data);
                if(data.length >0 ){
                    this.newDCFRecord = false;
                    this.DCFId = data[0].Id
                }
                console.log('DCFId-', this.DCFId);
                console.log('record', this.record);
            this.error = undefined;
        } else if (error) {
            console.error('Error:', error);
            this.error = error;
        }
    }
    // renderedCallback(){
    //     fetchDcf({dcfId : this.recordId})
    //         .then((data)=>{
    //             this.record = data;
    //             console.log("data",data);
    //             if(data.length >0 ){
    //                 this.newDCFRecord = false;
    //                 this.DCFId = data[0].Id
    //             }
    //             console.log('DCFId', this.DCFId);
    //             console.log('record', this.record);
    //         }).catch((err)=>{
    //             console.log(err);
    //         })
    // }

    @wire(dcfLines, { oppId: '$recordId' })
    wiredDcfLines(result) {
        this.wiredDcfLinesResult = result;
        if (result.data) {
            this.dcfLines = result.data;
            console.log('dcfLines-', this.dcfLines);
            this.error = undefined;
        } else if (result.error) {
            console.error('Error:', result.error);
            this.error = result.error;
        }
    }

    addNewDcfLine() {
        console.log('Add button clicked');
        this.showNewDcfLine = true;
    }

    closeModal() {
        this.showNewDcfLine = false;
    }
    closeDCFModal() {
        this.showNewDcfLine = false;
        this.newDCFRecord=false
    }

    handleSuccessDCF(event) {
        console.log('Success');
        this.DCFId = event.detail.id;
        console.log('DCFId', this.DCFId);
        this.newDCFRecord = false;
        const toastEvent = new ShowToastEvent({
            title: 'Success',
            message: 'DCF Created',
            variant: 'success'
        });
        this.dispatchEvent(toastEvent);
        this.refreshDcfLines();
    }

    handleSuccess(event) {
        console.log('Success');
        const toastEvent = new ShowToastEvent({
            title: 'Success',
            message: 'DCF Line Created',
            variant: 'success'
        });
        this.dispatchEvent(toastEvent);
        this.refreshDcfLines();
        const inputFields = this.template.querySelectorAll('.contactName');
        if (inputFields) {
            inputFields.forEach(field => {
                field.reset();
            });
        }
    }

    refreshDcfLines() {
        refreshApex(this.wiredDcfLinesResult);
    }
}