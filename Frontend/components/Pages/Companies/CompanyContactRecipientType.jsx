import React from "react";
import { observer, inject } from "mobx-react";
import { Row, Col, FormGroup, FormControl, OverlayTrigger } from "react-bootstrap";

import Helper from "../../../Helper/Helper";

import WaitControl from "../../WaitControl/WaitControl";

const CompanyContactRecipientType = inject("store")(
    observer(
        class CompanyContactRecipientType extends React.Component {

            constructor(props) {
                super(props);

                this.state = { isModalShown: false };

                this.pageViewModel = props.pageViewModel;

                this.viewModel = props.companyContactsViewModel;

                this.errorHandler = props.errorHandler;
                this.activeLang = props.store.langStore.active;

                this.contactReceipientTarget = props.contactReceipientTarget;

                this.saveContactRecipientType = this.saveContactRecipientType.bind(this);
            }

            componentWillMount() {
            }

            saveContactRecipientType(value) {

                if (value && !value.isSaving) {

                    value.isSaving = true;

                    const isDeleting = value.recordState === 30;

                    Helper.RunPromise(
                        {
                            promise: Helper.FetchPromisePost('/Company/SaveCompanyContactTypes', value),
                            success: data => {

                                if (isDeleting) {

                                    value.id = 0;
                                    value.recordState = 0;
                                }
                                else if (data && data.returnValue && data.returnValue.id > 0) {

                                    value.id = data.returnValue.id;
                                    value.recordState = 0;
                                }
                            },
                        },
                        error => {

                            value.recordState = 0;

                            switch (error.exceptionID) {
                                default:
                                    this.errorHandler.showFromLang(this.activeLang);
                                    break;
                            }
                        },
                        () => {

                            value.isSaving = false;
                        }
                    );
                }
            }

            render() {

                return (

                    <div className="s-modal-form">

                        <Row>
                            <Col sm={7} style={{ paddingRight: 0 }}>
                                <div className="s-user-role-container">
                                    <div className="s-user-role-name">
                                        {this.activeLang.labels['lbl_Role']}
                                    </div>
                                    {
                                        this.contactReceipientTarget.contactTypes.map((v, i) => {

                                            return (
                                                <p key={v.value}>
                                                    {this.activeLang.labels[`enum_CntTpVal_${v.value}`]}
                                                </p>
                                            );
                                        })
                                    }

                                </div>
                            </Col>
                            <Col sm={1} style={{ paddingLeft: 0, paddingRight: 0 }}>
                                <div className="s-user-role-container">
                                    <div style={{
                                        position: 'relative', width: '100%', height: 22, fontWeight: 'bold', borderBottom: "1px solid #ddd", marginBottom: 20
                                    }}>
                                    </div>
                                    {
                                        this.contactReceipientTarget.contactTypes.map((v, i) => {

                                            return (
                                                <div
                                                    key={v.value}
                                                    style={{ position: 'relative', height: 21, marginBottom: 10 }}>
                                                    <span style={{ position: 'absolute', left: 5 }} className={v.isSaving ? 'spinner' : ''}></span>
                                                </div>
                                            );
                                        })
                                    }
                                </div>

                            </Col>
                            <Col sm={4} style={{ paddingLeft: 0 }}>

                                <div className="s-user-role-container">
                                    <div className="s-user-role-active">
                                        {this.activeLang.labels['lbl_Inactive']}
                                    </div>
                                    <div className="s-user-role-inactive">
                                        {this.activeLang.labels['lbl_Active']}
                                    </div>
                                    <ul className="s-user-role-list">
                                        {
                                            this.contactReceipientTarget.contactTypes.map((v, i) => {

                                                return (
                                                    <li
                                                        key={v.value}
                                                        className={`s-user-role-list-item${v.id > 0 ? ' selected' : ''}`}
                                                        onClick={e => {

                                                            if (v.id > 0) {

                                                                v.recordState = 30;
                                                            }
                                                            else {
                                                                v.recordState = 10;
                                                            }

                                                            this.saveContactRecipientType(v);
                                                        }}>
                                                    </li>
                                                );
                                            })
                                        }
                                    </ul>
                                </div>
                            </Col>
                        </Row>

                    </div >
                );
            }
        }
    )
);

export default CompanyContactRecipientType;