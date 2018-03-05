import { types, clone } from 'mobx-state-tree';

import BaseModel from './BaseModel';
import ItemFieldModel from './ItemFieldModel';


const getObject = () => {

    return Object.assign(
        {
            colValueRef: types.optional(types.string, ''),
            typeRef: types.optional(types.string, ''),
            types: types.optional(types.array(ItemFieldModel), []),
            originalValue: types.optional(types.frozen, null)
        },
        BaseModel.getBaseObject());
};


const FlagModel = types.model(
    'FlagModel',
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

            self.types.length = 0;

            if (value.types && value.types.length > 0) {

                self.types.push(...value.types.map((v, i) => {

                    return ItemFieldModel.init({
                        id: v.id,
                        status: v.status,
                        value: v.value,
                        language_Id: v.language_Id,
                        language_Code: v.language_Code ? v.language_Code.toLowerCase() : '',
                    });
                }));
            }
        },
        resetOriginalValue: () => {

            const value = self.getValue();
            delete value.recordState;

            self.originalValue = value;

            for (const tp of self.types) {

                tp.resetOriginalValue();
            }
        }
    })).views(
    self => ({

        getType: () => {

            if (self.types && self.types.length > 0) {

                if (self.activeLangCode) {

                    const typeItem = self.types.find(v => v.language_Code == self.activeLangCode);

                    if (typeItem) {

                        return typeItem.value;
                    }
                }

                return self.types[0].value;
            }

            return '';
        }
    }));


FlagModel.getObject = getObject;

FlagModel.init = (value, genId, activeLangCode) => {

    const self = FlagModel.create({
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
                colValueRef: self.colValueRef,
                typeRef: self.typeRef,
                types: self.types.map((v, i) => v.getValue())
            });
    };

    return self;
};

export default FlagModel;