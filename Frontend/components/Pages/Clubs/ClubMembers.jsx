import React from "react";
import { observer, inject } from "mobx-react";
import LazyLoad from 'react-lazy-load';

import { Checkbox, Button } from "react-bootstrap";

import moment from "moment-es6";
import Helper from "../../../Helper/Helper";

import ModalHandler from "../../ModalHandler/ModalHandler";
import WaitControl from "../../WaitControl/WaitControl";

import GridRowToolbar from "../../GridRowToolbar/GridRowToolbar";
import PageComponent from "../../PageComponents/PageComponent";

import ClubMembersViewModel from "./ClubMembersViewModel";
import ClubMemberDetails from "./ClubMemberDetails";
import ClubViewModel from "./ClubViewModel";


const ClubMembers = inject("store")(
    observer(
        class ClubMembers extends React.Component {

            constructor(props) {
                super(props);

                this.state = { isModalShown: false };

                this.pageViewModel = props.pageViewModel;
                this.clubViewModel = props.clubViewModel;
                this.clubItem = this.clubViewModel.selectedClubForMembers;

                this.viewModel = new ClubMembersViewModel(this.clubItem, this.clubViewModel);

                this.modalHandler = new ModalHandler();
                this.errorHandler = props.errorHandler;

                this.activeLang = this.props.store.langStore.active;

                this.getMembers = this.getMembers.bind(this);
                this.getMemberRow = this.getMemberRow.bind(this);
                this.saveMembers = this.saveMembers.bind(this);


                this.navBarSearch = {
                    page: 'clubMembers',
                    searchAction: () => {
                        this.offset = 0;
                        this.getMembers();
                    },
                    getSearchText: () => this.viewModel.searchText,
                    setSearchText: value => this.viewModel.searchText = value,
                    clearText: () => {

                        this.viewModel.searchText = '';
                        this.offset = 0;
                        this.getMembers();
                    }
                };

            }

            componentWillMount() {

                this.pageViewModel.menu.navBarSearch = this.navBarSearch;
                this.getMembers();
            }

            componentDidMount() { }

            getMembers() {

                this.viewModel.members.length = 0;

                this.pageViewModel.showPageWaitControl = true;
                this.pageViewModel.pageBlurPixels = 3;


                const params = {
                    clubID: this.clubItem.id,
                    statusFilter: this.viewModel.statusType
                };

                if (this.viewModel.searchText) {

                    params['nameFilter'] = this.viewModel.searchText;
                }

                let idCounter = -1;

                Helper.RunPromise(
                    {
                        promise: Helper.FetchPromiseGet('/club/getMembers', params),
                        success: data => {

                            if (data) {

                                this.viewModel.syncMembers(data);
                            }
                        },
                        incrementSession: () => {

                            this.getMembersPromiseID = this.getMembersPromiseID ? (this.getMembersPromiseID + 1) : 1;
                            idCounter = this.getMembersPromiseID;
                        },
                        sessionValid: () => {

                            return idCounter === this.getMembersPromiseID;
                        }
                    },
                    error => {
                        switch (error.exceptionID) {
                            default:
                                this.errorHandler.showFromLang(this.activeLang);
                                break;
                        }
                    },
                    () => {
                        this.pageViewModel.pageBlurPixels = 0;
                        this.pageViewModel.showPageWaitControl = false;
                    }
                );
            }

            getMemberRow(value, index) {

                let statusColor = null;

                switch (value.recordState) {

                    case 10:
                        statusColor = 's-status-add';
                        break;

                    case 20:
                        statusColor = 's-status-edit';
                        break;

                    case 30:
                        statusColor = 's-status-delete';
                        break;

                }

                let genderName = 'unknown';

                switch (value.gender) {

                    case 10:
                        genderName = 'male';
                        break;

                    case 20:
                        genderName = 'female';
                        break;
                }

                if (value.errorID === 1062) {

                    return (
                        <tr key={value.genId}>
                            <td className="s-td-cell-status">
                                <div className={statusColor}>
                                </div>
                            </td>
                            <td className="s-td-cell-namenl">
                                <img style={{ width: '30px', height: '30px', borderRadius: '50%', marginRight: '15px' }}
                                    src={`../images/${genderName}_avatar.png`} />
                                {value.lName}
                            </td>
                            <td>
                                {value.fName}
                            </td>
                            <td colSpan={5}>
                                <table>
                                    <tbody>
                                        <tr>
                                            <td>
                                                <p>{this.activeLang.msgs['msg_PrsnExists']}</p>
                                            </td>
                                            <td>
                                                <Button
                                                    onClick={e => {
                                                        value.forceSave = true;
                                                        this.saveMembers(value);
                                                    }}>
                                                    {this.activeLang.labels['lbl_Yes']}
                                                </Button>
                                            </td>
                                            <td>
                                                <Button
                                                    onClick={e => {

                                                        if (value.recordState === 10) {

                                                            this.viewModel.removeMember(value);
                                                        }
                                                        else {

                                                            value.sync(value.originalValue);
                                                        }
                                                    }}>
                                                    {this.activeLang.labels['lbl_No']}
                                                </Button>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    );
                }

                return (
                    <tr key={value.genId}>
                        <td className="s-td-cell-status">
                            <div className={statusColor}>
                            </div>
                        </td>
                        <td className="s-td-cell-namenl">
                            <img style={{ width: '30px', height: '30px', borderRadius: '50%', marginRight: '15px' }}
                                src={`../images/${genderName}_avatar.png`} />
                            {value.lName}
                        </td>
                        <td>
                            {value.fName}
                        </td>
                        <td className="hidden-xs hidden-sm">
                            {value.email}
                        </td>
                        <td className="hidden-xs hidden-sm">
                            {
                                value.telNumbers && value.telNumbers.length > 0 ?
                                    `${(value.telNumbers[0].countryPhoneCode ? `(${value.telNumbers[0].countryPhoneCode}) ` : '')}${value.telNumbers[0].number}`
                                    :
                                    null
                            }
                        </td>
                        <td className="hidden-xs hidden-sm hidden-md">
                            {value.occupationName
                                ? value.occupationName
                                : this.activeLang.labels["lbl_Unknown"]}
                        </td>
                        <td className="s-td-cell-active">

                            {
                                value.isChangingStatus ?
                                    <span className="spinner"></span>
                                    :
                                    <Checkbox className="s-checkbox"
                                        defaultChecked={value.status === 1}
                                        onChange={e => {

                                            if (value.id > 0) {

                                                let tempValue = value.status;

                                                value.status = e.target.checked ? 1 : 0;

                                                if (tempValue !== value.status) {

                                                    this.changeStatus(value);
                                                }
                                            }

                                        }}>
                                    </Checkbox>
                            }

                        </td>
                        <GridRowToolbar
                            currentValue={value}
                            displayName={value ? `${value.lName}, ${value.fName}` : ''}
                            onEdit={e => {

                                this.viewModel.selectedValue = value;
                                value.verifyIdNumber();
                                value.checkRecordState();
                                this.modalHandler.show();
                            }}
                            onDelete={e => {

                                if (value.recordState === 10) {

                                    this.viewModel.removeContact(value);
                                }
                                else {

                                    value.recordState = 30;
                                    this.saveContacts();
                                }
                            }}
                            deleteTitle={this.activeLang.labels["lbl_DeleteClubMember"]} />

                    </tr>
                );
            }

            saveMembers(membersToSave) {

                let idCounter = -1;

                membersToSave = membersToSave ? membersToSave : this.viewModel.members.slice();

                if (!Array.isArray(membersToSave)) {
                    membersToSave = [membersToSave];
                }

                const savePromises = {
                    options: membersToSave
                        .filter((v, i) => v.recordState && v.recordState !== 0 && !v.isSaving)
                        .map((toSave, index) => {

                            toSave.isSaving = true;

                            return {
                                promise: Helper.FetchPromisePost('/club/SaveMember', toSave.getValue()),
                                success: data => {

                                    if (data) {

                                        if (toSave.recordState === 30) {

                                            this.viewModel.removeMember(toSave);
                                        }
                                        else if (!data.ok) {

                                            toSave.sync(data);
                                        }
                                    }
                                },
                                failure: error => {

                                    toSave.errorID = error.exceptionID ? error.exceptionID : 0;

                                    switch (error.exceptionID) {
                                        default:
                                            toSave.error = this.activeLang.msgs['errMsg_Aplgs'];
                                            break;
                                    }
                                },
                                complete: () => {

                                    toSave.isSaving = false;
                                }
                            };
                        }),
                    incrementSession: () => {

                        this.saveMembersPromiseID = this.saveMembersPromiseID ? (this.saveMembersPromiseID + 1) : 1;
                        idCounter = this.saveMembersPromiseID;
                    },
                    sessionValid: () => {

                        return idCounter === this.saveMembersPromiseID;
                    }
                };

                Helper.RunPromise(savePromises);
            }

            render() {

                return (

                    <PageComponent
                        isSibling

                        paTitle={this.clubViewModel.selectedClubForMembers.name}
                        paTitleClick={this.clubViewModel.backToCompanies}
                        paSearchPlaceholder={this.activeLang.labels["lbl_SearchMembers"]}
                        paSearchValue={this.viewModel.searchText}
                        paOnSearchValueChange={e => this.viewModel.searchText = e.target.value}
                        paOnSearch={e => this.getMembers()}
                        paClearSearchValue={e => this.viewModel.searchText = ''}
                        paOnAdd={e => {
                            this.viewModel.toAddMember = this.viewModel.getNewMember();
                            this.modalHandler.show();
                        }}
                        paShowSaveButton={e => !this.viewModel.isModalShown && this.viewModel.members.find((v, i) => v.recordState !== 0 && !v.isSaving)}
                        paGlobalSaveOnClick={e => {
                            this.saveMembers();
                        }}

                        paRefresh={e => this.getMembers()}


                        getTableHeaders={() => {

                            return (

                                <tr>
                                    <th className="s-th-cell-status"></th>
                                    <th className="s-th-cell-name">{this.activeLang.labels["lbl_LName"]}</th>
                                    <th>{this.activeLang.labels["lbl_FName"]}</th>
                                    <th className="hidden-xs hidden-sm">{this.activeLang.labels["lbl_Email"]}</th>
                                    <th className="hidden-xs hidden-sm">{this.activeLang.labels["lbl_PhoneNumbers"]}</th>
                                    <th className="hidden-xs hidden-sm hidden-md">{this.activeLang.labels["lbl_Occup"]}</th>
                                    <th className="s-th-cell-active">{this.activeLang.labels["lbl_Active"]}</th>
                                    <th className="s-th-cell-controls" />
                                </tr>

                            );
                        }}
                        getTableRows={() => this.viewModel.members.map(this.getMemberRow)}

                        modalHandler={this.modalHandler}
                        getModalHeader={() => this.activeLang.labels['lbl_AddMember']}

                        getModalInRoot={() => <WaitControl opacity50={true} />}

                        getModalBody={() => {
                            return (
                                <ClubMemberDetails
                                    errorHandler={this.errorHandler}
                                    pageViewModel={this.pageViewModel}
                                    clubItem={this.clubItem}
                                    modalHandler={this.modalHandler}
                                    saveMembers={this.saveMembers}
                                    viewModel={this.viewModel}
                                    pageViewModel={this.pageViewModel} />
                            );
                        }}

                        getModalFooter={() => {

                        }}

                        onModalShow={args => this.viewModel.isModalShown = true}
                        onModalHide={args => {

                            this.viewModel.isModalShown = false;

                            if (args) {

                                switch (args.action) {

                                    case 'later':
                                    case 'save':
                                        if (this.viewModel.selectedValue
                                            && this.viewModel.selectedValue.recordState === 10) {

                                            this.viewModel.addNewMember(this.viewModel.selectedValue);
                                        }

                                        if (args.action === 'save') {

                                            this.saveMembers();
                                        }
                                        break;

                                    default:

                                        if (this.viewModel.selectedValue) {

                                            if (this.viewModel.selectedValue.recordState === 10) {

                                                this.viewModel.removeMember(this.viewModel.selectedValue);
                                            }
                                            else {

                                                this.viewModel.selectedValue.sync(this.viewModel.selectedValue.originalValue);
                                            }
                                        }
                                        break;
                                }

                                this.viewModel.selectedValue = null;
                                this.viewModel.verifyingToAdd = false;
                                this.viewModel.toAddMember = null;
                                this.viewModel.foundToAdd.length = 0;
                            }
                        }} />

                );
            }
        }
    )
);

export default ClubMembers;
