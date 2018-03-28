import { types } from 'mobx-state-tree';

import BaseModel from './BaseModel';



const ItemFieldModel = types.model(
    'ItemFieldModel',
    {
        recordState: types.optional(types.number, 0),
        value: types.optional(types.string, ''),
        receivedInput: false,
        originalValue: types.optional(types.frozen, null)
    }
).actions(
    self => ({
        execAction: func => { if (func) func(self); },
        
        sync: value => {

            self.originalValue = value;
            BaseModel.setPropsValue(self, value);
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

            return BaseModel.isSelfModified(self, self.originalValue);
        },
        isValueValid: () => self.receivedInput ? (self.value && self.value.length > 0 ? true : false) : true,
        isValid: () => {

            self.execAction(() => self.receivedInput = true);

            return self.isValueValid();
        }
    }));

ItemFieldModel.init = (value, genId) => {

    const self = ItemFieldModel.create({ recordState: 0 });

    self.genId = genId;

    self.sync(value);

    if (value) {

        self.id = value.id;
        self.status = value.status;
        self.isList = value.isList;
        self.detailRank = value.detailRank;
        self.language_Id = value.language_Id;
        self.language_Code = value.language_Code;
        self.language = value.language;
    }


    self.getValue = () => {

        return Object.assign(
            BaseModel.getValueFromSelf(self),
            {
                value: self.value,
                isList: self.isList,
                detailRank: self.detailRank,
                language_Id: self.language_Id,
                language_Code: self.language_Code,
                language: self.language
            });
    };


    return self;
};


export default ItemFieldModel;