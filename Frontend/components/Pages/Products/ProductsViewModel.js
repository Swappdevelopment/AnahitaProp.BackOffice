import { types, destroy } from 'mobx-state-tree';

import BaseModel from '../../../Models/BaseModel';
import ProductModel from '../../../Models/ProductModel';


const ProductsViewModel = types.model(
    'ProductsViewModel',
    {
        isLazyLoading: false,
        isModalShown: false,
        selectedValue: types.maybe(types.reference(ProductModel), types.null),
        searchText: types.optional(types.string, ''),
        products: types.optional(types.array(ProductModel), [])
    }
).actions(
    self => ({

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
        }
    }));



ProductsViewModel.init = () => {

    const self = ProductsViewModel.create({});
    self.idGenerator = 0;
    self.statusType = 1;

    self.syncProduct = (value, activeLangCode) => ProductModel.init(value, ++self.idGenerator, activeLangCode);

    self.getNewProduct = () => {

        const newProd = ProductModel.init(ProductModel.getObject(), ++self.idGenerator);
        newProd.setRecordState(10);

        return newProd;
    };

    self.getLazyWaitRecord = () => ProductModel.init({ id: -1, isLazyWait: true }, ++self.genId);


    return self;
};


export default ProductsViewModel;