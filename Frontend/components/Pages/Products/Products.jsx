import React from "react";
import ReactDOM from "react-dom";
import LazyLoad from 'react-lazy-load';
import { observer, inject } from "mobx-react";

import { Row, Col, FormGroup, FormControl, Button, Overlay, Popover, Checkbox } from "react-bootstrap";

import Helper from "../../../Helper/Helper";

import ModalHandler from "../../ModalHandler/ModalHandler";
import WaitControl from "../../WaitControl/WaitControl";
import RowLazyWait from "../../RowLazyWait/RowLazyWait";

import GridRowToolbar from "../../GridRowToolbar/GridRowToolbar";
import PageComponent from "../../PageComponents/PageComponent";

import DropdownEditor from '../../DropdownEditor/DropdownEditor';
import DropdownEditorMenu from '../../DropdownEditor/DropdownEditorMenu';

import ProductsViewModel from "./ProductsViewModel";


const Products = inject("store")(
    observer(
        class Products extends React.Component {

            constructor(props) {
                super(props);

                this.state = { isModalShown: false };

                this.pageViewModel = props.pageViewModel;
                this.errorHandler = props.errorHandler;

                this.viewModel = new ProductsViewModel();

                this.modalHandler = new ModalHandler();
                this.activeLang = this.props.store.langStore.active;

                this.getProducts = this.getProducts.bind(this);
                this.getProductsRow = this.getProductsRow.bind(this);
                this.saveProducts = this.saveProducts.bind(this);

                this.changeStatus = this.changeStatus.bind(this);

                this.limit = Helper.LAZY_LOAD_LIMIT;
                this.offset = 0;
            }

            componentWillMount() {

                this.getProducts();
            }

            getProducts() {

                const isFullRefresh = this.offset === 0;

                if (isFullRefresh) {

                    this.viewModel.products.length = 0;

                    this.pageViewModel.pageBlurPixels = 3;
                    this.pageViewModel.showPageWaitControl = true;
                }
                else {

                    this.viewModel.isLazyLoading = true;
                }

                const params = {
                    limit: this.limit,
                    offset: this.offset,
                    statusFilter: this.viewModel.statusType
                };

                if (this.viewModel.searchText) {

                    params['nameFilter'] = this.viewModel.searchText;
                }

                let idCounter = -1;

                Helper.RunPromise(
                    {
                        promise: Helper.FetchPromiseGet('/products/get/', params),
                        success: data => {

                            if (data && data.length > 0) {

                                this.viewModel.removeLazyWaitRecord();

                                const temp = [...data.map((v, i) => this.viewModel.syncProductItem(v))];
                                temp.push(this.viewModel.getLazyWaitRecord());

                                this.viewModel.products.push(...temp);
                            }
                            else {

                                this.viewModel.removeLazyWaitRecord();
                            }
                        },
                        incrementSession: () => {

                            this.getProductsPromiseID = this.getProductsPromiseID ? (this.getProductsPromiseID + 1) : 1;
                            idCounter = this.getProductsPromiseID;
                        },
                        sessionValid: () => {

                            return idCounter === this.getProductsPromiseID;
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

            getProductsRow(value, index) {

                let ovtObjectivesTarget = null;
                let statusColor = null;

                switch (value.recordState) {

                    case 10:
                        statusColor = 's-status-add';
                        break;

                    case 20:
                        statusColor = 's-status-edit';
                        break;

                    case 30:
                        statusColor = 's-status-delete';
                        break;

                }

                return (

                    value.isLazyWait ?
                        <tr key={value.genId}>
                            <RowLazyWait colSpan={7} spin={true} onAppear={() => {

                                this.offset += this.limit;
                                this.getProducts();
                            }} />
                        </tr>
                        :
                        <tr key={value.genId}>

                            <td className="s-td-cell-status">
                                <div className={statusColor}>
                                </div>
                            </td>
                            <td className="s-td-cell-name-short">{value.title}</td>

                            <td className="hidden-xs hidden-sm">
                                {
                                    value.hasObjectives ?
                                        <div>
                                            <Overlay
                                                rootClose
                                                target={p => ovtObjectivesTarget}
                                                show={value.showObjectives}
                                                onHide={() => value.showObjectives = false}
                                                placement="top">
                                                {
                                                    this.popObjectives(
                                                        value,
                                                        e => {
                                                            value.showObjectives = false;
                                                        })
                                                }
                                            </Overlay>
                                            <Button
                                                className="s-btn-small-blue-empty"
                                                ref={r => ovtObjectivesTarget = ReactDOM.findDOMNode(r)}
                                                onClick={e => this.getProductsObjectives(value, () => value.showObjectives = true)}>
                                                <span className={`la ${value.isGettingObjectives ? 'la-circle-o-notch la-spin' : 'la-comment-o'}`}></span>
                                            </Button>
                                        </div>
                                        :
                                        <span className="la la-comment-o lightgray2"></span>
                                }
                            </td>
                            <td className="hidden-xs hidden-sm">{this.activeLang.labels[`lbl_CourseHType_${value.type}`]}</td>
                            <td className="hidden-xs hidden-sm">{this.activeLang.labels[`lbl_CourseHApproach_${value.approach}`]}</td>
                            <td className="hidden-xs hidden-sm">{value.expectedDuration}</td>
                            <td className="hidden-xs hidden-sm">{value.happeningsCount}</td>
                            <td className="s-td-cell-active">

                                {
                                    value.isChangingStatus ?
                                        null
                                        :
                                        <Checkbox className="s-checkbox"

                                            defaultChecked={value.status === 1}
                                            onChange={e => {

                                                if (value.id > 0) {

                                                    let tempValue = value.status;

                                                    value.status = e.target.checked ? 1 : 0;

                                                    if (tempValue !== value.status) {

                                                        this.changeStatus(value);
                                                    }
                                                }

                                            }}>
                                        </Checkbox>
                                }

                            </td>

                            <GridRowToolbar hideEdit
                                currentValue={value}
                                displayName={value ? value.title : ''}
                                onEdit={e => {

                                    this.getProductsObjectives(value);
                                    this.viewModel.selectedValue = value;
                                    this.modalHandler.show();
                                }}
                                onDelete={e => {

                                    if (value.recordState === 10) {

                                        this.viewModel.removeProducts(value);
                                    }
                                    else {

                                        value.recordState = 30;
                                        this.saveProducts();
                                    }
                                }}
                                deleteTitle={this.activeLang.labels["lbl_DeleteProducts"]} />
                        </tr >
                );
            }

            saveProducts() {

                let idCounter = -1;

                const savePromises = {
                    options: this.viewModel.products
                        .filter((v, i) => v.recordState && v.recordState !== 0 && !v.isSaving)
                        .map((toSave, index) => {

                            toSave.isSaving = true;

                            return {
                                promise: Helper.FetchPromisePost('/products/Save', toSave.getValue()),
                                success: data => {

                                    if (data) {

                                        if (toSave.recordState === 30) {

                                            this.viewModel.removeProducts(toSave);
                                        }
                                        else if (!data.ok) {

                                            toSave.sync(data);
                                        }
                                    }
                                },
                                failure: error => {

                                    toSave.error = this.activeLang.msgs['errMsg_Aplgs'];
                                },
                                complete: () => {

                                    toSave.isSaving = false;
                                }
                            };
                        }),
                    incrementSession: () => {

                        this.saveProductsPromiseID = this.saveProductsPromiseID ? (this.saveProductsPromiseID + 1) : 1;
                        idCounter = this.saveProductsPromiseID;
                    },
                    sessionValid: () => {

                        return idCounter === this.saveProductsPromiseID;
                    }
                };

                Helper.RunPromise(savePromises);
            }

            changeStatus(value) {

                if (value) {

                    let idCounter = -1;

                    value.isChangingStatus = true;

                    Helper.RunPromise(
                        {
                            promise: Helper.FetchPromisePost('/products/changeStatus', { id: value.id, status: value.status }),
                            success: data => {


                                if (value.originalValue) {

                                    value.originalValue.status = value.status;
                                }
                            },
                            incrementSession: () => {

                                this.changeStatusPromiseID = this.changeStatusPromiseID ? (this.changeStatusPromiseID + 1) : 1;
                                idCounter = this.changeStatusPromiseID;
                            },
                            sessionValid: () => {

                                return idCounter === this.changeStatusPromiseID;
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
                            value.isChangingStatus = false;
                        }
                    );
                }
            }

            getProductsObjectives(value, onSuccess) {

                if (value && value.id > 0 && !value.isGettingObjectives) {

                    if (value.fromObjectives) {

                        if (onSuccess) {
                            onSuccess();
                        }
                    }
                    else {

                        let idCounter = -1;

                        value.isGettingObjectives = true;

                        Helper.RunPromise(
                            {
                                promise: Helper.FetchPromiseGet('/products/GetObjectives/', { headerID: value.id }),
                                success: data => {

                                    if (data && data.result) {

                                        value.fromObjectives = data.result;

                                        if (value.originalValue) {

                                            value.originalValue.fromObjectives = data.result;
                                        }

                                        if (onSuccess) {
                                            onSuccess();
                                        }
                                    }
                                },
                                incrementSession: () => {

                                    this.getProductsObjectivesPromiseID = this.getProductsObjectivesPromiseID ? (this.getProductsObjectivesPromiseID + 1) : 1;
                                    idCounter = this.getProductsObjectivesPromiseID;
                                },
                                sessionValid: () => {

                                    return idCounter === this.getProductsObjectivesPromiseID;
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
                                value.isGettingObjectives = false;
                            }
                        );
                    }
                }
            }

            popObjectives(value, onClose) {

                if (value) {

                    return (

                        <Popover id="popObjectives">
                            <p>
                                {value.fromObjectives}
                            </p>
                        </Popover >
                    );
                }
            }

            render() {

                return (

                    <PageComponent

                        paTitle={this.activeLang.labels["lbl_Menu_products"]}
                        paSearchPlaceholder={this.activeLang.labels["lbl_SearchProducts"]}
                        paSearchValue={this.viewModel.searchText}
                        paOnSearchValueChange={e => this.viewModel.searchText = e.target.value}
                        paOnSearch={e => {
                            this.offset = 0;
                            this.getProducts();
                        }}
                        paClearSearchValue={e => this.viewModel.searchText = ''}
                        paOnAdd={e => {
                            this.viewModel.selectedValue = this.viewModel.getNewProducts();
                            this.modalHandler.show();
                        }}
                        paShowSaveButton={e => {
                            const temp = this.viewModel.products.find((v, i) => !v.isLazyWait && v.recordState !== 0 && !v.isSaving) ? true : false;

                            return !this.viewModel.isModalShown && temp;
                        }}
                        paGlobalSaveOnClick={e => {
                            this.saveProducts();
                        }}
                        paRefresh={e => {

                            this.offset = 0;
                            this.getProducts();
                        }}
                        paStatusAll={e => {

                            this.viewModel.statusType = null;
                            this.offset = 0;
                            this.getProducts();

                        }}
                        paStatusActive={e => {

                            this.viewModel.statusType = 1;
                            this.offset = 0;
                            this.getProducts();

                        }}
                        paStatusInactive={e => {

                            this.viewModel.statusType = 0;
                            this.offset = 0;
                            this.getProducts();

                        }}

                        getTableHeaders={() => {

                            return (

                                <tr>
                                    <th className="s-th-cell-status"></th>
                                    <th className="s-th-cell-name">{this.activeLang.labels["lbl_Title"]}</th>
                                    <th className="hidden-xs hidden-sm">{this.activeLang.labels["lbl_Objectives"]}</th>
                                    <th className="hidden-xs hidden-sm">{this.activeLang.labels["lbl_CourseType"]}</th>
                                    <th className="hidden-xs hidden-sm">{this.activeLang.labels["lbl_CourseApproach"]}</th>
                                    <th className="hidden-xs hidden-sm">{this.activeLang.labels["lbl_Duration"]}</th>
                                    <th className="hidden-xs hidden-sm">{this.activeLang.labels["lbl_Days"]}</th>
                                    <th className="s-th-cell-active">{this.activeLang.labels["lbl_Active"]}</th>
                                    <th className="s-th-cell-controls" />
                                </tr>

                            );
                        }}
                        getTableRows={() => this.viewModel.products.map(this.getProductsRow)}
                        hideNext
                        hidePrev
                        modalHandler={this.modalHandler}
                        getModalHeader={() => {

                            return this.activeLang.labels["lbl_EditTraining"];
                        }}

                        getModalInRoot={() => {

                            return <WaitControl opacity50={true} />;
                        }}

                        getModalBody={() => {

                            return (
                                this.viewModel.selectedValue === null ?
                                    null
                                    :

                                    <div>

                                        <div className="modal-avatar">
                                            <img src="../images/products.png" />
                                        </div>

                                        <div className="modal-form">

                                            {
                                                this.viewModel.selectedValue.isGettingObjectives ?
                                                    <WaitControl />
                                                    :
                                                    <Row>
                                                        <Col sm={12}>
                                                            <FormGroup className="form-error">
                                                                <p className="labels">{this.activeLang.labels['lbl_Title']}</p>

                                                                <FormControl
                                                                    type="text"
                                                                    className={this.viewModel.selectedValue.isTitleValid() ? '' : 'input-error'}
                                                                    value={this.viewModel.selectedValue.title}
                                                                    onChange={e => {

                                                                        this.viewModel.selectedValue.title = e.target.value;
                                                                        this.viewModel.selectedValue.checkRecordState();

                                                                    }} />
                                                                {
                                                                    this.viewModel.selectedValue.isTitleValid() ?
                                                                        null
                                                                        :
                                                                        <small className="error-label">{this.activeLang.msgs['msg_ValReq']}</small>
                                                                }

                                                            </FormGroup>
                                                        </Col>

                                                        <Col sm={12}>
                                                            <div className="modal-input">
                                                                <FormGroup>
                                                                    <p className="labels">{this.activeLang.labels['lbl_Objectives']}</p>

                                                                    <FormControl
                                                                        componentClass="textarea"
                                                                        style={{ height: 100 }}
                                                                        value={this.viewModel.selectedValue.fromObjectives}
                                                                        onChange={e => {
                                                                            this.viewModel.selectedValue.fromObjectives = e.target.value
                                                                            this.viewModel.selectedValue.checkRecordState();
                                                                        }} />

                                                                </FormGroup>
                                                            </div>
                                                        </Col>

                                                        <Col md={6} sm={12}>
                                                            <div className="modal-input">
                                                                <FormGroup>
                                                                    <p className="labels">{this.activeLang.labels['lbl_CourseType']}</p>

                                                                    <DropdownEditor
                                                                        className="form-control"
                                                                        title={this.activeLang.labels[`lbl_CourseHType_${this.viewModel.selectedValue.type}`]}>
                                                                        {

                                                                            Helper.getCourseTypes().map((v, i) => {

                                                                                return (
                                                                                    <DropdownEditorMenu
                                                                                        className={v.key === this.viewModel.selectedValue.title ? 'active' : ''}
                                                                                        key={v.key}
                                                                                        eventKey={i}
                                                                                        onClick={e => {

                                                                                            this.viewModel.selectedValue.type = this.activeLang.labels[`lbl_CourseHType_${v.key}`];
                                                                                            this.viewModel.selectedValue.type = v.key;
                                                                                            this.viewModel.selectedValue.type.checkRecordState();
                                                                                        }}>
                                                                                        {this.activeLang.labels[`lbl_CourseHType_${v.key}`]}
                                                                                    </DropdownEditorMenu>
                                                                                );
                                                                            })
                                                                        }
                                                                    </DropdownEditor>

                                                                </FormGroup>
                                                            </div>
                                                        </Col>


                                                        <Col md={6} sm={12}>
                                                            <div className="modal-input">
                                                                <FormGroup>
                                                                    <p className="labels">{this.activeLang.labels['lbl_CourseApproach']}</p>

                                                                    <DropdownEditor
                                                                        className="form-control"
                                                                        title={this.activeLang.labels[`lbl_CourseHApproach_${this.viewModel.selectedValue.approach}`]}>
                                                                        {
                                                                            Helper.getCourseApproaches().map((v, i) => {

                                                                                return (
                                                                                    <DropdownEditorMenu
                                                                                        className={v.key === this.viewModel.selectedValue.title ? 'active' : ''}
                                                                                        key={v.key}
                                                                                        eventKey={i}
                                                                                        onClick={e => {

                                                                                            this.viewModel.selectedValue.approach = this.activeLang.labels[`lbl_CourseHApproach_${v.key}`];
                                                                                            this.viewModel.selectedValue.approach = v.key;
                                                                                            this.viewModel.selectedValue.approach.checkRecordState();
                                                                                        }}>
                                                                                        {this.activeLang.labels[`lbl_CourseHApproach_${v.key}`]}
                                                                                    </DropdownEditorMenu>
                                                                                );
                                                                            })
                                                                        }
                                                                    </DropdownEditor>


                                                                </FormGroup>
                                                            </div>
                                                        </Col>

                                                        <Col md={6} sm={12}>
                                                            <div className="modal-input">
                                                                <FormGroup>
                                                                    <p className="labels">{this.activeLang.labels['lbl_Duration']}</p>

                                                                    <FormControl
                                                                        type="text"
                                                                        value={this.viewModel.selectedValue.expectedDuration}
                                                                        onChange={e => {
                                                                            this.viewModel.selectedValue.expectedDuration = e.target.value
                                                                            this.viewModel.selectedValue.checkRecordState();
                                                                        }} />

                                                                </FormGroup>
                                                            </div>
                                                        </Col>

                                                        <Col md={6} sm={12}>
                                                            <div className="modal-input">
                                                                <FormGroup>
                                                                    <p className="labels">{this.activeLang.labels['lbl_Days']}</p>

                                                                    <FormControl
                                                                        type="text"
                                                                        value={this.viewModel.selectedValue.happeningsCount}
                                                                        onChange={e => {
                                                                            this.viewModel.selectedValue.happeningsCount = e.target.value
                                                                            this.viewModel.selectedValue.checkRecordState();
                                                                        }} />
                                                                </FormGroup>
                                                            </div>
                                                        </Col>

                                                    </Row>
                                            }
                                        </div>

                                    </div>
                            );
                        }}

                        getModalFooter={() => {

                            return (

                                <div className="modal-controls">
                                    <Button className="btn-green-secondary"
                                        onClick={e => {

                                            if (this.viewModel.selectedValue.isValid()) {

                                                this.modalHandler.hide('save');
                                            }
                                        }}>
                                        {this.activeLang.labels["lbl_Save"]}

                                    </Button>

                                    <Button className="btn-purple"
                                        onClick={e => {

                                            if (this.viewModel.selectedValue.isValid()) {

                                                this.modalHandler.hide('noRevert');
                                            }
                                        }}>
                                        {this.activeLang.labels["lbl_SaveLater"]}
                                    </Button>
                                </div>
                            );

                        }}

                        onModalShow={args => this.viewModel.isModalShown = true}
                        onModalHide={args => {

                            this.viewModel.isModalShown = false;

                            if (args) {

                                switch (args.action) {

                                    case 'noRevert':
                                    case 'save':

                                        if (this.viewModel.selectedValue
                                            && this.viewModel.selectedValue.recordState === 10) {

                                            this.viewModel.addNewProducts(this.viewModel.selectedValue);
                                        }

                                        if (args.action === 'save') {

                                            this.saveProducts();
                                        }
                                        break;

                                    default:

                                        if (this.viewModel.selectedValue) {

                                            if (this.viewModel.selectedValue.recordState === 10) {

                                                this.viewModel.removeProducts(this.viewModel.selectedValue);
                                            }
                                            else {

                                                this.viewModel.selectedValue.sync(this.viewModel.selectedValue.originalValue);
                                            }
                                        }
                                        break;
                                }

                                this.viewModel.selectedValue = null;
                            }
                        }} />
                );
            }
        }
    )
);

export default Products;
