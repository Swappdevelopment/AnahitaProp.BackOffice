import React from 'react';
import { inject } from 'mobx-react';
import { Modal, Button } from 'react-bootstrap';

import Helper from '../../Helper/Helper';


const ModalComponent =
    inject('store')(
        class ModalComponent extends React.Component {

            constructor(props) {

                super(props);

                this.activeLang = this.props.store.langStore.active;

                this.state = { show: false, inDOM: false };

                this.show = this.show.bind(this);
                this.hide = this.hide.bind(this);

                props.inner.show = this.show;
                props.inner.hide = this.hide;
            }

            show() {

                this.setState({ show: true, inDOM: true });

                if (this.props.onShow) {

                    this.props.onShow();
                }
            }

            hide(param1, param2, param3) {

                this.setState({ show: false });

                if (this.props.onHide) {

                    this.props.onHide(param1, param2, param3);
                }
            }

            render() {

                const modalClassName = (this.props.className ? this.props.className : '') + (this.props.textCenter ? 'text-center' : '');

                return (
                    this.state.inDOM ?

                        <Modal show={this.state.show} onHide={() => this.hide()} className={modalClassName}>
                            {this.props.inRoot}
                            {
                                this.props.header ?
                                    <Modal.Header closeButton>
                                        {
                                            typeof (this.props.header) === 'string' ?
                                                <Modal.Title>{this.props.header}</Modal.Title>
                                                :
                                                this.props.header
                                        }
                                    </Modal.Header>
                                    :
                                    null
                            }
                            {
                                this.props.body ?
                                    <Modal.Body>
                                        {this.props.body}
                                    </Modal.Body>
                                    :
                                    null
                            }
                            {
                                this.props.footer ?
                                    <Modal.Footer>
                                        {this.props.footer}
                                    </Modal.Footer>
                                    :
                                    null
                            }
                        </Modal>
                        :
                        null
                );
            }
        });


export default class ModalHandler {

    constructor() {

        this.inner = {
            show: null,
            hide: null,
        };

        this.getComponent = this.getComponent.bind(this);
        this.show = this.show.bind(this);
        this.hide = this.hide.bind(this);
    }

    getComponent(options) {

        return (
            <ModalComponent {...Object.assign({ inner: this.inner }, options)} />
        );
    }

    show() {

        if (this.inner && this.inner.show) {

            this.inner.show();
        }
    }

    hide(param1, param2, param3) {

        if (this.inner && this.inner.hide) {

            this.inner.hide(param1, param2, param3);
        }
    }
}