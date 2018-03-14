import React from 'react';
import { observer, inject } from 'mobx-react';
import { Alert, Button, Row, FormGroup, FormControl, ControlLabel, Label } from 'react-bootstrap';

import Helper from '../../../Helper/Helper';
import WaitControl from '../../WaitControl/WaitControl';

import CompleteRegistrationViewModel from './CompleteRegistrationViewModel';

import { errorHandler } from '../../ErrorHandler/ErrorHandler';

import './CompleteRegistration.scss';


const CompleteRegistration =
    inject('store')(
        observer(
            class CompleteRegistration extends React.Component {

                constructor(props) {

                    super(props);

                    this.accountIdentifier = null;

                    this.viewModel = new CompleteRegistrationViewModel();

                    this.accessStore = this.props.store.accessStore;
                    this.routeStore = this.props.store.routeStore;
                    this.activeLang = this.props.store.langStore.active;

                    this.verifyWithServer = this.verifyWithServer.bind(this);
                    this.processRegistration = this.processRegistration.bind(this);
                }

                componentWillMount() {

                    Helper.RunPromise(
                        Helper.FetchPromisePost('/Account/TrySignOut', { signOut: true })
                    );

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

                        const options = [
                            {
                                promise: Helper.FetchPromisePost('/account/verifyaccounttoken', { tokenValue: this.routeStore.currentRoute.mainParams[0], accountType: 210 }),
                                success: data => {

                                    if (data && data.ok) {

                                        this.viewModel.queryingServer = false;

                                        this.viewModel.sync(data.result);
                                    }
                                },
                                failure: error => {

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
                            }
                        ];

                        if (!this.firstLoadDone) {

                            options.push(
                                {
                                    promise: Helper.FetchPromisePost('/account/TrySignOut', { signOut: true })
                                });

                            this.firstLoadDone = true;
                        }

                        Helper.RunPromise(
                            {
                                options: options,
                                incrementSession: () => {

                                    this.verifyWithServerPromiseID = this.verifyWithServerPromiseID ? (this.verifyWithServerPromiseID + 1) : 1;
                                    idCounter = this.verifyWithServerPromiseID;
                                },
                                sessionValid: () => {

                                    return idCounter === this.verifyWithServerPromiseID;
                                }
                            }
                        );
                    }
                    else {

                        this.viewModel.queryingServer = false;
                    }
                }

                processRegistration() {

                    this.viewModel.completed = false;
                    this.viewModel.processingRegistration = true;
                    this.viewModel.exceptionIDCaught = false;
                    this.viewModel.criticalError = false;

                    this.viewModel.invalidMsgs.length = 0;

                    let idCounter = -1;

                    Helper.RunPromise(
                        {
                            promise: Helper.FetchPromisePost(
                                '/account/processRegistration',
                                {
                                    tokenValue: this.routeStore.currentRoute.mainParams[0],
                                    accountName: this.viewModel.accountName,
                                    fName: this.viewModel.fName,
                                    lName: this.viewModel.lName,
                                    password: this.viewModel.password
                                }),
                            success: data => {

                                if (data) {

                                    if (data.errMsgs && data.errMsgs.length > 0) {

                                        this.viewModel.invalidMsgs.push(...data.errMsgs);
                                    }
                                    else if (data.ok) {

                                        this.viewModel.completed = true;
                                    }
                                }
                            },
                            incrementSession: () => {

                                this.processRegistrationPromiseID = this.processRegistrationPromiseID ? (this.processRegistrationPromiseID + 1) : 1;
                                idCounter = this.processRegistrationPromiseID;
                            },
                            sessionValid: () => idCounter === this.processRegistrationPromiseID
                        },
                        error => {

                            if (error.exceptionID) {

                                this.viewModel.exceptionIDCaught = true;
                            }
                            else {

                                errorHandler.showFromLang(this.activeLang);
                                this.viewModel.criticalError = true;
                            }
                        },
                        () => {

                            this.viewModel.processingRegistration = false;
                        });
                }

                render() {

                    return (

                        <div className="s-compreg">
                            {errorHandler.getComponent()}

                            <div className="s-compreg-header">
                                <h3>{this.activeLang.labels["lbl_CompleteReg"]}</h3>
                            </div>

                            {
                                this.viewModel.exceptionIDCaught ?
                                    (
                                        <div className="s-compreg-form">
                                            <Alert className="s-alert">
                                                <div>
                                                    {Helper.stringToParagraphs(this.activeLang.msgs['msg_LnkXprd'])}
                                                </div>
                                            </Alert>

                                            <Button className="s-btn-large-primary" onClick={e => { this.routeStore.goToRootPage() }}>
                                                {this.activeLang.labels['lbl_Back']}
                                            </Button>
                                        </div>

                                    )
                                    :
                                    (
                                        this.viewModel.queryingServer ?

                                            <div className="s-compreg-form">
                                                <WaitControl show={true} opacity50={true} />
                                            </div>
                                            :
                                            (
                                                this.viewModel.criticalError ?
                                                    <div className="s-compreg-form">
                                                        <Button className="s-btn-large-primary" onClick={e => { this.verifyWithServer() }}>
                                                            {this.activeLang.labels['lbl_Retry']}
                                                        </Button>
                                                    </div>

                                                    :
                                                    <div className="s-compreg-form">
                                                        {
                                                            <WaitControl show={this.viewModel.processingRegistration} opacity50={true} />
                                                        }

                                                        {
                                                            this.viewModel.completed ?
                                                                <div className="s-change-sent">
                                                                    <p>{this.activeLang.msgs["msg_RegComplete"]}</p>
                                                                </div>
                                                                :
                                                                <Row>

                                                                    <div className="form-group s-form-group">
                                                                        <input
                                                                            type="text"
                                                                            placeholder={this.activeLang.labels['lbl_UsrNm']}
                                                                            className={
                                                                                this.viewModel.isAccountNameValid()
                                                                                    && this.viewModel.isAccountNameLengthValid() ? 'form-control s-input-empty' : 'form-control s-input-empty s-input-empty-invalid'
                                                                            }
                                                                            ref={element => {

                                                                                if (!this.focusDone) {
                                                                                    Helper.focusOnLoad(element);
                                                                                    this.focusDone = true;
                                                                                }
                                                                            }}
                                                                            disabled={this.viewModel.processingRegistration}
                                                                            onChange={e => this.viewModel.accountName = e.target.value}
                                                                            value={this.viewModel.accountName} />

                                                                    </div>

                                                                    <div className="form-group s-form-group">
                                                                        <input
                                                                            type="text"
                                                                            placeholder={this.activeLang.labels['lbl_FName']}
                                                                            className={this.viewModel.isPasswordValid() ? 'form-control s-input-empty' : 'form-control s-input-empty'}
                                                                            disabled={this.viewModel.processingRegistration}
                                                                            onChange={e => this.viewModel.fName = e.target.value}
                                                                            value={this.viewModel.fName} />
                                                                    </div>

                                                                    <div className="form-group s-form-group">
                                                                        <input
                                                                            type="text"
                                                                            placeholder={this.activeLang.labels['lbl_LName']}
                                                                            className={this.viewModel.isPasswordValid() ? 'form-control s-input-empty' : 'form-control s-input-empty'}
                                                                            disabled={this.viewModel.processingRegistration}
                                                                            onChange={e => this.viewModel.lName = e.target.value}
                                                                            value={this.viewModel.lName} />
                                                                    </div>

                                                                    <div className="form-group s-form-group">
                                                                        <input
                                                                            type="password"
                                                                            placeholder={this.activeLang.labels['lbl_Psswrd']}
                                                                            className={this.viewModel.isPasswordValid() ? 'form-control s-input-empty s-input-empty-last' : 'form-control s-input-empty s-input-empty-last-invalid'}
                                                                            disabled={this.viewModel.processingRegistration}
                                                                            onChange={e => this.viewModel.password = e.target.value}
                                                                            value={this.viewModel.password} />

                                                                    </div>
                                                                </Row>
                                                        }


                                                        <div className="s-compreg-form-alert">

                                                            {
                                                                this.viewModel.isAccountNameValid() ?
                                                                    this.viewModel.isAccountNameLengthValid() ?
                                                                        null
                                                                        :
                                                                        <Alert className="s-alert">
                                                                            <span>{this.activeLang.msgs['msg_MinLenReq'].replace('{1}', 3)}</span>
                                                                        </Alert>
                                                                    :
                                                                    <Alert className="s-alert">
                                                                        <span>{this.activeLang.msgs['msg_ValReq']}</span>
                                                                    </Alert>
                                                            }

                                                            {
                                                                this.viewModel.invalidMsgs.length > 0 ?
                                                                    <ul style={{ listStyleType: 'none', padding: 0 }}>
                                                                        {
                                                                            this.viewModel.invalidMsgs.map((v, i) =>
                                                                                <li>

                                                                                    <Alert className="s-alert">
                                                                                        <span>{v}</span>
                                                                                    </Alert>
                                                                                </li>
                                                                            )
                                                                        }
                                                                    </ul>
                                                                    :
                                                                    null
                                                            }
                                                        </div>

                                                        <div className="s-compreg-form-action">
                                                            <Button
                                                                className="s-btn-large-primary"
                                                                disabled={this.viewModel.processingRegistration}
                                                                onClick={e => {

                                                                    if (this.viewModel.completed) {

                                                                        this.routeStore.goToRootPage();
                                                                    }
                                                                    else {

                                                                        if (this.viewModel.isValid()) {

                                                                            this.processRegistration();
                                                                        }
                                                                    }
                                                                }}>
                                                                {this.activeLang.labels[this.viewModel.completed ? 'lbl_Back' : 'lbl_Save']}
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

export default CompleteRegistration;





