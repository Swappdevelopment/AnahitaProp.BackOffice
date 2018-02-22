import React from 'react';
import { inject } from 'mobx-react';
import { Modal, Button } from 'react-bootstrap';

import Helper from '../../Helper/Helper';

import './ErrorHandler.scss';

const ErrorComponent =
    inject('store')(
        class ErrorComponent extends React.Component {

            constructor(props) {

                super(props);

                this.activeLang = this.props.store.langStore.active;

                this.state = { title: null, message: null, show: false };

                this.closeModal = this.closeModal.bind(this);
                this.show = this.show.bind(this);

                props.inner.show = this.show;
            }

            closeModal(e) {

                this.setState({ title: null, message: null, show: false });
            }

            show(title, message) {

                this.setState({ title: title, message: message, show: true });
            }

            render() {
                
                return (
                    this.state.show ?

                        <Modal show={true} onHide={this.closeModal} className="text-center">
                            <Modal.Header closeButton>
                                <Modal.Title>{this.state.title}</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                {this.state.message}
                            </Modal.Body>
                            <Modal.Footer>
                                <Button className="btn btn-green-primary" onClick={this.closeModal}>{this.activeLang.labels['lbl_Close']}</Button>
                            </Modal.Footer>
                        </Modal>
                        :
                        null
                );
            }
        });

        
export default class ErrorHandler {

    constructor() {

        this.inner = {
            show: null
        };

        this.show = this.show.bind(this);
        this.showFromLang = this.showFromLang.bind(this);
    }

    getComponent() {

        return (
            <ErrorComponent inner={this.inner} />
        );
    }

    show(title, message) {

        if (this.inner && this.inner.show) {

            this.inner.show(title, message);
        }
    }

    showFromLang(activeLang) {

        this.show(activeLang.labels['lbl_SmthngWrng'], Helper.stringToParagraphs(activeLang.msgs['errMsg_Aplgs']));
    }

}

const errorHandler = new ErrorHandler();

export { errorHandler, ErrorComponent };