import { LightningElement, api, track } from 'lwc';
 
export default class Modal extends LightningElement {
    @track openmodel = false
    @api modalTitle = 'Lightning'
    @api showModal(){
        console.log('############showModal')
        this.openmodel = true
    }
    @api hideModal(){
        this.openmodel = false
    }
}