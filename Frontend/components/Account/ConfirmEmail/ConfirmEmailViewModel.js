import { extendObservable } from 'mobx';


export default class ConfirmEmailViewModel {


    constructor() {

        extendObservable(this, {
            queryingServer: false,
            exceptionIDCaught: false,
            criticalError: false
        });
    }
}