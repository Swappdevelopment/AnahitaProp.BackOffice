import React from 'react';
import { observer, inject } from 'mobx-react';
import { Button, OverlayTrigger, Popover } from "react-bootstrap";

import Helper from '../../Helper/Helper';

const GridRowToolbar =
    inject('store')(
        observer(
            class GridRowToolbar extends React.Component {

                constructor(props) {

                    super(props);

                    this.activeLang = props.store.langStore.active;

                    this.currentValue = props.currentValue;

                    this.popDeleteConfirm = this.popDeleteConfirm.bind(this);
                    this.popOverRowError = this.popOverRowError.bind(this);
                }

                popDeleteConfirm() {

                    if (this.currentValue) {

                        return (
                            <Popover
                                id={`popDelete-${this.currentValue.genId}`}
                                className={`popDelete-${this.currentValue.genId}`}
                                title={
                                    <div>
                                        <span className="la la-exclamation-circle">&nbsp;</span>
                                        {this.props.deleteTitle}
                                    </div>}>

                                <p>{this.activeLang.msgs['msg_SureDelete'].replace('{1}', this.props.displayName)}</p>

                                <div style={{ paddingTop: '8px', textAlign: 'center' }}>
                                    <Button
                                        className="s-btn-small-redDark"
                                        onClick={e => {

                                            if (this.props.onDelete && !this.props.deleteButtonDisabled) {

                                                this.props.onDelete(e);
                                            }
                                        }}
                                    >{this.activeLang.labels['lbl_Delete']}</Button>
                                </div>

                            </Popover>
                        );
                    }
                }

                popOverRowError() {
                    return (
                        <Popover id="popError" title={this.activeLang.labels['lbl_ErrWhlSvng']}>
                            {Helper.stringToParagraphs(this.currentValue.error)}
                        </Popover >
                    );
                }

                render() {

                    return (
                        <td className="s-td-cell-controls">
                            {
                                this.currentValue.isSaving ?
                                    <OverlayTrigger
                                        placement="top"
                                        rootClose
                                        overlay={Helper.getTooltip(`tltpSaving-${this.currentValue.genId}`, `${this.activeLang.labels["lbl_Saving"]}...`)}>
                                        <i style={{ position: 'absolute', top: '10px', right: '44px' }} className="spinner"></i>
                                    </OverlayTrigger>
                                    :
                                    <div>

                                        {
                                            this.currentValue.error ?
                                                <OverlayTrigger
                                                    rootClose
                                                    trigger="click"
                                                    placement="left"
                                                    overlay={this.popOverRowError()}>
                                                    <OverlayTrigger
                                                        placement="top"
                                                        rootClose
                                                        overlay={Helper.getTooltip(
                                                            `tltpError-${this.currentValue.genId}`,
                                                            `${this.activeLang.labels["lbl_Error"]}...`
                                                        )}>
                                                        <Button
                                                            style={{ marginRight: '5px' }}
                                                            className="s-btn-small-redDark-empty">
                                                            <span className="la la-exclamation-circle la-lg" />
                                                        </Button>
                                                    </OverlayTrigger>
                                                </OverlayTrigger>
                                                :
                                                <div>

                                                    {
                                                        this.props.hideEdit ?
                                                            null
                                                            :
                                                            <OverlayTrigger
                                                                placement="top"
                                                                rootClose
                                                                overlay={Helper.getTooltip(
                                                                    `tltpEdit-${this.currentValue.genId}`,
                                                                    this.props.tltpEdit ? this.props.tltpEdit : this.activeLang.labels["lbl_Edit"]
                                                                )}>
                                                                <Button
                                                                    className="s-btn-small-edit"
                                                                    disabled={this.props.editButtonDisabled}
                                                                    onClick={this.props.onEdit}>
                                                                    <span className="la la-pencil" />
                                                                </Button>

                                                            </OverlayTrigger>
                                                    }

                                                    {
                                                        this.props.hideDelete ?
                                                            null
                                                            :
                                                            <OverlayTrigger
                                                                rootClose
                                                                trigger="click"
                                                                placement="left"
                                                                overlay={this.popDeleteConfirm(this.currentValue)}>
                                                                <OverlayTrigger
                                                                    placement="top"
                                                                    rootClose
                                                                    overlay={Helper.getTooltip(
                                                                        `tltpDelete-${this.currentValue.genId}`,
                                                                        this.activeLang.labels["lbl_Delete"]
                                                                    )}>
                                                                    <Button
                                                                        className="s-btn-small-delete"
                                                                        disabled={this.props.deleteButtonDisabled}>
                                                                        <span className="la la-remove" />
                                                                    </Button>
                                                                </OverlayTrigger>
                                                            </OverlayTrigger>
                                                    }
                                                </div>

                                        }


                                    </div>

                            }

                        </td>
                    );
                }
            }));

export default GridRowToolbar;