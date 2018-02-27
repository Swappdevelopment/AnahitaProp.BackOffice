import React from 'react';
import { observer, inject } from 'mobx-react';
import { errorHandler } from '../../ErrorHandler/ErrorHandler';

import { NavLink, Checkbox, Button, Alert, HelpBlock } from "react-bootstrap";

import Helper from '../../../Helper/Helper';
import WaitBlock from '../../WaitBlock/WaitBlock';

import ChangePasswordViewModel from './ChangePasswordViewModel';

import './ChangePassword.scss';

const ChangePassword =
    inject('store')(
        observer(
            class ChangePassword extends React.Component {

                constructor(props) {

                    super(props);

                    this.accessStore = this.props.store.accessStore;
                    this.activeLang = this.props.store.langStore.active;

                    this.viewModel = new ChangePasswordViewModel();

                    this.inputChange = this.inputChange.bind(this);
                    this.changePassword = this.changePassword.bind(this);
                    this.onKeyPress = this.onKeyPress.bind(this);

                    this.state = {
                        passwordChangeSuccess: false
                    };
                }

                componentWillMount() {

                    this.changePassword(null);
                }

                inputChange(e, value) {

                    if (this.state.passwordChangeSuccess) {

                        this.setState({ passwordChangeSuccess: false });
                    }

                    switch (value) {

                        case 'curpassword':
                            this.viewModel.currentPassword = e.target.value;
                            break;

                        case 'newpassword':
                            this.viewModel.newPassword = e.target.value;
                            if (this.viewModel.newPassword === this.viewModel.newPasswordConfirm && !this.viewModel.newPasswordValidated) {
                            }
                            break;

                        case 'confirm':
                            this.viewModel.newPasswordConfirm = e.target.value;
                            if (this.viewModel.newPassword === this.viewModel.newPasswordConfirm && !this.viewModel.newPasswordValidated) {
                                this.viewModel.newPasswordValidated = true;
                            }
                            break;
                    }
                }

                onKeyPress(e) {

                    if (e.key === 'Enter') {

                        this.changePassword(e);
                    }
                }

                changePassword(e) {

                    if (this.state.passwordChangeSuccess) {

                        this.setState({ passwordChangeSuccess: false });
                    }

                    if (this.viewModel.newPassword === this.viewModel.newPasswordConfirm) {

                        if (!this.viewModel.newPasswordValidated) {

                            this.viewModel.newPasswordValidated = true;
                        }

                        this.viewModel.invalidMsgs.length = 0;

                        let data = {
                            oldPassword: this.viewModel.currentPassword,
                            newPassword: this.viewModel.newPassword,
                            resetToken: this.props.resetToken
                        };

                        this.viewModel.currentPassword = '';
                        this.viewModel.newPassword = '';
                        this.viewModel.newPasswordConfirm = '';

                        this.viewModel.queryingServer = true;

                        let idCounter = -1;

                        Helper.RunPromise(
                            {
                                promise: fetch(`/account/${this.props.resetToken ? 'resetpassword' : 'changepassword'}`, {
                                    method: "POST",
                                    body: JSON.stringify(data),
                                    headers: {
                                        'content-type': 'application/json; charset=utf-8'
                                    },
                                    credentials: 'same-origin'
                                }),
                                success: data => {

                                    if (idCounter === this.changePasswordPromiseID) {

                                        if (data && data.result && data.result.length > 0) {

                                            this.viewModel.invalidMsgs.push(...data.result);
                                        }
                                        else if (this.props.resetSuccess) {

                                            this.props.resetSuccess();
                                        }
                                        else {

                                            this.viewModel.invalidMsgs.length = 0;

                                            if (this.props.redirectOnSuccess) {

                                                this.accessStore.status = 0;
                                            }
                                            else {

                                                this.viewModel.changeSuccess = true;
                                            }
                                        }
                                    }
                                },
                                incrementSession: () => {

                                    this.changePasswordPromiseID = this.changePasswordPromiseID ? (this.changePasswordPromiseID + 1) : 1;
                                    idCounter = this.changePasswordPromiseID;
                                },
                                sessionValid: () => {

                                    return idCounter === this.changePasswordPromiseID;
                                }
                            },
                            error => {

                                if (idCounter === this.changePasswordPromiseID) {

                                    switch (error.exceptionID) {
                                        default:
                                            errorHandler.showFromLang(this.activeLang);
                                            break;
                                    }
                                }
                            },
                            () => {

                                this.viewModel.queryingServer = false;
                            }
                        );
                    }
                    else {

                        this.viewModel.newPasswordValidated = false;
                    }
                }

                render() {

                    return (

                        <div className={this.props.accountChangeContent ? "s-account-change-content s-height-100" : "s-account-change-content"}>
                            <div className="container">
                                <div className="row">
                                    {
                                        this.props.hideBackground ?
                                            null
                                            :
                                            <div className="col-sm-12">
                                                <div className="s-account-background" />
                                            </div>
                                    }

                                    <div className="col-sm-12">
                                        <div className="s-language" />
                                        <div className={this.props.accountChangeWrapper ? "s-account-change-wrapper s-m-0" : "s-account-change-wrapper"}>
                                            {
                                                this.props.hideLogo ?
                                                    null
                                                    :
                                                    <div className="s-logo">
                                                        <img src="../images/logo.jpg" width="180px" />
                                                    </div>
                                            }
                                            <div className="s-change">
                                                {errorHandler.getComponent()}

                                                <div className="s-change-header">

                                                    {
                                                        this.props.hideTitle ?
                                                            null
                                                            :
                                                            <h3>
                                                                {
                                                                    this.props.resetToken ?
                                                                        this.activeLang.labels['lbl_RstPsswrd']
                                                                        :
                                                                        this.activeLang.labels['lbl_ChngPsswrd']
                                                                }
                                                            </h3>
                                                    }

                                                    {
                                                        this.props.subTitles ?
                                                            this.props.subTitles.map((value, i) => <h5 key={i}>{value}</h5>)
                                                            : null
                                                    }

                                                    {
                                                        this.viewModel.queryingServer ?
                                                            null
                                                            :
                                                            this.viewModel.invalidMsgs.length > 0 ?
                                                                <Alert className="s-alert-m">
                                                                    {this.viewModel.invalidMsgs.map((value, i) => <p key={i}>* {value}</p>)}
                                                                </Alert>
                                                                : null
                                                    }

                                                </div>

                                                <div className="s-change-form">


                                                    {
                                                        this.viewModel.changeSuccess ?
                                                            <div className="s-change-sent">
                                                                <p>{this.activeLang.msgs["msg_PsswrdChngSccss"]}</p>

                                                                {
                                                                    this.props.hideSuccessNavToLogin ?
                                                                        null
                                                                        :
                                                                        <NavLink to="/login">
                                                                            <Button className="s-btn-big-primary">
                                                                                {this.activeLang.labels['lbl_Back']}
                                                                            </Button>
                                                                        </NavLink>
                                                                }
                                                            </div>
                                                            :
                                                            <div>

                                                                <div className="form-group s-form-group">
                                                                    {
                                                                        this.props.resetToken ?
                                                                            null
                                                                            :
                                                                            this.viewModel.queryingServer ?
                                                                                null
                                                                                :
                                                                                <input className="form-control s-input-empty"
                                                                                    type="password"
                                                                                    placeholder={this.activeLang.labels['lbl_CurPsswrd']}
                                                                                    name="password"
                                                                                    value={this.viewModel.currentPassword}
                                                                                    onKeyPress={this.onKeyPress}
                                                                                    onChange={e => this.inputChange(e, 'curpassword')} />
                                                                    }
                                                                    {
                                                                        this.viewModel.queryingServer ?
                                                                            null
                                                                            :

                                                                            <input className="form-control s-input-empty"
                                                                                type="password"
                                                                                placeholder={this.activeLang.labels['lbl_NewPsswrd']}
                                                                                name="password"
                                                                                value={this.viewModel.newpassword}
                                                                                onKeyPress={this.onKeyPress}
                                                                                onChange={e => this.inputChange(e, 'newpassword')} />
                                                                    }
                                                                    {
                                                                        this.viewModel.queryingServer ?
                                                                            null
                                                                            :

                                                                            <input className="form-control s-input-empty s-input-empty-last"
                                                                                type="password"
                                                                                placeholder={this.activeLang.labels['lbl_CfrmNewPsswrd']}
                                                                                name="password"
                                                                                value={this.viewModel.newPasswordConfirm}
                                                                                onKeyPress={this.onKeyPress}
                                                                                onChange={e => this.inputChange(e, 'confirm')} />
                                                                    }
                                                                    {
                                                                        this.viewModel.newPasswordValidated ?
                                                                            null :
                                                                            <HelpBlock style={{ color: 'red' }}>{this.activeLang.msgs['msg_EntrSmPsswrd']}</HelpBlock>
                                                                    }

                                                                    <div className="s-change-form-alert">
                                                                        {
                                                                            this.state.passwordChangeSuccess ?
                                                                                <Alert>
                                                                                    {this.activeLang.msgs['msg_PsswrdChngSccss']}
                                                                                </Alert>
                                                                                : null
                                                                        }
                                                                    </div>

                                                                    <div className={this.props.accountChangeWrapper ? "s-change-form-action s-m-0" : "s-change-form-action"}>

                                                                        <Button onClick={this.changePassword} className="s-btn-big-primary" disabled={this.viewModel.queryingServer}>
                                                                            {
                                                                                this.viewModel.queryingServer ?

                                                                                    <span>{this.activeLang.labels['lbl_Apply']}<i className="spinner-right"></i></span>
                                                                                    :
                                                                                    this.activeLang.labels['lbl_Apply']
                                                                            }
                                                                        </Button>

                                                                    </div>
                                                                </div>
                                                            </div>
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    );
                }
            }));

export default ChangePassword;





