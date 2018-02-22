import { extendObservable, observe } from 'mobx';
import moment from 'moment-es6';

import Helper from '../Helper/Helper';

import TelNumberItem from './TelNumberItem';


export default class PersonItem {

    constructor(value, genId, optns) {

        this.originalValue = null;

        this.genId = genId;
        this.optns = optns;

        extendObservable(
            this,
            Object.assign(
                {
                    filteredOccupations: [],
                    isChangingStatus: false,
                    isSaving: false,
                    error: null,
                    recievedInput: false,
                    grade: 0,
                    errorID: 0
                },
                PersonItem.getObject(),
                this.validationsObject()));

        this.validationsObject = this.validationsObject.bind(this);
        this.sync = this.sync.bind(this);
        this.checkRecordState = this.checkRecordState.bind(this);
        this.clearValues = this.clearValues.bind(this);
        this.verifyIdNumber = this.verifyIdNumber.bind(this);
        this.isValid = this.isValid.bind(this);


        if (value) {

            this.sync(value);
        }


        if (this.optns) {

            observe(this.optns.occupations, change => {

                if (change) {

                    this.filteredOccupations.length = 0;

                    this.filteredOccupations.push(...this.optns.occupations);
                }
            });
        }

        observe(this, 'idNumber', change => {

            this.verifyIdNumber();
        });
    }

    validationsObject() {

        return {

            isFNameValid: () => this.recievedInput ? (this.fName ? true : false) : true,
            isLNameValid: () => this.recievedInput ? (this.lName ? true : false) : true,
            isEmailValid: () => Helper.validateEmail(this.email),
            isJoinedDateValid: () => this.joinedDate && this.joinedDate instanceof moment ? true : false
        };
    }

    static getObject() {

        let value = {
            recordState: 0,
            status: 1,
            id: 0,
            company_Id: 0,
            club_Id: 0,
            occupation_Id: 0,
            occupationName: '',
            grade: 0,
            gradeName: '',
            contact_Id: 0,
            uid: '',
            email: '',
            fName: '',
            lName: '',
            isForeigner: false,
            gender: 0,
            genderName: '',
            title: 0,
            titleName: '',
            dateOfBirth: null,
            joinedDate: null,
            idNumber: '',
            telNumbers: [],
            contactTypes: [],
        };

        // Participant Properties
        value = Object.assign(
            {
                courseDetail_Id: 0,
                participant_Id: 0,
                present: false,
                reimbursable: false
            },
            value);

        return value;
    }

    static create(value, genId, optns) {

        return new PersonItem(value, genId, optns);
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
            courseDetail_Id: this.courseDetail_Id,
            participant_Id: this.participant_Id,
            present: this.present,
            reimbursable: this.reimbursable,
            uid: this.uid,
            email: this.email,
            fName: this.fName,
            lName: this.lName,
            isForeigner: this.isForeigner,
            gender: this.gender,
            title: this.title,
            dateOfBirth: this.dateOfBirth ? this.dateOfBirth.utc() : null,
            joinedDate: this.joinedDate ? this.joinedDate.utc() : null,
            idNumber: this.idNumber,
            telNumbers: this.telNumbers.map((v, i) => v.getValue()),
            contactTypes: this.contactTypes.map((v, i) => Object.assign({}, v)),
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

            this.contactTypes.length = 0;

            this.occupation_Id = value.occupation_Id ? value.occupation_Id : (value.contact ? value.contact.occupation_Id : 0);
            this.contact_Id = value.contact_Id;


            if (value.occupation) {

                this.occupationName = value.occupation.name;
            }

            if (value.contact) {

                if (!this.occupationName) {

                    if (value.contact.occupationName) {

                        this.occupationName = value.contact.occupationName;
                    }
                    else if (value.contact.occupation) {

                        this.occupationName = value.contact.occupation.name;
                    }
                }

                //this.contactTypes.push(...value.contact.contactTypes.map((v, i) => Object.assign({}, v)));
            }

            if (value.contactTypes) {

                this.contactTypes.push(...Helper.getContactTypes().filter((v, i) => v.key > 0).map((key, i) => {

                    let record = value.contactTypes.filter((v, i) => v.value === key.key);

                    record = record.length > 0 ? record[0] : null;

                    if (record) {

                        record = Object.assign(record, {
                            recordState: 0,
                            isSaving: false
                        });
                    }
                    else {

                        record = {
                            id: 0,
                            status: 1,
                            contact_Id: this.id,
                            value: key.key,
                            recordState: 0,
                            isSaving: false
                        };
                    }

                    record = extendObservable({}, record);

                    return record;
                }));
            }

            this.grade = value.occupation ? value.occupation.grade : 0;

            this.member_Id = value.member_Id;
            this.joinedDate = value.joinedDate ? moment(value.joinedDate) : null;

            this.courseDetail_Id = value.courseDetail_Id;
            this.participant_Id = value.participant_Id;
            this.present = value.present;
            this.reimbursable = value.reimbursable;

            this.gradeName = '';
            this.genderName = '';
            this.titleName = '';

            const person = value.contact ? value.contact : (value.member ? value.member : (value.participant ? value.participant : value));

            if (person) {

                this.status = person.status;
                this.uid = person.uid ? person.uid : '';
                this.email = person.email ? person.email : '';
                this.fName = person.fName ? person.fName : '';
                this.lName = person.lName ? person.lName : '';
                this.gender = person.gender;
                this.isForeigner = person.isForeigner;
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
                this.isForeigner = false;
                this.gender = 0;
                this.title = 0;
                this.dateOfBirth = null;
                this.idNumber = '';
            }
        }
        else {

            this.clearValues();
        }

        this.recordState = 0;
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
                || this.isForeigner !== person.isForeigner
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
        this.isForeigner = false;
        this.gender = 0;
        this.genderName = '';
        this.title = 0;
        this.titleName = '';
        this.dateOfBirth = null;
        this.joinedDate = null;
        this.idNumber = '';

        this.filteredOccupations.length = 0;
        this.telNumbers.length = 0;
        this.contactTypes.length = 0;

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
        newTelNum.country_Id = this.optns && this.optns.defCountry ? this.optns.defCountry.id : 0;
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