import { extendObservable } from 'mobx';

export default class RoleItem {

    constructor(value, genId) {

        this.originalValue = null;

        this.genId = genId;

        extendObservable(
            this,
            Object.assign(
                {
                    isSaving: false
                },
                RoleItem.getObject()));

        this.sync = this.sync.bind(this);
        this.clearValues = this.clearValues.bind(this);
        this.getValue = this.getValue.bind(this);

        this.sync(value);
    }

    static getObject() {

        return {
            recordState: 0,
            id: 0,
            status: 0,
            name: '',
            account_Id: null,
            role_Id: null
        };
    }

    sync(value) {

        this.originalValue = value;

        if (value) {

            if (value.role) {

                this.id = value.id;
                this.status = value.status;
                this.name = value.role.name ? value.role.name : '';
                this.account_Id = value.account_Id;
                this.role_Id = value.role_Id;
            }
            else {

                this.id = value.id;
                this.status = value.status;
                this.name = value.name ? value.name : '';
                this.account_Id = null;
                this.role_Id = null;
            }
        }
        else {

            this.clearValues();
        }

        this.recordState = 0;
    }

    clearValues() {

        this.originalValue = null;

        this.id = 0;
        this.status = 0;
        this.name = '';
        this.account_Id = null;
        this.role_Id = null;

        this.recordState = 0;
    }

    getValue() {

        return {
            recordState: this.recordState,
            id: this.id,
            status: this.status,
            name: this.name,
            account_Id: this.account_Id,
            role_Id: this.role_Id
        };
    }
}