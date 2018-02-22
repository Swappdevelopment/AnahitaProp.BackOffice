import { extendObservable } from 'mobx';


export default class AddressItem {

    constructor(value, parent) {

        this.originalValue = value ? value : getObject();
        this.parents = parent;

        if (this.parents && !Array.isArray(this.parents)) {
            this.parents = [this.parents];
        }

        extendObservable(this, this.originalValue);

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
            venue_Id: 0,
            country_Id: 0,
            countryName: '',
            line1: '',
            line2: '',
            line3: '',
            line4: '',
            region: '',
            city: '',
            postalCode: '',
        };
    }

    getValue() {

        return {
            id: this.id,
            uid: this.uid,
            company_Id: this.company_Id ? this.company_Id : null,
            venue_Id: this.venue_Id ? this.venue_Id : null,
            country_Id: this.country_Id,
            line1: this.line1,
            line2: this.line2,
            line3: this.line3,
            line4: this.line4,
            region: this.region,
            city: this.city,
            postalCode: this.postalCode,
            recordState: this.recordState
        };
    }

    sync(value) {

        this.originalValue = value;

        if (value) {

            this.id = value.id;
            this.uid = value.uid;
            this.company_Id = value.company_Id;
            this.venue_Id = value.venue_Id;
            this.country_Id = value.country_Id;
            this.countryName = value.countryName;
            this.line1 = value.line1 ? value.line1 : '';
            this.line2 = value.line2 ? value.line2 : '';
            this.line3 = value.line3 ? value.line3 : '';
            this.line4 = value.line4 ? value.line4 : '';
            this.region = value.region ? value.region : '';
            this.city = value.city ? value.city : '';
            this.postalCode = value.postalCode ? value.postalCode : '';
        }
        else {

            this.clearValues();
        }

        this.recordState = 0;
    }

    checkRecordState() {

        if (this.originalValue && this.recordState != 10 && this.recordState != 30) {

            if (this.country_Id !== this.originalValue.country_Id
                || this.line1 !== this.originalValue.line1
                || this.line2 !== this.originalValue.line2
                || this.line3 !== this.originalValue.line3
                || this.line4 !== this.originalValue.line4
                || this.region !== this.originalValue.region
                || this.city !== this.originalValue.city
                || this.postalCode !== this.originalValue.postalCode) {

                if (this.id && this.id > 0) {

                    this.recordState = 20;
                }
                else {

                    this.recordState = 10;
                }

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

    clearValues() {

        this.originalValue = null;

        this.id = 0;
        this.uid = '';
        this.company_Id = 0;
        this.venue_Id = 0;
        this.country_Id = 0;
        this.countryName = '';
        this.line1 = '';
        this.line2 = '';
        this.line3 = '';
        this.line4 = '';
        this.region = '';
        this.city = '';
        this.postalCode = '';

        this.recordState = 0;
    }
}