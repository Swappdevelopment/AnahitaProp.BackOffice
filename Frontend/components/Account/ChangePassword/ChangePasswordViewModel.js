import { extendObservable } from 'mobx';


export default class ChangePasswordViewModel {


    constructor() {

        extendObservable(this, {
            changeSuccess: false,
            queryingServer: false,
            currentPassword: '',
            newPassword: '',
            newPasswordConfirm: '',
            newPasswordValidated: true,
            invalidMsgs: []
        });
    }
}