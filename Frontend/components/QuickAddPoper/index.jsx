import React from 'react';

import { Overlay, OverlayTrigger, Button, Popover } from 'react-bootstrap';

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
                ref={r => this.target = r}
                style={{
                    marginTop: 4
                }}
                onClick={e => {

                    if (this.props.isOpen) {

                        this.onHide();
                    }
                    else {

                        this.onShow();
                    }

                    if (this.props.onClick)
                        this.props.onClick(e);
                }}
                className="s-btn-small-secondary-empty"
                disabled={this.props.disabled ? true : false}>
                <span className="la la-plus-square la-2x"></span>
            </Button>
        );

        if (this.props.tooltip) {

            return (
                <OverlayTrigger
                    placement="top"
                    rootClose
                    overlay={this.props.isOpen ? <span /> : Helper.getTooltip(`tltp-QuickAddPoper-${this.props.id}`, this.props.tooltip)}>
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

    onHide = () => {

        this.setState({ show: false });

        if (this.props.onHide)
            this.props.onHide();
    }

    render() {

        if (this.props.isWaitOn) {

            return (
                <span className="spinner" />
            );
        }

        const popStyles = {};

        if (this.props.width > 0) {
            popStyles.width = this.props.width;
            popStyles.maxWidth = this.props.width;
        }

        return (

            <div>
                <Overlay
                    rootClose={this.props.rootClose ? true : false}
                    show={this.props.isOpen}
                    onHide={this.onHide}
                    target={this.target}
                    placement={this.props.popPlacement ? this.props.popPlacement : 'bottom'}
                    container={this.props.container ? this.props.container : this}>

                    <Popover id={`pop-QuickAddPoper-${this.props.id}`} style={popStyles}>
                        {
                            this.props.title || !this.props.hideCloseButton ?
                                <div>
                                    <h4 className="clr-fore-primary">{this.props.title}</h4>
                                    {
                                        this.props.hideCloseButton ?
                                            null
                                            :
                                            <Button bsSize="xsmall" onClick={this.onHide}>
                                                <span className="la la-times"></span>
                                            </Button>
                                    }
                                </div>
                                :
                                null
                        }
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