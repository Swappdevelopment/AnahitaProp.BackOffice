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
            <ButtonToolbar style={{ marginLeft: -25, marginBottom: 20 }}>
                <ButtonGroup>
                    <OverlayTrigger
                        placement="top"
                        rootClose
                        overlay={Helper.getTooltip(
                            "tltpProdDtl1-revert",
                            this.activeLang.labels["lbl_Revert"]
                        )}>
                        <Button
                            onClick={this.props.undoManager ? this.props.undoManager.revert : null}>
                            <span className="la la-refresh"></span>
                        </Button>
                    </OverlayTrigger>

                    <OverlayTrigger
                        placement="top"
                        rootClose
                        overlay={Helper.getTooltip(
                            "tltpProdDtl1-undo",
                            this.activeLang.labels["lbl_Undo"]
                        )}>
                        <Button
                            onClick={this.props.undoManager ? this.props.undoManager.undo : null}>
                            <span className="la la-undo"></span>
                        </Button>
                    </OverlayTrigger>
                </ButtonGroup>
            </ButtonToolbar>
        );
    }
}