import { extendObservable } from 'mobx';
import moment from 'moment-es6';

import Helper from '../../../Helper/Helper';
import RoleItem from '../../../Models/RoleItem';

export default class UserManagementViewModel {

    constructor() {

        this.originalValue = null;

        extendObservable(
            this,
            {
                isModalShown: false,
                gettingRoles: false,
                targetRoleUser: null,
                searchText: '',
                users: [],
                roles: [],
                statusType: 1
            });

        this.getNewUser = this.getNewUser.bind(this);
        this.addNewUser = this.addNewUser.bind(this);
        this.removeUser = this.removeUser.bind(this);
        this.syncUserItem = this.syncUserItem.bind(this);
    }


    static idGenerator = 0;

    getNewUser() {

        UserManagementViewModel.idGenerator += 1;
        const temp = new UserItem(UserItem.getObject(), UserManagementViewModel.idGenerator);
        temp.recordState = 10;

        return temp;
    }

    addNewUser(value) {

        if (value) {

            this.users.splice(0, 0, value);
        }

        return value;
    }

    removeUser(user) {

        if (user && this.users) {

            const index = this.users.indexOf(user);

            if (index >= 0) {

                this.users.splice(index, 1);
            }
        }
    }

    syncUserItem(value) {

        return new UserItem(value, ++UserManagementViewModel.idGenerator);
    }
}



class UserItem {

    constructor(value, genId) {

        this.originalValue = null;

        this.genId = genId;

        extendObservable(
            this,
            Object.assign(
                {
                    isSaving: false,
                    error: null,
                    recievedInput: false,
                    emailSentStatus: 0
                },
                UserItem.getObject(),
                this.validationsObject()));

        this.validationsObject = this.validationsObject.bind(this);
        this.sync = this.sync.bind(this);
        this.checkRecordState = this.checkRecordState.bind(this);
        this.clearValues = this.clearValues.bind(this);
        this.isValid = this.isValid.bind(this);

        this.sync(value);
    }

    validationsObject() {

        return {
            isEmailValid: () => Helper.validateEmail(this.email, this.recievedInput)
        };
    }

    static getObject() {

        return {
            recordState: 0,
            id: 0,
            status: 1,
            uid: '',
            accountName: '',
            email: '',
            lName: '',
            fName: '',
            emailConfirmed: false,
            activityStartDate: null,
            activityEndDate: null,
            isCurrentUser: false,
            accountRoles: [],
            accountTokens: [],
        };
    }

    sync(value) {

        this.originalValue = value;

        if (value) {

            this.accountRoles.length = 0;
            this.accountTokens.length = 0;

            this.id = value.id;
            this.status = value.status;
            this.isCurrentUser = value.isCurrentUser;
            this.uid = value.uid ? value.uid : '';
            this.accountName = value.accountName ? value.accountName : '';
            this.email = value.email ? value.email : '';
            this.lName = value.lName ? value.lName : '';
            this.fName = value.fName ? value.fName : '';
            this.emailConfirmed = value.emailConfirmed;
            this.activityStartDate = value.activityStartDate ? moment(value.activityStartDate) : null;
            this.activityEndDate = value.activityEndDate ? moment(value.activityEndDate) : null;

            if (value.accountRoles) {
                this.accountRoles.push(...value.accountRoles.map((v, i) => new RoleItem(v, i)));
            }

            if (value.accountTokens) {
                this.accountTokens.push(...value.accountTokens);

                if (!this.email && this.accountTokens.length > 0 && this.accountTokens[0].type === 210) {

                    this.email = this.accountTokens[0].addData;
                    this.emailSentStatus = this.accountTokens[0].emailSentStatus;
                }
            }
        }
        else {

            this.clearValues();
        }

        this.recordState = 0;
    }

    checkRecordState() {

        if (this.originalValue && this.recordState != 10 && this.recordState != 30) {

            if (this.status !== this.originalValue.status
                || this.accountName !== this.originalValue.accountName
                || this.email !== this.originalValue.email
                || this.emailConfirmed !== this.originalValue.emailConfirmed
                || !Helper.compareDate(this.activityStartDate, moment(this.originalValue.activityStartDate))
                || !Helper.compareDate(this.activityEndDate, moment(this.originalValue.activityEndDate))) {

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

        this.accountRoles.length = 0;
        this.accountTokens.length = 0;

        this.id = 0;
        this.status = 0;
        this.uid = '';
        this.accountName = '';
        this.email = '';
        this.lName = '';
        this.fName = '';
        this.emailConfirmed = false;
        this.isCurrentUser = false;
        this.activityStartDate = null;
        this.activityEndDate = null;

        this.recordState = 0;
    }

    getValue() {

        this.originalValue = null;

        const value = {

            id: this.id,
            status: this.status,
            uid: this.uid,
            accountName: this.accountName,
            email: this.email,
            lName: this.lName,
            fName: this.fName,
            emailConfirmed: this.emailConfirmed,
            activityStartDate: this.activityStartDate ? this.activityStartDate : null,
            activityEndDate: this.activityEndDate ? this.activityEndDate : null,
            accountRoles: this.accountRoles ? this.accountRoles.map((v, i) => v.getValue()) : [],
            accountTokens: this.accountTokens ? this.accountTokens.map((v, i) => Object.assign({}, v)) : [],
            isCurrentUser: this.isCurrentUser,
            recordState: this.recordState
        };

        return value;
    }

    isValid() {

        this.recievedInput = true;

        return this.isEmailValid();
    }
}