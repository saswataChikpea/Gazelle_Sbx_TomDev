import { LightningElement, wire, track, api } from 'lwc';
import getDcfLineRecords from '@salesforce/apex/dcfController.getDcfLineRecords';


export default class UpdateDCFLines2 extends LightningElement {
    @api recordId;
    @track dcfLines;
    wiredDcfLinesResult=[];

    @wire(getDcfLineRecords, { oppId: '$recordId' })
    wiredDcfLines(result) {
        if (result.data) {
            this.dcfLines = JSON.parse(JSON.stringify(result.data));
            this.dcfLines.forEach(ele => {
                ele.planName=ele.Plan__r != undefined ? ele.Plan__r.Name : '';
                ele.premiseName=ele.Premise__r != undefined ? ele.Premise__r.Name : '';
            });
            this.wiredDcfLinesResult= JSON.parse(JSON.stringify(this.dcfLines));

            console.log('dcfLines-', this.wiredDcfLinesResult);
            this.error = undefined;
        } else if (result.error) {
            console.error('Error:', result.error);
            this.error = result.error;
        }
    }

}