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
            <ButtonToolbar style={{ display: 'flex', justifyContent: 'flex-end'}}>
                <ButtonGroup>
                    <OverlayTrigger
                        placement="top"
                        rootClose
                        overlay={Helper.getTooltip(
                            "tltpRevert",
                            this.activeLang.labels["lbl_Revert"]
                        )}>
                        <Button
                            style={{ marginRight: 10 }}
                            className="s-btn-small-blue"
                            onClick={this.props.undoManager ? this.props.undoManager.revert : null}>
                            <span className="la la-refresh"></span>
                        </Button>
                    </OverlayTrigger>

                    <OverlayTrigger
                        placement="top"
                        rootClose
                        overlay={Helper.getTooltip(
                            "tltpEdit",
                            this.activeLang.labels["lbl_Undo"]
                        )}>
                        <Button
                            className="s-btn-small-secondary"
                            onClick={this.props.undoManager ? this.props.undoManager.undo : null}>
                            <span className="la la-undo"></span>
                        </Button>
                    </OverlayTrigger>
                </ButtonGroup>
            </ButtonToolbar >
        );
    }
}