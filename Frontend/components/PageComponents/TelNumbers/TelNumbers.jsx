import React from "react";
import { observer, inject } from "mobx-react";
import { Button, OverlayTrigger, Row, Col, FormGroup, FormControl } from "react-bootstrap";
import Helper from "../../../Helper/Helper";

import SelectEditor from '../../SelectEditor/SelectEditor';
import DropdownEditor from '../../DropdownEditor/DropdownEditor';
import DropdownEditorMenu from '../../DropdownEditor/DropdownEditorMenu';

import "./TelNumbers.scss";

const TelNumbers =
    inject("store")(
        observer(
            class TelNumbers extends React.Component {

                constructor(props) {
                    super(props);

                    this.activeLang = props.store.langStore.active;
                }

                render() {

                    return (

                        <div>

                            <div className="s-label">
                                <span>{this.activeLang.labels['lbl_PhoneNumbers']}</span>

                                <OverlayTrigger
                                    placement="right"
                                    rootClose
                                    overlay={Helper.getTooltip('tltpTelAdd', this.activeLang.labels['lbl_Add'])}>
                                    <Button className="s-btn-small-blue-empty"
                                        onClick={this.props.onAdd}>
                                        <i className="flaticon-add"></i>
                                    </Button>
                                </OverlayTrigger>
                            </div>


                            {
                                this.props.telNumbers.map((telNumber, index) => {

                                    if (!telNumber.countryPhoneCode) {

                                        const country = this.props.countries.find((v, i) => v.id === telNumber.country_Id);

                                        telNumber.countryName = country ? country.name : '';
                                        telNumber.countryPhoneCode = country ? country.phoneCode : '';
                                    }

                                    return (
                                        telNumber.recordState === 30 ?
                                            null
                                            :
                                            <Row key={index}>

                                                <Col className="s-mb-20" xs={4} sm={3}>

                                                    <div className="form-group s-form-group">

                                                        <div className="s-dropdown-code-modal">

                                                            <FormGroup className="s-form-group">
                                                                <FormControl className="s-input" componentClass="select">
                                                                    {
                                                                        this.props.countries.map((ctry, ctryIndex) => {

                                                                            return (

                                                                                <option key={ctry.id} value={ctry.id === telNumber.country_Id ? 'active' : ''} onClick={e => {
                                                                                    telNumber.countryPhoneCode = ctry.phoneCode;
                                                                                    telNumber.country_Id = ctry.id;
                                                                                    telNumber.checkRecordState();
                                                                                }}>
                                                                                    {ctry.phoneCode + ` (${ctry.name})`}
                                                                                </option>

                                                                            );
                                                                        })
                                                                    }
                                                                </FormControl>
                                                            </FormGroup>

                                                        </div>
                                                    </div>


                                                </Col>

                                                <Col className="s-mb-20" xs={6} sm={7}>

                                                    <div className="form-group s-form-group">
                                                        <input className="form-control s-input"
                                                            disabled={this.props.disabled}
                                                            onChange={e => {
                                                                telNumber.number = e.target.value;
                                                                telNumber.checkRecordState();
                                                            }}
                                                            value={telNumber.number} />
                                                    </div>

                                                </Col>

                                                <Col className="s-mb-20" xs={1} sm={1}>
                                                    <div style={{ marginTop: "5px" }}>
                                                        <Button
                                                            disabled={this.props.disabled}
                                                            className="s-btn-small-red-empty"
                                                            onClick={e => this.props.onDelete(e, telNumber)}>
                                                            <span className="la la-remove"></span>
                                                        </Button>
                                                    </div>
                                                </Col>
                                            </Row>
                                    );
                                })
                            }

                        </div>
                    );
                }
            }
        )
    );

export default TelNumbers;
