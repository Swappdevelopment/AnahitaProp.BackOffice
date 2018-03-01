import { types, clone } from 'mobx-state-tree';

import BaseModel from './BaseModel';
import NeighbourhoodModel from './NeighbourhoodModel';


const getObject = () => {

    return Object.assign(
        {
            uid: types.optional(types.string, ''),
            code: types.optional(types.string, ''),
            latitude: types.optional(types.number, 0),
            lotSize: types.optional(types.number, 0),
            neighbourhood_Id: types.maybe(types.number, types.null),
            neighbourhood: types.maybe(NeighbourhoodModel, types.null)
        },
        BaseModel.getBaseObject());
};


const PropertyModel = types.model(
    'PropertyModel',
    Object.assign(
        {
            isSaving: false,
            originalValue: types.optional(types.frozen, null),
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

            BaseModel.setPropsValue(self, value, ['neighbourhood']);

            if (value.neighbourhood) {

                self.neighbourhood = NeighbourhoodModel.init(value.neighbourhood, self.genId, self.activeLangCode);
            }
            else {
                self.neighbourhood = null;
            }
        }
    })).views(self => ({
        isModified: () => BaseModel.isSelfModified(self, self.originalValue, true)
    }));


PropertyModel.getObject = getObject;

PropertyModel.init = (value, genId, activeLangCode) => {

    const self = PropertyModel.create({
        id: value && value.id >= 0 ? value.id : 0
    });

    self.genId = genId;
    self.execAction(() => self.activeLangCode = activeLangCode);

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

export default PropertyModel;