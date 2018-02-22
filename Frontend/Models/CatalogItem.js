import { extendObservable } from 'mobx';


export default class CatalogItem {

    constructor(value, genId) {

        this.originalValue = null;

        this.genId = genId;

        extendObservable(
            this,
            Object.assign(
                {
                    isSaving: false,
                    error: null,
                    recievedInput: false,
                    isGettingObjectives: false,
                    showObjectives: false,
                    isChangingStatus: false
                },
                CatalogItem.getObject(),
                this.validationsObject()));

        this.validationsObject = this.validationsObject.bind(this);
        this.sync = this.sync.bind(this);
        this.checkRecordState = this.checkRecordState.bind(this);
        this.clearValues = this.clearValues.bind(this);
        this.isValid = this.isValid.bind(this);

        this.sync(value);
    }

    validationsObject() {

        return {
            isTitleValid: () => this.recievedInput ? (this.title ? true : false) : true,
        };
    }

    static getObject() {

        return {
            recordState: 0,
            status: 1,
            id: 0,
            title: '',
            fromObjectives: '',
            expectedDuration: 0,
            hasObjectives: false
        };
    }

    sync(value) {

        this.originalValue = value;

        if (value) {

            this.status = value.status;
            this.id = value.id;
            this.title = value.title;
            this.fromObjectives = value.fromObjectives;
            this.expectedDuration = value.expectedDuration;
            this.hasObjectives = value.hasObjectives;
        }
        else {

            this.clearValues();
        }

        this.recordState = 0;
    }

    checkRecordState() {

        if (this.originalValue && this.recordState != 10 && this.recordState != 30) {

            if (this.title !== this.originalValue.title
                || this.fromObjectives !== this.originalValue.fromObjectives
                || this.expectedDuration !== this.originalValue.expectedDuration) {

                this.recordState = 20;
            }
            else {

                this.recordState = 0;
            }
        }

        this.recievedInput = true;
    }

    clearValues() {

        this.originalValue = null;

        this.status = 0;
        this.id = 0;
        this.title = '';
        this.fromObjectives = '';
        this.expectedDuration = 0;
        this.hasObjectives = false;

        this.recordState = 0;
    }

    getValue() {

        this.originalValue = null;

        const value = {

            id: this.id,
            title: this.titlename,
            fromObjectives: this.fromObjectives,
            expectedDuration: this.expectedDuration,
            hasObjectives: this.hasObjectives,
            recordState: this.recordState
        };

        return value;
    }

    isValid() {

        this.recievedInput = true;

        return this.isTitleValid();
    }
}