import { extendObservable } from 'mobx';
import moment from 'moment-es6';

import CatalogItem from './CatalogItem';
import PersonItem from './PersonItem';


export default class TrainingItem {

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
                    isChangingStatus: false
                },
                TrainingItem.getObject(),
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
        };
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
            indGroupSize: 0,
            expert_Id: null,

            type: 0,
            approach: 0,
            happeningsCount: 1,

            occupation_Id: 1,
            occupation_Name: '',

            expertCVReceived: null,
            expertConfirmedDate: null,
            topicsConfirmed: null,
            mqlSubmited: null,
            mqaApproved: null,
            venuesConfirmed: null,
            equipmentConfirmed: null,
            planningSent: null,
            planningConfirmed: null,
            traineesReady: null,
            officialEndDate: null,
            invoiceSent: null,
            certificatesSent: null,
            closedDate: null,
            surveySent: null,

            header: null,
            currency: null,
            expert: null,
            steps: null,
            participants: [],
            venues: [],

            participantCount: 0,
            venuesCount: 0,
            reportLength: 0,
        };
    }

    sync(value) {

        this.originalValue = value;

        this.participants.length = 0;
        this.venues.length = 0;

        if (value) {

            this.status = value.status;
            this.id = value.id;
            this.uid = value.uid;
            this.header_Id = value.header_Id;
            this.startDate = value.startDate ? moment(value.startDate) : null;
            this.fee = value.fee;
            this.currency_Id = value.currency_Id;
            this.indGroupSize = value.indGroupSize;
            this.expert_Id = value.expert_Id;
            this.title = value.title;

            this.type = value.type;
            this.approach = value.approach;
            this.happeningsCount = value.happeningsCount;

            if (value.occupation) {

                this.occupation_Id = value.occupation.id;
                this.occupation_Name = value.occupation.name;
            }
            else {

                this.occupation_Id = 0;
                this.occupation_Name = null;
            }

            this.expertCVReceived = value.expertCVReceived ? moment(value.expertCVReceived) : null;
            this.expertConfirmedDate = value.expertConfirmedDate ? moment(value.expertConfirmedDate) : null;
            this.topicsConfirmed = value.topicsConfirmed ? moment(value.topicsConfirmed) : null;
            this.mqlSubmited = value.mqlSubmited ? moment(value.mqlSubmited) : null;
            this.mqaApproved = value.mqaApproved ? moment(value.mqaApproved) : null;
            this.venuesConfirmed = value.venuesConfirmed ? moment(value.venuesConfirmed) : null;
            this.equipmentConfirmed = value.equipmentConfirmed ? moment(value.equipmentConfirmed) : null;
            this.planningSent = value.planningSent ? moment(value.planningSent) : null;
            this.planningConfirmed = value.planningConfirmed ? moment(value.planningConfirmed) : null;
            this.traineesReady = value.traineesReady ? moment(value.traineesReady) : null;
            this.officialEndDate = value.officialEndDate ? moment(value.officialEndDate) : null;
            this.invoiceSent = value.invoiceSent ? moment(value.invoiceSent) : null;
            this.certificatesSent = value.certificatesSent ? moment(value.certificatesSent) : null;
            this.closedDate = value.closedDate ? moment(value.closedDate) : null;
            this.surveySent = value.surveySent ? moment(value.surveySent) : null;

            if (value.header) {

                this.header = new CatalogItem(value.header, 1);
            }
            else {

                this.header = null;
            }

            if (value.expert) {

                this.expert = new PersonItem(value.expert, 1);
            }
            else {

                this.expert = null;
            }

            this.currency = value.currency;
            this.steps = value.steps;

            this.participants.length = 0;
            if (value.participants && value.participants.length > 0) {

                this.participants.push(...value.participants.map((v, i) => new PersonItem(v, i + 1)));
            }

            this.venues.length = 0;
            if (value.venues && value.venues.length > 0) {

                this.venues.push(...value.venues);
            }
        }
        else {

            this.clearValues();
        }

        this.recordState = 0;
    }

    checkRecordState() {

        if (this.originalValue && this.recordState != 10 && this.recordState != 30) {

        }

        this.recievedInput = true;
    }

    clearValues() {

        this.originalValue = null;

        this.recordState = 0;
        this.status = 1;
        this.id = 0;
        this.uid = '';
        this.header_Id = 0;
        this.startDate = null;
        this.fee = 0;
        this.currency_Id = 0;
        this.indGroupSize = 0;
        this.expert_Id = null;

        this.type = 0;
        this.approach = 0;
        this.happeningsCount = 1;

        this.occupation_Id = 0;
        this.occupation_Name = '';

        this.expertCVReceived = null;
        this.expertConfirmedDate = null;
        this.topicsConfirmed = null;
        this.mqlSubmited = null;
        this.mqaApproved = null;
        this.venuesConfirmed = null;
        this.equipmentConfirmed = null;
        this.planningSent = null;
        this.planningConfirmed = null;
        this.traineesReady = null;
        this.officialEndDate = null;
        this.invoiceSent = null;
        this.certificatesSent = null;
        this.closedDate = null;
        this.surveySent = null;

        this.header = null;
        this.currency = null;
        this.expert = null;
        this.steps = null;
        this.participants.length = 0;
        this.venues.length = 0;

        this.participantCount = 0;
        this.venuesCount = 0;
        this.reportLength = 0;

        this.recordState = 0;
    }

    getValue() {

        this.originalValue = null;

        const value = {

            status: this.status,
            id: this.id,
            uid: this.uid,
            header_Id: this.header_Id,
            startDate: this.startDate,
            fee: this.fee,
            currency_Id: this.currency_Id,
            indGroupSize: this.indGroupSize,
            expert_Id: this.expert_Id,
            title: this.title,

            type: this.type,
            approach: this.approach,
            happeningsCount: this.happeningsCount,

            expertCVReceived: this.expertCVReceived,
            expertConfirmedDate: this.expertConfirmedDate,
            topicsConfirmed: this.topicsConfirmed,
            mqlSubmited: this.mqlSubmited,
            mqaApproved: this.mqaApproved,
            venuesConfirmed: this.venuesConfirmed,
            equipmentConfirmed: this.equipmentConfirmed,
            planningSent: this.planningSent,
            planningConfirmed: this.planningConfirmed,
            traineesReady: this.traineesReady,
            officialEndDate: this.officialEndDate,
            invoiceSent: this.invoiceSent,
            certificatesSent: this.certificatesSent,
            closedDate: this.closedDate,
            surveySent: this.surveySent,
            header: this.header == null ? null : this.header.getValue(),
            expert: this.expert == null ? null : this.expert.getValue(),
            currency: this.currency,
            steps: this.steps,
            participants: this.participants ? null : this.participants.map((v, i) => v.getValue()),
            venues: this.venues ? null : this.venues.slice(),
        };

        return value;
    }

    isValid() {

        this.recievedInput = true;

        return true;
    }
}