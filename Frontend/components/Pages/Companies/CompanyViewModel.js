import { extendObservable } from 'mobx';


export default class CompanyViewModel {

    constructor() {

        this.defCountry = null;

        extendObservable(this, {
            isLazyLoading: false,
            showModalWait: false,
            isModalShown: false,
            companies: [],
            searchText: '',
            businessTypes: [],
            countries: [],
            occupations: [],
            selectedValue: null,
            selectedCompForContacts: null,
            statusType: 1
        });
    }

    static idGenerator = 0;

    getNewCompany() {

        CompanyViewModel.idGenerator += 1;
        const temp = new CompanyItem(CompanyItem.getObject(), CompanyViewModel.idGenerator);
        temp.recordState = 10;

        return temp;
    }

    addNewCompany(value) {

        if (value) {
            this.companies.splice(0, 0, value);
        }
        return value;
    }

    removeCompany(value) {

        if (value && this.companies) {

            const index = this.companies.indexOf(value);

            if (index >= 0) {

                this.companies.splice(index, 1);
            }
        }

    }

    syncCompanyItem(value) {

        return new CompanyItem(value, ++CompanyViewModel.idGenerator);
    }

    getLazyWaitRecord() {

        return {
            isLazyWait: true,
            genId: ++CompanyViewModel.idGenerator
        };
    }

    removeLazyWaitRecord() {

        if (this.companies
            && this.companies.length > 0
            && this.companies[this.companies.length - 1].isLazyWait) {

            this.companies.splice(this.companies.length - 1, 1);
        }
    }
}

class CompanyItem {

    constructor(value, genId) {

        this.originalValue = null;
        this.toEdit = null;

        this.genId = genId;

        extendObservable(
            this,
            Object.assign(
                {
                    isSaving: false,
                    error: null,
                    recievedInput: false,
                    isChangingStatus: false
                },
                CompanyItem.getObject()));

        this.sync = this.sync.bind(this);
        this.clearValues = this.clearValues.bind(this);

        this.sync(value);
    }

    static getObject() {

        return {
            recordState: 0,
            status: 1,
            id: 0,
            uid: '',
            name: '',
            tva: '',
            brn: '',
            businessType_Id: 0,
            businessTypeName: ''
        };
    }

    sync(value) {

        this.originalValue = value;

        if (value) {

            this.status = value.status;
            this.id = value.id;
            this.uid = value.uid ? value.uid : '';
            this.name = value.name ? value.name : '';
            this.tva = value.tva ? value.tva : '';
            this.brn = value.brn ? value.brn : '';
            this.businessType_Id = value.businessType_Id;
            this.businessTypeName = value.businessType ? value.businessType.name : '';
            this.businessTypeUID = value.businessType ? value.businessType.uid : '';
        }
        else {

            this.clearValues();
        }

        this.recordState = 0;
    }

    clearValues() {

        this.originalValue = null;
        this.toEdit = null;

        this.status = 0;
        this.id = 0;
        this.uid = '';
        this.name = '';
        this.tva = '';
        this.brn = '';
        this.businessType_Id = 0;
        this.businessTypeName = '';
        this.businessTypeUID = '';
        this.recordState = 0;
    }
}