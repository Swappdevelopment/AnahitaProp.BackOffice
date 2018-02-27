import { types, destroy, detach } from 'mobx-state-tree';
import moment from 'moment-es6';

import BaseModel from './BaseModel';
import RoleModel from './RoleModel';



const getObject = () => {

    return Object.assign(
        BaseModel.getBaseObject(),
        {
            uid: types.optional(types.string, ''),
            accountName: types.optional(types.string, ''),
            email: types.optional(types.string, ''),
            lName: types.optional(types.string, ''),
            fName: types.optional(types.string, ''),
            emailConfirmed: false,
            activityStartDate: types.optional(types.frozen, null),
            activityEndDate: types.optional(types.frozen, null),
            isCurrentUser: false,
            accountRoles: types.optional(types.array(RoleModel), []),
            accountTokens: types.optional(types.array(types.frozen), [])
        }
    );
}



const UserModel = types.model(
    'UserModel',
    Object.assign(
        getObject(),
        {
            isSaving: false,
            error: types.optional(types.frozen, null),
            receivedInput: false,
            emailSentStatus: types.optional(types.number, 0)
        })
).actions(
    self => ({
        insertAccountRole: (index, value) => {

            if (value && index >= 0 && index <= self.accountRoles.length) {

                self.accountRoles.splice(index, 0, RoleModel.init(value, ++self.accountRolesIdGen));
            }
        },
        removeAccountRole: (accRole, doDestroy) => {

            if (accRole) {

                detach(accRole);

                if (doDestroy) {
                    destroy(accRole);
                }
            }
        },
        hasAccountRole: roleId => {

            const temp = self.accountRoles.find((v, i) => v.role_Id === roleId);

            return temp ? true : false;
        },
        setPropsValue: value => {

            BaseModel.setPropsValue(self, value, true);
            this.receivedInput = true;
        },
        setRecordState: value => {

            self.recordState = value;
        },
        sync: value => {

            self.originalValue = value;

            BaseModel.setPropsValue(
                self,
                Object.assign(
                    value,
                    {
                        activityStartDate: value.activityStartDate ? moment(value.activityStartDate) : null,
                        activityEndDate: value.activityEndDate ? moment(value.activityEndDate) : null
                    }));

            if (value.accountRoles) {

                self.accountRoles.push(...value.accountRoles.map((v, i) => RoleModel.init(v, ++self.accountRolesIdGen)));
            }

            if (value.accountTokens) {

                self.accountTokens.push(...value.accountTokens.map((v, i) => Object.assign({}, v)));

                if (!self.email && self.accountTokens.length > 0 && self.accountTokens[0].type === 210) {

                    self.email = self.accountTokens[0].addData;
                    self.emailSentStatus = self.accountTokens[0].emailSentStatus;
                }
            }
        },
        clearValues: () => {

            BaseModel.clearValues(self);

            self.accountRoles.length = 0;
            self.accountTokens.length = 0;

            self.uid = '';
            self.accountName = '';
            self.email = '';
            self.lName = '';
            self.fName = '';
            self.emailConfirmed = false;
            self.isCurrentUser = false;
            self.activityStartDate = null;
            self.activityEndDate = null;
        }
    })).views(
    self => ({

        isEmailValid: () => Helper.validateEmail(self.email, self.recievedInput),

        isValid: () => {

            self.recievedInput = true;

            return self.isEmailValid();
        },

        findAccountRole: roleId => self.accountRoles.find((ar, i) => ar.role_Id === roleId)
    }));


UserModel.getObject = getObject;


UserModel.init = (value, genId) => {

    const self = UserModel.create({
        id: value && value.id >= 0 ? value.id : 0
    });

    self.accountRolesIdGen = 0;

    self.originalValue = null;
    self.genId = genId;

    self.sync(value);

    self.initDone = true;


    self.getValue = () => {

        self.originalValue = null;

        return Object.assign(
            BaseModel.getValueFromSelf(self),
            {
                uid: self.uid,
                accountName: self.accountName,
                email: self.email,
                lName: self.lName,
                fName: self.fName,
                emailConfirmed: self.emailConfirmed,
                activityStartDate: self.activityStartDate ? self.activityStartDate : null,
                activityEndDate: self.activityEndDate ? self.activityEndDate : null,
                accountRoles: self.accountRoles.map((v, i) => v.getValue()),
                accountTokens: self.accountTokens.map((v, i) => Object.assign({}, v)),
                isCurrentUser: self.isCurrentUser
            });
    };


    return self;
};


export default UserModel;