import { extendObservable } from 'mobx';

import AddressItem from '../../../Models/AddressItem';
import TelNumberItem from '../../../Models/TelNumberItem';


export default class CompanyEditorViewModel {

    constructor(companyViewModel) {

        this.companyViewModel = companyViewModel;
        this.originalValue = null;

        extendObservable(
            this,
            Object.assign(
                {},
                {
                    bTypeName: '',
                    queryingServer: false,
                    recordState: 0,
                    recievedInput: false
                },
                CompanyEditorViewModel.getObject(this.companyViewModel),
                this.validationsObject()));

        this.clearValues = this.clearValues.bind(this);
        this.checkRecordState = this.checkRecordState.bind(this);
        this.sync = this.sync.bind(this);
    }

    validationsObject() {

        return {
            isNameValid: () => this.recievedInput ? (this.name ? true : false) : true,
            isBusinessTypeValid: () => this.recievedInput ? (this.businessType_Id && this.businessType_Id > 0 ? true : false) : true,
        };
    }

    static getObject(companyViewModel) {

        const temp = AddressItem.getObject();
        temp.company_Id = 0;
        temp.country_Id = companyViewModel && companyViewModel.defCountry ? companyViewModel.defCountry.id : 0;
        temp.countryName = companyViewModel && companyViewModel.defCountry ? companyViewModel.defCountry.name : '';

        return {
            status: 1,
            id: 0,
            uid: '',
            name: '',
            brn: '',
            email: '',
            websiteUrl: '',
            beautifiedWebsiteUrl: '',
            tva: '',
            businessType_Id: 0,
            businessTypeName: '',
            telNumbers: [],
            addresses: [temp]
        };
    }

    checkRecordState() {

        if (this.originalValue && this.recordState != 10 && this.recordState != 30) {

            if (this.name !== this.originalValue.name
                || this.status !== this.originalValue.status
                || this.brn !== this.originalValue.brn
                //|| this.email !== this.originalValue.email
                || this.websiteUrl !== this.originalValue.websiteUrl
                || this.tva !== this.originalValue.tva
                || this.businessType_Id !== this.originalValue.businessType_Id) {

                this.recordState = 20;
            }
            else {

                this.recordState = 0;
            }
        }

        this.recievedInput = true;
    }

    clearValues() {

        this.originalValue = null;

        this.status = 0;
        this.id = null;
        this.uid = null;
        this.name = '';
        this.brn = '';
        this.email = '';
        this.websiteUrl = '';
        this.beautifiedWebsiteUrl = '';
        this.tva = '';
        this.businessType_Id = null;
        this.businessTypeName = '';
        this.telNumbers.length = 0;
        this.addresses.length = 0;
    }

    getValue() {

        this.originalValue = null;

        const value = {

            status: this.status,
            id: this.id,
            uid: this.uid,
            name: this.name,
            brn: this.brn,
            email: this.email,
            websiteUrl: this.websiteUrl,
            tva: this.tva,
            businessType_Id: this.businessType_Id,
            telNumbers: this.telNumbers ? this.telNumbers.map((v, i) => v.getValue()) : null,
            addresses: this.addresses ? this.addresses.map((v, i) => v.getValue ? v.getValue() : v) : null,
            recordState: this.recordState
        };

        return value;
    }

    sync(value) {

        if (value) {

            this.originalValue = value;

            this.status = value.status;
            this.id = value.id;
            this.uid = value.uid;
            this.name = value.name ? value.name : '';
            this.brn = value.brn ? value.brn : '';
            this.email = value.email ? value.email : '';
            this.websiteUrl = value.websiteUrl ? value.websiteUrl : '';
            this.beautifiedWebsiteUrl = value.beautifiedWebsiteUrl ? value.beautifiedWebsiteUrl : '';
            this.tva = value.tva ? value.tva : '';
            this.businessType_Id = value.businessType_Id;
            this.businessTypeName = value.businessType ? value.businessType.name : '';

            const parents = [this, this.companyViewModel.selectedValue];

            this.telNumbers.length = 0;
            if (value.telNumbers) {


                this.telNumbers.push(...value.telNumbers.map((v, i) => new TelNumberItem(v, parents)));
            }

            this.addresses.length = 0;
            if (value.addresses && value.addresses.length > 0) {

                this.addresses.push(...value.addresses.map((v, i) => new AddressItem(v, parents)));
            }
            else {

                const temp = new AddressItem(AddressItem.getObject());
                temp.company_Id = this.id;
                temp.country_Id = this.companyViewModel && this.companyViewModel.defCountry ? this.companyViewModel.defCountry.id : 0;
                temp.countryName = this.companyViewModel && this.companyViewModel.defCountry ? this.companyViewModel.defCountry.name : '';

                this.addresses.push(temp);
            }
        }
        else {
            this.clearValues();
        }

        this.recordState = 0;
    }

    addNewTelNumber() {

        const newTelNum = new TelNumberItem(null, [this, this.companyViewModel.selectedValue]);
        newTelNum.country_Id = this.companyViewModel && this.companyViewModel.defCountry ? this.companyViewModel.defCountry.id : 0;
        newTelNum.company_Id = this.id;
        newTelNum.recordState = 10;

        this.telNumbers.splice(0, 0, newTelNum);

        if (this.recordState === 0) {

            this.recordState = 20;
        }

        if (this.companyViewModel.selectedValue.recordState === 0) {

            this.companyViewModel.selectedValue.recordState = 20;
        }
    }

    removeTelNumber(telNumber) {

        const index = this.telNumbers.indexOf(telNumber);

        if (index >= 0) {

            this.telNumbers.splice(index, 1);
        }

        if (this.recordState === 0) {

            this.recordState = 20;
        }

        if (this.companyViewModel.selectedValue.recordState === 0) {

            this.companyViewModel.selectedValue.recordState = 20;
        }
    }

    isValid() {

        this.recievedInput = true;

        return this.isNameValid() && this.isBusinessTypeValid();
    }
}