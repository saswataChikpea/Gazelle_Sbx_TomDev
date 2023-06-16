import { LightningElement, api , wire } from 'lwc';
import getSuppliers from "@salesforce/apex/TOMPlanToSupplier.getSuppliers";
import { updateRecord } from 'lightning/uiRecordApi';
import { CloseActionScreenEvent } from 'lightning/actions';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';




import QUOTE_LINE_OBJECT from '@salesforce/schema/ChikPeaTOM__Quote_Line__c';
import QUOTE_LINE_ID from '@salesforce/schema/ChikPeaTOM__Quote_Line__c.Id';
import SUPPLIER_FIELD from '@salesforce/schema/ChikPeaTOM__Quote_Line__c.Supplier__c';


export default class PlanToSupplier extends LightningElement {

    @api recordId;
    suppliers;
    error;
    isChecked = false;
    newsupplierId;
    showSpinner=false;


    @wire(getSuppliers, { qLineId: '$recordId' })
    wiredData({ error, data }) {
        if (data) {
            this.suppliers = data;
            this.error = undefined;

        console.log('Data',data);
        } else if (error) {
            this.error = error;
            this.suppliers = undefined;
         console.error('Error:', error);
      }
    }

    handleChange(event) {
        const planCostId = event.target.name;
        const isChecked = event.target.checked;

    // Find the supplier and plan cost in the data
    for (let supplier of this.suppliers) {
        for (let pc of supplier.planCosts) {
            if (pc.planCostId === planCostId) {
                // Update the isChecked property of the plan cost
                pc.isChecked = isChecked;
                break;
            }
        }
    }
    
        console.log('Supplier ID:', event.target.dataset.supplierId);
        
        this.newsupplierId = event.target.dataset.supplierId;
        

    }

    handleSave() {

        console.log('Save Clicked');
        this.showSpinner=true;
        const fields = {};

        

        fields[QUOTE_LINE_ID.fieldApiName] = this.recordId;
        fields[SUPPLIER_FIELD.fieldApiName] = this.newsupplierId;

        console.log('fields',fields);

        const recordInput = { fields: fields };
        
        updateRecord(recordInput)
            .then(() => {
                // Success! Handle any additional logic here.
                console.log('Quote Line record updated successfully.');
                const event = new ShowToastEvent({
                    title: 'Success!',
                    message: 'Supplier Added',
                    variant: 'success',
                });
                this.dispatchEvent(event);

                this.handleCancel();
                this.showSpinner=false;

            })
            .catch(error => {
                // Handle error
                console.error('Error updating Quote Line record:', error);
                const event = new ShowToastEvent({
                    title: 'Error!',
                    message: error,
                    variant: 'error',
                });
                this.dispatchEvent(event);
                this.showSpinner=false;
            });

    }

    handleCancel(){
        const closeQuickAction = new CloseActionScreenEvent();
        this.dispatchEvent(closeQuickAction);
    }


}