import { extendObservable } from 'mobx';
import moment from 'moment-es6';

export default class ClubViewModel {

    constructor() {

        this.originalValue = null;

        extendObservable(this, {
            isLazyLoading: false,
            isModalShown: false,
            selectedClubForMembers: null,
            selectedValue: null,
            searchText: '',
            occupations: [],
            countries: [],
            clubs: [],
            statusType: 1
        });

        this.syncClubItem = this.syncClubItem.bind(this);
    }

    static idGenerator = 0;

    getNewClub() {

        ClubViewModel.idGenerator += 1;
        const temp = new ClubItem(ClubItem.getObject(), ClubViewModel.idGenerator);
        temp.recordState = 10;

        return temp;
    }

    addNewClub(value) {

        if (value) {
            this.clubs.splice(0, 0, value);
        }
        return value;
    }

    removeClub(club) {

        if (club && this.clubs) {

            const index = this.clubs.indexOf(club);

            if (index >= 0) {

                this.clubs.splice(index, 1);
            }
        }

    }

    syncClubItem(value) {

        return new ClubItem(value, ++ClubViewModel.idGenerator);
    }

    getLazyWaitRecord() {

        return {
            isLazyWait: true,
            genId: ++ClubViewModel.idGenerator
        };
    }

    removeLazyWaitRecord() {

        if (this.clubs
            && this.clubs.length > 0
            && this.clubs[this.clubs.length - 1].isLazyWait) {

            this.clubs.splice(this.clubs.length - 1, 1);
        }
    }

}

class ClubItem {

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
                ClubItem.getObject(),
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
            isNameValid: () => this.recievedInput ? (this.name ? true : false) : true,
        };
    }

    static getObject() {

        return {
            recordState: 0,
            status: 1,
            id: 0,
            name: '',
            endDate: null
        };
    }

    sync(value) {

        this.originalValue = value;

        if (value) {

            this.status = value.status;
            this.id = value.id;
            this.name = value.name;
            this.endDate = value.endDate ? moment(value.endDate) : null;
        }
        else {

            this.clearValues();
        }

        this.recordState = 0;
    }

    checkRecordState() {

        if (this.originalValue && this.recordState != 10 && this.recordState != 30) {

            if (this.name !== this.originalValue.name
                || this.endDate !== this.originalValue.endDate) {

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
        this.name = '';
        this.endDate = null;

        this.recordState = 0;
    }

    getValue() {

        this.originalValue = null;

        const value = {

            id: this.id,
            name: this.name,
            endDate: this.endDate ? this.endDate.utc() : null,
            recordState: this.recordState
        };

        return value;
    }

    isValid() {

        this.recievedInput = true;

        return this.isNameValid();
    }
}