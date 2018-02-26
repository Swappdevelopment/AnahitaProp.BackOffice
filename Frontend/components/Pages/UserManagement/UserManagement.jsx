import React from "react";
import { observer, inject } from "mobx-react";
import { OverlayTrigger, Button, FormControl, Label } from "react-bootstrap";

import Helper from "../../../Helper/Helper";

import ModalHandler from "../../ModalHandler/ModalHandler";
import WaitControl from "../../WaitControl/WaitControl";

import GridRowToolbar from "../../GridRowToolbar/GridRowToolbar";
import PageComponent from "../../PageComponents/PageComponent";

import UserManagementViewModel from "./UserManagementViewModel";
import UserManagementRole from "./UserManagementRole";

import './UserManagement.scss';


const UserManagement =
    inject("store")(
        observer(
            class UserManagement extends React.Component {

                constructor(props) {
                    super(props);

                    this.state = { isModalShown: false };

                    this.pageViewModel = props.pageViewModel;

                    this.viewModel = UserManagementViewModel.init();

                    this.errorHandler = props.errorHandler;
                    this.activeLang = this.props.store.langStore.active;
                    this.modalHandler = new ModalHandler();

                    this.getUsers = this.getUsers.bind(this);
                    this.getUserRow = this.getUserRow.bind(this);
                    this.save = this.save.bind(this);
                }

                componentWillMount() {
                    this.getUsers();
                }

                getUsers() {

                    this.viewModel.users.length = 0;

                    this.pageViewModel.pageBlurPixels = 3;
                    this.pageViewModel.showPageWaitControl = true;

                    const params = {
                        statusFilter: this.viewModel.statusType
                    };

                    if (this.viewModel.searchText) {

                        params['nameFilter'] = this.viewModel.searchText;
                    }
                    let idCounter = -1;

                    Helper.RunPromise(
                        {
                            promise: Helper.FetchPromiseGet('/AccountManagement/get/', params),
                            success: data => {

                                if (data && data.length > 0) {

                                    this.viewModel.pushUser(...data.map((v, i) => this.viewModel.syncUser(v)));
                                }
                            },
                            incrementSession: () => {

                                this.getUserPromiseID = this.getUserPromiseID ? (this.getUserPromiseID + 1) : 1;
                                idCounter = this.getUserPromiseID;
                            },
                            sessionValid: () => {

                                return idCounter === this.getUserPromiseID;
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
                            this.viewModel.isLazyLoading = false;
                        }
                    );
                }

                getUserRow(value, index) {

                    value = value ? value : {};

                    const getEmailStatus = () => {

                        if (value) {

                            if (value.emailConfirmed) {

                                return <span className="badge s-badge-primary">{this.activeLang.labels['lbl_Confirmed']}</span>;
                            }
                            else if (value.accountTokens && value.accountTokens.length > 0) {

                                switch (value.emailSentStatus) {

                                    case 0:
                                        return (
                                            <Button onClick={e => this.sendEmail(value)}
                                                className="badge s-badge-orange">
                                                {this.activeLang.labels['lbl_EmailNotSent']}
                                            </Button>
                                        );

                                    case 10:
                                        return (
                                            <div style={{ position: 'relative', marginTop: '10px', marginRight: '20px' }}>
                                                <span style={{ position: 'absolute', top: '-14px' }} className="spinner"></span>
                                            </div>
                                        );

                                    case 20:
                                        return (
                                            <Button onClick={e => this.sendEmail(value)}
                                                className="badge s-badge-red">
                                                {this.activeLang.labels['lbl_EmailSentFailed']}
                                            </Button>
                                        );

                                    case 30:
                                        return (
                                            <Button onClick={e => this.sendEmail(value)}
                                                className="badge s-badge-blue">
                                                {this.activeLang.labels['lbl_EmailSent']}
                                            </Button>
                                        );
                                }
                            }
                        }

                        return <span className="badge s-badge-lightgray">{this.activeLang.labels['lbl_NotConfirmed']}</span>;;
                    };

                    return (

                        value.isLazyWait ?
                            <tr key={value.genId}>
                                <RowLazyWait colSpan={6} spin={true} onAppear={() => {

                                    this.offset += this.limit;
                                    this.getUsers();

                                }} />
                            </tr>
                            :
                            <tr key={value.genId}>
                                <td className="s-td-cell-status"></td>
                                <td className="s-td-cell-namenl">{value.accountName}</td>
                                <td>{value.email}</td>
                                <td>{`${value.lName} ${value.fName}`}</td>
                                <td>{value.accountRoles && value.accountRoles.length > 0 ? value.accountRoles[0].name : ''}</td>
                                <td className="text-center">
                                    {getEmailStatus()}
                                </td>

                                <GridRowToolbar
                                    currentValue={value}
                                    displayName={value ? `${value.lName ? value.lName.toUpperCase() : ''} ${value.fName}` : ''}
                                    tltpEdit={this.activeLang.labels["lbl_AddRmvRoles"]}
                                    editButtonDisabled={value.isCurrentUser}
                                    deleteButtonDisabled={value.isCurrentUser}
                                    onEdit={e => {
                                        this.viewModel.setPropValue({ targetRoleUser: value.id });
                                        this.modalHandler.show();
                                    }}
                                    onDelete={e => {
                                        value.recordState = 30;
                                        this.save(value);
                                    }}
                                    deleteTitle={this.activeLang.labels["lbl_DeleteUser"]}
                                />
                            </tr>
                    );
                }

                save(record) {

                    if (record && record.recordState > 0) {

                        if (!('role_Id' in record) || this.viewModel.targetRoleUser.recordState === 10) {

                            const user = ('role_Id' in record) ? this.viewModel.targetRoleUser : record;

                            user.isSaving = true;
                            record.isSaving = true;

                            const param = user.getValue();

                            param.accountRoles = [record.getValue()];

                            Helper.RunPromise(
                                {
                                    promise: Helper.FetchPromisePost('/AccountManagement/CreateAccount', param),
                                    success: data => {

                                        if (data) {

                                            if (user.recordState === 30) {

                                                const index = this.viewModel.users.indexOf(user);

                                                if (index >= 0) {

                                                    this.viewModel.users.splice(index, 1);
                                                }
                                            }
                                            else if (data.account) {

                                                user.sync(data.account);

                                                if (this.viewModel.users.indexOf(user) < 0) {

                                                    this.viewModel.users.splice(0, 0, user);
                                                }

                                                this.sendEmail(user);
                                            }
                                        }
                                    },
                                },
                                error => {

                                    switch (error.exceptionID) {
                                        default:
                                            this.errorHandler.showFromLang(this.activeLang);
                                            break;
                                    }
                                },
                                () => {

                                    user.isSaving = false;
                                    record.isSaving = false;
                                }
                            );
                        }
                        else {

                            record.setPropValue({ isSaving: true });

                            Helper.RunPromise(
                                {
                                    promise: Helper.FetchPromisePost('/AccountManagement/AddRoleToAccount', record.getValue()),
                                    success: data => {

                                        if (data) {

                                            if (data.accountRole) {

                                                record.sync(data.accountRole);

                                                if (!this.viewModel.targetRoleUser.hasAccountRole(data.accountRole.role_Id)) {

                                                    this.viewModel.targetRoleUser.insertAccountRole(0, data.accountRole);
                                                }
                                            }
                                            else if (record.recordState === 30) {

                                                this.viewModel.targetRoleUser.removeAccountRole(record);
                                            }
                                        }
                                    },
                                },
                                error => {

                                    switch (error.exceptionID) {
                                        default:
                                            this.errorHandler.showFromLang(this.activeLang);
                                            break;
                                    }
                                },
                                () => {

                                    record.setPropValue({ isSaving: false });
                                }
                            );
                        }
                    }
                }

                sendEmail(user) {

                    if (user && user.accountTokens && user.accountTokens.length > 0 && user.accountTokens[0].value) {

                        user.emailSentStatus = 10;

                        Helper.RunPromise(
                            {
                                promise: Helper.FetchPromisePost('/AccountManagement/SendSignupEmail', user.accountTokens[0]),
                                success: data => {

                                    if (data) {

                                        user.accountTokens[0] = data;
                                        user.emailSentStatus = data.emailSentStatus;
                                    }
                                },
                            },
                            error => {

                                user.emailSentStatus = 20;

                                switch (error.exceptionID) {
                                    default:
                                        this.errorHandler.showFromLang(this.activeLang);
                                        break;
                                }
                            },
                            () => {

                                user.isSaving = false;
                            }
                        );
                    }
                }

                render() {

                    const onRoleCreationContinue = e => {

                        if (this.viewModel.targetRoleUser
                            && this.viewModel.targetRoleUser.recordState === 10
                            && this.viewModel.targetRoleUser.id < 0
                            && this.viewModel.targetRoleUser.isValid()) {

                            this.viewModel.targetRoleUser.id = 0;
                        }
                    };

                    return (

                        <PageComponent

                            paTitle={this.activeLang.labels["lbl_Menu_usermanagement"]}
                            paSearchPlaceholder={this.activeLang.labels["lbl_SearchUsers"]}
                            paSearchValue={this.viewModel.searchText}
                            paOnSearchValueChange={e => this.viewModel.searchText = e.target.value}
                            paOnSearch={e => this.getUsers(this.viewModel.searchText)}
                            paClearSearchValue={e => this.viewModel.searchText = ''}
                            paOnAdd={e => {
                                const temp = this.viewModel.getNewUser();
                                temp.id = -1;

                                this.viewModel.targetRoleUser = temp;

                                this.modalHandler.show();
                            }}
                            paShowSaveButton={e => !this.viewModel.isModalShown && this.viewModel.users.find((v, i) => v.recordState !== 0 && !v.isSaving)}
                            paGlobalSaveOnClick={e => {
                                this.saveUsers();
                            }}
                            paRefresh={e => {
                                this.getUsers();
                            }}
                            hideStatus
                            hideSave
                            hideNext
                            hidePrev
                            getTableHeaders={() => {

                                return (

                                    <tr>
                                        <th className="s-th-cell-status"></th>
                                        <th className="s-th-cell-name">{this.activeLang.labels['lbl_UsrNm']}</th>
                                        <th>{this.activeLang.labels['lbl_Email']}</th>
                                        <th>{this.activeLang.labels['lbl_Name']}</th>
                                        <th>{this.activeLang.labels['lbl_Role']}</th>
                                        <th>{this.activeLang.labels['lbl_Confirmed']}</th>
                                        <th className="s-th-cell-controls" />
                                    </tr>
                                );
                            }}

                            getTableRows={() => this.viewModel.users.map(this.getUserRow)}

                            modalHandler={this.modalHandler}
                            getModalHeader={() => {

                                return this.activeLang.labels[
                                    this.viewModel.targetRoleUser
                                        && this.viewModel.targetRoleUser.recordState === 10
                                        && this.viewModel.targetRoleUser.id < 0 ? 'lbl_CreateNwUsr' : 'lbl_ManageRoles'];
                            }}

                            getModalInRoot={() => {

                                return <WaitControl opacity50={true} />;
                            }}

                            getModalBody={() =>
                                <UserManagementRole
                                    pageViewModel={this.pageViewModel}
                                    userManagementViewModel={this.viewModel}
                                    save={this.save}
                                    onRoleCreationContinue={onRoleCreationContinue}
                                    errorHandler={this.errorHandler} />}

                            getModalFooter={() => {

                                return (

                                    <div className="modal-controls">

                                        {
                                            this.viewModel.targetRoleUser && this.viewModel.targetRoleUser.recordState === 10 && this.viewModel.targetRoleUser.id ?
                                                <div>
                                                    <Button className="s-btn-medium-primary-border"
                                                        onClick={e => {

                                                            this.modalHandler.hide();
                                                        }}>
                                                        {this.activeLang.labels['lbl_Cancel']}
                                                    </Button>
                                                    <Button className="s-btn-medium-primary"
                                                        onClick={onRoleCreationContinue}>
                                                        {this.activeLang.labels['lbl_Continue']}
                                                    </Button>
                                                </div>
                                                :
                                                <Button className="s-btn-medium-primary"
                                                    onClick={e => {

                                                        if (this.viewModel.targetRoleUser
                                                            && this.viewModel.targetRoleUser.recordState === 10
                                                            && this.viewModel.targetRoleUser.id === 0
                                                            && this.viewModel.targetRoleUser.isValid()) {

                                                            if (this.viewModel.users.indexOf(this.viewModel.targetRoleUser) < 0) {

                                                                this.viewModel.users.splice(0, 0, this.viewModel.targetRoleUser);
                                                            }

                                                            this.save(this.viewModel.targetRoleUser);
                                                        }

                                                        this.modalHandler.hide();
                                                    }}>
                                                    {this.activeLang.labels['lbl_Done']}
                                                </Button>
                                        }

                                    </div>

                                );
                            }}
                        />
                    );
                }
            }
        )
    );

export default UserManagement;
