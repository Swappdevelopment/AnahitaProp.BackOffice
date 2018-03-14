import React from "react";
import ReactDOM from "react-dom";

import { observer, inject } from "mobx-react";
import { Button, OverlayTrigger, FormControl, DropdownButton, MenuItem } from "react-bootstrap";
import { bootstrapUtils } from 'react-bootstrap/lib/utils';

import Helper from "../../../Helper/Helper";


import "./PageActions.scss";

const PageActions = inject("store")(
    observer(
        class PageActions extends React.Component {

            constructor(props) {
                super(props);

                this.activeLang = props.store.langStore.active;

                this.state = { statusType: 1 };
                bootstrapUtils.addStyle(Button, 'none');

                this.handleScroll = this.handleScroll.bind(this);
            }

            componentDidMount() {

                window.addEventListener('scroll', this.handleScroll);
            }

            componentWillUnmount() {

                window.removeEventListener('scroll', this.handleScroll);

                this.affixTarget = null;
            }

            handleScroll(e) {

                if (e.srcElement.scrollingElement.scrollTop >= 73) {

                    this.setState({
                        affix: true
                    });
                }
                else {
                    this.setState({
                        affix: false
                    });
                }
            }

            render() {

                const style = {};

                if (this.props.hidePage) {
                    style.display = 'none';
                }

                const sideScrollNav = this.props.sideScrollNav;

                return (

                    <div className="s-page-action-wrapper">

                        <div style={style} ref={r => this.affixTarget = ReactDOM.findDOMNode(r)} className={this.state.affix ? 's-page-action-affix' : 's-page-action'}>

                            <div className="container">
                                {
                                    this.props.paTitleClick ?
                                        <a className='s-page-action-back' onClick={this.props.paTitleClick}>
                                            <h3 className="s-page-header">
                                                <span style={{ marginRight: '5px' }} className="la la-arrow-left" />
                                                {this.props.paTitle}
                                            </h3>
                                        </a>
                                        :
                                        <h3 className="s-page-header">
                                            {this.props.paTitle}
                                        </h3>
                                }

                                <div className="s-page-action-refresh">

                                    <OverlayTrigger
                                        placement="top"
                                        rootClose
                                        overlay={Helper.getTooltip(
                                            "tltpTopRefresh",
                                            this.activeLang.labels["lbl_Refresh"]
                                        )}>
                                        <Button
                                            className="s-btn-small-secondary-empty"
                                            onClick={e => {

                                                if (this.props.paRefresh)
                                                    this.props.paRefresh();
                                            }}>
                                            <i className="flaticon-refresh" />
                                        </Button>

                                    </OverlayTrigger>

                                </div>

                                <div className={this.props.hideAdd ? 'hidden' : 's-page-action-add'}>

                                    <OverlayTrigger
                                        placement="top"
                                        rootClose
                                        overlay={Helper.getTooltip(
                                            "tltpTopAdd",
                                            this.activeLang.labels["lbl_Add"]
                                        )}>
                                        <Button
                                            className="s-btn-small-secondary-empty"
                                            onClick={e => {

                                                if (this.props.paOnAdd)
                                                    this.props.paOnAdd();
                                            }}>
                                            <i className="flaticon-add" />
                                        </Button>

                                    </OverlayTrigger>

                                </div>

                                <div className={this.props.hideStatus ? 'hidden' : 's-page-action-status s-dropdown-status hidden-xs hidden-sm'}>

                                    <DropdownButton
                                        id="drpStatus"
                                        className="s-btn-medium-gray-empty-secondary"
                                        bsStyle="none"
                                        noCaret
                                        title={
                                            this.activeLang.labels[`lbl_Active_${this.state.statusType < 0 ? '' : this.state.statusType}`]
                                        }>

                                        <div className="s-dropdown-wrapper">
                                            <span className="s-dropdown-arrow"></span>

                                            <div className="s-dropdown-content">

                                                <MenuItem
                                                    className={this.state.statusType == -1 ? 'active' : ''}
                                                    onClick={e => {

                                                        if (this.props.paStatusAll) {

                                                            this.props.paStatusAll();
                                                        }

                                                        this.setState({ statusType: -1 })
                                                    }}>
                                                    {this.activeLang.labels['lbl_Active_']}
                                                </MenuItem>
                                                <MenuItem
                                                    className={this.state.statusType == 1 ? 'active' : ''}
                                                    onClick={e => {

                                                        if (this.props.paStatusActive) {

                                                            this.props.paStatusActive();
                                                        }

                                                        this.setState({ statusType: 1 })
                                                    }}>
                                                    {this.activeLang.labels['lbl_Active_1']}
                                                </MenuItem>
                                                <MenuItem
                                                    className={this.state.statusType == 0 ? 'active' : ''}
                                                    onClick={e => {

                                                        if (this.props.paStatusInactive) {

                                                            this.props.paStatusInactive();
                                                        }

                                                        this.setState({ statusType: 0 })
                                                    }}>
                                                    {this.activeLang.labels['lbl_Active_0']}
                                                </MenuItem>


                                            </div>
                                        </div>
                                    </DropdownButton>
                                </div>

                                <div className={this.props.hideStatus ? 'hidden' : 's-page-action-status s-dropdown-status visible-xs visible-sm'}>

                                    <OverlayTrigger
                                        placement="top"
                                        rootClose
                                        overlay={Helper.getTooltip(
                                            "tltpTopStatus",
                                            this.activeLang.labels["lbl_Status"]
                                        )}>
                                        <DropdownButton
                                            id="drpStatus"
                                            className="s-btn-small-secondary-empty"
                                            bsStyle="none"
                                            noCaret
                                            title={
                                                <i className="flaticon-mark" />
                                            }>

                                            <div className="s-dropdown-wrapper">
                                                <span className="s-dropdown-arrow"></span>

                                                <div className="s-dropdown-content">

                                                    <MenuItem
                                                        className={this.state.statusType == -1 ? 'active' : ''}
                                                        onClick={e => {

                                                            if (this.props.paStatusAll) {

                                                                this.props.paStatusAll();
                                                            }

                                                            this.setState({ statusType: -1 })
                                                        }}>
                                                        {this.activeLang.labels['lbl_Active_']}
                                                    </MenuItem>
                                                    <MenuItem
                                                        className={this.state.statusType == 1 ? 'active' : ''}
                                                        onClick={e => {

                                                            if (this.props.paStatusActive) {

                                                                this.props.paStatusActive();
                                                            }

                                                            this.setState({ statusType: 1 })
                                                        }}>
                                                        {this.activeLang.labels['lbl_Active_1']}
                                                    </MenuItem>
                                                    <MenuItem
                                                        className={this.state.statusType == 0 ? 'active' : ''}
                                                        onClick={e => {

                                                            if (this.props.paStatusInactive) {

                                                                this.props.paStatusInactive();
                                                            }

                                                            this.setState({ statusType: 0 })
                                                        }}>
                                                        {this.activeLang.labels['lbl_Active_0']}
                                                    </MenuItem>


                                                </div>
                                            </div>
                                        </DropdownButton>
                                    </OverlayTrigger>
                                </div>

                                <div className={this.props.hideSave ? 'hidden' : 's-page-action-save'}>

                                    {
                                        this.props.paShowSaveButton && this.props.paShowSaveButton() ?

                                            <Button
                                                className="s-btn-medium-primary"
                                                disabled={this.props.saveBtnDisabled && this.props.saveBtnDisabled()}
                                                onClick={e => {

                                                    if (this.props.paGlobalSaveOnClick)
                                                        this.props.paGlobalSaveOnClick();
                                                }}
                                                onClick={this.props.paGlobalSaveOnClick}>
                                                {this.activeLang.labels["lbl_Save"]}
                                            </Button>
                                            :
                                            null
                                    }

                                </div>

                                {
                                    sideScrollNav ?
                                        <div>
                                            {
                                                sideScrollNav.isLeftVisible && sideScrollNav.isLeftVisible() ?
                                                    <OverlayTrigger
                                                        placement="top"
                                                        rootClose
                                                        overlay={
                                                            Helper.getTooltip(
                                                                `tltpPageLeftNav-${this.props.key}`,
                                                                sideScrollNav.getLeftLabel ? sideScrollNav.getLeftLabel() : '')}>
                                                        <div
                                                            className={this.props.hidePrev ? 'hidden' : 's-page-action-prev hidden-xs hidden-sm'}
                                                            onClick={sideScrollNav.onLeftClick}>
                                                            <i className="la la-arrow-left"></i>
                                                        </div>
                                                    </OverlayTrigger>
                                                    :
                                                    null
                                            }
                                            {
                                                sideScrollNav.isRightVisible && sideScrollNav.isRightVisible() ?
                                                    <OverlayTrigger
                                                        placement="top"
                                                        rootClose
                                                        overlay={
                                                            Helper.getTooltip(
                                                                `tltpPageRightNav`,
                                                                sideScrollNav.getRightLabel ? sideScrollNav.getRightLabel() : '')}>
                                                        <div
                                                            className={this.props.hideNext ? 'hidden' : 's-page-action-next hidden-xs hidden-sm'}
                                                            onClick={sideScrollNav.onRightClick}>
                                                            <i className="la la-arrow-right"></i>
                                                        </div>
                                                    </OverlayTrigger>
                                                    :
                                                    null
                                            }
                                        </div>
                                        :
                                        null
                                }

                                <div className={this.props.hideActive ? 'hidden' : 's-page-action-active'}>
                                    <Button
                                        className="s-btn-large-green">
                                        {this.activeLang.labels["lbl_Active"]}
                                    </Button>

                                </div>
                            </div>

                        </div >
                    </div >
                );
            }
        }
    )
);

export default PageActions;
