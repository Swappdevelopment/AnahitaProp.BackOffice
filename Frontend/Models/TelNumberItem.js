import { extendObservable } from 'mobx';


export default class TelNumberItem {

    constructor(value, parent) {

        this.originalValue = null;
        this.parents = parent;

        if (this.parents && !Array.isArray(this.parents)) {
            this.parents = [this.parents];
        }

        extendObservable(this, TelNumberItem.getObject());

        this.sync = this.sync.bind(this);
        this.checkRecordState = this.checkRecordState.bind(this);
        this.clearValues = this.clearValues.bind(this);


        if (value) {

            this.sync(value);
        }
    }


    static getObject() {

        return {
            recordState: 0,
            id: 0,
            company_Id: 0,
            person_Id: 0,
            country_Id: 0,
            countryName: '',
            countryPhoneCode: '',
            number: ''
        };
    }

    sync(value) {

        this.originalValue = value;

        if (value) {

            this.id = value.id;
            this.company_Id = value.company_Id;
            this.person_Id = value.person_Id;
            this.country_Id = value.country_Id;
            this.countryName = value.countryName ? value.countryName : '';
            this.countryPhoneCode = value.countryPhoneCode ? value.countryPhoneCode : '';
            this.number = value.number ? value.number : '';
        }
        else {

            this.clearValues();
        }

        this.recordState = 0;
    }

    checkRecordState() {

        if (this.originalValue && this.recordState != 10 && this.recordState != 30) {

            if (this.country_Id !== this.originalValue.country_Id
                || this.number !== this.originalValue.number) {

                this.recordState = 20;

                if (this.parents && this.recordState > 0) {

                    for (let p of this.parents.filter((v, i) => v.recordState === 0)) {

                        p.recordState = 20;
                    }
                }
            }
            else {

                this.recordState = 0;
            }
        }
    }

    getValue() {

        return {

            id: this.id,
            company_Id: this.company_Id ? this.company_Id : null,
            person_Id: this.person_Id ? this.person_Id : null,
            country_Id: this.country_Id ? this.country_Id : null,
            number: this.number,
            recordState: this.recordState
        };
    }

    clearValues() {

        this.originalValue = null;

        this.id = 0;
        this.company_Id = 0;
        this.person_Id = 0;
        this.country_Id = 0;
        this.countryName = '';
        this.countryPhoneCode = '';
        this.number = '';

        this.recordState = 0;
    }
}