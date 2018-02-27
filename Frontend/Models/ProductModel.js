import { types } from 'mobx-state-tree';

import BaseModel from './BaseModel';
import ItemNameModel from './ItemNameModel';
import ProdFamilyModel from './ProdFamilyModel';


const getObject = () => {

    return Object.assign(
        {
            uid: types.optional(types.string, ''),
            code: types.optional(types.string, ''),
            slug: types.optional(types.string, ''),
            property_Id: types.optional(types.number, 0),
            currency_Id: types.optional(types.number, 0),
            currencyCode: types.optional(types.string, ''),
            project_Id: types.optional(types.number, 0),
            group_Id: types.optional(types.number, 0),
            netSize: types.optional(types.number, 0),
            grossSize: types.optional(types.number, 0),
            price: types.optional(types.number, 0),
            priority: types.optional(types.number, 0),
            binaryValue: types.optional(types.number, 0),
            hideSearch: false,
            isGroup: false,
            name: types.optional(types.string, ''),
            names: types.optional(types.array(ItemNameModel), []),
            productFamily: types.maybe(ProdFamilyModel, types.null)
        },
        BaseModel.getBaseObject());
};


const ProductModel = types.model(
    'ProductModel',
    Object.assign(
        {
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
        setPropsValue: value => {

            BaseModel.setPropsValue(self, value, true);
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

            if (value.productFamily) {

                self.productFamily = ProdFamilyModel.init(value.productFamily, self.genId, self.activeLangCode);
            }
            else {

                self.productFamily = null;
            }
        }
    })).views(
    self => ({
        getNameAndCode: () => {
            
            let tempCode = self.code ? self.code.split('-') : null;

            tempCode = tempCode && tempCode.length > 0 ? tempCode[0] : null;

            return `${self.name}${tempCode ? ' ' + tempCode.toUpperCase() : ''}`;
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

        self.originalValue = null;

        return Object.assign(
            BaseModel.getValueFromSelf(self),
            {
                uid: self.uid,
                code: self.code,
                slug: self.slug,
                property_Id: self.property_Id,
                currency_Id: self.currency_Id,
                project_Id: self.project_Id,
                group_Id: self.group_Id,
                netSize: self.netSize,
                grossSize: self.grossSize,
                price: self.price,
                priority: self.priority,
                binaryValue: self.binaryValue,
                hideSearch: self.hideSearch,
                isGroup: self.isGroup,
                names: self.names.map((v, i) => v.getValue())
            });
    };


    return self;
};

export default ProductModel;