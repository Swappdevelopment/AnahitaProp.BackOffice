import BaseModel from './BaseModel';

export default class ProductItem extends BaseModel {

    constructor(value, genId) {

        super(genId);

        this.sync = this.sync.bind(this);
        this.clearValues = this.clearValues.bind(this);

        this.sync(value);
    }

    static getObject() {

        return {
            recordState: 0,
            id: 0,
            status: 0,
            uid: '',
            code: '',
            slug: '',
            property_Id: 0,
            currency_Id: 0,
            project_Id: 0,
            group_Id: 0,
            netSize: 0,
            grossSize: 0,
            price: 0,
            priority: 0,
            binaryValue: 0,
            hideSearch: false,
            isGroup: false,
        };
    }

    getServerItem() {

        return ProductItem.getObject();
    }

    getLocalItem() {

        return {
            isSaving: false
        };
    }

    sync(value) {

        this.originalValue = value;

        if (value) {

            this.id = value.id;
            this.status = value.status;
            this.uid = value.uid ? value.uid : '';
            this.code = value.code ? value.code : '';
            this.slug = value.slug ? value.slug : '';
            this.property_Id = value.property_Id;
            this.currency_Id = value.currency_Id;
            this.project_Id = value.project_Id;
            this.group_Id = value.group_Id;
            this.netSize = value.netSize;
            this.grossSize = value.grossSize;
            this.price = value.price;
            this.priority = value.priority;
            this.binaryValue = value.binaryValue;
            this.hideSearch = value.hideSearch;
            this.isGroup = value.isGroup;
        }
        else {

            this.clearValues();
        }

        this.recordState = 0;
    }

    clearValues() {

        this.originalValue = null;

        this.recordState = 0;
        this.id = 0;
        this.status = 0;
        this.uid = '';
        this.code = '';
        this.slug = '';
        this.property_Id = 0;
        this.currency_Id = 0;
        this.project_Id = 0;
        this.group_Id = 0;
        this.netSize = 0;
        this.grossSize = 0;
        this.price = 0;
        this.priority = 0;
        this.binaryValue = 0;
        this.hideSearch = false;
        this.isGroup = false;
    }

    getValue() {

        const temp = Object.assign({}, this);

        delete temp.isSaving;

        return temp;
    }
}