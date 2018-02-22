import { extendObservable } from 'mobx';

import TrainingItem from '../../../Models/TrainingItem';


export default class TrainingsViewModel {

    constructor() {

        this.originalValue = null;

        this.idGenerator = 0;

        extendObservable(this, {
            isLazyLoading: false,
            isModalShown: false,
            selectedValue: null,
            searchText: '',
            trainings: [],
            statusType: 1
        });

        this.syncTrainingItem = this.syncTrainingItem.bind(this);
        this.getLazyWaitRecord = this.getLazyWaitRecord.bind(this);
        this.removeLazyWaitRecord = this.removeLazyWaitRecord.bind(this);
    }

    syncTrainingItem(value) {

        return new TrainingItem(value, ++this.idGenerator);
    }

    getLazyWaitRecord() {

        return {
            isLazyWait: true,
            genId: ++this.idGenerator
        };
    }

    removeLazyWaitRecord() {

        if (this.trainings
            && this.trainings.length > 0
            && this.trainings[this.trainings.length - 1].isLazyWait) {

            this.trainings.splice(this.trainings.length - 1, 1);
        }
    }
}