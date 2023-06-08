import { LightningElement,api } from 'lwc';
import createOppLine from "@salesforce/apex/OppLineFromDCF.createOppLine"
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';

export default class DcfLineToOppLine extends NavigationMixin(LightningElement) {
    @api recordId;
    loadSpinner =true
    
    @api invoke(){
        console.log(this.recordId);
        createOppLine({dcfId : this.recordId})
            .then(result=>{
                console.log("result",result)
                const event = new ShowToastEvent({
                title: 'Success!',
                message: 'Quote Created',
                variant: 'success',
            });
            this.dispatchEvent(event);

            loadSpinner=false;

            })
            .catch(err=>{
                console.log("error",err);
                loadSpinner=false;
                const event = new ShowToastEvent({
                    title: 'Error!',
                    message: err,
                    variant: 'error',
                });
                this.dispatchEvent(event);
            })
    }
}