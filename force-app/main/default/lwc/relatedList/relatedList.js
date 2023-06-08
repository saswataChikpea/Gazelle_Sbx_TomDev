/* eslint-disable no-unused-vars */
/* eslint-disable dot-notation */
/* eslint-disable array-callback-return */
/* eslint-disable no-console */
import { LightningElement, wire, api, track } from 'lwc'
import { NavigationMixin } from 'lightning/navigation'
import { deleteRecord } from 'lightning/uiRecordApi'
import { ShowToastEvent } from 'lightning/platformShowToastEvent'
import getRelatedRecordList from '@salesforce/apex/RelatedList.getRelatedRecordList'
import deleteRelatedRecordList from '@salesforce/apex/RelatedList.deleteRelatedRecordList'
import getRelatedRecordListRefresh from '@salesforce/apex/RelatedList.getRelatedRecordListRefresh'
//const COLS = []

export default class RelatedList extends NavigationMixin(LightningElement) {
    @api childApiName = ''//Configured via Lightning App Builder, String of the API name of wchih related list to be shown
    @api parentRelationApiName = ''//Configured via Lightning App Builder, String of the API name parent
    @api parentObjectId = ''//Configured via Lightning App Builder, String of the parent Id
    @api recordId// page's record Id assignid automatically 
    @api disaplayFields = ''
    @api disaplayFieldsLabels = ''
    @api title = ''
    @api disaplayFieldsDetails = ''
    @api enableBulkDelete = false


    @track hasRecords = false
    @track makeSpace //take some space when record size is less to show menu button
    @track records
    @track error
    @track columns
    hideCheckBox = true
    selectedRows = [];

    connectedCallback() {
        this.disaplayFields = ""
        console.log("related list disaplayFieldsDetails=" + this.disaplayFieldsDetails)
        if (this.disaplayFieldsDetails) {
            const len = (this.disaplayFieldsDetails.length - 1)
            console.log("related list len=" + len)
            this.disaplayFieldsDetails = this.disaplayFieldsDetails.substring(1, len)
            console.log("related list after susbstring disaplayFieldsDetails=" + this.disaplayFieldsDetails)
            this.columns = JSON.parse(this.disaplayFieldsDetails)
            console.log("related list columns=" + JSON.stringify(this.columns, null, '\t'))
            for (let i = 0; i < this.columns.length; i++) {
                let field = this.columns[i]
                if (field.fieldName)
                    this.disaplayFields += field.fieldName + ","
            }

            console.log("related list disaplayFields=" + this.disaplayFields)

        }
        if (this.enableBulkDelete) {
            this.hideCheckBox = false
        }
    }

    @wire(getRelatedRecordList, {
        parentId: '$parentObjectId',
        parentApi: '$parentRelationApiName', childApi: '$childApiName', disaplayFields: '$disaplayFields'
    })
    wiredRelatedRecords(result) {
        if (result)
            this.processResult(result.data, result.error)

    }
    @api get refreshList() {
        console.log("related list in refreshList")
        getRelatedRecordListRefresh({
            parentId: this.parentObjectId,
            parentApi: this.parentRelationApiName, childApi: this.childApiName, disaplayFields: this.disaplayFields
        }).then(data => {
            console.log("related list refreshed")
            this.processResult(data, undefined);
        })
        return 'success'
    }

    processResult(data, error) {

        var jsonArray = []
        var i = 0
        var name_value = "null"
        var keys
        var key_to_replace
        var inner_object
        var coloumn_name_to_replace
        console.log("related list childapi=" + this.childApiName)
        //this.wiredContactsResult = result
        if (data) {
            console.log("related list data=" + JSON.stringify(data, null, '\t'))
            console.log("related list process result disaplayFieldsDetails=" + this.disaplayFieldsDetails)
            try {
                this.columns = JSON.parse(this.disaplayFieldsDetails)
            } catch (error) {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: this.title + ' Related List Display Fields Details json is invalid',
                        variant: 'error'
                    })
                )
            }

            try {
                if (this.columns) {
                    console.log("2 related list columns=" + JSON.stringify(this.columns))
                    this.columns.map(function (content, index) {
                        coloumn_name_to_replace = content["fieldName"]
                        if (coloumn_name_to_replace && coloumn_name_to_replace.includes("__r.")) {
                            console.log("content['filedName'] => " + JSON.stringify(content))
                            coloumn_name_to_replace = coloumn_name_to_replace.replace("__r.", "__r_")
                            content["fieldName"] = coloumn_name_to_replace
                            const key_to_add2 = coloumn_name_to_replace + "_url"
                            const typeAttributes = {
                                label: { fieldName: key_to_add2 },
                                target: '_blank'
                            }
                            content.type = 'url'
                            content.typeAttributes = typeAttributes
                        } else if (coloumn_name_to_replace === 'Name') {
                            content["fieldName"] = 'Name_url'
                            const typeAttributes = {
                                label: { fieldName: 'Name' },
                                target: '_blank'
                            }
                            content.type = 'url'
                            content.typeAttributes = typeAttributes
                        }
                    })
                    console.log("3 related list columns=" + JSON.stringify(this.columns))

                    this.records = data

                    this.records.map(function (content, index) {
                        //const recJson = JSON.stringify(content, null, '\t')
                        //const jsonObject = JSON.parse(recJson)
                        const jsonObject = { ...content }
                        console.log('------related list record loop :')
                        if (jsonObject.Id) {
                            jsonObject.Name_url = '/' + jsonObject.Id
                        }
                        console.log(JSON.stringify(jsonObject, null, '\t'))
                        keys = Object.keys(jsonObject)


                        for (i = 0; i < keys.length; i++) {
                            if (keys[i].includes("__r")) {
                                inner_object = jsonObject[keys[i]]

                                console.log("INNER OBJECT ==> ", inner_object)
                                const name_value = inner_object["Name"]
                                const id_value = inner_object["Id"]
                                const key_to_add1 = keys[i] + '_' + "Name"
                                const key_to_add2 = key_to_add1 + '_' + "url"

                                jsonObject[key_to_add1] = '/' + id_value
                                jsonObject[key_to_add2] = name_value
                            }
                        }
                        // result.data
                        jsonArray.push(jsonObject)
                    })
                }
            } catch (error) {
                console.error("related list error=" + error)
                var errorMsg = ''
                if (Array.isArray(error.body)) {
                    errorMsg = error.body.map(e => e.message).join(', ')
                } else if (typeof error.body.message === 'string') {
                    errorMsg = error.body.message
                }
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: errorMsg,
                        variant: 'error'
                    })
                )
            }

            console.log("1#****this.records=", jsonArray)
            // this.records[0]["ChikPeaTOM__Premise__c"] = "Test"
            this.records = jsonArray
            this.error = undefined
            try {
                this.hasRecords = data.length > 0
                this.makeSpace = data.length < 4
            } catch (ex) {
                console.error(ex)
            }
        } else if (error) {
            console.error("#****related list error=" + error)
            console.error("#****related error=" + JSON.stringify(error, null, '\t'))
            this.error = error
            this.records = undefined
        }

    }
    handleSelection(event) {
        this.selectedRows = event.detail.selectedRows;
    }
    deleteRecordsRowAction(event) {
        if (this.selectedRows.length > 0) {
            deleteRelatedRecordList({ records: this.selectedRows })
                .then(() => {
                    this.refreshList
                    const event1 = new CustomEvent('refreshplanlist', {
                        // detail contains only primitives
                        detail: { message: "", statusCode: 100 }
                    });
                    this.dispatchEvent(event1);
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Success',
                            message: 'Record(s) were deleted successfully.',
                            variant: 'success'
                        })
                    )
                })
                .catch(error => {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Error deleting record',
                            message: error.body.message,
                            variant: 'error'
                        })
                    )

                    console.error(JSON.stringify(error, null, '\t'))
                    if (error.body && error.body.output && error.body.output.errors) {
                        const e1 = error.body.output.errors
                        var es1 = ""
                        if (Array.isArray(e1)) {
                            es1 = e1.map(e => e.message).join(', ')
                        } else if (typeof e1.message === 'string') {
                            es1 = error.message
                        }
                        this.dispatchEvent(
                            new ShowToastEvent({
                                title: 'Error deleting record',
                                message: es1,
                                variant: 'error',
                                mode: 'sticky'
                            })
                        )
                    }
                })
        }else{
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'No record(s) were selected.',
                    variant: 'error'
                })
            )
        }
    }
    handleRowActions(event) {
        const selectedRecord = event.detail.row
        console.log("selectedRecord= " + JSON.stringify(selectedRecord, null, '\t'))
        const actionName = event.detail.action.name
        console.log("relatedList handleRowActions actionName= " + actionName)
        if (actionName === 'view') {
            this[NavigationMixin.Navigate]({
                type: 'standard__recordPage',
                attributes: {
                    recordId: selectedRecord.Id,
                    actionName: 'view'
                }
            })
        }
        if (actionName === 'edit') {
            console.log("edit action")
            this[NavigationMixin.Navigate]({
                type: 'standard__recordPage',
                attributes: {
                    recordId: selectedRecord.Id,
                    actionName: 'edit'
                }
            })
            console.log("Navigation called..")
        }
        if (actionName === 'delete') {
            deleteRecord(selectedRecord.Id)
                .then(() => {
                    this.refreshList
                    const event1 = new CustomEvent('refreshplanlist', {
                        // detail contains only primitives
                        detail: { message: "", statusCode: 100 }
                    });
                    this.dispatchEvent(event1);
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Success',
                            message: 'Record deleted',
                            variant: 'success'
                        })
                    )
                })
                .catch(error => {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Error deleting record',
                            message: error.body.message,
                            variant: 'error'
                        })
                    )

                    console.error(JSON.stringify(error, null, '\t'))
                    if (error.body && error.body.output && error.body.output.errors) {
                        const e1 = error.body.output.errors
                        var es1 = ""
                        if (Array.isArray(e1)) {
                            es1 = e1.map(e => e.message).join(', ')
                        } else if (typeof e1.message === 'string') {
                            es1 = error.message
                        }
                        this.dispatchEvent(
                            new ShowToastEvent({
                                title: 'Error deleting record',
                                message: es1,
                                variant: 'error',
                                mode: 'sticky'
                            })
                        )
                    }
                })
        }
    }
}