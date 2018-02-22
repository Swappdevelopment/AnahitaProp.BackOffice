import { extendObservable } from 'mobx';


export default class PageViewModel {

    constructor(menu) {

        this.menu = menu;

        extendObservable(this, {
            showPageWaitControl: false,
            waitOpacity50: false,
            pageBlurPixels: 0
        });
    }
}