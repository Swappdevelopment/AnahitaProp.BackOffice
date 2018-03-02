import { types } from 'mobx-state-tree';

import BaseModel from './BaseModel';
import ItemNameModel from './ItemNameModel';
import ProdFamilyModel from './ProdFamilyModel';
import PropertyModel from './PropertyModel';
import ProjectModel from './ProjectModel';
import FlagLinkModel from './FlagLinkModel';


const getObject = () => {

    return Object.assign(
        {
            uid: types.optional(types.string, ''),
            code: types.optional(types.string, ''),
            slug: types.optional(types.string, ''),
            type: types.optional(types.number, 0),
            property_Id: types.optional(types.number, 0),
            currency_Id: types.optional(types.number, 0),
            productFamily_Id: types.optional(types.number, 0),
            currencyCode: types.optional(types.string, ''),
            project_Id: types.optional(types.number, 0),
            group_Id: types.optional(types.number, 0),
            netSize: types.optional(types.number, 0),
            grossSize: types.optional(types.number, 0),
            price: types.optional(types.number, 0),
            priority: types.optional(types.number, 1),
            binaryValue: types.optional(types.number, 0),
            hideSearch: false,
            isGroup: false,
            names: types.optional(types.array(ItemNameModel), []),
            productFamily: types.maybe(ProdFamilyModel, types.null),
            originalValue: types.optional(types.frozen, null),
            property: types.maybe(types.reference(PropertyModel), types.null),
            project: types.maybe(types.reference(ProjectModel), types.null),
            flags: types.optional(types.array(FlagLinkModel), [])
        },
        BaseModel.getBaseObject());
};


const ProductModel = types.model(
    'ProductModel',
    Object.assign(
        {
            receivedInput: false,
            isSaving: false,
            isLazyWait: false,
            isChangingStatus: false,
            isChangingHideSearch: false
        },
        getObject())
).actions(
    self => ({
        execAction: func => {

            if (func) {

                func(self);
            }
        },
        setRecordState: value => {

            self.recordState = value;
        },
        setPropsValue: (value, listenForChange) => {

            BaseModel.setPropsValue(self, value, listenForChange);

            self.receivedInput = listenForChange ? true : false;
        },
        resetOriginalValue: () => {

            const value = self.getValue();
            delete value.recordState;

            self.originalValue = value;

            if (self.property) {

                self.property.resetOriginalValue();
            }

            for (const nmv of self.names) {

                nmv.resetOriginalValue();
            }
        },
        sync: value => {

            self.originalValue = value;

            BaseModel.setPropsValue(self, value);

            self.names.length = 0;

            if (value.names && value.names.length > 0) {

                self.names.push(...value.names.map((v, i) => {

                    return ItemNameModel.init({
                        id: v.id,
                        status: v.status,
                        value: v.value,
                        language_Id: v.language_Id,
                        language_Code: v.language_Code ? v.language_Code.toLowerCase() : '',
                    });
                }));
            }

            if (value.productFamily) {

                self.productFamily = ProdFamilyModel.init(value.productFamily, self.genId, self.activeLangCode);
            }
            else {

                self.productFamily = null;
            }
        }
    })).views(
    self => ({
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
        requiresSave: () => (self.recordState !== 0 || self.isModified()),
        isModified: excludeSubs => {

            const modified = BaseModel.isSelfModified(self, self.originalValue);

            if (!modified && !excludeSubs) {

                return (self.property && self.property.isModified())
                    //|| (self.project && self.project.isModified())
                    || self.names.filter((v, i) => v.isModified()).length > 0
                    || self.flags.filter((v, i) => v.isModified()).length > 0;
            }

            return modified;
        },
        getNameAndCode: () => {

            let tempCode = self.code ? self.code.split('-') : null;

            tempCode = tempCode && tempCode.length > 0 ? tempCode[0] : null;

            return `${self.getName()}${tempCode ? ' ' + tempCode.toUpperCase() : ''}`;
        },
        isCodeValid: () => self.recievedInput ? (self.code ? true : false) : true,
        isPriceAndCurrencyValid: () => self.recievedInput ? ((self.currency_Id > 0 && self.price > 0) ? true : false) : true,
        isValid: () => {

            self.recievedInput = true;

            return self.isCodeValid()
                && self.isPriceAndCurrencyValid()
                && (self.names.filter((v, i) => !v.isValid()).length === 0);
        }
    }));


ProductModel.getObject = getObject;

ProductModel.init = (value, genId, activeLangCode) => {

    const self = ProductModel.create({
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
                uid: self.uid,
                code: self.code,
                slug: self.slug ? self.slug : self.getName(),
                property_Id: self.property_Id,
                currency_Id: self.currency_Id,
                productFamily_Id: self.productFamily_Id,
                project_Id: self.project_Id,
                group_Id: self.group_Id,
                netSize: self.netSize,
                grossSize: self.grossSize,
                price: self.price,
                priority: self.priority,
                binaryValue: self.binaryValue,
                hideSearch: self.hideSearch,
                isGroup: self.isGroup,
                type: self.type,
                names: self.names.map((v, i) => v.getValue()),
                property: self.property ? self.property.getValue() : null
            });
    };


    return self;
};

export default ProductModel;