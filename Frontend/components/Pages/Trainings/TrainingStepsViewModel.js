import { extendObservable } from 'mobx';


export default class TrainingStepsViewModel {

    constructor() {

        extendObservable(
            this,
            {
                selectedStep: 'catalogStep'
            });
    }
}