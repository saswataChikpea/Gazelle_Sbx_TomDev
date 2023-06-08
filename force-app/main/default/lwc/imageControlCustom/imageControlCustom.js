import { LightningElement,api } from 'lwc';

export default class ImageControlCustom extends LightningElement {
    @api url
    @api altText
}