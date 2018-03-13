import { types, detach } from 'mobx-state-tree';

import ProductModel from '../../../Models/ProductModel';


const CreateProductViewModel = types.model(
    'CreateProductViewModel',
    {
        target: types.maybe(ProductModel, types.null),
        wizardStep: types.optional(types.number, 0),
        stepsStack: types.optional(types.array(types.string), ['ProductDetail1'])
    }
).actions(
    self => ({
        execAction: func => {

            if (func) {
                func(self);
            }
        }
    }))
    .actions(self => ({

        initNewProduct: allLanguages => {

            const raw = {
                id: -1,
                uid: '',
                code: '',
                slug: '',
                type: 10,
                priority: 1,
                hideSearch: false,
                isGroup: false,
                recordState: 10,
                names: [],
                descs: [],
            };


            if (allLanguages) {

                for (let [key, value] of Object.entries(allLanguages)) {

                    if (key) {

                        const langCode = key.toUpperCase();

                        raw.names.push({
                            value: '',
                            language: {
                                code: langCode
                            }
                        });


                        raw.descs.push({
                            value: '',
                            detailRank: -1,
                            isList: true,
                            language: {
                                code: langCode
                            }
                        });
                        raw.descs.push({
                            value: '',
                            detailRank: 0,
                            isList: false,
                            language: {
                                code: langCode
                            }
                        });
                        raw.descs.push({
                            value: '',
                            detailRank: 1,
                            isList: false,
                            language: {
                                code: langCode
                            }
                        });
                    }
                }
            }

            self.target = ProductModel.init(
                raw,
                ++self.idGenerator,
                self.activeLang.code);

            self.target.execAction(st => st.status = 0);
        },

        detachNewProduct: () => {

            detach(self.target);
        }
    }))
    .views(self => ({
        isStep1Valid: () => {

            if (self.target) {

                self.target.execAction(st => st.receivedInput = true);

                return self.target.isCodeValid()
                    && self.target.isNetSizeValid()
                    && self.target.isGrossSizeValid()
                    && self.target.isCurrencyValid()
                    && self.target.isPriceValid()
                    && self.target.isFamilyValid()
                    && !self.target.names.find((v, i) => !v.isValid());
            }

            return false;
        },

        isStep2Valid: () => {

            if (self.target) {

                self.target.execAction(st => st.receivedInput = true);

                return self.target.isPropertyValid()
                    && self.target.isProjectValid()
                    && (!self.target.property || self.target.property.isValid());
            }

            return false;
        }
    }));


CreateProductViewModel.init = activeLang => {

    const self = CreateProductViewModel.create();

    self.activeLang = activeLang;

    return self;
};


export default CreateProductViewModel;
