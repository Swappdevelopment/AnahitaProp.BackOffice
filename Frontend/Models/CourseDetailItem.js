import { extendObservable, observe } from 'mobx';
import moment from 'moment-es6';

import CourseHeaderItem from './CourseHeaderItem';
import PersonItem from './PersonItem';

import Helper from '../Helper/Helper';


export default class CourseDetailItem {

    constructor(value, genId) {

        this.originalValue = null;

        this.genId = genId;

        this.childrenGenId = 0;

        extendObservable(
            this,
            Object.assign(
                {
                },
                CourseDetailItem.getObject(),
                this.validationsObject()));

        this.sync = this.sync.bind(this);
        this.checkRecordState = this.checkRecordState.bind(this);
        this.clearValues = this.clearValues.bind(this);

        if (value) {

            this.sync(value);
        }
    }

    static getObject() {

        return {
            recordState: 0,
            status: 1,
            id: 0,
            uid: '',
            header_Id: 0,
            startDate: null,
            fee: 0,
            currency_Id: 0,
            indGroupSize: null,
            expert_Id: 0,
            header: null,
            currency: null,
            expert: null,
            participants: []
        };
    }

    getValue() {

        const value = {
            recordState: this.recordState,
            status: this.status,
            id: this.id,
            uid: this.uid,
            header_Id: this.header_Id,
            startDate: this.startDate ? this.startDate.utc() : null,
            fee: this.fee,
            currency_Id: this.currency_Id,
            indGroupSize: this.indGroupSize,
            expert_Id: this.expert_Id,
            header: this.header ? this.header.getValue() : null,
            currency: this.currency ? Object.assign({}, this.currency) : null,
            expert: this.expert ? this.expert.getValue() : null,
            participants: this.participants ? this.participants.map((v, i) => v.getValue()) : null
        };

        return value;
    }

    sync(value) {

        this.originalValue = value;

        this.participants.lengtn = 0;

        if (value) {

            this.status = value.status;
            this.id = value.id;
            this.uid = value.uid;
            this.header_Id = value.header_Id;
            this.joinedDate = value.joinedDate ? moment(value.joinedDate) : null;
            this.fee = value.fee;
            this.currency_Id = value.currency_Id;
            this.indGroupSize = value.indGroupSize;
            this.expert_Id = value.expert_Id;
            this.header = value.header ? CourseHeaderItem.create(value.header, `${this.genId}-${++this.childrenGenId}`) : null;
            this.currency = value.currency ? Object.assign({}, value.currency) : null;
            this.expert = value.expert ? PersonItem.create(value.header, `${this.genId}-${++this.childrenGenId}`) : null;

            if (value.participants && value.participants.lengtn > 0) {

                this.participants.push(...value.participants.map((v, i) => PersonItem.create(v, `${this.genId}-${++this.childrenGenId}`)));
            }
        }
        else {

            this.clearValues();
        }

        this.recordState = 0;
    }

    clearValues() {

        this.originalValue = null;

        this.status = 1;
        this.id = 0;
        this.uid = '';
        this.header_Id = 0;
        this.joinedDate = null;
        this.fee = 0;
        this.currency_Id = 0;
        this.indGroupSize = null;
        this.expert_Id = 0;
        this.header = null;
        this.currency = null;
        this.expert = null;
        this.participants.lengtn = 0;
    }
}