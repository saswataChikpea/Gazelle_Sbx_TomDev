import { LightningElement , wire , track } from 'lwc';
import dcfLines from '@salesforce/apex/dcfController.getDcfLines';


const columns = [
    { label: 'Name', fieldName: 'name' },
    { label: 'Location', fieldName: 'Location__c', type: 'text' },
    { label: 'Requirement', fieldName: 'Requirement__c', type: 'text' },
    { label: 'Term', fieldName: 'Term__c', type: 'number' },
    { label: 'Availability', fieldName: 'Availability__c', type: 'picklist' },
    { label: 'Commencement Date', fieldName: 'Commencement_Date__c', type: 'date' },

];

export default class UpdateDCFLines extends LightningElement {
    columns = columns;
    @track dcfLines;



    @wire(dcfLines, { oppId: '$recordId' })
    wiredData({ error, data }) {
      if (data) {
        this.dcfLines = result.data;
        console.log('dcfLines-', this.dcfLines);
        this.error = undefined;
      } else if (error) {
         console.error('Error:', error);
      }
    }
}