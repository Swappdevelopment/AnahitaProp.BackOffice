import React from 'react';
import { observer, inject } from 'mobx-react';
import { Alert, Button } from 'react-bootstrap';

import Helper from '../../../Helper/Helper';
import WaitControl from '../../WaitControl/WaitControl';

import ConfirmEmailViewModel from './ConfirmEmailViewModel';

import { errorHandler } from '../../ErrorHandler/ErrorHandler';

import './ConfirmEmail.scss';


const ConfirmEmail =
    inject('store')(
        observer(
            class ConfirmEmail extends React.Component {

                constructor(props) {

                    super(props);

                    this.accountIdentifier = null;

                    this.viewModel = new ConfirmEmailViewModel();

                    this.routeStore = this.props.store.routeStore;
                    this.activeLang = this.props.store.langStore.active;

                    this.verifyWithServer = this.verifyWithServer.bind(this);
                }

                componentWillMount() {

                    this.verifyWithServer();
                }

                verifyWithServer() {

                    this.viewModel.queryingServer = true;

                    this.viewModel.exceptionIDCaught = false;
                    this.viewModel.criticalError = false;


                    if (this.routeStore.currentRoute
                        && this.routeStore.currentRoute.mainParams
                        && this.routeStore.currentRoute.mainParams.length > 0) {

                        let idCounter = -1;

                        Helper.RunPromise(
                            {
                                promise: fetch("/account/verifyaccounttoken", {
                                    method: "POST",
                                    body: JSON.stringify({ tokenValue: this.routeStore.currentRoute.mainParams[0], accountType: 230 }), //EmailChange = 230
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
                            });
                    }
                    else {

                        this.viewModel.queryingServer = false;
                    }
                }

                render() {

                    return (

                        <div className="s-confirm">
                            {errorHandler.getComponent()}

                            <div className="s-confirm-header">
                                <h3>{this.activeLang.labels["lbl_CnfrmEmailAddr"]}</h3>
                            </div>

                            {
                                this.viewModel.exceptionIDCaught ?
                                    (
                                        <div className="s-confirm-form">

                                            <div className="s-confirm-form-alert">
                                                <Alert className="s-alert">
                                                    <div>
                                                        {Helper.stringToParagraphs(this.activeLang.msgs['msg_LnkXprd'])}
                                                    </div>
                                                </Alert>
                                            </div>

                                            <div className="s-confirm-form-action">
                                                <Button className="s-btn-large-primary" onClick={e => { this.routeStore.goToRootPage() }}>
                                                    {this.activeLang.labels['lbl_Back']}
                                                </Button>
                                            </div>

                                        </div>

                                    )
                                    :
                                    (
                                        this.viewModel.queryingServer ?

                                            <div className="s-confirm-form">
                                                <WaitControl show={true} opacity50={true} />
                                            </div>
                                            :
                                            (
                                                this.viewModel.criticalError ?
                                                    <div className="s-confirm-form">
                                                        <Button className="s-btn-large-primary" onClick={e => { this.verifyWithServer() }}>
                                                            {this.activeLang.labels['lbl_Retry']}
                                                        </Button>
                                                    </div>

                                                    :
                                                    <div className="s-confirm-form">

                                                        <h5>{this.activeLang.labels["lbl_EmailConfirmed"]}</h5>

                                                        <div className="s-confirm-form-action">
                                                            <Button className="s-btn-large-primary" onClick={e => { this.routeStore.goToRootPage() }}>
                                                                {this.activeLang.labels['lbl_Back']}
                                                            </Button>
                                                        </div>
                                                    </div>



                                            )
                                    )
                            }

                        </div>


                    );
                }
            }));

export default ConfirmEmail;





