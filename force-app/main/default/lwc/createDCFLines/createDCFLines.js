import { LightningElement, track, wire, api } from 'lwc';
import fetchDcf from '@salesforce/apex/dcfController.getDcf';
import DCF from '@salesforce/schema/DCF__c';
import DCF_LINE from '@salesforce/schema/DCF_Line__c';
import dcfLines from '@salesforce/apex/dcfController.getDcfLines';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';


export default class CreateDCFLines extends LightningElement {
    @track phaseDetails = true;
    @track record = {};
    @api recordId;
    @track newDCFRecord = true;
    @track showNewDcfLine;
    @track newDCF = DCF;
    @track newDCFline = DCF_LINE
    @track dcfLineId
    @track dcf;

    @track DCFId;

    // @wire(dcfLines, { oppId: '$DCFId' })
    // wiredDcfLines(result) {
    //     if (result.data) {
    //         this.dcf = result.data;
    //         console.log('dcf  ',this.dcf );
    //     }
    // }

    //     renderedCallback(){
    //         dcfLines({oppId : this.recordId}).then((data)=>{
    //             console.log('dcflines',data);
    //             this.dcf=data
    //             console.log("id",data[0].DCF_Lines__r.id);
    //     })
    // }

    @wire(fetchDcf, { dcfId: '$recordId' })
    dcfRecordData({ error, data }) {
        if (data) {
            this.record = data;
            console.log('record', JSON.stringify(this.record));

            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.yearlyGrowth = undefined;
        }
    }
    addNewDcfLine() {
        console.log("add button clicked");
        this.showNewDcfLine = true;
    }
    closeModal() {
        this.showNewDcfLine = false;
    }

    handleSuccessDCF(event) {
        console.log("Success");
        this.DCFId = event.detail.id;
        console.log('DCFId', this.DCFId);
        this.newDCFRecord = false;
        // refreshApex(this.DCFId);
        const toastEvent = new ShowToastEvent({
            title: 'Success',
            message: 'DCF Created',
            variant: 'success'
        });
        this.dispatchEvent(toastEvent);
        // window.location.reload()

    }

    handleSuccess(event) {
        console.log("Success");
        refreshApex(this.wiredDcfLines);
        const toastEvent = new ShowToastEvent({
            title: 'Success',
            message: 'DCF Line Created',
            variant: 'success'
        });
        this.dispatchEvent(toastEvent);
        //window.location.reload()
        dcfLines({ oppId: this.DCFId })
            .then((result) => {
                this.dcf = result;
                console.log('dcflines', result);
                console.log("id", this.dcf);
                console.log('DCFId',this.DCFId);
            }).catch(error => {
                this.error = error;
            });
        
            const inputFields = this.template.querySelectorAll(
                '.contactName'
            );
            if (inputFields) {
                inputFields.forEach(field => {
                    field.reset();
                });
            }
    }
}