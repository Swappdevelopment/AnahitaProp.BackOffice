import React from 'react';
import { observer, inject } from 'mobx-react';
import { Alert, Button, Panel } from 'react-bootstrap';

import Helper from '../../../Helper/Helper';
import WaitControl from '../../WaitControl/WaitControl';

import ChangePassword from '../ChangePassword/ChangePassword';

import { errorHandler } from '../../ErrorHandler/ErrorHandler';

import ResetPasswordViewModel from './ResetPasswordViewModel';

import './ResetPassword.scss';


const ResetPassword =
    inject('store')(
        observer(
            class ResetPassword extends React.Component {

                constructor(props) {

                    super(props);

                    this.accountIdentifier = null;

                    this.viewModel = new ResetPasswordViewModel();

                    this.routeStore = this.props.store.routeStore;
                    this.activeLang = this.props.store.langStore.active;

                    this.verifyWithServer = this.verifyWithServer.bind(this);
                }

                componentWillMount() {

                    this.verifyWithServer();
                }

                verifyWithServer(resetState) {

                    if (resetState) {

                        this.viewModel.queryingServer = true;
                    }

                    this.viewModel.exceptionIDCaught = false;
                    this.viewModel.criticalError = false;


                    if (this.routeStore.currentRoute
                        && this.routeStore.currentRoute.mainParams
                        && this.routeStore.currentRoute.mainParams.length > 0) {

                        let idCounter = -1;

                        Helper.RunPromise(
                            {
                                promise: fetch("/account/verifyAccountToken", {
                                    method: "POST",
                                    body: JSON.stringify({ tokenValue: this.routeStore.currentRoute.mainParams[0], accountType: 100 }), // ResetPassword = 100
                                    headers: {
                                        'content-type': 'application/json; charset=utf-8'
                                    },
                                    credentials: 'same-origin'
                                }),
                                success: data => {

                                    if (data && data.ok) {

                                        this.viewModel.queryingServer = false;
                                    }
                                },
                                incrementSession: () => {

                                    this.verifyWithServerPromiseID = this.verifyWithServerPromiseID ? (this.verifyWithServerPromiseID + 1) : 1;
                                    idCounter = this.verifyWithServerPromiseID;
                                },
                                sessionValid: () => {

                                    return idCounter === this.verifyWithServerPromiseID;
                                }
                            },
                            error => {

                                if (error.exceptionID) {

                                    this.viewModel.queryingServer = false;
                                    this.viewModel.exceptionIDCaught = true;
                                }
                                else {

                                    errorHandler.showFromLang(this.activeLang);
                                    this.viewModel.queryingServer = false;
                                    this.viewModel.criticalError = true;
                                }
                            }
                        );
                    }
                    else {

                        this.viewModel.queryingServer = false;
                    }
                }

                render() {

                    return (

                        this.viewModel.exceptionIDCaught || this.viewModel.queryingServer || this.viewModel.criticalError || this.viewModel.resetSuccess ?

                            <div className="s-reset">
                                {errorHandler.getComponent()}


                                <div className="s-reset-header">
                                    <h3>{this.activeLang.labels["lbl_RstPsswrd"]}</h3>
                                </div>


                                {
                                    this.viewModel.exceptionIDCaught ?
                                        (
                                            <div className="s-reset-form">
                                                <Alert>
                                                    <div>
                                                        {Helper.stringToParagraphs(this.activeLang.msgs['msg_LnkXprd'])}
                                                    </div>
                                                </Alert>

                                                <Button className="s-btn-big-primary" onClick={e => { this.routeStore.goToRootPage() }}>
                                                    {this.activeLang.labels['lbl_Back']}
                                                </Button>
                                            </div>
                                        )
                                        :
                                        (
                                            this.viewModel.queryingServer ?

                                                <div className="s-reset-form">
                                                    <h3>{this.activeLang.labels['lbl_Verifying']}...</h3>
                                                    <WaitControl show={true} opacity50={true} />
                                                </div>
                                                :
                                                (
                                                    this.viewModel.criticalError ?
                                                        <div className="s-reset-form">
                                                            <Button className="s-btn-big-primary" onClick={e => { this.verifyWithServer(true) }}>
                                                                {this.activeLang.labels['lbl_Retry']}
                                                            </Button>
                                                        </div>
                                                        :
                                                        <div className="s-reset-form">

                                                            <p>{this.activeLang.msgs['msg_PsswrdRstCmplt'] + '!'}</p>

                                                            <Button className="s-btn-big-primary" onClick={e => { this.routeStore.goToRootPage() }}>
                                                                {this.activeLang.labels['lbl_Back']}
                                                            </Button>

                                                        </div>
                                                )
                                        )
                                }
                            </div >

                            :

                            <ChangePassword
                                resetToken={this.routeStore.currentRoute.mainParams[0]}
                                resetSuccess={() => {

                                    this.viewModel.resetSuccess = true;
                                }} />
                    );
                }
            }));

export default ResetPassword;





