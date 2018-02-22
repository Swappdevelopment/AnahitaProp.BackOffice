import React from "react";
import ReactDOM from "react-dom";
import { observer, inject } from "mobx-react";
import moment from "moment-es6";

import { Button, Overlay, ProgressBar, Row, Col } from "react-bootstrap";

import Helper from "../../../Helper/Helper";

import TrainingStepsViewModel from "./TrainingStepsViewModel";
import CatalogStep from "./Steps/CatalogStep";

import './TrainingSteps.scss';


const TrainingSteps = inject("store")(
    observer(
        class TrainingSteps extends React.Component {

            constructor(props) {
                super(props);

                this.state = { isModalShown: false };

                this.pageViewModel = props.pageViewModel;
                this.trainingsViewModel = props.trainingsViewModel;
                this.currentTraining = props.currentTraining;
                this.errorHandler = props.errorHandler;

                this.viewModel = new TrainingStepsViewModel();

                this.activeLang = this.props.store.langStore.active;
            }

            componentWillMount() {
            }

            getSteps(values, className, isActiveTarget) {

                if (values && values.length > 0) {

                    const temp = [];

                    for (let item of values) {

                        temp.push(item);

                        if (item.subSteps && item.subSteps.length > 0) {

                            temp.push({ subTable: item.subSteps });
                        }
                    }

                    return (
                        <table className={className}>
                            <tbody>
                                {
                                    temp.map((v, i) => {

                                        return (
                                            <tr key={i} className={isActiveTarget && this.viewModel.selectedStep === v.uid ? 'active' : ''}>
                                                {
                                                    v.subTable ?
                                                        <td></td>
                                                        :
                                                        <td className="ico"
                                                            onClick={e => this.viewModel.selectedStep = v.uid}>
                                                            {
                                                                v.done ?
                                                                    <span className="la la-check clr-fore-primary"></span>
                                                                    :
                                                                    <span className="la la-times clr-fore-danger"></span>
                                                            }
                                                        </td>
                                                }
                                                {
                                                    v.subTable ?
                                                        <td>
                                                            {this.getSteps(v.subTable)}
                                                        </td>
                                                        :
                                                        <td className="txt"
                                                            onClick={e => this.viewModel.selectedStep = v.uid}>
                                                            {v.label}
                                                        </td>
                                                }
                                            </tr>
                                        );
                                    })
                                }
                            </tbody>
                        </table>
                    );
                }

                return null;
            }

            render() {

                const value = this.currentTraining;

                const steps = value.steps.steps;
                const postSteps = value.steps.postSteps;

                const catalogStepDone = steps.hasCatalog
                    && steps.hasName
                    && steps.hasStatus
                    && steps.hasApproach
                    && steps.hasDuration
                    && steps.hasHappeningsCount
                    && steps.startDateSet;

                const expertReady = steps.hasExpert
                    && steps.expertCVReceived
                    && steps.expertConfirmed;

                const topicsReady = steps.hasTopics
                    && steps.topicsConfirmed;


                return (

                    <div className="s-page">
                        <div className="s-page-action-wrapper">
                            <div className="container">
                                <table>
                                    <tbody>
                                        <tr>
                                            <td>
                                                <a className='s-page-action-back'
                                                    onClick={e => {
                                                        this.trainingsViewModel.selectedValue = null;
                                                    }}>
                                                    <h3 className="s-page-header">
                                                        <span style={{ marginRight: '5px' }} className="la la-arrow-left" />
                                                        {value.header.title}
                                                    </h3>
                                                </a>
                                            </td>
                                            <td>
                                                {this.props.getObjectiveElement(value, 'bottom')}
                                            </td>
                                            <td>
                                                <h4>
                                                    {moment(value.startDate).format("DD/MM/YYYY")}
                                                </h4>
                                            </td>
                                            <td style={{ minWidth: '150px', paddingTop: '10px', paddingLeft: '15px' }}>
                                                {
                                                    (() => {

                                                        const now = value.steps.percentageDone * 100;

                                                        return <ProgressBar now={now} label={`${Math.round(now)}%`} />;
                                                    })()
                                                }

                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                                <Row>
                                    <Col md={4}>
                                        <div className="s-portlet steps-wrapper">
                                            {
                                                this.getSteps(
                                                    [{
                                                        uid: 'catalogStep',
                                                        done: catalogStepDone,
                                                        label: 'Setup catalog',
                                                        subSteps: [
                                                            {
                                                                uid: 'catalogStep',
                                                                done: steps.hasName,
                                                                label: 'Set Title'
                                                            },
                                                            {
                                                                uid: 'catalogStep',
                                                                done: steps.startDateSet,
                                                                label: 'Set Start Date'
                                                            },
                                                            {
                                                                uid: 'catalogStep',
                                                                done: steps.hasDuration,
                                                                label: 'Set Duration'
                                                            },
                                                            {
                                                                uid: 'catalogStep',
                                                                done: steps.hasHappeningsCount,
                                                                label: 'Set Happenings'
                                                            }
                                                        ]
                                                    },
                                                    {
                                                        uid: 'expertStep',
                                                        done: expertReady,
                                                        label: 'Setup Expert',
                                                        subSteps: [
                                                            {
                                                                uid: 'expertStep',
                                                                done: steps.hasExpert,
                                                                label: 'Add Expert'
                                                            },
                                                            {
                                                                uid: 'expertStep',
                                                                done: steps.expertCVReceived,
                                                                label: 'Expert CV Received'
                                                            },
                                                            {
                                                                uid: 'expertStep',
                                                                done: steps.expertConfirmed,
                                                                label: 'Expert Confirmed'
                                                            }
                                                        ]
                                                    },
                                                    {
                                                        uid: 'topicsStep',
                                                        done: topicsReady,
                                                        label: 'Setup Topics',
                                                        subSteps: [
                                                            {
                                                                uid: 'topicsStep',
                                                                done: steps.hasTopics,
                                                                label: 'Add Topics'
                                                            },
                                                            {
                                                                uid: 'topicsStep',
                                                                done: steps.topicsConfirmed,
                                                                label: 'Topics Confirmed'
                                                            },
                                                        ]
                                                    },
                                                    {
                                                        uid: 'mqaSubmited',
                                                        done: steps.mqaSubmited,
                                                        label: 'MQA Submitted'
                                                    },
                                                    {
                                                        uid: 'mqaApproved',
                                                        done: steps.mqaApproved,
                                                        label: 'MQA Approved'
                                                    }
                                                    ],
                                                    'table-steps',
                                                    true)
                                            }
                                        </div>
                                    </Col>
                                    <Col md={8}>
                                        <div className="s-portlet content-wrapper">
                                            {
                                                (() => {

                                                    switch (this.viewModel.selectedStep) {

                                                        case 'catalogStep':
                                                            return <CatalogStep currentTraining={value} />
                                                    }

                                                    return null;
                                                })()
                                            }
                                        </div>
                                    </Col>
                                </Row>
                            </div>
                        </div>
                    </div>
                );
            }
        }
    )
);

export default TrainingSteps;
