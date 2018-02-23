import { extendObservable } from 'mobx';

import ProductItem from '../../../Models/ProductItem';

export default class ProductsViewModel {

    constructor() {

        this.originalValue = null;
        this.idGenerator = 0;

        extendObservable(this, {
            isLazyLoading: false,
            isModalShown: false,
            selectedValue: null,
            searchText: '',
            products: [],
            statusType: 1
        });

        this.syncProductItem = this.syncProductItem.bind(this);
    }

    getNewProduct() {

        this.idGenerator += 1;
        const temp = new ProductItem(ProductItem.getObject(), this.idGenerator);
        temp.recordState = 10;

        return temp;
    }

    addNewProduct(value) {

        if (value) {
            this.products.splice(0, 0, value);
        }

        return value;
    }

    removeProduct(product) {

        if (product && this.products) {

            const index = this.products.indexOf(product);

            if (index >= 0) {

                this.clubs.splice(index, 1);
            }
        }

    }

    syncProductItem(value, activeLangCode) {

        return new ProductItem(value, ++this.idGenerator, activeLangCode);
    }

    getLazyWaitRecord() {

        return {
            isLazyWait: true,
            genId: ++this.idGenerator
        };
    }

    removeLazyWaitRecord() {

        if (this.products
            && this.products.length > 0
            && this.products[this.products.length - 1].isLazyWait) {

            this.products.splice(this.products.length - 1, 1);
        }
    }

}