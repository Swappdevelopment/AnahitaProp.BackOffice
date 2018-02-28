import React from "react";
import { observer, inject } from "mobx-react";
import { Row, Col, FormGroup, FormControl, OverlayTrigger } from "react-bootstrap";

import Helper from "../../../Helper/Helper";

import WaitControl from "../../WaitControl/WaitControl";
import RoleModel from "../../../Models/RoleModel";

const UserManagementRole = inject("store")(
    observer(
        class UserManagementRole extends React.Component {

            constructor(props) {
                super(props);

                this.state = { isModalShown: false };

                this.pageViewModel = props.pageViewModel;

                this.viewModel = props.userManagementViewModel;

                this.errorHandler = props.errorHandler;
                this.activeLang = this.props.store.langStore.active;
            }

            componentWillMount() {

                this.getRoles();
            }

            getRoles = () => {

                if (this.viewModel.roles.length === 0) {

                    this.viewModel.setPropsValue({ gettingRoles: true });

                    let idCounter = -1;

                    Helper.RunPromise(
                        {
                            promise: Helper.FetchPromiseGet('/Lookup/getRoles/'),
                            success: data => {

                                if (data && data.length > 0) {

                                    this.viewModel.pushRole(...data.map((v, i) => RoleModel.init(Object.assign(v, { role_Id: v.id, id: 0 }), i + 1)));
                                }
                            },
                            incrementSession: () => {

                                this.getRolesPromiseID = this.getRolesPromiseID ? (this.getRolesPromiseID + 1) : 1;
                                idCounter = this.getRolesPromiseID;
                            },
                            sessionValid: () => {

                                return idCounter === this.getRolesPromiseID;
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

                            this.viewModel.setPropsValue({ gettingRoles: false });
                        }
                    );
                }
            }

            render() {

                if (!this.viewModel.targetRoleUser) {
                    return null;
                }

                const isCreatingUser = this.viewModel.targetRoleUser
                    && this.viewModel.targetRoleUser.recordState === 10
                    && this.viewModel.targetRoleUser.id < 0
                    && !this.viewModel.targetRoleUser.creationStep1Passed;

                const value = this.viewModel.targetRoleUser;

                return (

                    <div className="s-modal-form">

                        <WaitControl show={this.viewModel.gettingRoles} opacity50={true} />

                        {
                            isCreatingUser ?

                                <Row>
                                    <Col sm={12}>

                                        <div className="form-group s-form-group s-form-validation">
                                            <div className="s-label">
                                                <span>{this.activeLang.labels['lbl_Email']}</span>
                                            </div>
                                            <input className={value.isEmailValid() ? 'form-control s-input' : 'form-control s-input-error'}
                                                type="email"
                                                value={value.email}
                                                onKeyPress={e => {

                                                    switch (e.key) {

                                                        case 'Enter':

                                                            if (this.props.onRoleCreationContinue) {

                                                                this.props.onRoleCreationContinue();
                                                            }
                                                            break;
                                                    }
                                                }}
                                                onChange={e => value.execAction(self => self.email = e.target.value)} />
                                            {
                                                value.isEmailValid() ?
                                                    null
                                                    :
                                                    <small className="s-label-error">{this.activeLang.msgs['msg_ValReq']}</small>
                                            }
                                        </div>

                                    </Col>
                                </Row>

                                :

                                <Row>
                                    <Col sm={7} style={{ paddingRight: 0 }}>
                                        <div className="s-user-role-container">
                                            <div className="s-user-role-name">
                                                {this.activeLang.labels['lbl_Role']}
                                            </div>
                                            {
                                                this.viewModel.roles.map((v, i) => {

                                                    return (
                                                        <p key={v.genId}>
                                                            {v.name}
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
                                                this.viewModel.roles.map((v, i) => {

                                                    return (
                                                        <div
                                                            key={v.genId}
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
                                                    this.viewModel.roles.map((v, i) => {

                                                        let userRole = this.viewModel.targetRoleUser.findAccountRole(v.role_Id);

                                                        return (
                                                            <li
                                                                key={v.role_Id}
                                                                className={`s-user-role-list-item${userRole && userRole.id > 0 ? ' selected' : ''}`}
                                                                onClick={e => {

                                                                    if (!this.viewModel.targetRoleUser.isCurrentUser) {

                                                                        if (userRole && !userRole.isSaving) {

                                                                            userRole.setPropsValue({
                                                                                recordState: 30
                                                                            });

                                                                            this.props.save(userRole);
                                                                        }
                                                                        else if (!v.isSaving) {

                                                                            userRole = v;

                                                                            userRole.setPropsValue({
                                                                                account_Id: this.viewModel.targetRoleUser.id,
                                                                                recordState: 10
                                                                            });

                                                                            this.props.save(userRole);
                                                                        }
                                                                    }
                                                                }}>
                                                            </li>
                                                        );
                                                    })
                                                }
                                            </ul>
                                        </div>
                                    </Col>
                                </Row>
                        }

                    </div>
                );
            }
        }
    )
);

export default UserManagementRole;