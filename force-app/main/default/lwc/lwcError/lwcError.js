import { LightningElement, track, api } from 'lwc';
 
export default class LwcError extends LightningElement {
    @api title = 'Error'
    @api message = 'Something is wrong'
    @api technicalDetail
    @track activeSections = [];
    @track activeSectionsMessage = '';

    handleSectionToggle(event) {
        const openSections = event.detail.openSections;

        if (openSections.length === 0) {
            this.activeSectionsMessage = 'All sections are closed';
        } else {
            this.activeSectionsMessage =
                'Open sections: ' + openSections.join(', ');
        }
    }
}