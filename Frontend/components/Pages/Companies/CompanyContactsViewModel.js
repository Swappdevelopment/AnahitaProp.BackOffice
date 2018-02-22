import { extendObservable, observe } from 'mobx';

import PersonItem from '../../../Models/PersonItem';

import Helper from '../../../Helper/Helper';

export default class CompanyContactsViewModel {

    constructor(companyViewModel) {

        this.companyViewModel = companyViewModel;

        extendObservable(this, {
            isModalShown: false,
            searchText: '',
            toAddContact: null,
            selectedValue: null,
            verifyingToAdd: false,
            foundToAdd: [],
            contacts: []
        });

        this.syncContacts = this.syncContacts.bind(this);
        this.addNewContact = this.addNewContact.bind(this);
    }

    static idGenerator = 0;

    syncContacts(value) {

        if (value && Array.isArray(value)) {


            this.contacts.push(...value.map((v, i) => {

                CompanyContactsViewModel.idGenerator += 1;

                return new PersonItem(v, CompanyContactsViewModel.idGenerator, this.companyViewModel);
            }));
        }
    }

    genContact(value) {

        CompanyContactsViewModel.idGenerator += 1;
        const temp = new PersonItem(value, CompanyContactsViewModel.idGenerator, this.companyViewModel);
        temp.company_Id = this.companyViewModel.selectedCompForContacts ? this.companyViewModel.selectedCompForContacts.id : -1;

        return temp;
    }

    getNewContact() {

        if (this.companyViewModel.selectedCompForContacts && this.companyViewModel.selectedCompForContacts.id) {

            CompanyContactsViewModel.idGenerator += 1;
            const temp = new PersonItem(PersonItem.getObject(), CompanyContactsViewModel.idGenerator, this.companyViewModel);
            temp.recordState = 10;
            temp.company_Id = this.companyViewModel.selectedCompForContacts.id;

            return temp;
        }

        return null;
    }

    addNewContact(value) {

        if (value && this.contacts.indexOf(value) < 0) {

            this.contacts.splice(0, 0, value);
        }

        return value;
    }

    removeContact(value) {

        if (value) {

            const index = this.contacts.indexOf(value);

            if (index >= 0) {

                this.contacts.splice(index, 1);
            }
        }
    }
}