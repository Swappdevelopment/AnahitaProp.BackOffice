import { extendObservable, observe } from 'mobx';
import moment from 'moment-es6';

import PersonItem from '../../../Models/PersonItem';

import Helper from '../../../Helper/Helper';

export default class ClubMembersViewModel {

    constructor(clubItem, clubViewModel) {

        this.clubItem = clubItem;
        this.clubViewModel = clubViewModel;

        extendObservable(this, {
            isModalShown: false,
            searchText: '',
            toAddMember: null,
            selectedValue: null,
            verifyingToAdd: false,
            foundToAdd: [],
            members: [],
            statusType: 1
        });

        this.syncMembers = this.syncMembers.bind(this);
        this.genMember = this.genMember.bind(this);
        this.getNewMember = this.getNewMember.bind(this);
        this.addNewMember = this.addNewMember.bind(this);
        this.removeMember = this.removeMember.bind(this);
    }

    static idGenerator = 0;

    syncMembers(value) {

        if (value && Array.isArray(value)) {

            this.members.push(...value.map((v, i) => {

                ClubMembersViewModel.idGenerator += 1;

                return new PersonItem(v, ClubMembersViewModel.idGenerator, this.clubViewModel);
            }));
        }
    }

    genMember(value) {

        const temp = new PersonItem(value, ClubMembersViewModel.idGenerator, this.clubViewModel);
        temp.club_Id = this.clubItem.id;
        temp.joinedDate = moment(new Date());

        return temp;
    }

    getNewMember() {

        if (this.clubItem && this.clubItem.id) {

            ClubMembersViewModel.idGenerator += 1;
            const temp = new PersonItem(PersonItem.getObject(), ClubMembersViewModel.idGenerator, this.clubViewModel);
            temp.recordState = 10;
            temp.club_Id = this.clubItem.id;
            temp.joinedDate = moment(new Date());

            return temp;
        }

        return null;
    }

    addNewMember(value) {

        if (value && this.members.indexOf(value) < 0) {

            this.members.splice(0, 0, value);
        }

        return value;
    }

    removeMember(value) {

        if (value) {

            const index = this.members.indexOf(value);

            if (index >= 0) {

                this.members.splice(index, 1);
            }
        }
    }
}
