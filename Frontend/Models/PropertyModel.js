import { types, clone } from 'mobx-state-tree';

import BaseModel from './BaseModel';
import NeighbourhoodModel from './NeighbourhoodModel';
import FlagLinkModel from './FlagLinkModel';


const getObject = () => {

    return Object.assign(
        {
            uid: types.optional(types.string, ''),
            code: types.optional(types.string, ''),
            lotSize: types.optional(types.number, 0),
            neighbourhood_Id: types.maybe(types.number, types.null),
            neighbourhood: types.maybe(NeighbourhoodModel, types.null),
            flags: types.optional(types.array(FlagLinkModel), [])
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
        },
        resetOriginalValue: () => {

            const value = self.getValue();
            delete value.recordState;

            self.originalValue = value;

            if (self.neighbourhood) {

                self.neighbourhood.resetOriginalValue();
            }
        }
    })).views(self => ({
        isModified: excludeSubs => {

            const modified = BaseModel.isSelfModified(self, self.originalValue);

            if (!modified && !excludeSubs) {

                return self.flags.filter((v, i) => v.isModified()).length > 0;
            }

            return modified;
        }
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

        const temp = BaseModel.getValueFromSelf(self);

        return Object.assign(
            temp
            ,
            {
                uid: self.uid,
                code: self.code,
                lotSize: self.lotSize,
                neighbourhood_Id: self.neighbourhood_Id,
                neighbourhood: self.neighbourhood ? self.neighbourhood.getValue() : null
            });
    };

    return self;
};

export default PropertyModel;