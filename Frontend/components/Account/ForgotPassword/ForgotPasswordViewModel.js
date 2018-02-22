import { extendObservable } from 'mobx';


export default class ForgotPasswordViewModel {


    constructor() {

        extendObservable(this, {
            queryingServer: false,
            tokenSent: false,
            showErrMsg: false,
            identifier: ''
        });
    }
}