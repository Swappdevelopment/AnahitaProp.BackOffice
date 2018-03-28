import { types, destroy } from 'mobx-state-tree';

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
            neighbourhoodRef: types.maybe(types.reference(NeighbourhoodModel), types.null),
            flags: types.optional(types.array(FlagLinkModel), []),
            activeLangCode: types.optional(types.string, '')
        },
        BaseModel.getBaseObject());
};


const PropertyModel = types.model(
    'PropertyModel',
    Object.assign(
        {
            isSaving: false,
            receivedInput: false,
            originalValue: types.optional(types.frozen, null),
        },
        getObject()))

    .actions(self => ({
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
        resetOriginalValue: propertyFlags => {

            const value = self.getValue();
            delete value.recordState;

            self.originalValue = value;

            if (self.neighbourhood) {

                self.neighbourhood.resetOriginalValue();
            }

            for (const flag of self.flags.slice()) {

                if (flag.id > 0) {

                    if (flag.recordState === 30) {

                        destroy(flag);
                    }
                    else {

                        flag.resetOriginalValue();
                    }
                }
                else {

                    destroy(flag);
                }
            }

            if (propertyFlags) {

                self.flags.push(...propertyFlags.filter(f => {
                    return !self.flags.find(sf => sf.id === f.id);
                }).map(f => FlagLinkModel.init(f, f.id + 100000, self.activeLangCode)));
            }
        },
        addViewFlag: flag => {

            if (flag) {

                const negId = --self.flagGenId;

                self.flags.push(FlagLinkModel.init({
                    id: negId,
                    status: 1,
                    recordState: 10,
                    flag_Id: flag.id,
                    valueBool: true,
                    flag
                },
                    (negId * -1),
                    self.activeLangCode));
            }
        },
        destroySubModel: subModel => {

            if (subModel) {
                destroy(subModel);
            }
        }
    }))

    .views(self => ({
        isModified: excludeSubs => {

            const modified = BaseModel.isSelfModified(self, self.originalValue);

            if (!modified && !excludeSubs) {

                return self.flags.filter((v, i) => v.isModified()).length > 0;
            }

            return modified;
        },

        requiresSaving: excludeSubs => self.recordState > 0 || self.isModified(excludeSubs),

        getFullName() {

            if (self.neighbourhood) {
                return `${self.neighbourhood.getName()} - ${self.code.toUpperCase()}`;
            }

            return self.code;
        },
        getValue: () => {

            const temp = BaseModel.getValueFromSelf(self);

            return Object.assign(
                temp,
                {
                    uid: self.uid,
                    code: self.code,
                    lotSize: self.lotSize,
                    neighbourhood_Id: self.neighbourhood_Id,
                    neighbourhood: self.neighbourhood ?
                        self.neighbourhood.getValue()
                        :
                        (self.neighbourhoodRef ? self.neighbourhoodRef.getValue() : null),
                    flags: self.flags ? self.flags.map(f => f.getValue()) : null
                });
        },
        isCodeValid: () => self.receivedInput ? (self.code ? true : false) : true,
        isLotSizeValid: () => self.receivedInput ? (self.lotSize >= 0 ? true : false) : true,
        isNbhValid: () => self.receivedInput ? (self.neighbourhood_Id > 0 ? true : false) : true,
        isValid: () => {

            self.execAction(() => self.receivedInput = true);

            return self.isCodeValid()
                && self.isLotSizeValid()
                && self.isNbhValid();
        },
    }));


PropertyModel.getObject = getObject;

PropertyModel.init = (value, genId, activeLangCode) => {

    const self = PropertyModel.create({
        id: value && value.id >= 0 ? value.id : 0
    });

    self.flagGenId = -1;

    self.genId = genId;
    self.execAction(() => self.activeLangCode = activeLangCode);

    self.sync(value);

    self.initDone = true;


    return self;
};


let _toBeAddedCounter = 0;

PropertyModel.toBeAdded = () => {

    const model = {
        id: -(++_toBeAddedCounter),
        recordState: 10
    };

    return PropertyModel.init(
        model,
        ++_toBeAddedCounter);
};

export default PropertyModel;