import { types } from 'mobx-state-tree';

import BaseModel from './BaseModel';



const ItemNameModel = types.model(
    'ItemNameModel',
    {
        recordState: types.optional(types.number, 0),
        value: types.optional(types.string, ''),
        recievedInput: false,
        originalValue: types.optional(types.frozen, null)
    }
).actions(
    self => ({
        execAction: func => {
            if (func) {
                func(self);
            }
        },
        setPropsValue: (value, listenForChange) => {

            BaseModel.setPropsValue(self, value, listenForChange);

            self.recievedInput = listenForChange ? true : false;
        },
        resetOriginalValue: () => {

            const value = self.getValue();
            delete value.recordState;

            self.originalValue = value;
        },
        setValue: value => {

            const nrs = value === self.value ? self.recordState : 20;

            self.value = value;

            switch (self.recordState) {

                case 0:
                    self.recordState = nrs;
                    break;
            }
        }
    })).views(self => ({
        isModified: () => {

            return BaseModel.isSelfModified(self, self.originalValue, true);
        },
        isValueValid: () => self.recievedInput ? (self.value ? true : false) : true,
        isValid: () => {

            self.recievedInput = true;

            return self.isValueValid();
        }
    }));

ItemNameModel.init = value => {

    const self = ItemNameModel.create({ recordState: 0 });

    self.execAction(() => self.originalValue = value);

    self.setPropsValue(value);

    self.id = value.id;
    self.status = value.status;
    self.language_Id = value.language_Id;
    self.language_Code = value.language_Code;


    self.getValue = () => {

        return Object.assign(
            BaseModel.getValueFromSelf(self),
            {
                value: self.value,
                language_Id: self.language_Id,
                language_Code: self.language_Code
            });
    };


    return self;
};


export default ItemNameModel;