import { types, clone } from 'mobx-state-tree';

import BaseModel from './BaseModel';


const getObject = () => {

    return Object.assign(
        {
            name: types.optional(types.string, ''),
            account_Id: types.maybe(types.number, types.null),
            role_Id: types.maybe(types.number, types.null)
        },
        BaseModel.getBaseObject());
};


const RoleModel = types.model(
    'RoleModel',
    Object.assign(
        {
            isSaving: false
        },
        getObject())
).actions(
    self => ({
        execAction: func => {

            if (func) {
                func(self);
            }
        },
        setPropsValue: value => {

            BaseModel.setPropsValue(self, value);
        },
        sync: value => {

            self.originalValue = value;

            BaseModel.setPropsValue(self, value);
        },
        clearValues: () => {

            BaseModel.clearValues(self);

            self.name = '';
            self.account_Id = null;
            self.role_Id = null;
        }
    }));


RoleModel.getObject = getObject;

RoleModel.init = (value, genId) => {

    const self = RoleModel.create({
        id: value && value.id >= 0 ? value.id : 0
    });

    self.genId = genId;

    self.sync(value);

    self.initDone = true;


    self.getValue = () => {

        self.originalValue = null;

        return Object.assign(
            BaseModel.getValueFromSelf(self),
            {
                name: self.name,
                account_Id: self.account_Id,
                role_Id: self.role_Id
            });
    };

    return self;
};

export default RoleModel;