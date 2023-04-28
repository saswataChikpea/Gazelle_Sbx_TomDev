import { LightningElement,api } from 'lwc';
import QuotefromOpp from "@salesforce/apex/QuoteFromOpp.create";
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';

export default class CreateQuoteLWC extends NavigationMixin(LightningElement) {

    @api recordId;
    @api invoke(){
        console.log("record Id -> ",this.recordId);
        QuotefromOpp({oppId : this.recordId})
        .then(result =>{
            console.log("result",result)
            const event = new ShowToastEvent({
                title: 'Success!',
                message: 'Quote Created',
                variant: 'success',
            });
            this.dispatchEvent(event);

            this[NavigationMixin.Navigate]({
                type: 'standard__recordPage',
                attributes: {
                    recordId: result,
                    actionName: 'view'
                }
            });
        })
        .catch(err=>{
            console.log("error",err);
            const event = new ShowToastEvent({
                title: 'Error!',
                message: err,
                variant: 'error',
            });
            this.dispatchEvent(event);
        })
    }
}