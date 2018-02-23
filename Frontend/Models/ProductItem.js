import BaseModel from './BaseModel';

export default class ProductItem extends BaseModel {

    constructor(value, genId, activeLangCode) {

        super(genId);

        this.activeLangCode = activeLangCode ? activeLangCode.toLowerCase() : null;

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
            name: '',
            names: [],
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

            debugger;
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

            this.name = '';
            this.names.length = 0;

            if (value.names && value.names.length > 0) {

                this.names.push(...value.names.map((v, i) => {

                    const lCode = v.language_Code ? v.language_Code.toLowerCase() : '';

                    if (this.activeLangCode && this.activeLangCode === lCode) {

                        this.name = v.value;
                    }

                    return this.extendObv(
                        {
                            id: v.id,
                            status: v.status,
                            language_Id: v.language_Id,
                            language_Code: lCode
                        },
                        {
                            recordState: 0,
                            value: v.value
                        });
                }));
            }
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

        this.name = '';
        this.names.length = 0;
    }

    getValue() {

        const temp = Object.assign({}, this);

        delete temp.name;
        delete temp.isSaving;
        temp.names = this.names.map((v, i) => Object.assign({}, v));

        return temp;
    }
}