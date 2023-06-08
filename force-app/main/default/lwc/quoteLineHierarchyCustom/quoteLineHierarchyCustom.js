import { LightningElement, api, track } from 'lwc'
import getMapKey from '@salesforce/apex/QuoteLineHierarchy.getMapKey'
import getQuoteLines from '@salesforce/apex/QuoteLineHierarchy.getQuoteLines'
import getConfigCounts from '@salesforce/apex/QuoteLineHierarchy.getConfigCounts'
import {ShowToastEvent} from 'lightning/platformShowToastEvent'

export default class QuoteLineHierarchyCustom extends LightningElement {
    @api recordId
    @api showAction
    @api showConfigCount
    @api title
    @api fromPremise = false
    @api quoteColumns = []

    @track ql
    @track quote
    @track qName
    @track qu_url
    @track quoteList = []
    @track gridData
    @track parentsArray
    @track counter
    @track currentExpanded

    tempGridData = []
    tempQuoteList
    configCounts
    quoteLineData
    parentMap
    planIds
    mapKey

    @api
    play() {
        console.log("1-----play click= ")
        const player = this.template.querySelector('video');
        // the player might not be in the DOM just yet
        if (player) {
            player.play();
        }
    }

    @api
    get allQuoteLines() {
        return this.quoteLineData
    }
    @api 
    get updateConfigCounts(){
        console.log("#*****1-----updateConfigCounts called")
        this.gridData = undefined
        this.tempGridData = []
        //getQuoteLine({ recordId: this.recordId})
        //this.callConfigCounts(this.planIds)
        this.callGetQuoteLine()
        return 'Success'
    }

    @api gridColumns = [
        {
            type: 'text',
            fieldName: 'Name',
            label: 'Quote Lines'
        },
        {
            type: 'text',
            fieldName: 'Plan_Equipemnt',
            label: 'Service Plans/Equipments'
        },
        {
            type: 'number',
            fieldName: 'ChikPeaTOM__Contract_Period__c',
            label: 'Contract Period',
            cellAttributes: { alignment: 'left' }
        },
        {
            type: 'text',
            fieldName: 'Parent_Line',
            label: 'Parent Line',
            initialWidth: 220
        }
    ]


    clickToGetExpanded(e) {
        console.log("1-----clickToGetExpanded= "+e)
        const grid =  this.template.querySelector('lightning-tree-grid')
        this.currentExpanded = grid.getCurrentExpandedRows()
    }

    connectedCallback(){
        console.log("#****callGetQuoteLine with id "+this.recordId)
        console.log('grid columns: '+JSON.stringify(this.gridColumns, null, '\t'))
        getMapKey({}).then(data=>{
            if(data)
                this.mapKey = data
        })
        this.callGetQuoteLine()
    }

    callGetQuoteLine(){
        getQuoteLines({ recordId: this.recordId}).then(data => {
            this.tempGridData = []
            this.tempQuoteList = []
            this.quoteLineData = data
            if(data.length === 0){
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Missing',
                    message: 'There are no Quote Lines in this Quote',
                    variant: 'info'
                }),)
            }
            if (data) {
                this.parentsArray = []
                this.currentExpanded = []
                this.createParentMap(data)

                console.log("1-----recordId= "+this.recordId)
                console.log("1-----data= "+JSON.stringify(data, null, '\t'))

                this.planIds = []
                for (let i = 0; i<data.length; i++) {
                    const ql = data[i]
                    if(ql.ChikPeaTOM__Quote__c){
                        this.qu_url = '/' + ql.ChikPeaTOM__Quote__c
                        this.qName =  ql.ChikPeaTOM__Quote__r.Name
                    }
                    if(ql.ChikPeaTOM__Service_Plan__c){
                        this.planIds.push(ql.ChikPeaTOM__Service_Plan__c)
                    }
                    
                    const json = {Id: ql.Id, Name: ql.Name, ChikPeaTOM__Contract_Period__c: ql.ChikPeaTOM__Contract_Period__c}
                    json.ql_id = '/' + ql.Id
                    if(ql.ChikPeaTOM__Service_Plan__c){
                        json.Plan_Equipemnt = ql.ChikPeaTOM__Service_Plan__r.Name
                    }
                    if(ql.ChikPeaTOM__Primary_Site__c && ql.ChikPeaTOM__Primary_Site__r){
                        json.primary_site = ql.ChikPeaTOM__Primary_Site__r.Name
                        json.primary_site_url = '/' + ql.ChikPeaTOM__Primary_Site__c
            
                        if(this.mapKey){
                            const primary_site = ql.ChikPeaTOM__Primary_Site__r
                            const mapUrl = 'http://maps.google.com/maps/api/staticmap?center='+primary_site.ChikPeaTOM__Street_Addess__c+','
                                    +primary_site.ChikPeaTOM__City__c+','+primary_site.ChikPeaTOM__State__c+
                                    '&zoom=14&size=166x80&maptype=roadmap&markers=color:red|size:small|'+
                                    primary_site.ChikPeaTOM__Street_Addess__c+','+primary_site.ChikPeaTOM__City__c+','+primary_site.ChikPeaTOM__State__c+'&sensor=false&key='+this.mapKey
                            json.map_url = mapUrl
                        }
                    }
                    if(ql.ChikPeaTOM__Quote_Line_Premises__r){
                        for(let i=0; i<ql.ChikPeaTOM__Quote_Line_Premises__r.length; i++){
                            const rec = ql.ChikPeaTOM__Quote_Line_Premises__r[i]
                            if(rec.ChikPeaTOM__Primary__c === true){
                                if(rec.ChikPeaTOM__Suite_No__c)
                                    json.suite = rec.ChikPeaTOM__Suite_No__c
                            }
                        }
                    }
                    if(json.primary_site)
                        this.tempQuoteList.push(json)
                }
                this.quoteList = this.tempQuoteList
                if(this.showConfigCount){
                    this.callConfigCounts(this.planIds)
                }else{
                    //create grid data
                    this.createTree()
                    this.gridData = this.tempGridData
                }
            }
        }).catch(error => {
            console.error("#**** error="+error)
            if(error.body){
                if (Array.isArray(error.body)) {
                    this.error = error.body.map(e => e.message).join(', ')
                } else if (typeof error.body.message === 'string') {
                    this.error = error.body.message
                }
            }else{
                this.error = error
            }
        })
    }
    
    createParentMap(data){
        var childs
        const parentMap = {}
        for (let i = 0; i<data.length; i++) {
            const rec = data[i]
            childs = []
            if(rec.ChikPeaTOM__Parent_Line__c === undefined){
                if(parentMap.null){
                    childs = parentMap.null
                }else{
                    parentMap.null = childs 
                }
            }else{
                if(parentMap[rec.ChikPeaTOM__Parent_Line__c]){
                    childs = parentMap[rec.ChikPeaTOM__Parent_Line__c]
                }else{
                    parentMap[rec.ChikPeaTOM__Parent_Line__c] = childs
                }
            }
            childs.push(rec)
        }
        this.parentMap = parentMap
        console.log("#**** createParentMap parentMap="+JSON.stringify(parentMap, null, '\t'))
    }

    createTree(){
        for (let i = 0; i<this.parentMap.null.length; i++) {
            const pOl = this.newQlJson(this.parentMap.null[i])
            const name = (i+1).toString()
            pOl.name = name
            this.currentExpanded.push(name)//auto expanding parent
            this.tempGridData.push(pOl)
            this.createTreeRec(pOl,0)//calling a recursive function
        }
        
    }

    createTreeRec(parent, depth){
        const children = this.parentMap[parent.Id]
        if(children){
            const _children = []
            for (let i = 0; i<children.length; i++) {
                const child = this.newQlJson(children[i])
                child.name = parent.name + '-' + String.fromCharCode(65+i)
                if(child.ChikPeaTOM__Parent_Line__c){
                    child.Parent_Line = child.ChikPeaTOM__Parent_Line__r.Name
                }
                _children.push(child)
                this.createTreeRec(child,(depth+1))
            }
            parent._children = _children
        }
    }

    newQlJson(data){
        const ql = {...data}
        console.log('newQlJson data= '+JSON.stringify(data, null, '\t'))
        ql.ql_id = '/' + ql.Id
        if(ql.ChikPeaTOM__Service_Plan__c){
            ql.Plan_Equipemnt = ql.ChikPeaTOM__Service_Plan__r.Name
        }else if(ql.ChikPeaTOM__Related_Equipment__c){
            ql.Plan_Equipemnt = ql.ChikPeaTOM__Related_Equipment__r.ChikPeaTOM__Equipment__r.Name
        }
        if(ql.ChikPeaTOM__Primary_Site__c && ql.ChikPeaTOM__Primary_Site__r){
            ql.primary_site = ql.ChikPeaTOM__Primary_Site__r.Name
            ql.primary_site_url = '/' + ql.ChikPeaTOM__Primary_Site__c
        }
        console.log("2========== newQlJson getConfigCounts = "+JSON.stringify(this.configCounts, null, '\t'))
        console.log("2==========newQlJson ql = "+ql.ChikPeaTOM__Service_Plan__c)
        
        if(this.configCounts){
            const configCount = this.configCounts[ql.ChikPeaTOM__Service_Plan__c]
            console.log('#****newQlJson configCounts='+configCount)
            if(configCount){
                if(ql.ChikPeaTOM__Quote_Configs__r){
                    console.log('#****1newQlJson configCounts='+configCount+','+ql.ChikPeaTOM__Quote_Configs__r.length)
                    ql.ConfigProgress = '('+ql.ChikPeaTOM__Quote_Configs__r.length
                        +'/'+configCount+')'
                }else{
                    ql.ConfigProgress = '(0/'+configCount+')'
                }
            }else{
                ql.ConfigProgress = '(0/0)'
            }
        }
        return ql
    }

    callConfigCounts(planIds){
        getConfigCounts({planIds: planIds}).then(result => {
            console.log("1==========getConfigCounts = "+JSON.stringify(result, null, '\t'))
            this.configCounts = {}
            for (let i = 0; i<result.length; i++) {
                const data = result[i] 
                this.configCounts[data.ChikPeaTOM__Plan__c] = data.config_count
            }
            //create grid data
            this.createTree()
            this.gridData = this.tempGridData
            this.error = undefined
            this.loadingText = false
            
        })
        .catch(error => {
            //console.error("#**** error="+error)
            if(error.body){
                if (Array.isArray(error.body)) {
                    this.error = error.body.map(e => e.message).join(', ')
                } else if (typeof error.body.message === 'string') {
                    this.error = error.body.message
                }
            }else{
                this.error = error
            }
        })
    }

    handleRowActions(event) {
        console.log('add click on hierarchy ====> ')
        const event1 = new CustomEvent('olrowaction', {
            // detail contains only primitives
            detail: {event: event.detail}
        });
        this.dispatchEvent(event1);
    }

}