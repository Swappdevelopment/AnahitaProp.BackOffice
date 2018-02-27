import { types, clone } from 'mobx-state-tree';

import BaseModel from './BaseModel';
import ItemNameModel from './ItemNameModel';


const getObject = () => {

    return Object.assign(
        {
            slug: types.optional(types.string, ''),
            type_Id: types.maybe(types.number, types.null),
            names: types.optional(types.array(ItemNameModel), []),
            name: types.optional(types.string, ''),
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
        setPropsValue: value => {

            BaseModel.setPropsValue(self, value);
        },
        sync: value => {

            self.originalValue = value;

            BaseModel.setPropsValue(self, value);

            self.names.length = 0;

            if (value.names && value.names.length > 0) {

                self.names.push(...value.names.map((v, i) => {

                    const lCode = v.language_Code ? v.language_Code.toLowerCase() : '';

                    if (self.activeLangCode && self.activeLangCode === lCode) {

                        self.name = v.value;
                    }

                    return ItemNameModel.init({
                        id: v.id,
                        status: v.status,
                        value: v.value,
                        language_Id: v.language_Id,
                        language_Code: v.lCode,
                    });
                }));
            }
        }
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

        self.originalValue = null;

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