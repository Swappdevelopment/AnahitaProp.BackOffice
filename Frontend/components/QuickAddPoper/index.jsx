import React from 'react';

import { Overlay, OverlayTrigger, Button, Popover } from 'react-bootstrap';

import Helper from '../../Helper/Helper';


export default class QuickAddPoper extends React.Component {

    constructor(props) {

        super(props);

        this.state = { show: false };
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
                ref={r => this.target = r}
                style={{
                    marginTop: 4
                }}
                onClick={e => {

                    if (this.state.show) {

                        this.onClose();
                    }
                    else {

                        this.onShow();
                    }

                    if (this.props.onClick)
                        this.props.onClick(e);
                }}
                className="s-btn-small-secondary-empty"
                disabled={this.props.disabled ? true : false}>
                <span className="flaticon-add"></span>
            </Button>
        );

        if (this.props.tooltip) {

            return (
                <OverlayTrigger
                    placement="top"
                    rootClose
                    overlay={this.state.show ? <span /> : Helper.getTooltip(`tltp-QuickAddPoper-${this.props.id}`, this.props.tooltip)}>
                    {btnPop}
                </OverlayTrigger>
            );
        }

        return btnPop;
    }

    onShow = () => {

        this.setState({ show: true });

        if (this.props.onShow)
            this.props.onShow();
    }

    onClose = () => {

        this.setState({ show: false });

        if (this.props.onHide)
            this.props.onHide();
    }

    render() {

        let ovt = null;

        this.onHide = () => {

            if (ovt) {
                ovt.hide();
            }
        };

        return (

            <div>
                <Overlay
                    rootClose
                    show={this.state.show}
                    onHide={this.onClose}
                    target={this.target}
                    placement={this.props.popPlacement ? this.props.popPlacement : 'bottom'}
                    container={this.props.container ? this.props.container : this}>

                    <Popover id={`pop-QuickAddPoper-${this.props.id}`}>
                        <div style={{ padding: '10px 20px' }}>
                            {this.props.children}
                        </div>
                    </Popover>

                </Overlay>
                {this.getPopActionComponent()}
            </div>
        );
    }
}