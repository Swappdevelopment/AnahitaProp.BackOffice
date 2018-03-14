import React from 'react';
import { observer, inject } from 'mobx-react';
import { Checkbox, Button, Alert } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';

import Helper from '../../../Helper/Helper';

import LoginViewModel from './LoginViewModel';

import './Login.scss';

const Login =
    inject('store')(
        observer(
            class Login extends React.Component {

                constructor(props) {

                    super(props);

                    this.accessStore = this.props.store.accessStore;
                    this.accessStore.identifierBeforeForgot = null;

                    this.langStore = this.props.store.langStore;
                    this.activeLang = this.props.store.langStore.active;

                    this.viewModel = new LoginViewModel();

                    this.inputChange = this.inputChange.bind(this);
                    this.signIn = this.signIn.bind(this);
                    this.onKeyPress = this.onKeyPress.bind(this);
                }

                inputChange(e, value) {

                    this.viewModel.showErrMsg = false;

                    switch (value) {

                        case 'username':
                            this.viewModel.userName = e.target.value;
                            this.accessStore.identifierBeforeForgot = this.viewModel.userName;
                            break;

                        case 'password':
                            this.viewModel.password = e.target.value;
                            break;

                        default:
                            this.viewModel.remember = e.target.checked;
                            break;
                    }
                }

                onKeyPress(e) {

                    if (e.key === 'Enter') {

                        this.signIn(e);
                    }
                }

                signIn(e) {

                    if (this.viewModel.queryingServer) return;

                    this.viewModel.showErrMsg = false;
                    this.viewModel.queryingServer = true;

                    const param = {
                        User: this.viewModel.userName,
                        Password: this.viewModel.password,
                        Remember: this.viewModel.remember
                    };

                    let idCounter = -1;

                    Helper.RunPromise(
                        {
                            promise: Helper.FetchPromisePost('/account/signin', param),
                            success: data => {

                                if (data && data.ok === true) {

                                    this.accessStore.status = 0;
                                    this.accessStore.setUserName(data.fullName);
                                    this.accessStore.setUserEmail(data.email);
                                    this.accessStore.setUserGender(data.gender);
                                    this.accessStore.history.replace(this.redirectToPath ? this.redirectToPath : '/');
                                }

                                this.accessStore.redirectToPath = null;
                            },
                            incrementSession: () => {

                                this.signInPromiseID = this.signInPromiseID ? (this.signInPromiseID + 1) : 1;
                                idCounter = this.signInPromiseID;
                            },
                            sessionValid: () => {

                                return idCounter === this.signInPromiseID;
                            }
                        },
                        error => {

                            this.viewModel.showErrMsg = true;
                        },
                        () => {

                            this.viewModel.queryingServer = false;
                        }
                    );
                }

                render() {

                    return (

                        <div className="s-login">
                            <div className="s-login-header">
                                <h3>{this.activeLang.labels['lbl_SignIn']}</h3>
                            </div>
                            <div className="s-login-form">
                                <div className="form-group s-form-group">
                                    <input className="form-control s-input-empty"
                                        type="text"
                                        placeholder={this.activeLang.labels['lbl_UsrNmEmail']}
                                        name="username"
                                        value={this.viewModel.userName}
                                        onKeyPress={this.onKeyPress}
                                        onChange={e => this.inputChange(e, 'username')}
                                        disabled={this.viewModel.queryingServer} />
                                </div>
                                <div className="form-group s-form-group">
                                    <input className="form-control s-input-empty s-input-empty-last"
                                        type="password"
                                        placeholder={this.activeLang.labels['lbl_Psswrd']}
                                        name="password"
                                        value={this.viewModel.password}
                                        onKeyPress={this.onKeyPress}
                                        onChange={e => this.inputChange(e, 'password')}
                                        disabled={this.viewModel.queryingServer} />
                                </div>
                                <div className="row s-login-form-sub">
                                    <div className="col-sm-6 login-form-remember">
                                        <Checkbox
                                            className="s-checkbox"
                                            value={this.viewModel.remember}
                                            disabled={this.viewModel.queryingServer}
                                            onChange={e => this.inputChange(e, 'remember')}>
                                            <span>{this.activeLang.labels['lbl_RmbrMe']}</span>
                                        </Checkbox>
                                    </div>
                                    <div className="col-sm-6 login-form-forgot">
                                        <NavLink className="s-action" to="/forgotpassword">
                                            {this.activeLang.labels['lbl_FrgtPsswrdQm']}
                                        </NavLink>
                                    </div>
                                </div>

                                <div className="s-login-form-alert">
                                    {
                                        this.viewModel.showErrMsg ?
                                            <Alert className="s-alert">
                                                <span>{this.activeLang.msgs['msg_InvldUsrNmPsswrd']}</span>
                                            </Alert>
                                            : null
                                    }
                                </div>

                                <div className="s-login-form-action">

                                    <Button onClick={this.signIn} className="s-btn-large-primary">
                                        {
                                            this.viewModel.queryingServer ?
                                                <span>{this.activeLang.labels['lbl_SignIn']}<i className="spinner-right"></i></span>
                                                :
                                                this.activeLang.labels['lbl_SignIn']
                                        }
                                    </Button>


                                </div>

                            </div>
                        </div>

                    );
                }
            }));

export default Login;


