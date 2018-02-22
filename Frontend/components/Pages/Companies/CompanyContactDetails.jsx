import React from 'react';
import { observer, inject } from 'mobx-react';
import { Row, Col, Button } from 'react-bootstrap';

import Datepicker from 'react-datepicker';
import moment from 'moment-es6';
import Helper from '../../../Helper/Helper';

import ModalHandler from '../../ModalHandler/ModalHandler';
import WaitControl from '../../WaitControl/WaitControl';

import DropdownEditor from '../../DropdownEditor/DropdownEditor';
import DropdownEditorMenu from '../../DropdownEditor/DropdownEditorMenu';

import TelNumbers from '../../PageComponents/TelNumbers/TelNumbers';


const CompanyContactDetails =
    inject('store')(
        observer(
            class CompanyContactDetails extends React.Component {

                constructor(props) {

                    super(props);

                    this.pageViewModel = props.pageViewModel;
                    this.companyViewModel = props.companyViewModel;
                    this.companyItem = props.companyItem;
                    this.viewModel = props.viewModel;
                    this.modalHandler = props.modalHandler;

                    this.activeLang = this.props.store.langStore.active;

                    this.verifyToAddContact = this.verifyToAddContact.bind(this);
                    this.addNotFoundContact = this.addNotFoundContact.bind(this);
                    this.syncToAdd = this.syncToAdd.bind(this);

                    if (this.props.autoAddContact) {

                        this.syncToAdd(this.viewModel.toAddContact);

                        // if (this.viewModel.selectedValue) {

                        //     this.viewModel.selectedValue.recordState = 20;
                        // }
                    }
                }

                verifyToAddContact() {

                    if (this.viewModel.toAddContact
                        && (this.viewModel.toAddContact.fName || this.viewModel.toAddContact.lName)) {

                        this.viewModel.verifyingToAdd = true;

                        const params = {
                            companyContactExceptionID: this.companyItem.id
                        };

                        if (this.viewModel.toAddContact.fName) {
                            params['fNameFilter'] = this.viewModel.toAddContact.fName;
                        }

                        if (this.viewModel.toAddContact.lName) {
                            params['lNameFilter'] = this.viewModel.toAddContact.lName;
                        }


                        let idCounter = -1;

                        Helper.RunPromise(
                            {
                                promise: Helper.FetchPromiseGet('/person/get/', params),
                                success: data => {

                                    if (data && Array.isArray(data) && data.length > 0) {

                                        const tempIDs = this.viewModel.contacts.map((v, i) => v.contact_Id);

                                        this.viewModel.foundToAdd.push(...data.filter((v, i) => tempIDs.indexOf(v.id) < 0));
                                    }
                                    else {

                                        this.addNotFoundContact();
                                    }
                                },
                                incrementSession: () => {

                                    this.verifyToAddContactPromiseID = this.verifyToAddContactPromiseID ? (this.verifyToAddContactPromiseID + 1) : 1;
                                    idCounter = this.verifyToAddContactPromiseID;
                                },
                                sessionValid: () => {

                                    return idCounter === this.verifyToAddContactPromiseID;
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

                addNotFoundContact() {

                    if (this.viewModel.toAddContact) {

                        this.viewModel.addNewContact(this.viewModel.toAddContact);
                        this.viewModel.selectedValue = this.viewModel.toAddContact;
                        this.viewModel.toAddContact = null;
                    }
                }

                syncToAdd(toAdd) {

                    if (toAdd) {

                        this.viewModel.toAddContact = null;
                        this.viewModel.foundToAdd.length = 0;

                        toAdd = {
                            contact: toAdd,
                            id: 0,
                            contact_Id: toAdd.id
                        };

                        toAdd = this.viewModel.genContact(toAdd);
                        toAdd.recordState = 10;
                        toAdd.verifyIdNumber();

                        this.viewModel.addNewContact(toAdd);
                        this.viewModel.selectedValue = toAdd;
                    }
                }

                render() {

                    const value = this.viewModel.selectedValue;

                    return (

                        <div className="s-modal-form">

                            {
                                this.viewModel.toAddContact === null ?
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
                                                                    this.viewModel.companyViewModel.occupations.map((v, i) => {

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

                                                <Col md={6} sm={12}>
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

                                                <Col md={6} sm={12}>

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

                                                <Col sm={12}>

                                                    <div className="form-group s-form-group s-form-input">
                                                        <TelNumbers
                                                            telNumbers={value.telNumbers}
                                                            countries={this.viewModel.companyViewModel.countries}
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

                                            <div style={{ textAlign: 'center', marginTop: 10 }}>
                                                {
                                                    this.props.hideSaveLater ?
                                                        null
                                                        :
                                                        <Button className="s-btn-medium-blue"
                                                            onClick={e => {

                                                                if (value.isValid()) {

                                                                    this.modalHandler.hide('later');
                                                                }
                                                            }}>
                                                            {this.activeLang.labels['lbl_SaveLater']}
                                                        </Button>
                                                }
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
                                                onClick={e => { this.addNotFoundContact() }}>
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
                                                        value={this.viewModel.toAddContact.lName}
                                                        onChange={e => {
                                                            this.viewModel.toAddContact.lName = e.target.value;
                                                        }}
                                                        onKeyPress={e => {
                                                            switch (e.key) {
                                                                case 'Enter':
                                                                    this.verifyToAddContact()
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
                                                        value={this.viewModel.toAddContact.fName}
                                                        onChange={e => {
                                                            this.viewModel.toAddContact.fName = e.target.value;
                                                        }}
                                                        onKeyPress={e => {
                                                            switch (e.key) {
                                                                case 'Enter':
                                                                    this.verifyToAddContact()
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
                                                    onClick={e => { this.verifyToAddContact() }}>
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

export default CompanyContactDetails;