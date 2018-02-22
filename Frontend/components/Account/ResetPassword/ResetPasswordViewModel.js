import { extendObservable } from 'mobx';


export default class ResetPasswordViewModel {

    constructor() {

        extendObservable(this, {
            queryingServer: false,
            resetSuccess: false,
            exceptionIDCaught: false,
            criticalError: false
        });
    }
}