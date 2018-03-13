import { extendObservable } from 'mobx';


export default class CompleteRegistrationViewModel {


    constructor() {

        extendObservable(
            this,
            Object.assign(
                {
                    email: '',
                    accountName: '',
                    fName: '',
                    lName: '',
                    password: '',
                    isPasswordValid: true,
                    completed: false,
                    processingRegistration: false,
                    queryingServer: false,
                    exceptionIDCaught: false,
                    criticalError: false,
                    receivedInput: false,
                    invalidMsgs: []
                },
                this.validationsObject()));
    }

    validationsObject() {

        return {
            isPasswordValid: () => this.receivedInput ? (this.password ? true : false) : true,
            isAccountNameValid: () => this.receivedInput ? (this.accountName ? true : false) : true,
            isAccountNameLengthValid: () => this.receivedInput ? (this.accountName && this.accountName.length > 2 ? true : false) : true
        };
    }


    sync(value) {

        if (value) {

            this.email = value.email;
            this.accountName = value.accountName ? value.accountName : this.email.split('@')[0];
            this.fName = value.fName;
            this.lName = value.lName;
            this.password = '';
        }
        else {

            this.email = '';
            this.accountName = '';
            this.fName = '';
            this.lName = '';
            this.password = '';
        }
    }


    isValid() {

        this.receivedInput = true;

        return this.isPasswordValid() && this.isAccountNameValid() && this.isAccountNameLengthValid();
    }
}