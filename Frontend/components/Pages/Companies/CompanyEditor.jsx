import React from 'react';
import { observer, inject } from 'mobx-react';

import { Row, Col, Button, OverlayTrigger, Popover, Form } from 'react-bootstrap';

import Helper from '../../../Helper/Helper';

import Address from '../../PageComponents/Address/Address';
import TelNumbers from '../../PageComponents/TelNumbers/TelNumbers';

import DropdownEditor from '../../DropdownEditor/DropdownEditor';
import DropdownEditorMenu from '../../DropdownEditor/DropdownEditorMenu';

import CompanyEditorViewModel from './CompanyEditorViewModel';


const CompanyEditor =
    inject('store')(
        observer(
            class CompanyEditor extends React.Component {

                constructor(props) {

                    super(props);

                    this.errorHandler = props.errorHandler;

                    this.companyViewModel = props.companyViewModel;
                    this.companyItem = props.companyViewModel.selectedValue;

                    this.viewModel = this.companyItem.toEdit ? this.companyItem.toEdit : new CompanyEditorViewModel(props.companyViewModel);

                    if (this.companyItem.recordState === 10) {

                        this.viewModel.recordState = 10;
                        this.companyItem.toEdit = this.viewModel;
                    }

                    this.businessTypes = this.props.companyViewModel.businessTypes;
                    this.countries = this.props.companyViewModel.countries;

                    this.activeLang = this.props.store.langStore.active;

                    this.getCompanyDetails = this.getCompanyDetails.bind(this);
                    this.addBusinessType = this.addBusinessType.bind(this);
                    this.onValueChange = this.onValueChange.bind(this);
                    this.popNewBusinessType = this.popNewBusinessType.bind(this);
                }

                componentWillMount() {

                    this.getCompanyDetails();
                }

                getCompanyDetails() {

                    if (!this.companyItem.toEdit && this.companyItem.uid) {

                        this.viewModel.clearValues();
                        this.viewModel.queryingServer = true;

                        let idCounter = -1;

                        Helper.RunPromise(
                            {
                                promise: fetch("/company/getdetail", {
                                    method: "POST",
                                    body: JSON.stringify({ uid: this.companyItem.uid }),
                                    headers: {
                                        'content-type': 'application/json; charset=utf-8'
                                    },
                                    credentials: 'same-origin'
                                }),
                                success: data => {

                                    if (data) {

                                        this.viewModel.sync(data);
                                        this.companyItem.toEdit = this.viewModel;
                                    }
                                },
                                incrementSession: () => {

                                    this.getCompanyDetailsPromiseID = this.getCompanyDetailsPromiseID ? (this.getCompanyDetailsPromiseID + 1) : 1;
                                    idCounter = this.getCompanyDetailsPromiseID;
                                },
                                sessionValid: () => {

                                    return idCounter === this.getCompanyDetailsPromiseID;
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
                }

                addBusinessType(closePopOver) {

                    if (this.viewModel.bTypeName) {

                        if (closePopOver) {
                            closePopOver();
                        }

                        let idCounter = -1;

                        this.companyViewModel.showModalWait = true;

                        const param = { name: this.viewModel.bTypeName, recordState: 10 };

                        Helper.RunPromise(
                            {
                                promise: Helper.FetchPromisePost('/lookup/SaveBusinessType/', param),
                                success: data => {

                                    if (data) {

                                        if (data.result) {

                                            this.viewModel.businessTypeName = data.result.name;
                                            this.viewModel.businessType_Id = data.result.id;

                                            this.viewModel.checkRecordState();
                                            this.companyItem.recordState = this.viewModel.recordState;

                                            this.businessTypes.splice(0, 0, data.result);
                                        }

                                        if (data.version) {

                                            Helper.setVersion('BusinessType', data.version);
                                        }
                                    }
                                },
                                incrementSession: () => {

                                    this.addBusinessTypePromiseID = this.addBusinessTypePromiseID ? (this.addBusinessTypePromiseID + 1) : 1;
                                    idCounter = this.addBusinessTypePromiseID;
                                },
                                sessionValid: () => {

                                    return idCounter === this.addBusinessTypePromiseID;
                                }
                            },
                            error => {

                                switch (error.exceptionID) {

                                    case 5001:
                                        this.errorHandler.show('', this.activeLang.msgs['msg_BTypeExists'].replace('{1}', `'${param.name}'`));
                                        break;


                                    default:
                                        this.errorHandler.showFromLang(this.activeLang);
                                        break;
                                }
                            },
                            () => {

                                this.companyViewModel.showModalWait = false;
                            });
                    }
                }

                onValueChange(e, prop) {

                    if (prop) {

                        let checkState = false;

                        switch (prop) {

                            case 'name':

                                checkState = true;
                                this.companyItem.name = this.viewModel.name = e.target.value;
                                break;

                            case 'businessTypeName':

                                checkState = true;
                                this.companyItem.businessTypeName = this.viewModel.businessTypeName = e.target.value;
                                this.companyItem.businessType_Id = this.viewModel.businessType_Id;
                                break;

                            case 'email':

                                checkState = true;
                                this.viewModel.email = e.target.value;
                                break;

                            case 'brn':

                                checkState = true;
                                this.companyItem.brn = this.viewModel.brn = e.target.value;
                                break;

                            case 'tva':

                                checkState = true;
                                this.companyItem.tva = this.viewModel.tva = e.target.value;
                                break;

                            case 'websiteUrl':

                                checkState = true;
                                this.viewModel.websiteUrl = e.target.value;
                                break;
                        }

                        if (checkState) {

                            this.viewModel.checkRecordState();
                            this.companyItem.recordState = this.viewModel.recordState;
                        }
                    }
                }

                popNewBusinessType(onClose) {

                    return (
                        <Popover id="popBusinessType">

                            <Form inline>
                                <div style={{width: '100%'}} className="form-group s-form-group">

                                    <input className="form-control s-input-add"
                                        type="text"
                                        style={{width: '82%'}}
                                        placeholder={this.activeLang.labels['lbl_AddNewBsType']}
                                        value={this.viewModel.bTypeName}
                                        onKeyPress={e => {
                                            switch (e.key) {
                                                case 'Enter':
                                                    this.addBusinessType(onClose);
                                                    break;
                                            }
                                        }}
                                        onChange={e => {

                                            this.viewModel.bTypeName = e.target.value;
                                        }} />

                                    <Button 
                                        className="s-btn-small-popover-add"
                                        onClick={e => this.addBusinessType(onClose)}>
                                        <i className="la la-plus"></i>
                                    </Button>
                                </div>
                            </Form>
                        </Popover >
                    );
                }

                render() {

                    let ovtNewBsType = null;

                    return (

                        <div className="s-modal-form">
                            <Row>

                                <Col md={6} sm={12}>

                                    <div className="form-group s-form-group s-form-input">
                                        <div className="s-label">
                                            <span>{this.activeLang.labels['lbl_CompanyName']}</span>
                                        </div>
                                        <input className={this.viewModel.isNameValid() ? 'form-control s-input' : 'form-control s-input-error'}
                                            type="text"
                                            ref={Helper.focusOnLoad}
                                            value={this.viewModel.name}
                                            disabled={this.companyViewModel.showModalWait}
                                            onChange={e => { this.onValueChange(e, 'name') }} />
                                        {
                                            this.viewModel.isNameValid() ?
                                                null
                                                :
                                                <small className="s-label-error">{this.activeLang.msgs['msg_ValReq']}</small>
                                        }
                                    </div>
                                </Col>

                                <Col md={6} sm={12}>

                                    <div className="form-group s-form-group s-form-input">
                                        <div className="s-label">
                                            <span>{this.activeLang.labels['lbl_BusinessType']}</span>
                                            <OverlayTrigger
                                                ref={r => ovtNewBsType = r}
                                                rootClose
                                                trigger="click"
                                                placement="bottom"
                                                container={this}
                                                overlay={this.popNewBusinessType(e => {
                                                    if (ovtNewBsType) {
                                                        ovtNewBsType.hide();
                                                    }
                                                })}>
                                                <Button style={{ padding: '0 12px' }} className="s-btn-small-blue-empty"
                                                    disabled={this.companyViewModel.showModalWait}
                                                    onClick={e => this.viewModel.bTypeName = ''}>
                                                    <i className="flaticon-add"></i>
                                                </Button>

                                            </OverlayTrigger>
                                        </div>

                                        <div className="s-dropdown-modal">
                                            <DropdownEditor
                                                id="drpBusType"
                                                className={this.viewModel.isBusinessTypeValid() ? 'form-control s-input s-ellipsis' : 'form-control s-input-error'}
                                                disabled={this.companyViewModel.showModalWait}
                                                title={this.viewModel.businessTypeName}>
                                                {
                                                    this.businessTypes.map((v, i) => {

                                                        return <DropdownEditorMenu
                                                            active={v.id === this.viewModel.businessType_Id}
                                                            key={v.id}
                                                            onClick={e => {

                                                                this.viewModel.businessTypeName = v.name;
                                                                this.viewModel.businessType_Id = v.id;

                                                                this.viewModel.checkRecordState();
                                                                this.companyItem.recordState = this.viewModel.recordState;
                                                            }}>{v.name}</DropdownEditorMenu>;
                                                    })
                                                }
                                            </DropdownEditor>
                                            {
                                                this.viewModel.isBusinessTypeValid() ?
                                                    null
                                                    :
                                                    <small className="s-label-error">{this.activeLang.msgs['msg_ValReq']}</small>
                                            }
                                        </div>
                                    </div>

                                </Col>

                                <Col md={4} sm={12}>
                                    <div className="form-group s-form-group s-form-input">
                                        <div className="s-label">
                                            <span>{this.activeLang.labels['lbl_BRN']}</span>
                                        </div>
                                        <input className="form-control s-input"
                                            value={this.viewModel.brn}
                                            disabled={this.companyViewModel.showModalWait}
                                            onChange={e => { this.onValueChange(e, 'brn') }} />
                                    </div>
                                </Col>

                                <Col md={4} sm={12}>
                                    <div className="form-group s-form-group s-form-input">
                                        <div className="s-label">
                                            <span>{this.activeLang.labels['lbl_TVA']}</span>
                                        </div>
                                        <input className="form-control s-input"
                                            value={this.viewModel.tva}
                                            disabled={this.companyViewModel.showModalWait}
                                            onChange={e => { this.onValueChange(e, 'tva') }} />
                                    </div>
                                </Col>

                                <Col md={4} sm={12}>
                                    <div className="form-group s-form-group s-form-input">
                                        <div className="s-label">
                                            <span>{this.activeLang.labels['lbl_Website']}</span>
                                        </div>
                                        <input className="form-control s-input"
                                            value={this.viewModel.websiteUrl}
                                            disabled={this.companyViewModel.showModalWait}
                                            onChange={e => { this.onValueChange(e, 'websiteUrl') }} />
                                    </div>
                                </Col>

                                <Col sm={12}>
                                    <div className="form-group s-form-group s-form-input">
                                        <div className="s-label">
                                            <span>{this.activeLang.labels['lbl_Address']}</span>
                                        </div>

                                        <Address
                                            disabled={this.companyViewModel.showModalWait}
                                            addresses={this.viewModel.addresses}
                                            countries={this.countries} />

                                    </div>
                                </Col>

                                <Col sm={12}>

                                    <div className="form-group s-form-group">
                                        <TelNumbers
                                            disabled={this.companyViewModel.showModalWait}
                                            telNumbers={this.viewModel.telNumbers}
                                            countries={this.countries}
                                            onAdd={e => {

                                                this.viewModel.addNewTelNumber();

                                                if (this.viewModel.recordState === 0) {

                                                    this.viewModel.recordState = 20;
                                                    this.companyItem.recordState = 20;
                                                }
                                            }}
                                            onDelete={(e, telNumber) => {

                                                if (telNumber) {

                                                    if (telNumber.recordState === 10) {

                                                        this.viewModel.removeTelNumber(telNumber);
                                                    }
                                                    else {

                                                        telNumber.recordState = 30;

                                                        if (this.viewModel.recordState === 0) {
                                                            this.viewModel.recordState = 20;
                                                        }
                                                        if (this.companyItem.recordState === 0) {
                                                            this.companyItem.recordState = 20;
                                                        }
                                                    }
                                                }
                                            }} />

                                    </div>
                                </Col>

                            </Row>
                        </div>
                    );
                }
            }));

export default CompanyEditor;