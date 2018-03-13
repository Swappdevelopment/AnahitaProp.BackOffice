import React from 'react';

import { OverlayTrigger, Button, Popover } from 'react-bootstrap';

import Helper from '../../Helper/Helper';


export default class QuickAddPoper extends React.Component {

    constructor(props) {

        super(props);
    }

    componentWillReceiveProps(newProps) {

        if (newProps && newProps.isOpen !== this.props.isOpen) {

            if (!newProps.isOpen && this.onHide) {

                this.onHide();
            }
        }
    }


    getPopActionComponent = () => {

        if (this.props.popActionComponent) {

            return this.props.popActionComponent;
        }


        const btnPop = (
            <Button
                style={{
                    marginTop: 4
                }}
                className="s-btn-small-secondary-empty"
                disabled={this.props.isActionDisable ? this.props.isActionDisable() : false}>
                <span className="flaticon-add"></span>
            </Button>
        );


        if (this.props.tooltip) {

            return (

                <OverlayTrigger
                    placement="top"
                    rootClose
                    overlay={Helper.getTooltip(`tltp-QuickAddPoper-${this.props.id}`, this.props.tooltip)}>
                    {btnPop}
                </OverlayTrigger>
            );
        }

        return btnPop;
    }

    render() {

        let ovt = null;

        this.onHide = () => {

            if (ovt) {
                ovt.hide();
            }
        };

        return (
            <OverlayTrigger
                ref={r => {
                    ovt = r;
                    if (ovt && this.props.isOpen) {
                        ovt.show();
                    }
                }}
                rootClose
                trigger="click"
                placement={this.props.popPlacement ? this.props.popPlacement : 'bottom'}
                container={this.props.container ? this.props.container : this}
                overlay={<Popover id={`pop-QuickAddPoper-${this.props.id}`}>{this.props.children}</Popover>}>
                {this.getPopActionComponent()}
            </OverlayTrigger>
        );
    }
}