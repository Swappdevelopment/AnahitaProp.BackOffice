import { types, destroy, detach, onPatch } from 'mobx-state-tree';

import CreateProductViewModel from './CreateProductViewModel';

import BaseModel from '../../../Models/BaseModel';
import ProductModel from '../../../Models/ProductModel';
import ProdFamilyModel from '../../../Models/ProdFamilyModel';
import PropertyModel from '../../../Models/PropertyModel';
import ProjectModel from '../../../Models/ProjectModel';
import FlagModel from '../../../Models/FlagModel';
import FlagLinkModel from '../../../Models/FlagLinkModel';
import ItemFieldModel from '../../../Models/ItemFieldModel';
import EntityFileModelWrapper from '../../../Models/EntityFileModelWrapper';
import EntityFileModel from '../../../Models/EntityFileModel';

import Helper from '../../../Helper/Helper';


const _onSelectedValueChangeCallbacks = [];
const _onPropertyChanged = [];


const ProductsViewModel = types.model(
    'ProductsViewModel',
    {
        createProduct: types.maybe(CreateProductViewModel, types.null),
        isLazyLoading: false,
        isSaving: false,
        isGettingProperties: false,
        isGettingProjects: false,
        isGettingFlags: false,
        isGettingDescs: false,
        isGettingFiles: false,
        isModalShown: false,
        showModalWait: false,
        selectedValue: types.maybe(types.reference(ProductModel), types.null),
        selectedGroup: types.maybe(types.reference(ProductModel), types.null),
        selectedSubValue: types.maybe(types.reference(ProductModel), types.null),
        searchText: types.optional(types.string, ''),
        products: types.optional(types.array(ProductModel), []),
        groups: types.optional(types.array(ProductModel), []),
        properties: types.optional(types.array(PropertyModel), []),
        projects: types.optional(types.array(ProjectModel), []),
        currencies: types.optional(types.array(types.frozen), []),
        prodFamilies: types.optional(types.array(ProdFamilyModel), []),
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

        addNewProduct: value => {

            if (value) {

                self.products.splice(0, 0, value);
            }

            return value;
        },

        removeProduct: product => {

            if (product) {

                destroy(product);
            }
        },

        removeLazyWaitRecord: action => {

            if (action) {

                if (action.subProducts) {

                    if (action.subProducts
                        && action.subProducts.length > 0
                        && action.subProducts[action.subProducts.length - 1].isLazyWait) {

                        action.execAction(() => destroy(action.subProducts[action.subProducts.length - 1]));
                    }
                }
                else {

                    if (self.groups
                        && self.groups.length > 0
                        && self.groups[self.groups.length - 1].isLazyWait) {

                        destroy(self.groups[self.groups.length - 1]);
                    }
                }
            }
            else {

                if (self.products
                    && self.products.length > 0
                    && self.products[self.products.length - 1].isLazyWait) {

                    destroy(self.products[self.products.length - 1]);
                }
            }

            switch (action) {

                case 'groups':
                    break;

                case 'subgroups':

                    break;

                default:


                    break;
            }

        },

        saveProduct: (value, successCallback) => {

            if (value && !value.isSaving && (value.recordState > 0 || value.isModified())) {   // && value.isValid && value.isValid()) {

                value.execAction(prod => prod.isSaving = true);

                let idCounter = -1;

                const propertyChanging = value.recordState !== 30 && (!value.originalValue || value.property_Id !== value.originalValue.property_Id);

                Helper.RunPromise(
                    {
                        promise: Helper.CreatePostPromise('/products/saveBasics', value.getValue()),
                        success: data => {

                            if (data && data.saved) {

                                if (value.recordState === 10) {

                                    if (data.newProduct) {

                                        value = ProductModel.init(data.newProduct, ++self.idGenerator, self.activeLang.code);

                                        value.execAction(prod => prod.isSaving = true);
                                    }
                                }
                                else if (value.recordState === 30) {


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

                                if (propertyChanging) {

                                    for (const cb of _onPropertyChanged) {

                                        if (cb) {
                                            cb();
                                        }
                                    }
                                }

                                if (successCallback) {
                                    successCallback(value);
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

        syncProperties: data => {

            if (data) {

                self.properties.push(...data.map((mv, i) => PropertyModel.init(mv, ++self.idGenerator, self.activeLang.code)));
            }
        },

        getLookups: () => {

            if (!self.gettingLookups) {

                const promises = [];

                const joinFamiliesWithTypes = () => {

                    if (self.prodFamilyTypes.length > 0
                        && self.prodFamilies.length > 0) {

                        for (const ftp of self.prodFamilyTypes) {

                            self.prodFamilies.filter(fm => {

                                if (fm.type_Id === ftp.id) {

                                    fm.execAction(() => fm.type = ftp);

                                    return true;
                                }

                                return false;
                            });
                        }
                    }
                };

                if (self.prodFamilyTypes.length === 0) {

                    let idCounter = -1;

                    promises.push(
                        {
                            promise: Helper.CreateGetPromise(
                                '/lookup/GetProductFamilyTypes/'),
                            success: data => {

                                if (data && data.length > 0) {

                                    self.execAction(() => {

                                        self.prodFamilyTypes.push(...data.map((v, i) => {

                                            const name = v.names ?
                                                v.names.find(nm => (nm.language_Code ? nm.language_Code.toLowerCase() : '') == self.activeLang.code)
                                                :
                                                null;

                                            return Object.assign(v, {
                                                name: name ? name.value : null
                                            });
                                        }));
                                    });

                                    joinFamiliesWithTypes();
                                }
                            },
                            incrementSession: () => {

                                self.getProductFamilyTypesPromiseID = self.getProductFamilyTypesPromiseID ? (self.getProductFamilyTypesPromiseID + 1) : 1;
                                idCounter = self.getProductFamilyTypesPromiseID;
                            },
                            sessionValid: () => {

                                return idCounter === self.getProductFamilyTypesPromiseID;
                            }
                        });
                }

                if (self.prodFamilies.length === 0) {

                    let idCounter = -1;

                    promises.push(
                        {
                            promise: Helper.CreateGetPromise(
                                '/lookup/GetProductFamilies/'),
                            success: data => {

                                if (data && data.length > 0) {

                                    const temp = data.map(pf => ProdFamilyModel.init(pf, ++self.idGenerator, self.activeLang.code));

                                    self.execAction(() => self.prodFamilies.push(...temp));
                                }

                                joinFamiliesWithTypes();
                            },
                            incrementSession: () => {

                                self.getProductFamiliesPromiseID = self.getProductFamiliesPromiseID ? (self.getProductFamiliesPromiseID + 1) : 1;
                                idCounter = self.getProductFamiliesPromiseID;
                            },
                            sessionValid: () => {

                                return idCounter === self.getProductFamiliesPromiseID;
                            }
                        });
                }

                if (self.currencies.length === 0) {

                    let idCounter = -1;

                    promises.push(
                        {
                            promise: Helper.CreateGetPromise(
                                '/lookup/GetCurrencies/'),
                            success: data => {

                                if (data && data.length > 0) {

                                    self.execAction(() => {

                                        self.currencies.push(...data);
                                    });
                                }
                            },
                            incrementSession: () => {

                                self.getCurrenciesPromiseID = self.getCurrenciesPromiseID ? (self.getCurrenciesPromiseID + 1) : 1;
                                idCounter = self.getCurrenciesPromiseID;
                            },
                            sessionValid: () => {

                                return idCounter === self.getCurrenciesPromiseID;
                            }
                        });
                }


                if (promises.length > 0) {

                    self.gettingLookups = true;

                    let idCounter = -1;

                    Helper.RunPromise(
                        {
                            options: promises,
                            incrementSession: () => {

                                self.getLookupsPromiseID = self.getLookupsPromiseID ? (self.getLookupsPromiseID + 1) : 1;
                                idCounter = self.getLookupsPromiseID;
                            },
                            sessionValid: () => {

                                return idCounter === self.getLookupsPromiseID;
                            }
                        },
                        error => {

                            if (self.showPromiseError) {
                                self.showPromiseError(error);
                            }
                        },
                        () => {

                            self.gettingLookups = false;
                        });
                }
            }
        },

        getProducts: (limit, offset, getGroups, group_Id) => {

            if ((getGroups && !self.isGettingGroups)
                || (group_Id > 0 && self.subGroupsParentID !== group_Id)
                || !self.isGettingProjects) {

                const isFullRefresh = offset === 0;

                const prodGroup = self.selectedGroup;

                if (isFullRefresh) {

                    if (getGroups) {

                        self.isGettingGroups = true;
                        self.groups.length = 0;
                    }
                    else if (group_Id > 0 && prodGroup) {

                        self.subGroupsParentID = group_Id;
                        prodGroup.subProducts.length = 0;
                    }
                    else {

                        self.isGettingProducts = true;
                        self.products.length = 0;
                    }

                    self.triggerPageBlur(true);
                }
                else {

                    self.isLazyLoading = true;
                }

                const params = {
                    limit,
                    offset,
                    group_Id,
                    statusFilter: self.statusType,
                    withGroups: getGroups,
                    withSubGroups: group_Id > 0,
                    withProperties: (self.properties.length === 0)
                };

                if (self.searchText) {

                    params['nameFilter'] = self.searchText;
                }

                let idCounter = -1;

                Helper.RunPromise(
                    {
                        promise: Helper.CreateGetPromise('/products/get/', params),
                        success: data => {

                            if (data) {

                                if (data.properties && data.properties.length > 0) {

                                    self.syncProperties(data.properties);
                                }

                                if (data.products && data.products.length > 0) {

                                    self.removeLazyWaitRecord(getGroups ? true : (group_Id > 0 ? prodGroup : null));

                                    const temp = [...data.products.map((v, i) => self.syncProduct(v))];
                                    temp.push(self.getLazyWaitRecord());

                                    if (getGroups) {

                                        self.execAction(() => self.groups.push(...temp));
                                    }
                                    else if (group_Id > 0 && prodGroup) {

                                        prodGroup.execAction(() => prodGroup.subProducts.push(...temp));
                                    }
                                    else {

                                        self.execAction(() => self.products.push(...temp));
                                    }
                                }
                                else {

                                    self.removeLazyWaitRecord(getGroups ? true : (group_Id > 0 ? prodGroup : null));
                                }
                            }
                        },
                        incrementSession: () => {

                            self.getProductsPromiseID = self.getProductsPromiseID ? (self.getProductsPromiseID + 1) : 1;
                            idCounter = self.getProductsPromiseID;
                        },
                        sessionValid: () => {

                            return idCounter === self.getProductsPromiseID;
                        }
                    },
                    error => {
                        if (self.showPromiseError) {
                            self.showPromiseError(error);
                        }
                    },
                    () => {

                        self.triggerPageBlur(false);

                        self.execAction(() => self.isLazyLoading = false);

                        if (getGroups) {

                            self.isGettingGroups = false;
                        }
                        else if (group_Id > 0 && prodGroup) {

                            self.subGroupsParentID = 0;
                        }
                        else {

                            self.isGettingProducts = false;
                        }
                    }
                );
            }
        },

        getProduct: prodModel => {

            if (prodModel && !prodModel.isRefreshing) {

                self.triggerPageBlur(true);
                prodModel.execAction(self => self.isRefreshing = true);

                let idCounter = -1, destroyed = false;

                Helper.RunPromise(
                    {
                        promise: Helper.CreateGetPromise('/products/get/', { productID: prodModel.id }),
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

        getProperties: () => {

            if (self.properties.length === 0 && !self.isGettingProperties) {

                self.isGettingProperties = true;

                let idCounter = -1;

                Helper.RunPromise(
                    {
                        promise: Helper.CreateGetPromise('/property/GetPropertiesDetails'),
                        success: data => {

                            if (data && data.length) {

                                self.execAction(() => {

                                    self.properties.push(...data.map((mv, i) => PropertyModel.init(mv, ++self.idGenerator, self.activeLang.code)));

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

        getProjects: () => {

            if (self.projects.length === 0 && !self.isGettingProjects) {

                self.isGettingProjects = true;

                let idCounter = -1;

                Helper.RunPromise(
                    {
                        promise: Helper.CreateGetPromise('/project/GetProductProjectsDetails'),
                        success: data => {

                            if (data && data.length) {

                                self.execAction(() => {

                                    self.projects.push(...data.map((mv, i) => ProjectModel.init(mv, ++self.idGenerator, self.activeLang.code)));

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

        getFlags: prodModel => {

            if (!self.isGettingFlags && self.flags.length === 0) {

                self.isGettingFlags = true;

                let idCounter = -1;

                Helper.RunPromise(
                    {
                        promise: Helper.CreateGetPromise('/lookup/getFlagViews'),
                        success: data => {

                            if (data && data.length > 0) {

                                self.execAction(() => {

                                    self.flags.push(...data
                                        .map((v, i) => FlagModel.init(v, i + 1, self.activeLang.code))
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

            prodModel = prodModel ? prodModel : self.selectedValue;

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
                        promise: Helper.CreateGetPromise('/products/getProductFlags', { productID: prodModel.id }),
                        success: data => {

                            if (data) {

                                if (data.productFlags && data.productFlags.length > 0) {

                                    prodModel.execAction(() =>
                                        prodModel.flags.push(...data.productFlags
                                            .map((v, i) => FlagLinkModel.init(v, ++self.idGenerator, self.activeLang.code))));
                                }

                                if (propModel && data.propertyFlags && data.propertyFlags.length > 0) {

                                    propModel.execAction(() =>
                                        propModel.flags.push(...data.propertyFlags
                                            .map((v, i) => FlagLinkModel.init(v, ++self.idGenerator, self.activeLang.code))));
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

        getDescs: prodModel => {

            if (prodModel && !prodModel.isGettingDescs) {

                prodModel.execAction(() => {
                    prodModel.isGettingDescs = true;
                    prodModel.descs.length = 0;
                });

                let idCounter = -1;

                Helper.RunPromise(
                    {
                        promise: Helper.CreateGetPromise('/products/getProductDescs', { productID: prodModel.id }),
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
                        promise: Helper.CreateGetPromise('/products/getProductFiles', { productID: prodModel.id }),
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
        },

        bindOnPropertyChanged: callback => {

            if (callback) {
                _onPropertyChanged.push(callback);
            }
        },

        unbindOnPropertyChanged: callback => {

            if (callback) {

                const index = _onPropertyChanged.indexOf(callback);

                if (index >= 0) {
                    _onPropertyChanged.splice(index, 1);
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

ProductsViewModel.init = (activeLang) => {

    const self = ProductsViewModel.create({});

    self.activeLang = activeLang;
    self.idGenerator = 0;
    self.statusType = null;

    self.counterNewProdFile = -1;

    self.syncProduct = value => ProductModel.init(value, ++self.idGenerator, self.activeLang.code);

    self.getLazyWaitRecord = () => ProductModel.init({ id: -1, isLazyWait: true }, ++self.genId);


    onPatch(self, patch => {

        switch (patch.path) {

            case '/selectedValue':

                if (self.selectedValue) {

                    self.execAction(() => {

                        if (!self.selectedValue.productFamily) {

                            self.selectedValue.productFamily = self.selectedValue.productFamily_Id;
                        }

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

            case '/selectedGroup':

                if (self.selectedGroup) {

                    if (!self.selectedGroup.productFamily) {

                        self.selectedGroup.productFamily = self.selectedGroup.productFamily_Id;
                    }

                    self.execAction(() => {

                        if (self.properties.length > 0) {

                            self.selectedGroup.property = self.selectedGroup.property_Id > 0 ? self.selectedGroup.property_Id : null;
                        }

                        if (self.projects.length > 0) {

                            self.selectedGroup.project = self.selectedGroup.project_Id > 0 ? self.selectedGroup.project_Id : null;
                        }
                    });
                }

                _triggeronSelectedValueChanged();
                break;

            case '/selectedSubValue':

                if (self.selectedSubValue) {

                    if (!self.selectedSubValue.productFamily) {

                        self.selectedSubValue.productFamily = self.selectedSubValue.productFamily_Id;
                    }

                    self.execAction(() => {

                        if (self.properties.length > 0) {

                            self.selectedSubValue.property = self.selectedSubValue.property_Id > 0 ? self.selectedSubValue.property_Id : null;
                        }

                        if (self.projects.length > 0) {

                            self.selectedSubValue.project = self.selectedSubValue.project_Id > 0 ? self.selectedSubValue.project_Id : null;
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