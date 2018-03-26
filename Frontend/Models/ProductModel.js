import { types, detach, destroy, onPatch, getParent } from 'mobx-state-tree';

import BaseModel from './BaseModel';
import ItemFieldModel from './ItemFieldModel';
import ProdFamilyModel from './ProdFamilyModel';
import PropertyModel from './PropertyModel';
import ProjectModel from './ProjectModel';
import FlagLinkModel from './FlagLinkModel';
import EntityFileModelWrapper from './EntityFileModelWrapper';

import Helper from '../Helper/Helper';



const productFamilyReference =
    BaseModel.genModelReference(
        ProdFamilyModel,
        (identifier, parent) => {

            const pp = getParent(getParent(parent));
            return (pp ? pp.prodFamilies.find(pf => pf.id === identifier) : null) || null;
        });

// const productFamilyReference = types.maybe(
//     types.reference(ProdFamilyModel, {

//         get(identifier, parent) {

//             const pp = getParent(getParent(parent));

//             return (pp ? pp.prodFamilies.find(pf => pf.id === identifier) : null) || null
//         },
//         set(value) {

//             return value
//         }
//     })
// );



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
            names: types.optional(types.array(ItemFieldModel), []),
            descs: types.optional(types.array(ItemFieldModel), []),
            productFamily: productFamilyReference,
            // productFamily: types.maybe(types.reference(ProdFamilyModel), types.null),
            originalValue: types.optional(types.frozen, null),
            property: types.maybe(types.reference(PropertyModel), types.null),
            project: types.maybe(types.reference(ProjectModel), types.null),
            flags: types.optional(types.array(FlagLinkModel), []),
            files: types.optional(types.array(EntityFileModelWrapper), [])
        },
        BaseModel.getBaseObject());
};


const ProductModel = types.model(
    'ProductModel',
    Object.assign(
        {
            receivedInput: false,
            isRefreshing: false,
            isSaving: false,
            isLazyWait: false,
            isGettingFlags: false,
            isGettingFiles: false,
            isGettingDescs: false,
            isChangingStatus: false,
            isChangingHideSearch: false,
            group: types.maybe(types.reference(types.late(() => ProductModel)), types.null),
            subProducts: types.optional(types.array(types.late(() => ProductModel)), [])
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
        resetOriginalValue: propertyFlags => {

            const value = self.getValue();
            delete value.recordState;

            self.originalValue = value;

            if (self.property) {

                self.property.resetOriginalValue(propertyFlags);
            }

            for (const nmv of self.names) {

                nmv.resetOriginalValue();
            }

            for (const desc of self.descs) {

                desc.resetOriginalValue();
            }

            for (const flag of self.flags) {

                flag.resetOriginalValue();
            }
        },
        sync: value => {

            self.originalValue = value;

            BaseModel.setPropsValue(self, value, ['productFamily']);

            self.names.length = 0;
            self.descs.length = 0;
            self.flags.length = 0;
            self.files.length = 0;

            if (self.group_Id > 0) {

                self.group = self.group_Id;
            }
            else {

                self.group = null;
            }

            if (self.productFamily_Id > 0) {

                self.productFamily = self.productFamily_Id;
            }
            else {

                self.productFamily = null;
            }

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
        setOriginalValueProperty: value => {

            if (value) {

                self.originalValue = Object.assign({}, self.originalValue, value);
            }
        },
        sortFilesOnRank: file => {

            if (file && file.wrapper) {

                const index = self.files.indexOf(file.wrapper);

                if (index >= 0) {

                    let tempArray = self.files
                        .map((f, i) => ({ f: f.model, i }))
                        .filter(item =>
                            item.f !== file
                            && item.f.detailRank >= file.detailRank
                            && item.f.detailRank <= file.detailRank);


                    const targetIndex = tempArray.length > 0 ? tempArray[0].i : 0;

                    if (targetIndex !== index && targetIndex >= 0) {

                        for (let i = 0; i < self.files.length; i++) {

                            if (index > targetIndex) {

                                if (i >= targetIndex && i < index) {

                                    self.files[i].model.execAction(selfFile => selfFile.detailRank += 1);
                                }
                            }
                            else {

                                if (i > index && i <= targetIndex) {

                                    self.files[i].model.execAction(selfFile => selfFile.detailRank -= 1);
                                }
                            }
                        }

                        detach(file.wrapper);

                        self.files.splice(targetIndex, 0, file.wrapper);

                        // self.saveReorderSession();
                    }
                }
            }
        },
        saveReorderSession: () => {

            if (!self.isGettingFiles) {

                self.isGettingFiles = true;
                let idCounter = -1;

                const filesToSave = self.files.filter(w => w.model && w.model.isModified()).map(w => w.getValue());

                Helper.RunPromise(
                    {
                        promise: Helper.FetchPromisePost(
                            '/products/saveProductFiles/', { files: filesToSave }),
                        success: data => {

                            for (let item of filesToSave) {

                                const value = self.files.find(f => f.model && f.model.id === item.id);

                                if (value && value.model && value.model.originalValue) {

                                    value.model.setOriginalValueProperty({ detailRank: item.detailRank });
                                }
                            }
                        },
                        incrementSession: () => {

                            self.saveReorderSessionPromiseID = self.saveReorderSessionPromiseID ? (self.saveReorderSessionPromiseID + 1) : 1;
                            idCounter = self.saveReorderSessionPromiseID;
                        },
                        sessionValid: () => {

                            return idCounter === self.saveReorderSessionPromiseID;
                        }
                    },
                    error => {
                    },
                    () => {

                        self.execAction(() => self.isGettingFiles = false);
                    }
                );
            }
        },
        deleteProductFile: prodFile => {

            if (!prodFile.isSaving) {

                prodFile.execAction(self => self.isSaving = true);

                const param = {
                    files: [prodFile.getValue()]
                };

                param.files[0].recordState = 30;

                let success = false;

                Helper.RunPromise(
                    {
                        promise: Helper.FetchPromisePost(
                            '/products/saveProductFiles/', param),
                        success: data => {

                            if (prodFile.wrapper) {

                                self.execAction(() => {

                                    destroy(prodFile.wrapper);
                                });

                                success = true;
                            }
                        }
                    },
                    error => {
                    },
                    () => {

                        if (!success) {

                            prodFile.execAction(self => self.isSaving = false);
                        }
                    });
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
                    || self.descs.filter((v, i) => v.isModified()).length > 0
                    || self.flags.filter((v, i) => v.isModified()).length > 0;
            }

            return modified;
        },
        getNameAndCode: () => {

            let tempCode = self.code ? self.code.split('-') : null;

            tempCode = tempCode && tempCode.length > 0 ? tempCode[0] : null;

            return `${self.getName()}${tempCode ? ' ' + tempCode.toUpperCase() : ''}`;
        },
        isCodeValid: () => self.receivedInput ? (self.code ? true : false) : true,
        isNetSizeValid: () => self.receivedInput ? (self.netSize >= 0 ? true : false) : true,
        isGrossSizeValid: () => self.receivedInput ? (self.grossSize >= 0 ? true : false) : true,
        isCurrencyValid: () => self.receivedInput ? (self.currency_Id > 0 ? true : false) : true,
        isPriceValid: () => self.receivedInput ? (self.price >= 0 ? true : false) : true,
        isFamilyValid: () => self.receivedInput ? (self.productFamily_Id > 0 ? true : false) : true,
        isPropertyValid: () => {

            if (self.receivedInput
                && (!self.type || self.type === 10 || self.type === 20)) {

                return self.property_Id > 0;
            }

            return true;
        },
        isProjectValid: () => {

            if (self.receivedInput
                && (!self.type || self.type === 20 || self.type === 30)) {

                return self.project_Id > 0;
            }

            return true;
        },
        isValid: () => {

            self.execAction(() => self.receivedInput = true);

            return self.isCodeValid()
                && self.isNetSizeValid()
                && self.isGrossSizeValid()
                && self.isCurrencyValid()
                && self.isPriceValid()
                && self.isFamilyValid()
                && !self.names.find((v, i) => !v.isValid())
                && (self.recordState === 10
                    || (self.isPropertyValid()
                        && self.isProjectValid()
                        && (!self.property || self.property.isValid())));
        },
        isStep1Valid: () => {


            self.execAction(() => self.receivedInput = true);

            return self.isCodeValid()
                && self.isNetSizeValid()
                && self.isGrossSizeValid()
                && self.isCurrencyValid()
                && self.isPriceValid()
                && self.isFamilyValid()
                && !self.names.find((v, i) => !v.isValid());
        },
        isStep2Valid: () => {

            self.execAction(() => self.receivedInput = true);

            return self.isPropertyValid()
                && self.isProjectValid()
                && (!self.property || self.property.isValid());
        },
        getPropertyFlags: colRefFilter => {

            if (self.property) {

                if (colRefFilter) {

                    const temp = self.property.flags.filter(f => {

                        return f.flag && f.flag.colValueRef === colRefFilter;
                    });

                    return temp;
                }

                return self.property.flags;
            }

            return null;
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
                names: self.names ? self.names.map(f => f.getValue()) : null,
                descs: self.descs ? self.descs.map(f => f.getValue()) : null,
                property: self.property ? self.property.getValue() : null,
                flags: self.flags ? self.flags.map(f => f.getValue()) : null
            });
    };


    onPatch(self, patch => {

        switch (patch.path) {

            case '/receivedInput':

                if (patch.value === true) {

                    for (const item of self.names) {

                        item.execAction(() => item.receivedInput = patch.value);
                    }
                }
                break;
        }
    });


    return self;
};

export default ProductModel;