import React from 'react';

import { Button, ButtonToolbar, ButtonGroup, OverlayTrigger } from "react-bootstrap";

import Helper from '../../../Helper/Helper';


export default class ProductDetailToolBar extends React.Component {

    constructor(props) {

        super(props);

        this.activeLang = props.activeLang ? props.activeLang : { labels: {} };
    }

    render() {

        return (
            <div style={{ display: 'flex', flexDirection: 'row' }}>
                <div style={{ display: 'flex', flex: 1, justifyContent: 'flex-start', marginBottom: 20 }}>
                    {
                        this.props.isReadOnly ?
                            null
                            :
                            <OverlayTrigger
                                placement="top"
                                rootClose
                                overlay={Helper.getTooltip(
                                    "tltpDelete",
                                    this.activeLang.labels["lbl_Revert"]
                                )}>
                                <Button
                                    style={{ marginRight: 5 }}
                                    className="s-btn-small-red"
                                    onClick={e => {

                                        if (this.props.undoManager) {

                                            this.props.undoManager.revert();
                                        }

                                        if (this.props.onRevert) {

                                            this.props.onRevert();
                                        }
                                    }}>
                                    <span className="la la-close"></span>
                                </Button>
                            </OverlayTrigger>
                    }

                    {
                        this.props.isReadOnly ?
                            null
                            :
                            <OverlayTrigger
                                placement="top"
                                rootClose
                                overlay={Helper.getTooltip(
                                    "tltpRevert",
                                    this.activeLang.labels["lbl_Undo"]
                                )}>
                                <Button
                                    className="s-btn-small-blue"
                                    onClick={this.props.undoManager ? this.props.undoManager.undo : null}>
                                    <span className="la la-undo"></span>
                                </Button>
                            </OverlayTrigger>
                    }</div>
                <div style={{ display: 'flex', flex: 1, justifyContent: 'flex-end', marginBottom: 20 }}>
                    {
                        this.props.isReadOnly ?
                            <OverlayTrigger
                                placement="top"
                                rootClose
                                overlay={Helper.getTooltip(
                                    "tltpEdit",
                                    this.activeLang.labels["lbl_Edit"]
                                )}>
                                <Button
                                    className="s-btn-small-secondary"
                                    onClick={e => {

                                        if (this.props.onEdit) {

                                            this.props.onEdit(e);
                                        }
                                    }}>
                                    <span className="la la-pencil"></span>
                                </Button>
                            </OverlayTrigger>
                            :
                            <Button
                                className="s-btn-small-primary">
                                <span className="la la-save"></span>
                            </Button>
                    }</div>
            </div>

            // <ButtonToolbar style={{ display: 'flex' }}>
            //     <ButtonGroup style={{ display: 'flex', justifyContent: 'flex-end' }}>
            // {
            //     this.props.isReadOnly ?
            //         <OverlayTrigger
            //             placement="top"
            //             rootClose
            //             overlay={Helper.getTooltip(
            //                 "tltpEdit",
            //                 this.activeLang.labels["lbl_Edit"]
            //             )}>
            //             <Button
            //                 style={{ marginRight: 10 }}
            //                 className="s-btn-small-secondary"
            //                 onClick={e => {

            //                     if (this.props.onEdit) {

            //                         this.props.onEdit(e);
            //                     }
            //                 }}>
            //                 <span className="la la-pencil"></span>
            //             </Button>
            //         </OverlayTrigger>
            //         :
            //         null
            // }

            //         {
            //             this.props.isReadOnly ?
            //                 null
            //                 :
            //                 <OverlayTrigger
            //                     placement="top"
            //                     rootClose
            //                     overlay={Helper.getTooltip(
            //                         "tltpRevert",
            //                         this.activeLang.labels["lbl_Revert"]
            //                     )}>
            //                     <Button
            //                         style={{ marginRight: 10 }}
            //                         className="s-btn-small-blue"
            //                         onClick={e => {

            //                             if (this.props.undoManager) {

            //                                 this.props.undoManager.revert();
            //                             }

            //                             if (this.props.onRevert) {

            //                                 this.props.onRevert();
            //                             }
            //                         }}>
            //                         <span className="la la-refresh"></span>
            //                     </Button>
            //                 </OverlayTrigger>
            //         }

            //         {
            //             this.props.isReadOnly ?
            //                 null
            //                 :
            //                 <OverlayTrigger
            //                     placement="top"
            //                     rootClose
            //                     overlay={Helper.getTooltip(
            //                         "tltpEdit",
            //                         this.activeLang.labels["lbl_Undo"]
            //                     )}>
            //                     <Button
            //                         className="s-btn-small-secondary"
            //                         onClick={this.props.undoManager ? this.props.undoManager.undo : null}>
            //                         <span className="la la-undo"></span>
            //                     </Button>
            //                 </OverlayTrigger>
            //         }

            //     </ButtonGroup>
            // </ButtonToolbar >
        );
    }
}