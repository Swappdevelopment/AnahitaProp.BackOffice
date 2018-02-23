import { extendObservable } from 'mobx';

export default class BaseModel {

    constructor(genId) {

        this.originalValue = null;

        this.genId = genId;

        extendObservable(
            this,
            Object.assign(
                this.getLocalItem(),
                this.getServerItem()));

        this.getServerItem = this.getServerItem.bind(this);
        this.getLocalItem = this.getLocalItem.bind(this);
        this.getValue = this.getValue.bind(this);
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