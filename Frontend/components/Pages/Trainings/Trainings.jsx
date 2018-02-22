import React from "react";
import ReactDOM from "react-dom";
import LazyLoad from 'react-lazy-load';
import { observer, inject } from "mobx-react";
import moment from "moment-es6";

import { Row, Col, FormGroup, FormControl, Button, Overlay, Popover, Checkbox } from "react-bootstrap";

import Helper from "../../../Helper/Helper";

import ModalHandler from "../../ModalHandler/ModalHandler";
import WaitControl from "../../WaitControl/WaitControl";
import RowLazyWait from "../../RowLazyWait/RowLazyWait";

import GridRowToolbar from "../../GridRowToolbar/GridRowToolbar";
import PageComponent from "../../PageComponents/PageComponent";

import DropdownEditor from '../../DropdownEditor/DropdownEditor';
import DropdownEditorMenu from '../../DropdownEditor/DropdownEditorMenu';

import TrainingsViewModel from "./TrainingsViewModel";
import TrainingSteps from "./TrainingSteps";


const Trainings = inject("store")(
    observer(
        class Trainings extends React.Component {

            constructor(props) {
                super(props);

                this.state = { isModalShown: false };

                this.pageViewModel = props.pageViewModel;
                this.errorHandler = props.errorHandler;

                this.viewModel = new TrainingsViewModel();

                this.modalHandler = new ModalHandler();
                this.activeLang = this.props.store.langStore.active;

                this.getTrainings = this.getTrainings.bind(this);
                this.getObjectiveElement = this.getObjectiveElement.bind(this);
                this.getTrainingRow = this.getTrainingRow.bind(this);

                this.changeStatus = this.changeStatus.bind(this);
                this.getObjectives = this.getObjectives.bind(this);

                this.limit = Helper.LAZY_LOAD_LIMIT;
                this.offset = 0;

                this.stepsSiblingCounter = 0;
            }

            componentWillMount() {
                this.getTrainings();
            }

            getTrainings() {

                const isFullRefresh = this.offset === 0;

                if (isFullRefresh) {

                    this.viewModel.trainings.length = 0;

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

                    params['titleFilter'] = this.viewModel.searchText;
                }

                let idCounter = -1;

                Helper.RunPromise(
                    {
                        promise: Helper.FetchPromiseGet('/training/get/', params),
                        success: data => {

                            if (data && data.length > 0) {

                                this.viewModel.removeLazyWaitRecord();

                                const temp = [...data.map((v, i) => this.viewModel.syncTrainingItem(v))];
                                temp.push(this.viewModel.getLazyWaitRecord());

                                this.viewModel.trainings.push(...temp);
                            }
                            else {

                                this.viewModel.removeLazyWaitRecord();
                            }
                        },
                        incrementSession: () => {

                            this.getsTrainingsPromiseID = this.getsTrainingsPromiseID ? (this.getsTrainingsPromiseID + 1) : 1;
                            idCounter = this.getsTrainingsPromiseID;
                        },
                        sessionValid: () => {

                            return idCounter === this.getsTrainingsPromiseID;
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

            getObjectiveElement(value, placement) {

                if (value) {

                    let ovtObjectivesTarget = null;

                    if (value.header.hasObjectives) {

                        placement = placement ? placement : 'top';

                        return (
                            <div>
                                <Overlay
                                    rootClose
                                    target={p => ovtObjectivesTarget}
                                    show={value.header.showObjectives}
                                    onHide={() => value.header.showObjectives = false}
                                    placement={placement}>
                                    {
                                        this.popObjectives(
                                            value,
                                            e => {
                                                value.header.showObjectives = false;
                                            })
                                    }
                                </Overlay>
                                <Button
                                    className="s-btn-small-blue-empty"
                                    ref={r => ovtObjectivesTarget = ReactDOM.findDOMNode(r)}
                                    onClick={e => this.getObjectives(value, () => value.header.showObjectives = true)}>
                                    <span className={`la ${value.header.isGettingObjectives ? 'la-circle-o-notch la-spin' : 'la-comment-o'}`}></span>
                                </Button>
                            </div>
                        );
                    }

                    return (
                        <span className="la la-comment-o lightgray2"></span>
                    );
                }

                return null;
            }

            getTrainingRow(value, index) {

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
                                this.getTrainings();

                            }} />
                        </tr>
                        :
                        <tr key={value.genId}>

                            <td className="s-td-cell-status">
                                <div className={statusColor}>
                                </div>
                            </td>
                            <td
                                onClick={e => {
                                    this.getObjectives(value);
                                    this.viewModel.selectedValue = value;
                                }}
                                className="s-td-cell-name-short">{value.header.title}</td>
                            <td>{moment(value.startDate).format("DD/MM/YYYY")}</td>
                            <td>{value.closedDate ? moment(value.closedDate).format("DD/MM/YYYY") : ''}</td>

                            <td>
                                {this.getObjectiveElement(value)}
                            </td>
                            <td>{this.activeLang.labels[`lbl_CourseHType_${value.header.type}`]}</td>
                            <td>{this.activeLang.labels[`lbl_CourseHApproach_${value.header.approach}`]}</td>
                            <td>{Helper.minsToDDHHMMSS(value.header.expectedDuration, true)}</td>
                            <td>{value.header.happeningsCount}</td>
                            <td className="s-td-cell-active">
                                {
                                    value.isChangingStatus ?
                                        <span className="la la-circle-o-notch la-spin clr-fore-primary"></span>
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

                                    this.getObjectives(value);
                                    this.viewModel.selectedValue = value;
                                    this.modalHandler.show();
                                }}
                                onDelete={e => {

                                    if (value.recordState === 10) {

                                        this.viewModel.removeCatalog(value);
                                    }
                                    else {

                                        value.recordState = 30;
                                        this.saveTrainings();
                                    }
                                }} 
                                deleteTitle={this.activeLang.labels["lbl_DeleteTraining"]}/>
                        </tr >
                );
            }

            changeStatus(value) {

                if (value) {

                    let idCounter = -1;

                    value.isChangingStatus = true;

                    Helper.RunPromise(
                        {
                            promise: Helper.FetchPromisePost('/training/changeStatus', { id: value.id, status: value.status }),
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

            getObjectives(value, onSuccess) {

                if (value && value.header && value.header.id > 0 && !value.isGettingObjectives) {

                    if (value.header.fromObjectives) {

                        if (onSuccess) {
                            onSuccess();
                        }
                    }
                    else {

                        let idCounter = -1;

                        value.header.isGettingObjectives = true;

                        Helper.RunPromise(
                            {
                                promise: Helper.FetchPromiseGet('/training/GetObjectives/', { headerID: value.header.id }),
                                success: data => {

                                    if (data && data.result) {

                                        value.header.fromObjectives = data.result;

                                        if (value.header.originalValue) {

                                            value.header.originalValue.fromObjectives = data.result;
                                        }

                                        if (onSuccess) {
                                            onSuccess();
                                        }
                                    }
                                },
                                incrementSession: () => {

                                    this.getObjectivesPromiseID = this.getObjectivesPromiseID ? (this.getObjectivesPromiseID + 1) : 1;
                                    idCounter = this.getObjectivesPromiseID;
                                },
                                sessionValid: () => {

                                    return idCounter === this.getObjectivesPromiseID;
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
                                value.header.isGettingObjectives = false;
                            }
                        );
                    }
                }
            }

            getTrainingObjectives(value, onSuccess) {

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
                                promise: Helper.FetchPromiseGet('/training/getObjectives/', { headerID: value.id }),
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

                                    this.getObjectivesPromiseID = this.getObjectivesPromiseID ? (this.getObjectivesPromiseID + 1) : 1;
                                    idCounter = this.getObjectivesPromiseID;
                                },
                                sessionValid: () => {

                                    return idCounter === this.getObjectivesPromiseID;
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

                            <div className="popover-close">

                                <Button className="s-btn-small-red-empty"
                                    onClick={e => {
                                        if (onClose) {
                                            onClose(e);
                                        }
                                    }}>
                                </Button>

                            </div>
                            <p>
                                {value.header.fromObjectives}
                            </p>
                        </Popover >
                    );
                }
            }

            render() {

                return (

                    <PageComponent

                        paTitle={this.activeLang.labels["lbl_Menu_trainings"]}
                        paSearchValue={this.viewModel.searchText}
                        paOnAdd={e => {

                        }}
                        paShowSaveButton={e => {
                            return false;
                        }}
                        paRefresh={e => {

                            this.offset = 0;
                            this.getTrainings();
                        }}
                        paStatusAll={e => {

                            this.viewModel.statusType = null;
                            this.offset = 0;
                            this.getTrainings();

                        }}
                        paStatusActive={e => {

                            this.viewModel.statusType = 1;
                            this.offset = 0;
                            this.getTrainings();

                        }}
                        paStatusInactive={e => {

                            this.viewModel.statusType = 0;
                            this.offset = 0;
                            this.getTrainings();

                        }}
                        getTableHeaders={() => {

                            return (

                                <tr>
                                    <th className="s-th-cell-status"></th>
                                    <th className="s-th-cell-name">{this.activeLang.labels['lbl_Title']}</th>
                                    <th>{this.activeLang.labels['lbl_StartDate']}</th>
                                    <th>{this.activeLang.labels['lbl_ClosedDate']}</th>
                                    <th>{this.activeLang.labels['lbl_Objectives']}</th>
                                    <th>{this.activeLang.labels['lbl_CourseType']}</th>
                                    <th>{this.activeLang.labels['lbl_CourseApproach']}</th>
                                    <th>{this.activeLang.labels['lbl_Duration']}</th>
                                    <th>{this.activeLang.labels['lbl_Happenings']}</th>
                                    <th className="s-th-cell-active">{this.activeLang.labels['lbl_Active']}</th>
                                    <th className="s-th-cell-controls" />
                                </tr>
                            );
                        }}
                        getTableRows={() => this.viewModel.trainings.map(this.getTrainingRow)}

                        hidePage={this.viewModel.selectedValue ? true : false}
                        hideNext
                        hidePrev

                        getSiblings={() => {

                            return (

                                this.viewModel.selectedValue ?

                                    <TrainingSteps
                                        key={`TrainingSteps${++this.stepsSiblingCounter}`}
                                        pageViewModel={this.pageViewModel}
                                        trainingsViewModel={this.viewModel}
                                        currentTraining={this.viewModel.selectedValue}
                                        errorHandler={this.errorHandler}
                                        getObjectiveElement={this.getObjectiveElement} />
                                    :
                                    null

                            );
                        }} />
                );
            }
        }
    )
);

export default Trainings;
