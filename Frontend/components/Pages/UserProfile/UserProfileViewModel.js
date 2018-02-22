import { extendObservable, observe } from 'mobx';

import Helper from '../../../Helper/Helper';


export default class UserProfileViewModel {

    constructor() {

        this.originalValue = null;
        this.uid = null;

        extendObservable(this,
            Object.assign({
                inEditMode: false,
                waitingEmailConfirm: false,
                queryingServer: false,
                savingProfile: false,
                hasChanges: false,
                recievedInput: false,
                allowEmailChange: false,
                showChangePassword: false
            },
                UserProfileViewModel.getValues(),
                this.validationsObject()));

        this.validationsObject = this.validationsObject.bind(this);
        this.clone = this.clone.bind(this);
        this.sync = this.sync.bind(this);
        this.checkForChanges = this.checkForChanges.bind(this);
        this.isValid = this.isValid.bind(this);
    }


    static getValues() {

        return {
            accountName: '',
            fName: '',
            lName: '',
            email: '',
            emailConfirmed: false,
        };
    }

    validationsObject() {

        return {
            isAccountNameValid: () => this.recievedInput ? (this.accountName ? true : false) : true,
            isEmailValid: () => Helper.validateEmail(this.email, this.recievedInput)
        };
    }


    clone() {

        return {
            uid: this.uid,
            accountName: this.accountName,
            fName: this.fName,
            lName: this.lName,
            email: this.email,
            emailConfirmed: this.emailConfirmeduid
        };
    }


    sync(value) {

        if (value) {

            this.originalValue = value;

            this.uid = value.uid;
            this.accountName = value.accountName;
            this.fName = value.fName;
            this.lName = value.lName;
            this.email = value.email;
            this.emailConfirmed = value.emailConfirmed;

            this.waitingEmailConfirm = (this.email && !this.emailConfirmed) ? true : false;
        }
        else {

            this.originalValue = null;
        }

        this.hasChanges = false;
    }


    checkForChanges() {

        if (this.originalValue
            && (this.accountName != this.originalValue.accountName
                || this.fName != this.originalValue.fName
                || this.lName != this.originalValue.lName
                || this.email != this.originalValue.email)) {

            this.hasChanges = true;
        }
        else {

            this.hasChanges = false;
        }

        this.recievedInput = true;
    }


    isValid() {

        this.recievedInput = true;

        // return this.isEmailValid() && this.isAccountNameValid();
        return this.isAccountNameValid();
    }
}