import React from 'react';
import ReactDOM from 'react-dom';

import { observer, inject } from 'mobx-react';
import { Row, Col, Tabs, Tab, Button } from 'react-bootstrap';

import Helper from '../../../Helper/Helper';
import WaitBlock from '../../WaitBlock/WaitBlock';
import ChangePassword from '../../Account/ChangePassword/ChangePassword';
import PageActions from '../../PageComponents/PageActions/PageActions';

import UserProfileViewModel from './UserProfileViewModel';
import WaitControl from '../../WaitControl/WaitControl';

import { errorHandler } from '../../ErrorHandler/ErrorHandler';

import '../PageLayout.scss';
import './UserProfile.scss';


class UserProfile extends React.Component {

    constructor(props) {

        super(props);

        this.accessStore = this.props.store.accessStore;
        this.activeLang = this.props.store.langStore.active;

        this.viewModel = new UserProfileViewModel();

        this.getProfile = this.getProfile.bind(this);
        this.saveProfile = this.saveProfile.bind(this);
        this.editOrRevert = this.editOrRevert.bind(this);
        this.onValueChange = this.onValueChange.bind(this);

        this.state = {
            showChangePassword: false
        };
    }

    componentWillMount() {

        this.getProfile();
    }

    getProfile() {

        this.viewModel.queryingServer = true;

        let idCounter = -1;

        Helper.RunPromise(
            {
                promise: fetch('/account/getactiveprofile', { credentials: 'same-origin' }),
                success: data => {

                    data.accountName = data.accountName ? data.accountName : '';
                    data.fName = data.fName ? data.fName : '';
                    data.lName = data.lName ? data.lName : '';
                    data.email = data.email ? data.email : '';

                    this.viewModel.sync(data);
                },
                incrementSession: () => {

                    this.getActiveProfilePromiseID = this.getActiveProfilePromiseID ? (this.getActiveProfilePromiseID + 1) : 1;
                    idCounter = this.getActiveProfilePromiseID;
                },
                sessionValid: () => {

                    return idCounter === this.getActiveProfilePromiseID;
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

                this.viewModel.queryingServer = false;
            }
        );
    }

    saveProfile(e, successCallback) {

        if (!this.viewModel.savingProfile && this.viewModel.isValid() && this.viewModel.hasChanges) {

            this.viewModel.savingProfile = true;

            let idCounter = -1;

            Helper.RunPromise(
                {
                    promise: fetch("/account/saveactiveprofile", {
                        method: "POST",
                        body: JSON.stringify(this.viewModel),
                        headers: {
                            'content-type': 'application/json; charset=utf-8'
                        },
                        credentials: 'same-origin'
                    }),
                    success: data => {

                        if (data && data.ok) {

                            this.viewModel.sync(data.profile);

                            if (data.fullName) {

                                this.accessStore.userName = data.fullName;
                            }
                        }

                        this.viewModel.inEditMode = false;

                        if (successCallback) {
                            successCallback();
                        }
                    },
                    incrementSession: () => {

                        this.saveProfilePromiseID = this.saveProfilePromiseID ? (this.saveProfilePromiseID + 1) : 1;
                        idCounter = this.saveProfilePromiseID;
                    },
                    sessionValid: () => {

                        return idCounter === this.saveProfilePromiseID;
                    }
                },
                error => {

                    if (error) {

                        switch (error.exceptionID) {
                            default:
                                errorHandler.showFromLang(this.activeLang);
                                break;
                        }
                    }
                },
                () => {

                    this.viewModel.savingProfile = false;
                }
            );
        }
    }

    editOrRevert(e) {

        if (this.viewModel.inEditMode) {

            this.viewModel.sync(this.viewModel.originalValue);

            this.viewModel.inEditMode = false;
        }
        else {

            this.viewModel.inEditMode = true;
        }
    }

    onValueChange(e, key) {

        let change = false;

        switch (key) {

            case 'accountName':
                change = true;
                this.viewModel.accountName = e.target.value
                break;

            case 'fName':
                change = true;
                this.viewModel.fName = e.target.value
                break;

            case 'lName':
                change = true;
                this.viewModel.lName = e.target.value
                break;

            case 'email':
                change = true;
                this.viewModel.email = e.target.value
                break;
        }

        if (change) {

            this.viewModel.checkForChanges();
        }
    }

    render() {

        let userFName = this.accessStore.userName ? this.accessStore.userName.split(' ') : this.activeLang.labels['lbl_Unknown'];

        if (Array.isArray(userFName)) {
            userFName = userFName && userFName.length > 1 ? userFName[1] : this.activeLang.labels['lbl_Unknown'];
        }

        let genderName = 'unknown';

        switch (this.accessStore.userGender) {

            case 10:
                genderName = 'male';
                break;

            case 20:
                genderName = 'female';
                break;
        }

        return (


            <div className="s-page">
                {errorHandler.getComponent()}

                <WaitControl show={this.viewModel.queryingServer} opacity50 />

                <PageActions
                    paTitle={this.activeLang.labels['lbl_Profile']}
                    paRefresh={e => {

                        this.getProfile();
                    }}
                    hideStatus
                    hideNext
                    hidePrev
                    hideSave
                    hideAdd>
                </PageActions>

                <div className="container">
                    <Row className="s-row-top">

                        <Col xs={12} sm={4}>

                            <div className="s-portlet">

                                <div className="s-portlet-body">

                                    <div className="s-card-profile">
                                        <img src={`../images/${genderName}_avatar.png`} />

                                        <h4>{this.accessStore.userName ? this.accessStore.userName : this.activeLang.labels['lbl_Unknown']}</h4>
                                        <h5>{this.viewModel.email}</h5>
                                        {
                                            this.viewModel.emailConfirmed ?
                                                null
                                                :
                                                <span className="badge s-badge-primary">{this.activeLang.msgs['msg_ReqConfrmtn']}</span>
                                        }

                                    </div>
                                </div>

                            </div>
                        </Col>

                        <Col xs={12} sm={8}>
                            <div className="s-portlet">
                                <div className="s-portlet-body">

                                    <Tabs className="s-tabs" defaultActiveKey={1} id="tabProfile">
                                        <Tab eventKey={1} title={this.activeLang.labels['lbl_UpdateProfile']}>

                                            <Row>
                                                <Col xs={6}>
                                                    <h4 className="s-section-header">{this.activeLang.labels['lbl_AccountDetail']}</h4>
                                                </Col>
                                            </Row>

                                            <Row className="s-row-center">
                                                <Col xs={4} md={3}>
                                                    <span>{this.activeLang.labels['lbl_LName']}</span>
                                                </Col>
                                                <Col xs={8} md={6}>
                                                    <div className="form-group s-form-group">
                                                        <input
                                                            className="form-control s-input"
                                                            value={this.viewModel.lName}
                                                            onChange={e => { this.onValueChange(e, 'lName') }} />
                                                    </div>
                                                </Col>
                                            </Row>

                                            <Row className="s-row-center">
                                                <Col xs={4} md={3}>
                                                    <span>{this.activeLang.labels['lbl_FName']}</span>
                                                </Col>
                                                <Col xs={8} md={6}>
                                                    < div className="form-group s-form-group">
                                                        <input className="form-control s-input"
                                                            onChange={e => this.onValueChange(e, 'fName')}
                                                            value={this.viewModel.fName} />
                                                    </div>
                                                </Col>
                                            </Row>

                                            <Row className="s-row-center">
                                                <Col xs={4} md={3}>
                                                    <span>{this.activeLang.labels['lbl_UsrNm']}</span>
                                                </Col>
                                                <Col xs={8} md={6}>
                                                    <div className="form-group s-form-group">
                                                        <input className={this.viewModel.isAccountNameValid() ? 'form-control s-input' : 'form-control s-input-error'}
                                                            ref={Helper.focusOnLoad}
                                                            onChange={e => this.onValueChange(e, 'accountName')}
                                                            value={this.viewModel.accountName} />
                                                        {
                                                            this.viewModel.isAccountNameValid() ?
                                                                null
                                                                :
                                                                <small className="s-label-error">{this.activeLang.msgs['msg_ValReq']}</small>
                                                        }
                                                    </div>
                                                </Col>
                                            </Row>

                                            <div className="s-separator-dashed s-separator-space-2"></div>

                                            <Row>

                                                <Col md={9} mdOffset={3}>
                                                    <Button className="s-btn-medium-primary-border">
                                                        {this.activeLang.labels['lbl_Cancel']}
                                                    </Button>
                                                    <Button className="s-btn-medium-primary" onClick={this.saveProfile} style={{ padding: '12px 36px', marginLeft: "5px" }}>
                                                        {
                                                            this.viewModel.savingProfile ?
                                                                <span>{this.activeLang.labels['lbl_SaveChanges']}<i className="spinner-right"></i></span>
                                                                :
                                                                this.activeLang.labels['lbl_SaveChanges']

                                                        }
                                                    </Button>
                                                </Col>

                                            </Row>

                                        </Tab>

                                        {
                                            this.viewModel.showChangePassword ?
                                                <Tab eventKey={2} title={this.activeLang.labels['lbl_ChngPsswrd']}>
                                                    <Row>
                                                        <Col md={6}>
                                                            <h4 className="s-section-header" onClick={e => this.viewModel.showChangePassword = false} style={{ cursor: 'pointer' }}><span className="la la-arrow-left" style={{ fontWeight: 'bold', marginRight: 5 }}></span><span>{this.activeLang.labels['lbl_Back']}</span></h4>
                                                        </Col>
                                                    </Row>
                                                    <ChangePassword hideTitle hideLogo hideBackground hideSuccessNavToLogin accountChangeContent accountChangeWrapper />
                                                </Tab>
                                                :
                                                <Tab eventKey={2} title={this.activeLang.labels['lbl_Settings']}>

                                                    <Row>
                                                        <Col md={6}>
                                                            <h4 className="s-section-header">{this.activeLang.labels['lbl_Account']}</h4>
                                                        </Col>
                                                    </Row>

                                                    <Row className="s-row-center">
                                                        <Col md={3}>
                                                            <span>{this.activeLang.labels['lbl_ChngEmail']}</span>
                                                        </Col>

                                                        <Col md={6}>
                                                            <div className="form-group s-form-group">
                                                                {
                                                                    this.viewModel.allowEmailChange ?
                                                                        <input
                                                                            ref="txtChangeEmail"
                                                                            type="email"
                                                                            disabled={this.viewModel.savingProfile}
                                                                            className={this.viewModel.isEmailValid() ? 'form-control s-input' : 'form-control s-input-error'}
                                                                            value={this.viewModel.email}
                                                                            onChange={e => { this.onValueChange(e, 'email') }} />
                                                                        :
                                                                        <input
                                                                            type="email"
                                                                            className={this.viewModel.isEmailValid() ? 'form-control s-input' : 'form-control s-input-error'}
                                                                            disabled
                                                                            value={this.viewModel.email}
                                                                            placeholder={this.viewModel.emailConfirmed ? null : this.activeLang.msgs['msg_WtngCnfrmEmail']} />
                                                                }
                                                            </div>

                                                        </Col>



                                                        <Col md={3} className="text-right">
                                                            <Row>
                                                                <Col md={12}>
                                                                    {
                                                                        this.viewModel.allowEmailChange ?
                                                                            <Button className="s-btn-small-red-empty" onClick={e => {

                                                                                this.viewModel.allowEmailChange = false;
                                                                                this.viewModel.email = this.viewModel.originalValue.email;
                                                                            }}>

                                                                                <span className="la la-times"></span>
                                                                            </Button>
                                                                            :
                                                                            null
                                                                    }
                                                                    <Button className="s-btn-medium-primary-border"
                                                                        onClick={e => {

                                                                            if (this.viewModel.allowEmailChange) {

                                                                                this.saveProfile(e, () => this.viewModel.allowEmailChange = false);
                                                                            }
                                                                            else {

                                                                                this.viewModel.allowEmailChange = true;

                                                                                setTimeout(() => {

                                                                                    const temp = Helper.reactElementToDOM(this.refs.txtChangeEmail);
                                                                                    temp.focus();
                                                                                    temp.select();
                                                                                }, 250);
                                                                            }
                                                                        }}>
                                                                        {
                                                                            this.viewModel.allowEmailChange ?
                                                                                <span>{this.activeLang.labels['lbl_Save']}{this.viewModel.savingProfile ? <span className="spinner-right s-ml-20"></span> : null}</span>
                                                                                :
                                                                                this.activeLang.labels['lbl_Change']
                                                                        }
                                                                    </Button>
                                                                </Col>
                                                            </Row>
                                                        </Col>

                                                    </Row>
                                                    <Row className="s-row-center">
                                                        <Col md={3}>
                                                            <span>{this.activeLang.labels['lbl_ChngPsswrd']}</span>
                                                        </Col>
                                                        <Col md={9} className="text-right">
                                                            <Button
                                                                className="s-btn-medium-primary-border"
                                                                onClick={e => this.viewModel.showChangePassword = true}>
                                                                {this.activeLang.labels['lbl_Change']}
                                                            </Button>
                                                        </Col>
                                                    </Row>

                                                </Tab>
                                        }
                                    </Tabs>

                                </div>
                            </div>
                        </Col>

                    </Row>
                </div>
            </div >
        );
    }
}

export default inject('store')(observer(UserProfile));