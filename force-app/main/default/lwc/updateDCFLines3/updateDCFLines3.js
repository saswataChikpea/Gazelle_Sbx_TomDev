import { LightningElement, track, wire,api  } from 'lwc';
import { updateRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
import getDcfLineRecords from '@salesforce/apex/dcfController.getDcfLineRecords';

const columns = [
    { label: 'Name', fieldName: 'Name' },
    { label: 'Location', fieldName: 'Location__c', type: 'text' },
    { label: 'Requirement', fieldName: 'Requirement__c', type: 'text' },
    { label: 'Term', fieldName: 'Term__c', type: 'number' },
    { label: 'Plan', fieldName: 'planName', type: 'text' },
    {
        label: 'Plan',
        fieldName: 'Plan__r.Name', //lookup API field name 
        type: 'lookupColumn',
        typeAttributes: {
            object: 'DCF_Line__c', //object name which have lookup field
            fieldName: 'Plan__c',  //lookup API field name 
            value: { fieldName: 'Plan__c' },  //lookup API field name 
            context: { fieldName: 'Id' }, 
            name: 'Plan__c',  //lookup object API Name 
            fields: ['Plan__r.Name'], //lookup objectAPIName.Name
            target: '_self'
        },
        
        editable: false,

    },
    { label: 'Availability', fieldName: 'Availability__c', type: 'picklist' },
    { label: 'Commencement Date', fieldName: 'Commencement_Date__c', type: 'date' },
    { label: 'Premise Name', fieldName: 'premiseName', type: 'text' },
    {
        label: 'Premise',
        fieldName: 'Premise__r.Name', //lookup API field name 
        type: 'lookupColumn',
        typeAttributes: {
            object: 'DCF_Line__c', //object name which have lookup field
            fieldName: 'Premise__c',  //lookup API field name 
            value: { fieldName: 'Premise__c' },  //lookup API field name 
            context: { fieldName: 'Id' }, 
            name: 'Premise__c',  //lookup object API Name 
            fields: ['Premise__r.Name'], //lookup objectAPIName.Name
            target: '_self'
        },
        
        editable: false,

    },
    
]
export default class UpdateDCFLines3 extends LightningElement {
    columns = columns;
    showSpinner = false;
    @track data = [];
    @track contactData;
    @track draftValues = [];
    lastSavedData = [];
    @api recordId;

    @wire(getDcfLineRecords, {oppId: '$recordId'})
    wireData(result) {
        this.contactData = result;
        console.log("result",result);
        if (result.data) {
            this.data = JSON.parse(JSON.stringify(result.data));
            console.log('lookup data-',this.data);
            this.data.forEach(ele => {
                ele.premiseLink = ele.Premise__c != undefined ? '/' + ele.Premise__c : '';
                ele.premiseName = ele.Premise__r != undefined ? ele.Premise__r.Name : '';
                ele.planLink = ele.Plan__c != undefined ? '/' + ele.Plan__c : '';
                ele.planName = ele.Plan__r != undefined ? ele.Plan__r.Name : '';

            })
 
            this.lastSavedData = JSON.parse(JSON.stringify(this.data));
 
        } else if (result.error) {
            console.log(result.error);
            this.data = undefined;
        }
    };
 
    updateDataValues(updateItem) {
        let copyData = JSON.parse(JSON.stringify(this.data));
 
        copyData.forEach(item => {
            if (item.Id === updateItem.Id) {
                for (let field in updateItem) {
                    item[field] = updateItem[field];
                }
            }
        });
 
        //write changes back to original data
        this.data = [...copyData];
    }
 
    updateDraftValues(updateItem) {
        let draftValueChanged = false;
        let copyDraftValues = [...this.draftValues];
        //store changed value to do operations
        //on save. This will enable inline editing &
        //show standard cancel & save button
        copyDraftValues.forEach(item => {
            if (item.Id === updateItem.Id) {
                for (let field in updateItem) {
                    item[field] = updateItem[field];
                }
                draftValueChanged = true;
            }
        });
 
        if (draftValueChanged) {
            this.draftValues = [...copyDraftValues];
        } else {
            this.draftValues = [...copyDraftValues, updateItem];
        }
    }
 
    //listener handler to get the context and data
    //updates datatable, here I used AccountId you can use your look field API name
    lookupChanged(event) {
        console.log(event.detail.data);
        event.stopPropagation();
        let dataRecieved = event.detail.data;
        let accountIdVal = dataRecieved.value != undefined ? dataRecieved.value : null;
        // let updatedItem = { Id: dataRecieved.context, Premise__c: accountIdVal  };
        let updatedItem = { Id: dataReceived.context };
    
        if (dataReceived.field === 'Plan__c') {
            updatedItem.Plan__c = accountIdVal;
        } else if (dataReceived.field === 'Premise__c') {
            updatedItem.Premise__c = accountIdVal;
        }
        console.log(updatedItem);
        this.updateDraftValues(updatedItem);
        this.updateDataValues(updatedItem);
    }
 
    //handler to handle cell changes & update values in draft values
    handleCellChange(event) {
        this.updateDraftValues(event.detail.draftValues[0]);
    }
 
    handleSave(event) {
        this.showSpinner = true;
        this.saveDraftValues = this.draftValues;
 
        const recordInputs = this.saveDraftValues.slice().map(draft => {
            const fields = Object.assign({}, draft);
            return { fields };
        });
 
        // Updateing the records using the UiRecordAPi
        const promises = recordInputs.map(recordInput => updateRecord(recordInput));
        Promise.all(promises).then(res => {
            this.showToast('Success', 'Records Updated Successfully!', 'success', 'dismissable');
            this.draftValues = [];
            return this.refresh();
        }).catch(error => {
            console.log("error",error);
            this.showToast('Error', 'An Error Occured!!',error, 'dismissable');
        }).finally(() => {
            this.draftValues = [];
            this.showSpinner = false;
        });
    }
 
    handleCancel(event) {
        //remove draftValues & revert data changes
        this.data = JSON.parse(JSON.stringify(this.lastSavedData));
        this.draftValues = [];
    }
 
    showToast(title, message, variant, mode) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
            mode: mode
        });
        this.dispatchEvent(evt);
    }
 
    // This function is used to refresh the table once data updated
    async refresh() {
        await refreshApex(this.contactData);
    }
}