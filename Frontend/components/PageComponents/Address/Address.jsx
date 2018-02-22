import React from "react";
import { observer, inject } from "mobx-react";
import { Row, Col, FormGroup, FormControl } from "react-bootstrap";

import DropdownEditor from '../../DropdownEditor/DropdownEditor';
import DropdownEditorMenu from '../../DropdownEditor/DropdownEditorMenu';

const Address =
    inject("store")(
        observer(
            class Address extends React.Component {

                constructor(props) {
                    super(props);

                    this.activeLang = props.store.langStore.active;
                }

                render() {

                    return (

                        <div>                        {
                            this.props.addresses.map((addr, index) => {

                                return (

                                    <Row>
                                        <Col className="s-mb-20" sm={12} md={4}>
                                            <FormGroup className="s-form-group">
                                                <FormControl className="s-input" componentClass="select">
                                                    {
                                                        this.props.countries.map((ctry, ctryIndex) => {

                                                            return (

                                                                <option key={ctry.id} value={ctry.id === addr.country_Id ? 'active' : ''} onClick={e => {
                                                                    addr.countryName = ctry.name;
                                                                    addr.country_Id = ctry.id;
                                                                    addr.checkRecordState();
                                                                }}>
                                                                    {ctry.name + ` (${ctry.code})`}
                                                                </option>

                                                            );
                                                        })
                                                    }
                                                </FormControl>
                                            </FormGroup>
                                        </Col>
                                        <Col className="s-mb-20" sm={12} md={4}>
                                            <input className="form-control s-input"
                                                disabled={this.props.disabled}
                                                onChange={e => {
                                                    addr.city = e.target.value;
                                                    addr.checkRecordState();
                                                }}
                                                value={addr.city}
                                                placeholder={this.activeLang.labels['lbl_City']} />
                                        </Col>
                                        <Col className="s-mb-20" sm={12} md={4}>
                                            <input className="form-control s-input"
                                                disabled={this.props.disabled}
                                                onChange={e => {
                                                    addr.region = e.target.value;
                                                    addr.checkRecordState();
                                                }}
                                                value={addr.region}
                                                placeholder={this.activeLang.labels['lbl_Region']} />
                                        </Col>
                                        <Col className="s-mb-20" sm={12} md={4}>
                                            <input className="form-control s-input"
                                                disabled={this.props.disabled}
                                                onChange={e => {
                                                    addr.line1 = e.target.value;
                                                    addr.checkRecordState();
                                                }}
                                                value={addr.line1}
                                                placeholder={this.activeLang.labels['lbl_Line1']} />
                                        </Col>
                                        <Col className="s-mb-20" sm={12} md={4}>
                                            <input className="form-control s-input"
                                                disabled={this.props.disabled}
                                                onChange={e => {
                                                    addr.line2 = e.target.value;
                                                    addr.checkRecordState();
                                                }}
                                                value={addr.line2}
                                                placeholder={this.activeLang.labels['lbl_Line2']} />
                                        </Col>
                                        <Col className="s-mb-20" sm={12} md={4}>
                                            <input className="form-control s-input"
                                                disabled={this.props.disabled}
                                                onChange={e => {
                                                    addr.postalCode = e.target.value;
                                                    addr.checkRecordState();
                                                }}
                                                value={addr.postalCode}
                                                placeholder={this.activeLang.labels['lbl_PostCode']} />
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

export default Address;
