import React from "react";
import ReactDOM from "react-dom";
import { observer, inject } from "mobx-react";
import moment from "moment-es6";

import { Row, Col } from "react-bootstrap";
import Datepicker from "react-datepicker";
import NumericInput from 'react-numeric-input';

import Helper from "../../../../Helper/Helper";


const CatalogStep = inject("store")(
    observer(
        class TrainingSteps extends React.Component {

            constructor(props) {
                super(props);

                this.state = { isModalShown: false };

                this.currentTraining = props.currentTraining;
                this.errorHandler = props.errorHandler;

                this.activeLang = this.props.store.langStore.active;
            }

            componentWillMount() {
            }

            render() {

                const value = this.currentTraining;

                return (
                    <div className="form">
                        <Row>
                            <Col md={3} sm={12}>
                                <div className="s-label">
                                    <span>{this.activeLang.labels['lbl_Title']}</span>
                                </div>
                            </Col>
                            <Col md={9} sm={12}>
                                <textarea className={value.header.isTitleValid() ? 'form-control s-input' : 'form-control s-input-error'}
                                    value={value.header.title}
                                    onChange={e => {
                                        value.header.title = e.target.value;
                                        value.header.checkRecordState();
                                    }} />
                                {
                                    value.header.isTitleValid() ?
                                        null
                                        :
                                        <small className="s-label-error">{this.activeLang.msgs['msg_ValReq']}</small>
                                }
                            </Col>
                        </Row>
                        <br />
                        <Row>
                            <Col md={3} sm={12}>
                                <div className="s-label">
                                    <span>{this.activeLang.labels['lbl_Objectives']}</span>
                                </div>
                            </Col>
                            <Col md={9} sm={12}>
                                <textarea className="form-control s-input h-100"
                                    value={value.header.fromObjectives}
                                    onChange={e => {
                                        value.header.fromObjectives = e.target.value;
                                        value.header.checkRecordState();
                                    }} />
                            </Col>
                        </Row>
                        <br />
                        <Row>
                            <Col md={3} sm={12}>
                                <div className="s-label">
                                    <span>{this.activeLang.labels['lbl_StartDate']}</span>
                                </div>
                            </Col>
                            <Col md={9} sm={12}>
                                <Datepicker
                                    dateFormat={Helper.DATE_FORMAT}
                                    className="form-control"
                                    selected={value.startDate}
                                    onChange={date => {
                                        value.startDate = date;
                                        value.checkRecordState();
                                    }} />
                            </Col>
                        </Row>
                        <br />
                        <Row>
                            <Col md={3} sm={12}>
                                <div className="s-label">
                                    <span>{this.activeLang.labels['lbl_Duration']}</span>
                                </div>
                            </Col>
                            <Col md={9} sm={12}>
                                <table>
                                    <tbody>
                                        <tr>
                                            <td>
                                                <NumericInput className="form-control"
                                                    min={0}
                                                    max={23}
                                                    value={Helper.getValuesFromMins(value.header.expectedDuration).hours}
                                                    onChange={newValue => {

                                                        let temp = Helper.getValuesFromMins(value.header.expectedDuration);

                                                        temp = (newValue * 60) + temp.minutes;

                                                        value.header.expectedDuration = temp;
                                                    }} />
                                            </td>
                                            <td>
                                                <h3>:</h3>
                                            </td>
                                            <td>
                                                <NumericInput className="form-control"
                                                    min={0}
                                                    max={59}
                                                    value={Helper.getValuesFromMins(value.header.expectedDuration).minutes}
                                                    onChange={newValue => {

                                                        let temp = Helper.getValuesFromMins(value.header.expectedDuration);

                                                        temp = (temp.hours * 60) + newValue;

                                                        value.header.expectedDuration = temp;
                                                    }} />
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                                {/* <Row>
                                    <Col md={5}>
                                        <NumericInput className="form-control"
                                            min={0}
                                            max={23}
                                            value={Helper.getValuesFromMins(value.header.expectedDuration).hours}
                                            onChange={newValue => {

                                                let temp = Helper.getValuesFromMins(value.header.expectedDuration);

                                                temp = (newValue * 60) + temp.minutes;

                                                value.header.expectedDuration = temp;
                                            }} />
                                    </Col>
                                    <Col md={2}>
                                        <h3>:</h3>
                                    </Col>
                                    <Col md={5}>
                                        <NumericInput className="form-control"
                                            min={0}
                                            max={59}
                                            value={Helper.getValuesFromMins(value.header.expectedDuration).minutes}
                                            onChange={newValue => {

                                                let temp = Helper.getValuesFromMins(value.header.expectedDuration);

                                                temp = (temp.hours * 60) + newValue;

                                                value.header.expectedDuration = temp;
                                            }} />
                                    </Col>
                                </Row> */}
                            </Col>
                        </Row>
                        <br />
                        <Row>
                            <Col md={3} sm={12}>
                                <div className="s-label">
                                    <span>{this.activeLang.labels['lbl_Happenings']}</span>
                                </div>
                            </Col>
                            <Col md={3} sm={12}>
                                <NumericInput className="form-control"
                                    min={0}
                                    value={value.header.happeningsCount} />
                            </Col>
                        </Row>
                    </div>
                );
            }
        }
    )
);

export default CatalogStep;
