import { types, clone } from 'mobx-state-tree';

import BaseModel from './BaseModel';
import ItemFieldModel from './ItemFieldModel';


const getObject = () => {

    return Object.assign(
        {
            originalValue: types.optional(types.frozen, null),
            receivedInput: types.optional(types.boolean, false),
            slug: types.optional(types.string, ''),
            latitude: types.optional(types.number, 0),
            longitude: types.optional(types.number, 0),
            size: types.maybe(types.number, types.null),
            names: types.optional(types.array(ItemFieldModel), []),
        },
        BaseModel.getBaseObject());
};


const NeighbourhoodModel = types.model(
    'NeighbourhoodModel',
    Object.assign(
        {
            isSaving: false
        },
        getObject())
).actions(
    self => ({

        execAction: func => { if (func) func(self); },

        sync: value => {

            self.originalValue = value;

            BaseModel.setPropsValue(self, value);

            self.names.length = 0;

            if (value.names && value.names.length > 0) {

                self.names.push(...value.names.map((v, i) => {

                    return ItemFieldModel.init({
                        id: v.id,
                        status: v.status,
                        value: v.value,
                        language: v.language,
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
        }
    })).views(self => ({

        isModified: () => BaseModel.isSelfModified(self, self.originalValue),

        requiresSaving: () => self.recordState > 0 || self.isModified(),

        getName: () => {

            if (self.names && self.names.length > 0) {

                if (self.activeLangCode) {

                    const nameItem = self.names.find(v => v.language_Code == self.activeLangCode);

                    if (nameItem) {

                        return nameItem.value;
                    }
                }

                return self.names[0].value;
            }

            return '';
        },

        isValid: () => {

            self.execAction(() => self.receivedInput = true);

            return !self.names.find(n => !n.isValid());
        }
    }));


NeighbourhoodModel.getObject = getObject;

NeighbourhoodModel.init = (value, genId, activeLangCode) => {

    const self = NeighbourhoodModel.create({
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
                slug: self.slug,
                type_Id: self.type_Id,
                names: self.names.map((v, i) => v.getValue())
            });
    };

    return self;
};


let _toBeAddedCounter = 0;

NeighbourhoodModel.toBeAdded = langStore => {

    const model = {
        id: -(++_toBeAddedCounter),
        recordState: 10,
        names: []
    };

    for (let [key, value] of Object.entries(langStore.allLanguages)) {

        model.names.push({
            id: -(++_toBeAddedCounter),
            language: {
                code: key.toUpperCase()
            }
        });
    }

    return NeighbourhoodModel.init(
        model,
        ++_toBeAddedCounter,
        langStore && langStore.active ? langStore.active.code : '');
};

export default NeighbourhoodModel;