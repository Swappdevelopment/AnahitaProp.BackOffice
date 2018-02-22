import { extendObservable, intercept } from 'mobx';

export default class MenuWrapper {

    constructor(menu, uiStore) {

        this.uiStore = uiStore;
        this.originalValue = null;

        extendObservable(
            this,
            Object.assign({
                isActive: false,
                navBarSearch: null
            }, MenuWrapper.getObject()));

        this.sync = this.sync.bind(this);
        this.clearValues = this.clearValues.bind(this);

        this.sync(menu);

        intercept(this, 'isActive', change => {

            if (change) {

                if (change.newValue) {

                    this.uiStore.navBarSearch = this.navBarSearch;
                }
                else if (this.navBarSearch && this.uiStore.navBarSearch === this.navBarSearch) {

                    this.uiStore.navBarSearch = null;
                }
            }

            return change;
        });
        intercept(this, 'navBarSearch', change => {

            if (change) {

                if (this.isActive) {

                    this.uiStore.navBarSearch = change.newValue;
                }
            }

            return change;
        });
    }

    static getObject() {

        return {
            id: 0,
            parent_Id: 0,
            slug: '',
            level: 0,
            path: '',
            type: 0,
            crud: null,
            children: []
        }
    }

    sync(value) {

        if (value) {

            this.originalValue = value;

            this.id = value.id;
            this.parent_Id = value.parent_Id;
            this.slug = value.slug;
            this.level = value.level;
            this.path = value.path;
            this.type = value.type;
            this.crud = value.crud;

            if (value.children) {

                this.children.push(...value.children.map((mnu, i) => new MenuWrapper(mnu, this.uiStore)));
            }
            else {

                this.children.length = 0;
            }
        }
        else {

            this.originalValue = null;
            this.clearValues();
        }
    }

    clearValues() {

        this.id = 0;
        this.parent_Id = 0;
        this.slug = '';
        this.level = 0;
        this.path = '';
        this.type = 0;
        this.crud = null;
        this.children.length = 0;
    }
}