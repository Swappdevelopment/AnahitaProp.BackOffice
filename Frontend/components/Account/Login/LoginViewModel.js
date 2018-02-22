import { extendObservable } from 'mobx';


export default class ForgotPasswordViewModel {


    constructor() {

        extendObservable(this, {
            queryingServer: false,
            showErrMsg: false,
            userName: '',
            password: '',
            remember: false
        });
    }
}