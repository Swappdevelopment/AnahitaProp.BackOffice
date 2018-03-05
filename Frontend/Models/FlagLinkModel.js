import { types } from 'mobx-state-tree';

import BaseModel from './BaseModel';
import FlagModel from './FlagModel';


const getObject = () => {

    return Object.assign(
        {
            flag_Id: types.maybe(types.number, types.null),
            valueStr: types.maybe(types.string, types.null),
            valueInt: types.maybe(types.number, types.null),
            valueDbl: types.maybe(types.number, types.null),
            valueBool: types.maybe(types.boolean, types.null),
            valueDate: types.maybe(types.Date, types.null),
            flag: types.maybe(FlagModel, types.null),
            originalValue: types.optional(types.frozen, null)
        },
        BaseModel.getBaseObject());
};


const FlagLinkModel = types.model(
    'FlagLinkModel',
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
        sync: value => {

            self.originalValue = value;

            BaseModel.setPropsValue(self, value);

            if (value.flag) {

                self.flag = FlagModel.init(value.flag, self.genId, self.activeLangCode);
            }
            else {
                self.flag = null;
            }
        },
        resetOriginalValue: () => {

            const value = self.getValue();
            delete value.recordState;

            self.originalValue = value;
        }
    })).views(
    self => ({
        isModified: () => BaseModel.isSelfModified(self, self.originalValue),
        isBedNumberValueValid: () => {

            if (self.flag && self.flag.colValueRef === GlobalValues.constants.FLAG_NUM_BEDROOMS_REF) {

                return self.valueInt > 0;
            }

            return true;
        },
        getType: () => self.flag ? self.flag.getType() : ''
    }));;


FlagLinkModel.getObject = getObject;

FlagLinkModel.init = (value, genId, activeLangCode) => {

    const self = FlagLinkModel.create({
        id: value && value.id >= 0 ? value.id : 0
    });

    self.genId = genId;
    self.activeLangCode = activeLangCode;

    self.sync(value);

    self.initDone = true;


    self.getValue = () => {

        return Object.assign(
            BaseModel.getValueFromSelf(self),
            {
                flag_Id: self.flag_Id,
                valueStr: self.valueStr,
                valueInt: self.valueInt,
                valueDbl: self.valueDbl,
                valueBool: self.valueBool,
                valueDate: self.valueDate,
                flag: self.flag ? self.flag.getValue() : null
            });
    };

    return self;
};

export default FlagLinkModel;