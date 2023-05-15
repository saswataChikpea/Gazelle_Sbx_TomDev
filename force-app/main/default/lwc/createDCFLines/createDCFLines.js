import { LightningElement, track, wire, api } from 'lwc';
import fetchDcf from '@salesforce/apex/dcfController.getDcf';
import DCF_LINE from '@salesforce/schema/DCF_Line__c';
import dcfLines from '@salesforce/apex/dcfController.getDcfLines';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';


export default class CreateDCFLines extends LightningElement {
    @track phaseDetails = true;
    @track record = {};
    @api recordId;
    showNewDcfLine;
    newDCFline=DCF_LINE
    dcfLineId
    dcf;

    @wire(dcfLines, { oppId: '$recordId' })
    wiredDcfLines(result) {
        if (result.data) {
            this.dcf = result.data;
        }
    }

//     renderedCallback(){
//         dcfLines({oppId : this.recordId}).then((data)=>{
//             console.log('dcflines',data);
//             this.dcf=data
//             console.log("id",data[0].DCF_Lines__r.id);
//     })
// }

    @wire(fetchDcf,{dcfId:'$recordId'})
    dcfRecordData({ error, data }) {
        if (data) {
            this.record = data;
            console.log('record',JSON.stringify(this.record));
            
           this.error = undefined;
        } else if (error) {
            this.error = error;
            this.yearlyGrowth = undefined;
        }
    }
    addNewDcfLine(){
        console.log("add button clicked");
        this.showNewDcfLine = true;
    }
    closeModal(){
        this.showNewDcfLine = false;
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
        window.location.reload()
    }
}