import { types, clone } from 'mobx-state-tree';

import BaseModel from './BaseModel';
import ItemFieldModel from './ItemFieldModel';


const getObject = () => {

    return Object.assign(
        {
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
        execAction: cb => {

            if (cb) cb();
        },
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
                    });
                }));
            }
        }
    })).views(self => ({

        getName: withType => {
            
            let result = ''

            if (self.names && self.names.length > 0) {

                if (withType && self.type) {
                    result = `  (${self.type.name})`;
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
    }));


ProdFamilyModel.getObject = getObject;

ProdFamilyModel.init = (value, genId, activeLangCode) => {

    const self = ProdFamilyModel.create({
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
                name: self.name,
                names: self.names.map((v, i) => v.getValue())
            });
    };

    return self;
};

export default ProdFamilyModel;