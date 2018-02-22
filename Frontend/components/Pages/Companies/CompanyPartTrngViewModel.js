import { extendObservable, observe } from 'mobx';

import PersonItem from '../../../Models/PersonItem';
import TrainingItem from '../../../Models/TrainingItem';

export default class CompanyPartTrngViewModel {

    constructor() {

        this.participantsGenId = 0;
        this.trainingsGenId = 0;

        extendObservable(this, {
            statusType: 1,
            mainSearchText: '',
            participants: [],
            trainings: [],
            selectedMainIndex: -1,
            showCourseDetails: false,
            isPartLazyLoading: false,
            isTrngLazyLoading: false,
            isModalShown: false
        });
    }

    syncParticipants(value) {

        if (value && value.length > 0) {

            this.participants.push(...value.map((v, i) => this.syncParticipantItem(v)));
        }
    }

    syncParticipantItem(value) {

        return new PersonItem(value, ++this.participantsGenId);
    }

    syncTrainings(value) {

        if (value && value.length > 0) {

            this.trainings.push(...value.map((v, i) => this.syncTrainingItem(v)));
        }
    }

    syncTrainingItem(value) {

        return new TrainingItem(value, ++this.trainingsGenId);
    }


    getPartLazyWaitRecord() {

        return {
            isLazyWait: true,
            genId: ++this.participantsGenId
        };
    }

    removePartLazyWaitRecord() {

        if (this.participants
            && this.participants.length > 0
            && this.participants[this.participants.length - 1].isLazyWait) {

            this.participants.splice(this.participants.length - 1, 1);
        }
    }


    getTrngLazyWaitRecord() {

        return {
            isLazyWait: true,
            genId: ++this.trainingsGenId
        };
    }

    removeTrngLazyWaitRecord() {

        if (this.trainings
            && this.trainings.length > 0
            && this.trainings[this.trainings.length - 1].isLazyWait) {

            this.trainings.splice(this.trainings.length - 1, 1);
        }
    }
}