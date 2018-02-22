import { extendObservable, observe } from 'mobx';
import moment from 'moment-es6';

import Helper from '../Helper/Helper';


export default class CourseHeaderItem {

    constructor(value, genId) {

        this.originalValue = null;

        this.genId = genId;

        extendObservable(
            this,
            Object.assign(
                {},
                CourseHeaderItem.getObject(),
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

    static create(value, genId) {

        return value ? new CourseHeaderItem(value, genId) : null;
    }

    getValue() {

        const value = {
            status: this.status,
            id: this.id,
            company_Id: this.company_Id,
            club_Id: this.club_Id,
            occupation_Id: this.occupation_Id,
            grade: this.grade,
            contact_Id: this.contact_Id,
            member_Id: this.member_Id,
            uid: this.uid,
            email: this.email,
            fName: this.fName,
            lName: this.lName,
            gender: this.gender,
            title: this.title,
            dateOfBirth: this.dateOfBirth ? this.dateOfBirth.utc() : null,
            joinedDate: this.joinedDate ? this.joinedDate.utc() : null,
            idNumber: this.idNumber,
            telNumbers: this.telNumbers.map((v, i) => v.getValue()),
            recordState: this.recordState
        };

        if (this.forceSave) {
            value.forceSave = this.forceSave;

            delete this.forceSave;
        }

        return value;
    }

    sync(value) {

        this.originalValue = value;
        this.errorID = 0;

        if (value) {

            this.id = value.id;
            this.company_Id = value.company_Id;
            this.club_Id = value.club_Id;
            this.occupation_Id = value.occupation_Id;
            this.grade = value.occupation ? value.occupation.grade : 0;
            this.occupationName = value.occupation ? value.occupation.name : '';
            this.contact_Id = value.contact_Id;
            this.member_Id = value.member_Id;
            this.joinedDate = value.joinedDate ? moment(value.joinedDate) : null;

            this.gradeName = '';
            this.genderName = '';
            this.titleName = '';

            const person = value.contact ? value.contact : value.member;

            if (person) {

                this.status = person.status;
                this.uid = person.uid ? person.uid : '';
                this.email = person.email ? person.email : '';
                this.fName = person.fName ? person.fName : '';
                this.lName = person.lName ? person.lName : '';
                this.gender = person.gender;
                this.title = person.title;
                this.dateOfBirth = person.dateOfBirth ? moment(person.dateOfBirth) : null;
                this.idNumber = person.idNumber ? person.idNumber : '';

                this.telNumbers.length = 0;
                if (person.telNumbers) {
                    this.telNumbers.push(...person.telNumbers.map((v, i) => new TelNumberItem(v, this)));
                }
            }
            else {

                this.status = 1;
                this.uid = '';
                this.email = '';
                this.fName = '';
                this.lName = '';
                this.gender = 0;
                this.title = 0;
                this.dateOfBirth = null;
                this.idNumber = '';
            }

            this.syncFilteredOccupations();
        }
        else {

            this.clearValues();
        }

        this.recordState = 0;
    }

    syncFilteredOccupations() {

        if (this.optns.occupations && this.optns.occupations.length > 0) {

            let currentOccupationGood = false;

            this.filteredOccupations.length = 0;
            this.filteredOccupations.push(...this.optns.occupations.filter((v, i) => {

                const isGood = v.grade === this.grade;

                if (isGood && !currentOccupationGood) {

                    currentOccupationGood = this.occupation_Id === v.id;
                }

                return isGood;
            }));

            if (!currentOccupationGood) {

                this.occupation_Id = 0;
                this.occupationName = '';
            }
        }
    }

    checkRecordState() {

        if (this.originalValue && this.recordState != 10 && this.recordState != 30) {

            const person = this.originalValue.contact ? this.originalValue.contact : this.originalValue.member;

            if ((this.occupation_Id ? this.occupation_Id : 0) !== (this.originalValue.occupation_Id ? this.originalValue.occupation_Id : 0)
                || this.status !== person.status
                || this.uid !== person.uid
                || this.email !== person.email
                || this.fName !== person.fName
                || this.lName !== person.lName
                || this.gender !== person.gender
                || this.title !== person.title
                || !Helper.compareDate(this.dateOfBirth, moment(person.dateOfBirth), false)
                || !Helper.compareDate(this.joinedDate ? this.joinedDate : null, person.joinedDate ? moment(person.joinedDate) : null, false)
                || this.idNumber !== person.idNumber) {

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
        this.errorID = 0;

        this.id = 0;
        this.status = 1;
        this.company_Id = 0;
        this.club_Id = 0;
        this.occupation_Id = 0;
        this.occupationName = '';
        this.grade = 0;
        this.gradeName = '';
        this.contact_Id = 0;
        this.uid = '';
        this.email = '';
        this.fName = '';
        this.lName = '';
        this.gender = 0;
        this.genderName = '';
        this.title = 0;
        this.titleName = '';
        this.dateOfBirth = null;
        this.joinedDate = null;
        this.idNumber = '';

        this.filteredOccupations.length = 0;

        this.recordState = 0;
        this.isSaving = false;
        this.error = null;
    }

    revert() {

        this.sync(this.originalValue);
        this.isSaving = false;
        this.error = null;
    }

    verifyIdNumber() {

        if (!this.dateOfBirth && this.idNumber && this.idNumber.length >= 7) {

            let day = '', month = '', year = '';

            for (let i = 0; i < 7; i++) {

                switch (i) {

                    case 1:
                    case 2:
                        day += this.idNumber[i];
                        break;

                    case 3:
                    case 4:
                        month += this.idNumber[i];
                        break;

                    case 5:
                    case 6:
                        year += this.idNumber[i];
                        break;
                }
            }

            day = parseInt(day);
            month = parseInt(month) - 1;
            year = 1900 + parseInt(year);

            day = new Date(year, month, day);

            if (day) {

                this.dateOfBirth = moment(day);
            }
        }
    }

    isValid() {

        this.recievedInput = true;

        return this.isFNameValid() && this.isLNameValid() && this.isEmailValid();
    }

    addNewTelNumber() {

        const newTelNum = new TelNumberItem(null, this);
        newTelNum.country_Id = this.optns.defCountry ? this.optns.defCountry.id : 0;
        newTelNum.person_Id = this.id;
        newTelNum.recordState = 10;

        this.telNumbers.splice(0, 0, newTelNum);

        if (this.recordState === 0) {

            this.recordState = 20;
        }
    }

    removeTelNumber(telNumber) {

        const index = this.telNumbers.indexOf(telNumber);

        if (index >= 0) {

            this.telNumbers.splice(index, 1);
        }

        if (this.recordState === 0) {

            this.recordState = 20;
        }
    }
}