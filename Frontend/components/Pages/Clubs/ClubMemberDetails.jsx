import React from 'react';
import { observer, inject } from 'mobx-react';
import { Row, Col, FormGroup, FormControl, Button, Table } from 'react-bootstrap';
import Datepicker from 'react-datepicker';
import moment from 'moment-es6';
import Helper from '../../../Helper/Helper';

import ModalHandler from '../../ModalHandler/ModalHandler';
import WaitControl from '../../WaitControl/WaitControl';

import DropdownEditor from '../../DropdownEditor/DropdownEditor';
import DropdownEditorMenu from '../../DropdownEditor/DropdownEditorMenu';

import TelNumbers from '../../PageComponents/TelNumbers/TelNumbers';


const ClubMemberDetails =
    inject('store')(
        observer(
            class ClubMemberDetails extends React.Component {

                constructor(props) {

                    super(props);

                    this.pageViewModel = props.pageViewModel;
                    this.clubItem = props.clubItem;
                    this.viewModel = props.viewModel;
                    this.errorHandler = props.errorHandler;
                    this.modalHandler = props.modalHandler;

                    this.activeLang = this.props.store.langStore.active;

                    this.verifyToAddMember = this.verifyToAddMember.bind(this);
                    this.addNotFoundMember = this.addNotFoundMember.bind(this);
                    this.syncToAdd = this.syncToAdd.bind(this);
                }

                verifyToAddMember() {

                    if (this.viewModel.toAddMember
                        && (this.viewModel.toAddMember.fName || this.viewModel.toAddMember.lName)) {

                        this.viewModel.verifyingToAdd = true;

                        const params = {
                            clubExceptionID: this.clubItem.id
                        };

                        if (this.viewModel.toAddMember.fName) {
                            params['fNameFilter'] = this.viewModel.toAddMember.fName;
                        }

                        if (this.viewModel.toAddMember.lName) {
                            params['lNameFilter'] = this.viewModel.toAddMember.lName;
                        }


                        let idCounter = -1;

                        Helper.RunPromise(
                            {
                                promise: Helper.FetchPromiseGet('/person/get/', params),
                                success: data => {

                                    if (data && Array.isArray(data) && data.length > 0) {

                                        this.viewModel.foundToAdd.push(...data);
                                    }
                                    else {

                                        this.addNotFoundMember();
                                    }
                                },
                                incrementSession: () => {

                                    this.verifyToAddMemberPromiseID = this.verifyToAddMemberPromiseID ? (this.verifyToAddMemberPromiseID + 1) : 1;
                                    idCounter = this.verifyToAddMemberPromiseID;
                                },
                                sessionValid: () => {

                                    return idCounter === this.verifyToAddMemberPromiseID;
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
                                this.viewModel.verifyingToAdd = false;
                            }
                        );
                    }
                }

                addNotFoundMember() {

                    if (this.viewModel.toAddMember) {

                        this.viewModel.addNewMember(this.viewModel.toAddMember);
                        this.viewModel.selectedValue = this.viewModel.toAddMember;
                        this.viewModel.toAddMember = null;
                    }
                }

                syncToAdd(toAdd) {

                    if (toAdd) {

                        this.viewModel.toAddMember = null;
                        this.viewModel.foundToAdd.length = 0;

                        toAdd = {
                            member: toAdd,
                            id: 0,
                            member_Id: toAdd.id
                        };

                        toAdd = this.viewModel.genMember(toAdd);
                        toAdd.recordState = 10;
                        toAdd.verifyIdNumber();

                        this.viewModel.addNewMember(toAdd);
                        this.viewModel.selectedValue = toAdd;
                    }
                }

                render() {

                    const value = this.viewModel.selectedValue;

                    return (


                        <div className="s-modal-form">

                            {
                                this.viewModel.toAddMember === null ?
                                    value === null ?

                                        null

                                        :
                                        <div>
                                            <Row>

                                                <Col md={6} sm={12}>

                                                    <div className="form-group s-form-group s-form-input">
                                                        <div className="s-label">
                                                            <span>{this.activeLang.labels['lbl_LName']}</span>
                                                        </div>
                                                        <input className={value.isLNameValid() ? 'form-control s-input' : 'form-control s-input-error'}
                                                            type="text"
                                                            value={value.lName}
                                                            onChange={e => {
                                                                value.lName = e.target.value
                                                                value.checkRecordState();
                                                            }} />
                                                        {
                                                            value.isLNameValid() ?
                                                                null
                                                                :
                                                                <small className="s-label-error">{this.activeLang.msgs['msg_ValReq']}</small>
                                                        }
                                                    </div>

                                                </Col>

                                                <Col md={6} sm={12}>

                                                    <div className="form-group s-form-group s-form-input">
                                                        <div className="s-label">
                                                            <span>{this.activeLang.labels['lbl_FName']}</span>
                                                        </div>
                                                        <input className={value.isFNameValid() ? 'form-control s-input' : 'form-control s-input-error'}
                                                            type="text"
                                                            value={value.fName}
                                                            onChange={e => {
                                                                value.fName = e.target.value
                                                                value.checkRecordState();
                                                            }} />
                                                        {
                                                            value.isFNameValid() ?
                                                                null
                                                                :
                                                                <small className="s-label-error">{this.activeLang.msgs['msg_ValReq']}</small>
                                                        }
                                                    </div>

                                                </Col>

                                                <Col md={6} sm={12}>

                                                    <div className="form-group s-form-group s-form-input">
                                                        <div className="s-label">
                                                            <span>{this.activeLang.labels['lbl_Email']}</span>
                                                        </div>
                                                        <input className={value.isEmailValid() ? 'form-control s-input' : 'form-control s-input-error'}
                                                            type="email"
                                                            value={value.email}
                                                            onChange={e => {
                                                                value.email = e.target.value
                                                                value.checkRecordState();
                                                            }} />
                                                        {
                                                            value.isEmailValid() ?
                                                                null
                                                                :
                                                                <small className="s-label-error">{this.activeLang.msgs['msg_ValReq']}</small>
                                                        }
                                                    </div>

                                                </Col>

                                                <Col md={6} sm={12}>

                                                    <div className="form-group s-form-group s-form-input">
                                                        <div className="s-label">
                                                            <span>{this.activeLang.labels['lbl_IdNum']}</span>
                                                        </div>
                                                        <input className="form-control s-input"
                                                            type="text"
                                                            value={value.idNumber}
                                                            onChange={e => {
                                                                value.idNumber = e.target.value
                                                                value.checkRecordState();
                                                            }} />

                                                    </div>

                                                </Col>

                                                <Col md={6} sm={12}>
                                                    <div className="form-group s-form-group s-form-input">
                                                        <div className="s-label">
                                                            <span>{this.activeLang.labels['lbl_Occup']}</span>
                                                        </div>
                                                        <div className="s-dropdown-modal">

                                                            <DropdownEditor
                                                                id={`drpCtctOccup=${value.genId}`}
                                                                className="form-control s-input s-ellipsis"
                                                                title={value.occupationName ? value.occupationName : this.activeLang.labels['lbl_Unknown']}>
                                                                {
                                                                    this.viewModel.clubViewModel.occupations.map((v, i) => {

                                                                        return (
                                                                            <DropdownEditorMenu
                                                                                className={v.id === value.occupation_Id ? 'active' : ''}
                                                                                key={v.id}
                                                                                eventKey={i}
                                                                                onClick={e => {

                                                                                    value.occupationName = v.name;
                                                                                    value.occupation_Id = v.id;
                                                                                    value.checkRecordState();
                                                                                }}>
                                                                                {v.name}
                                                                            </DropdownEditorMenu>
                                                                        );
                                                                    })
                                                                }
                                                            </DropdownEditor>

                                                        </div>
                                                    </div>
                                                </Col>

                                                <Col md={6} sm={12}>
                                                    <div className="form-group s-form-group s-form-input">
                                                        <div className="s-label">
                                                            <span>{this.activeLang.labels['lbl_Title']}</span>
                                                        </div>
                                                        <div className="s-dropdown-modal">
                                                            <DropdownEditor
                                                                id={`drpCtctTitle=${value.genId}`}
                                                                className="form-control s-input s-ellipsis"
                                                                title={value.titleName ? value.titleName : this.activeLang.labels[`lbl_Title_${value.title}`]}>
                                                                {
                                                                    Helper.getTitles().map((v, i) => {

                                                                        return (
                                                                            <DropdownEditorMenu
                                                                                className={v.key === value.title ? 'active' : ''}
                                                                                key={v.key}
                                                                                eventKey={i}
                                                                                onClick={e => {

                                                                                    value.titleName = this.activeLang.labels[`lbl_Title_${v.key}`];
                                                                                    value.title = v.key;
                                                                                    value.checkRecordState();
                                                                                }}>
                                                                                {this.activeLang.labels[`lbl_Title_${v.key}`]}
                                                                            </DropdownEditorMenu>
                                                                        );
                                                                    })
                                                                }
                                                            </DropdownEditor>
                                                        </div>
                                                    </div>
                                                </Col>

                                                <Col md={4} sm={12}>
                                                    <div className="form-group s-form-group s-form-input">
                                                        <div className="s-label">
                                                            <span>{this.activeLang.labels['lbl_Gender']}</span>
                                                        </div>
                                                        <div className="s-dropdown-modal">
                                                            <DropdownEditor
                                                                id={`drpCtctGender=${value.genId}`}
                                                                className="form-control s-input s-ellipsis"
                                                                title={value.genderName ? value.genderName : this.activeLang.labels[`lbl_Gender_${value.gender}`]}>
                                                                {
                                                                    Helper.getGenders().map((v, i) => {

                                                                        return (
                                                                            <DropdownEditorMenu
                                                                                className={v.key === value.gender ? 'active' : ''}
                                                                                key={v.key}
                                                                                eventKey={i}
                                                                                onClick={e => {

                                                                                    value.genderName = this.activeLang.labels[`lbl_Gender_${v.key}`];
                                                                                    value.gender = v.key;
                                                                                    value.checkRecordState();
                                                                                }}>
                                                                                {this.activeLang.labels[`lbl_Gender_${v.key}`]}
                                                                            </DropdownEditorMenu>
                                                                        );
                                                                    })
                                                                }
                                                            </DropdownEditor>
                                                        </div>
                                                    </div>
                                                </Col>

                                                <Col md={4} sm={12}>

                                                    <div className="form-group s-form-group s-form-input">
                                                        <div className="s-label">
                                                            <span>{this.activeLang.labels['lbl_Dob']}</span>
                                                        </div>
                                                        <Datepicker
                                                            dateFormat={Helper.DATE_FORMAT}
                                                            className="form-control s-input"
                                                            selected={value.dateOfBirth}
                                                            onChange={date => {

                                                                value.dateOfBirth = date;
                                                                value.checkRecordState();
                                                            }} />

                                                    </div>

                                                </Col>

                                                <Col md={4} sm={12}>
                                                    <div className="form-group s-form-group s-form-input">
                                                        <div className="s-label">
                                                            <span>{this.activeLang.labels['lbl_JoinedDate']}</span>
                                                        </div>
                                                        <Datepicker
                                                            dateFormat={Helper.DATE_FORMAT}
                                                            className="form-control"
                                                            selected={value.joinedDate}
                                                            onChange={date => {

                                                                value.joinedDate = date;
                                                                value.checkRecordState();
                                                            }} />
                                                    </div>
                                                </Col>

                                                <Col sm={12}>

                                                    <div className="form-group s-form-group s-form-input">
                                                        <TelNumbers
                                                            telNumbers={value.telNumbers}
                                                            countries={this.viewModel.clubViewModel.countries}
                                                            onAdd={e => {
                                                                value.addNewTelNumber();
                                                            }}
                                                            onDelete={(e, telNumber) => {

                                                                if (telNumber) {

                                                                    if (telNumber.recordState === 10) {

                                                                        value.removeTelNumber(telNumber);
                                                                    }
                                                                    else {

                                                                        telNumber.recordState = 30;

                                                                        if (value.recordState === 0) {
                                                                            value.recordState = 20;
                                                                        }
                                                                    }
                                                                }
                                                            }} />
                                                    </div>


                                                </Col>

                                            </Row>

                                            <div style={{ textAlign: 'center',  marginTop: 10 }}>
                                                <Button className="s-btn-medium-blue"
                                                    onClick={e => {

                                                        if (value.isValid()) {

                                                            this.modalHandler.hide('later');
                                                        }
                                                    }}>
                                                    {this.activeLang.labels['lbl_SaveLater']}
                                                </Button>
                                                <Button
                                                    style={{ marginLeft: '5px' }}
                                                    className="s-btn-medium-primary"
                                                    onClick={e => {

                                                        if (value.isValid()) {

                                                            this.modalHandler.hide('save');
                                                        }
                                                    }}>
                                                    {this.activeLang.labels['lbl_Save']}
                                                </Button>
                                            </div>
                                        </div>

                                    :
                                    this.viewModel.foundToAdd.length > 0 ?
                                        <div>
                                            <h4 style={{ fontWeight: 'bold', fontSize: '14px' }}>{this.activeLang.msgs['msg_AddExisting']}:</h4>
                                            <div className="s-modal-fixed">
                                                <table>
                                                    <tbody>
                                                        {
                                                            this.viewModel.foundToAdd.map((toAdd, index) => {

                                                                let genderName = 'unknown';

                                                                switch (toAdd.gender) {

                                                                    case 10:
                                                                        genderName = 'male';
                                                                        break;

                                                                    case 20:
                                                                        genderName = 'female';
                                                                        break;
                                                                }

                                                                return (
                                                                    <tr key={toAdd.id}>

                                                                        <td>
                                                                            <img style={{ width: '30px', height: '30px', borderRadius: '50%', marginRight: '15px' }}
                                                                                src={`../images/${genderName}_avatar.png`} />
                                                                            <span>{`${toAdd.lName ? toAdd.lName.toUpperCase() : ''}, ${toAdd.fName}`}</span>
                                                                        </td>
                                                                        <td className="text-right">
                                                                            <Button
                                                                                className="s-btn-medium-primary"
                                                                                onClick={e => this.syncToAdd(toAdd)}>
                                                                                {this.activeLang.labels['lbl_Continue']}
                                                                            </Button>
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })
                                                        }
                                                    </tbody>
                                                </table>
                                            </div>

                                            <h4 style={{ fontWeight: 'bold', fontSize: '14px' }}>{this.activeLang.msgs['msg_AddNew']}:</h4>

                                            <Button
                                                style={{ margin: '20px auto 0 auto', display: 'block' }}
                                                className="s-btn-medium-blue"
                                                onClick={e => { this.addNotFoundMember() }}>
                                                {this.activeLang.labels['lbl_CreateNew']}
                                            </Button>

                                        </div>
                                        :

                                        <Row>

                                            <Col sm={6}>
                                                <div className="form-group s-form-group s-form-input">
                                                    <div className="s-label">
                                                        <span>{this.activeLang.labels['lbl_LName']}</span>
                                                    </div>
                                                    <input className="form-control s-input"
                                                        type="text"
                                                        disabled={this.viewModel.verifyingToAdd}
                                                        value={this.viewModel.toAddMember.lName}
                                                        onChange={e => {
                                                            this.viewModel.toAddMember.lName = e.target.value;
                                                        }}
                                                        onKeyPress={e => {
                                                            switch (e.key) {
                                                                case 'Enter':
                                                                    this.verifyToAddMember()
                                                                    break;
                                                            }
                                                        }} />

                                                </div>
                                            </Col>

                                            <Col sm={6}>
                                                <div className="form-group s-form-group s-form-input">
                                                    <div className="s-label">
                                                        <span>{this.activeLang.labels['lbl_FName']}</span>
                                                    </div>
                                                    <input className="form-control s-input"
                                                        type="text"
                                                        disabled={this.viewModel.verifyingToAdd}
                                                        value={this.viewModel.toAddMember.fName}
                                                        onChange={e => {
                                                            this.viewModel.toAddMember.fName = e.target.value;
                                                        }}
                                                        onKeyPress={e => {
                                                            switch (e.key) {
                                                                case 'Enter':
                                                                    this.verifyToAddMember()
                                                                    break;
                                                            }
                                                        }} />

                                                </div>
                                            </Col>

                                            <Col sm={12} style={{ textAlign: 'center', paddingTop: 20 }}>
                                                <Button className="s-btn-medium-primary-border"
                                                    onClick={e => {

                                                        this.modalHandler.hide();
                                                    }}>
                                                    {this.activeLang.labels['lbl_Cancel']}
                                                </Button>
                                                <Button
                                                    className="s-btn-medium-primary"
                                                    style={{ marginLeft: "5px" }}
                                                    disabled={this.viewModel.verifyingToAdd}
                                                    onClick={e => { this.verifyToAddMember() }}>
                                                    {
                                                        this.activeLang.labels['lbl_Continue']
                                                    }
                                                </Button>
                                            </Col>

                                        </Row>
                            }

                        </div>
                    );
                }
            }));

export default ClubMemberDetails;