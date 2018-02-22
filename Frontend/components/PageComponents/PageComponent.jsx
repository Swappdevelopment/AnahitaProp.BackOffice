import React from "react";
import { observer, inject } from "mobx-react";
import { ButtonToolbar, Button, FormGroup, FormControl, Table, OverlayTrigger, DropdownButton, MenuItem, Popover, Modal } from "react-bootstrap";
import Datepicker from "react-datepicker";
import moment from "moment-es6";

import Helper from "../../Helper/Helper";
import { errorHandler } from "../ErrorHandler/ErrorHandler";

import ModalHandler from "../ModalHandler/ModalHandler";
import WaitControl from "../WaitControl/WaitControl";
import GridRowToolbar from "../GridRowToolbar/GridRowToolbar";

import PageActions from "./PageActions/PageActions";
import DataGrid from "./DataGrid/DataGrid";


import "./PageComponent.scss";

const PageComponent = inject("store")(
    observer(
        class PageComponent extends React.Component {

            constructor(props) {
                super(props);

                this.state = { isModalShown: false };

                this.modalHandler = props.modalHandler ? props.modalHandler : new ModalHandler();
                this.errorHandler = props.errorHandler;
                this.activeLang = this.props.store.langStore.active;

                this.renderSPage = this.renderSPage.bind(this);
            }

            renderSPage() {

                return (

                    <div>
                        {
                            this.props.hideActions ?
                                null
                                :
                                <PageActions {...this.props} />
                        }

                        <div className={this.props.notSPage ? '' : 'container'}>

                            {this.modalHandler.getComponent({
                                className: "s-page-modal",
                                header: this.props.getModalHeader ? this.props.getModalHeader() : null,
                                inRoot: this.props.getModalInRoot ? this.props.getModalInRoot() : null,
                                body: this.props.getModalBody ? this.props.getModalBody() : null,
                                footer: this.props.getModalFooter ? this.props.getModalFooter() : null,
                                onShow: () => {

                                    const args = {
                                        cancel: false
                                    };

                                    if (this.props.onModalShow) {

                                        this.props.onModalShow(args);
                                    }

                                    if (!args.cancel) {

                                        this.setState({ isModalShown: true });
                                    }
                                },
                                onHide: action => {

                                    const args = {
                                        cancel: false,
                                        action: action
                                    };

                                    if (this.props.onModalHide) {

                                        this.props.onModalHide(args);
                                    }

                                    if (!args.cancel) {

                                        this.setState({ isModalShown: false });
                                    }
                                }
                            })}

                            <DataGrid {...this.props} />

                        </div>
                    </div>

                );
            }

            render() {

                const style = {};

                if (this.props.hidePage) {
                    style.display = 'none';
                }

                const container = (
                    <div style={this.props.notSPage ? style : null}>
                        {
                            this.props.hideActions ?
                                null
                                :
                                <PageActions {...this.props} />
                        }
                        <div className={this.props.notSPage ? '' : 'container'}>

                            {this.modalHandler.getComponent({
                                className: "s-page-modal",
                                header: this.props.getModalHeader ? this.props.getModalHeader() : null,
                                inRoot: this.props.getModalInRoot ? this.props.getModalInRoot() : null,
                                body: this.props.getModalBody ? this.props.getModalBody() : null,
                                footer: this.props.getModalFooter ? this.props.getModalFooter() : null,
                                onShow: () => {

                                    const args = {
                                        cancel: false
                                    };

                                    if (this.props.onModalShow) {

                                        this.props.onModalShow(args);
                                    }

                                    if (!args.cancel) {

                                        this.setState({ isModalShown: true });
                                    }
                                },
                                onHide: action => {

                                    const args = {
                                        cancel: false,
                                        action: action
                                    };

                                    if (this.props.onModalHide) {

                                        this.props.onModalHide(args);
                                    }

                                    if (!args.cancel) {

                                        this.setState({ isModalShown: false });
                                    }
                                }
                            })}

                            <DataGrid {...this.props} />

                        </div>
                    </div>
                );

                if (this.props.notSPage) {

                    return container;
                }


                const sPageComponent = (
                    <div className={this.props.notSPage ? '' : 's-page'} style={style}>
                        {container}
                    </div>
                );

                if (this.props.isSibling) {

                    return sPageComponent;
                }


                let siblings = this.props.getSiblings ? this.props.getSiblings() : null;

                if (siblings && !Array.isArray(siblings)) {

                    siblings = [siblings];
                }

                return (

                    <div className="s-page-wrapper">
                        {errorHandler.getComponent()}

                        {sPageComponent}
                        {siblings}

                    </div>
                );
            }
        }
    )
);

export default PageComponent;
