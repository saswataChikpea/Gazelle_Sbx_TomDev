import { LightningElement,api,track } from 'lwc';
import DCF_LINE from '@salesforce/schema/DCF_Line__c';

export default class AddNewDCF extends LightningElement {
    newDCFline=DCF_LINE
}