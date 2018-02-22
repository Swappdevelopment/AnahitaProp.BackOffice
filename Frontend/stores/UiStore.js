import { extendObservable } from 'mobx';

export default class UiStore {

    constructor() {

        extendObservable(this, {
            openPages: [],
            navBarSearch: null
        });

        this.onSignedOut = this.onSignedOut.bind(this);
    }


    onSignedOut() {

        this.openPages.length = 0;
    }
}