import { extendObservable } from 'mobx';

import CatalogItem from '../../../Models/CatalogItem';

export default class CatalogViewModel {

    constructor() {

        this.originalValue = null;

        extendObservable(this, {
            isLazyLoading: false,
            isModalShown: false,
            selectedValue: null,
            searchText: '',
            catalogs: [],
            statusType: 1
        });

        this.syncCatalogItem = this.syncCatalogItem.bind(this);
    }

    static idGenerator = 0;

    getNewCatalog() {

        CatalogViewModel.idGenerator += 1;
        const temp = new CatalogItem(CatalogItem.getObject(), CatalogViewModel.idGenerator);
        temp.recordState = 10;

        return temp;
    }

    addNewCatalog(value) {

        if (value) {
            this.catalogs.splice(0, 0, value);
        }
        return value;
    }

    removeClub(catalog) {

        if (catalog && this.catalogs) {

            const index = this.catalogs.indexOf(catalog);

            if (index >= 0) {

                this.clubs.splice(index, 1);
            }
        }

    }

    syncCatalogItem(value) {

        return new CatalogItem(value, ++CatalogViewModel.idGenerator);
    }

    getLazyWaitRecord() {

        return {
            isLazyWait: true,
            genId: ++CatalogViewModel.idGenerator
        };
    }

    removeLazyWaitRecord() {

        if (this.catalogs
            && this.catalogs.length > 0
            && this.catalogs[this.catalogs.length - 1].isLazyWait) {

            this.catalogs.splice(this.catalogs.length - 1, 1);
        }
    }

}