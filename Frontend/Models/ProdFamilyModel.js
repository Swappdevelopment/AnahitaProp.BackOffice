import { types, onPatch } from 'mobx-state-tree';

import BaseModel from './BaseModel';
import ItemFieldModel from './ItemFieldModel';


const getObject = () => {

    return Object.assign(
        {
            isSaving: types.optional(types.boolean, false),
            receivedInput: types.optional(types.boolean, false),
            slug: types.optional(types.string, ''),
            type_Id: types.maybe(types.number, types.null),
            type: types.optional(types.frozen, null),
            names: types.optional(types.array(ItemFieldModel), []),
        },
        BaseModel.getBaseObject());
};


const ProdFamilyModel = types.model(
    'ProdFamilyModel',
    Object.assign(
        {
            isSaving: false
        },
        getObject())
).actions(
    self => ({
        execAction: cb => { if (cb) cb(self); },

        sync: value => {

            self.originalValue = value;

            BaseModel.setPropsValue(self, value);

            self.type = value.type ? value.type : null;

            self.names.length = 0;

            if (value.names && value.names.length > 0) {

                self.names.push(...value.names.map((v, i) => {

                    return ItemFieldModel.init({
                        id: v.id,
                        status: v.status,
                        value: v.value,
                        language_Id: v.language_Id,
                        language_Code: v.language_Code ? v.language_Code.toLowerCase() : '',
                        language: v.language
                    });
                }));
            }
        }
    })).views(self => ({

        isModified: () => BaseModel.isSelfModified(self, self.originalValue),

        requiresSaving: () => self.recordState > 0 || self.isModified(),

        getName: withType => {

            let result = ''

            if (self.names && self.names.length > 0) {

                if (withType && self.type) {

                    result = '  ';

                    if (self.type.name) {

                        result += `(${self.type.name})`;
                    }
                    else if (self.type.names && self.type.names.length > 0) {

                        if (self.activeLangCode) {

                            let nameItem = self.type.names.find(v => v.language_Code.toLowerCase() == self.activeLangCode.toLowerCase());

                            nameItem = nameItem

                            if (nameItem) {

                                result += `(${nameItem.value})`;
                            }
                        }
                        else {

                            result += `(${self.type.names[0].value})`;
                        }
                    }
                    else {

                        result = '';
                    }
                }

                if (self.activeLangCode) {

                    const nameItem = self.names.find(v => v.language_Code == self.activeLangCode);

                    if (nameItem) {

                        result = nameItem.value + result;
                    }
                }
                else {

                    result = self.names[0].value + result;
                }
            }

            return result;
        },

        getValue: () => {

            return Object.assign(
                BaseModel.getValueFromSelf(self),
                {
                    slug: self.slug,
                    type_Id: self.type_Id,
                    name: self.name,
                    type: self.type ? Object.assign({}, self.type) : null,
                    names: self.names.map((v, i) => v.getValue())
                });
        },

        isTypeValid: () => self.receivedInput ? (self.type_Id > 0 ? true : false) : true,
        isValid: () => {

            self.execAction(() => self.receivedInput = true);

            return self.isTypeValid() && !self.names.find(n => !n.isValid());
        }
    }));


ProdFamilyModel.getObject = getObject;

ProdFamilyModel.init = (value, genId, activeLangCode) => {

    const self = ProdFamilyModel.create({
        id: value && value.id !== 0 ? value.id : 0
    });

    self.genId = genId;
    self.activeLangCode = activeLangCode;

    self.sync(value);

    self.initDone = true;

    onPatch(self, change => {

        switch (change.path) {

            case '/receivedInput':

                for (const nm of self.names) {

                    nm.execAction(() => nm.receivedInput = self.receivedInput);
                }
                break;
        }
    });

    return self;
};


let _toBeAddedCounter = 0;

ProdFamilyModel.toBeAdded = langStore => {

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

    return ProdFamilyModel.init(
        model,
        ++_toBeAddedCounter,
        langStore && langStore.active ? langStore.active.code : '');
};

export default ProdFamilyModel;