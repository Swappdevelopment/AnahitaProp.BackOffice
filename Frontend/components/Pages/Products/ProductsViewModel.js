import { types, destroy, detach, onPatch } from 'mobx-state-tree';

import BaseModel from '../../../Models/BaseModel';
import ProductModel from '../../../Models/ProductModel';
import PropertyModel from '../../../Models/PropertyModel';
import ProjectModel from '../../../Models/ProjectModel';
import FlagModel from '../../../Models/FlagModel';
import FlagLinkModel from '../../../Models/FlagLinkModel';
import ItemFieldModel from '../../../Models/ItemFieldModel';
import EntityFileModelWrapper from '../../../Models/EntityFileModelWrapper';
import EntityFileModel from '../../../Models/EntityFileModel';

import Helper from '../../../Helper/Helper';


const _onSelectedValueChangeCallbacks = [];


const ProductsViewModel = types.model(
    'ProductsViewModel',
    {
        isLazyLoading: false,
        isSaving: false,
        isGettingProperties: false,
        isGettingProjects: false,
        isGettingFlags: false,
        isGettingDescs: false,
        isGettingFiles: false,
        selectedValue: types.maybe(types.reference(ProductModel), types.null),
        searchText: types.optional(types.string, ''),
        products: types.optional(types.array(ProductModel), []),
        properties: types.optional(types.array(PropertyModel), []),
        projects: types.optional(types.array(ProjectModel), []),
        currencies: types.optional(types.array(types.frozen), []),
        prodFamilies: types.optional(types.array(types.frozen), []),
        prodFamilyTypes: types.optional(types.array(types.frozen), []),
        flags: types.optional(types.array(FlagModel), [])
    }
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

        clearProducts: () => {

            self.products.length = 0;
        },

        addNewProduct: value => {

            if (value) {

                self.products.splice(0, 0, value);
            }

            return value;
        },

        pushProduct: (...product) => {

            if (product) {

                self.products.push(...product);
            }
        },

        removeProduct: product => {

            if (product) {

                destroy(product);
            }
        },

        removeLazyWaitRecord: () => {

            if (self.products
                && self.products.length > 0
                && self.products[self.products.length - 1].isLazyWait) {

                destroy(self.products[self.products.length - 1]);
            }
        },

        saveProduct: value => {

            if (value && !value.isSaving && (value.recordState > 0 || value.isModified())) {

                value.execAction(prod => prod.isSaving = true);

                let idCounter = -1;

                Helper.RunPromise(
                    {
                        promise: Helper.FetchPromisePost('/products/saveBasics', value.getValue()),
                        success: data => {

                            if (data && data.saved) {

                                if (value.recordState === 30) {


                                }
                                else {

                                    switch (value.recordState) {

                                        case 10:

                                            break;

                                        default:

                                            value.resetOriginalValue(data.propertyFlags);
                                            break;
                                    }
                                }
                            }
                        },
                    },
                    error => {

                        if (self.showPromiseError) {
                            self.showPromiseError(error);
                        }
                    },
                    () => {

                        value.execAction(prod => prod.isSaving = false);
                    }
                );
            }
        },

        syncProperties: (activeLangCode, data) => {

            if (data) {

                self.properties.push(...data.map((mv, i) => PropertyModel.init(mv, ++self.idGenerator, activeLangCode)));
            }
        },

        getProduct: (activeLangCode, prodModel) => {

            if (prodModel && !prodModel.isRefreshing) {

                self.triggerPageBlur(true);
                prodModel.execAction(self => self.isRefreshing = true);

                let idCounter = -1, destroyed = false;

                Helper.RunPromise(
                    {
                        promise: Helper.FetchPromiseGet('/products/get/', { productID: prodModel.id }),
                        success: data => {

                            if (data && data.products && data.products.length > 0) {

                                const index = self.products.indexOf(prodModel);

                                if (index >= 0) {

                                    prodModel.sync(data.products[0]);
                                    _triggeronSelectedValueChanged();
                                }
                            }
                        },
                        incrementSession: () => {

                            self.getProductPromiseID = self.getProductPromiseID ? (self.getProductPromiseID + 1) : 1;
                            idCounter = self.getProductPromiseID;
                        },
                        sessionValid: () => {

                            return idCounter === self.getProductPromiseID;
                        }
                    },
                    error => {

                        if (self.showPromiseError) {
                            self.showPromiseError(error);
                        }
                    },
                    () => {

                        prodModel.execAction(self => self.isRefreshing = false);
                        self.triggerPageBlur(false);
                    }
                );
            }
        },

        getProperties: activeLangCode => {

            if (self.properties.length === 0 && !self.isGettingProperties) {

                self.isGettingProperties = true;

                let idCounter = -1;

                Helper.RunPromise(
                    {
                        promise: Helper.FetchPromiseGet('/products/GetProductPropertiesDetails'),
                        success: data => {

                            if (data && data.length) {

                                self.execAction(() => {

                                    self.properties.push(...data.map((mv, i) => PropertyModel.init(mv, ++self.idGenerator, activeLangCode)));

                                    if (self.selectedValue && self.selectedValue.property_Id > 0) {

                                        self.selectedValue.property = self.selectedValue.property_Id;
                                    }
                                });
                            }
                        },
                        incrementSession: () => {

                            self.getPropertiesPromiseID = self.getPropertiesPromiseID ? (self.getPropertiesPromiseID + 1) : 1;
                            idCounter = self.getPropertiesPromiseID;
                        },
                        sessionValid: () => {

                            return idCounter === self.getPropertiesPromiseID;
                        }
                    },
                    error => {

                        if (self.showPromiseError) {
                            self.showPromiseError(error);
                        }
                    },
                    () => {

                        self.execAction(() => self.isGettingProperties = false);
                    }
                );
            }
        },

        getProjects: activeLangCode => {

            if (self.projects.length === 0 && !self.isGettingProjects) {

                self.isGettingProjects = true;

                let idCounter = -1;

                Helper.RunPromise(
                    {
                        promise: Helper.FetchPromiseGet('/products/GetProductProjectsDetails'),
                        success: data => {

                            if (data && data.length) {

                                self.execAction(() => {

                                    self.projects.push(...data.map((mv, i) => ProjectModel.init(mv, ++self.idGenerator, activeLangCode)));

                                    if (self.selectedValue && self.selectedValue.project_Id > 0) {

                                        self.selectedValue.project = self.selectedValue.project_Id;
                                    }
                                });
                            }
                        },
                        incrementSession: () => {

                            self.getProjectsPromiseID = self.getProjectsPromiseID ? (self.getProjectsPromiseID + 1) : 1;
                            idCounter = self.getProjectsPromiseID;
                        },
                        sessionValid: () => {

                            return idCounter === self.getProjectsPromiseID;
                        }
                    },
                    error => {

                        if (self.showPromiseError) {
                            self.showPromiseError(error);
                        }
                    },
                    () => {

                        self.execAction(() => self.isGettingProjects = false);
                    }
                );
            }
        },

        getFlags: activeLangCode => {

            if (!self.isGettingFlags && self.flags.length === 0) {

                self.isGettingFlags = true;

                let idCounter = -1;

                Helper.RunPromise(
                    {
                        promise: Helper.FetchPromiseGet('/lookup/getFlagViews'),
                        success: data => {

                            if (data && data.length > 0) {

                                self.execAction(() => {

                                    self.flags.push(...data
                                        .map((v, i) => FlagModel.init(v, i + 1, activeLangCode))
                                        .sort((a, b) => {

                                            if (a && b) {

                                                const nameA = a.getType().toLowerCase();
                                                const nameB = b.getType().toLowerCase();

                                                if (nameA < nameB) {
                                                    return -1;
                                                }

                                                if (nameA > nameB) {
                                                    return 1;
                                                }
                                            }

                                            return 0;
                                        }));
                                });
                            }
                        },
                        incrementSession: () => {

                            self.getFlagViewsPromiseID = self.getFlagViewsPromiseID ? (self.getFlagViewsPromiseID + 1) : 1;
                            idCounter = self.getFlagViewsPromiseID;
                        },
                        sessionValid: () => {

                            return idCounter === self.getFlagViewsPromiseID;
                        }
                    },
                    error => {

                        if (self.showPromiseError) {
                            self.showPromiseError(error);
                        }
                    },
                    () => {

                        self.execAction(() => self.isGettingFlags = false);
                    }
                );
            }

            const prodModel = self.selectedValue;

            if (prodModel && !prodModel.isGettingFlags) {

                prodModel.execAction(() => {
                    prodModel.isGettingFlags = true;
                    prodModel.flags.length = 0;
                });

                const propModel = prodModel.property;

                if (propModel) {

                    propModel.execAction(() => propModel.flags.length = 0);
                }

                let idCounter = -1;

                Helper.RunPromise(
                    {
                        promise: Helper.FetchPromiseGet('/products/getProductFlags', { productID: prodModel.id }),
                        success: data => {

                            if (data) {

                                if (data.productFlags && data.productFlags.length > 0) {

                                    prodModel.execAction(() =>
                                        prodModel.flags.push(...data.productFlags
                                            .map((v, i) => FlagLinkModel.init(v, ++self.idGenerator, activeLangCode))));
                                }

                                if (propModel && data.propertyFlags && data.propertyFlags.length > 0) {

                                    propModel.execAction(() =>
                                        propModel.flags.push(...data.propertyFlags
                                            .map((v, i) => FlagLinkModel.init(v, ++self.idGenerator, activeLangCode))));
                                }
                            }
                        },
                        incrementSession: () => {

                            self.getProductFlagsPromiseID = self.getProductFlagsPromiseID ? (self.getProductFlagsPromiseID + 1) : 1;
                            idCounter = self.getProductFlagsPromiseID;
                        },
                        sessionValid: () => {

                            return idCounter === self.getProductFlagsPromiseID;
                        }
                    },
                    error => {

                        if (self.showPromiseError) {
                            self.showPromiseError(error);
                        }
                    },
                    () => {

                        prodModel.execAction(() => prodModel.isGettingFlags = false);
                    }
                );
            }
        },

        getDescs: () => {

            const prodModel = self.selectedValue;

            if (prodModel && !prodModel.isGettingDescs) {

                prodModel.execAction(() => {
                    prodModel.isGettingDescs = true;
                    prodModel.descs.length = 0;
                });

                let idCounter = -1;

                Helper.RunPromise(
                    {
                        promise: Helper.FetchPromiseGet('/products/getProductDescs', { productID: prodModel.id }),
                        success: data => {

                            if (data) {

                                if (data.length > 0) {

                                    prodModel.execAction(() =>
                                        prodModel.descs.push(...data
                                            .map((v, i) => ItemFieldModel.init(v, ++self.idGenerator))));
                                }
                            }
                        },
                        incrementSession: () => {

                            self.getProductDescsPromiseID = self.getProductDescsPromiseID ? (self.getProductDescsPromiseID + 1) : 1;
                            idCounter = self.getProductDescsPromiseID;
                        },
                        sessionValid: () => {

                            return idCounter === self.getProductDescsPromiseID;
                        }
                    },
                    error => {

                        if (self.showPromiseError) {
                            self.showPromiseError(error);
                        }
                    },
                    () => {

                        prodModel.execAction(() => prodModel.isGettingDescs = false);
                    }
                );
            }
        },

        getFiles: () => {

            const prodModel = self.selectedValue;

            if (prodModel && !prodModel.isGettingFiles) {

                prodModel.execAction(() => {
                    prodModel.isGettingFiles = true;
                    prodModel.files.length = 0;
                });

                let idCounter = -1;

                Helper.RunPromise(
                    {
                        promise: Helper.FetchPromiseGet('/products/getProductFiles', { productID: prodModel.id }),
                        success: data => {

                            if (data) {

                                if (data.length > 0) {

                                    prodModel.execAction(() =>
                                        prodModel.files.push(...data
                                            .map((v, i) => {

                                                const result = EntityFileModelWrapper.init(++self.idGenerator, EntityFileModel.init(v, ++self.idGenerator));

                                                result.model.setOriginalValueProperty({ product_Id: prodModel.id });
                                                result.model.product_Id = prodModel.id;

                                                return result;
                                            })));
                                }
                            }
                        },
                        incrementSession: () => {

                            self.getProductFilesPromiseID = self.getProductFilesPromiseID ? (self.getProductFilesPromiseID + 1) : 1;
                            idCounter = self.getProductFilesPromiseID;
                        },
                        sessionValid: () => {

                            return idCounter === self.getProductFilesPromiseID;
                        }
                    },
                    error => {

                        if (self.showPromiseError) {
                            self.showPromiseError(error);
                        }
                    },
                    () => {

                        prodModel.execAction(() => prodModel.isGettingFiles = false);
                    }
                );
            }
        },

        bindOnSelectedValueChange: callback => {

            if (callback) {
                _onSelectedValueChangeCallbacks.push(callback);
            }
        },

        unbindOnSelectedValueChange: callback => {

            if (callback) {

                const index = _onSelectedValueChangeCallbacks.indexOf(callback);

                if (index >= 0) {
                    _onSelectedValueChangeCallbacks.splice(index, 1);
                }
            }
        }
    })).views(self => ({

        getSelectedValueIndex: () => {

            if (self.selectedValue) {

                return self.products.indexOf(self.selectedValue);
            }

            return -1;
        },

        genNewProductFile: () => {

            const result = EntityFileModelWrapper.init(
                ++self.idGenerator,
                EntityFileModel.init({
                    id: --self.counterNewProdFile,
                    isListImage: false,
                    isFeaturedImage: false,
                    appearDetail: false,
                    detailRank: -1
                },
                    ++self.idGenerator));

            return result;
        }
    }));


const _triggeronSelectedValueChanged = () => {

    for (const cb of _onSelectedValueChangeCallbacks) {

        if (cb) {
            cb();
        }
    }
}

ProductsViewModel.init = () => {

    const self = ProductsViewModel.create({});
    self.idGenerator = 0;
    self.statusType = 1;

    self.counterNewProdFile = -1;

    self.syncProduct = (value, activeLangCode) => ProductModel.init(value, ++self.idGenerator, activeLangCode);

    self.getNewProduct = () => {

        const newProd = ProductModel.init(ProductModel.getObject(), ++self.idGenerator);
        newProd.setRecordState(10);

        return newProd;
    };

    self.getLazyWaitRecord = () => ProductModel.init({ id: -1, isLazyWait: true }, ++self.genId);


    onPatch(self, patch => {

        switch (patch.path) {

            case '/selectedValue':

                if (self.selectedValue) {

                    self.execAction(() => {

                        if (self.properties.length > 0) {

                            self.selectedValue.property = self.selectedValue.property_Id > 0 ? self.selectedValue.property_Id : null;
                        }

                        if (self.projects.length > 0) {

                            self.selectedValue.project = self.selectedValue.project_Id > 0 ? self.selectedValue.project_Id : null;
                        }
                    });
                }

                _triggeronSelectedValueChanged();
                break;
        }
    });


    return self;
};


export default ProductsViewModel;