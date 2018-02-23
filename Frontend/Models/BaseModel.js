import { extendObservable } from 'mobx';

export default class BaseModel {

    constructor(genId) {

        this.originalValue = null;

        this.genId = genId;

        // extendObservable(
        //     this,
        //     Object.assign(
        //         this.getLocalItem(),
        //         this.getServerItem()));

        this.extendObv = this.extendObv.bind(this);
        this.getServerItem = this.getServerItem.bind(this);
        this.getLocalItem = this.getLocalItem.bind(this);
        this.getValue = this.getValue.bind(this);

        this.extendObv(this, this.getLocalItem(), this.getServerItem());
    }

    extendObv(target, ...properties) {

        return extendObservable(target, ...properties);
    }

    getServerItem() {

        return {};
    }

    getLocalItem() {

        return {};
    }

    getValue() {

        return {};
    }
}