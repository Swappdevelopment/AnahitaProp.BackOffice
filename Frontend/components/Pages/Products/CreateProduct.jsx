import React from 'react';
import { observer, inject } from 'mobx-react';
import { Row, Col, Button } from 'react-bootstrap';

import CreateProductViewModel from './CreateProductViewModel';

import ProductDetail1 from './ProductDetail1';
import ProductDetail2 from './ProductDetail2';
import ProductDetail3 from './ProductDetail3';
import ProductDetail4 from './ProductDetail4';
import ProductDetail5 from './ProductDetail5';


class CreateProduct extends React.Component {

    constructor(props) {

        super(props);

        this.activeLang = this.props.store.langStore.active;

        this.viewModel = props.viewModel;
        this.viewModel.execAction(self => self.createProduct = CreateProductViewModel.init(this.activeLang));
        this.wizardViewModel = this.viewModel.createProduct;

        this.errorHandler = props.errorHandler;
        this.modalHandler = props.modalHandler;


        if (props.isActive) {

            this.wizardViewModel.initNewProduct(this.props.store.langStore.allLanguages);
        }
    }

    componentWillReceiveProps(nextProps) {

        if (this.wizardViewModel) {

            if (nextProps.isActive !== this.props.isActive) {

                if (nextProps.isActive) {

                    this.wizardViewModel.initNewProduct(this.props.store.langStore.allLanguages);
                }
                else {

                    if (this.wizardViewModel.target && this.wizardViewModel.target.recordState !== 10 && this.wizardViewModel.target.id > 0) {

                        const temp = this.wizardViewModel.target;

                        this.wizardViewModel.detachNewProduct();
                        this.wizardViewModel.execAction(self => self.target = null);

                        this.viewModel.execAction(self => {
                            self.products.splice(0, 0, temp);
                            self.selectedValue = temp.id;
                        });
                    }
                    else {
                        this.wizardViewModel.execAction(self => self.target = null);
                    }
                }
            }
        }
    }


    getNewProduct = () => this.wizardViewModel.target


    render() {

        return (
            <div>
                {/* <h4>
                    {
                        (() => {

                            switch (this.wizardViewModel.stepsStack.length) {

                                case 1:
                                    return this.activeLang.labels['lbl_CoreInfo'];

                                case 2:
                                    return this.activeLang.labels['lbl_ProdType'];

                                case 3:
                                    return this.activeLang.labels['lbl_SecInfo'];

                                case 4:
                                    return this.activeLang.labels['lbl_DescsOptnls'];
                            }
                        })()
                    }
                </h4> */}
                {
                    this.wizardViewModel.stepsStack.map((stepName, i) => {

                        let content = null;

                        switch (i) {

                            case 0:
                                content = (
                                    <ProductDetail1
                                        viewModel={this.viewModel}
                                        getSelectedValue={this.getNewProduct}
                                        errorHandler={this.errorHandler}
                                        rootContainer={this} />
                                );
                                break;

                            case 1:
                                content = (
                                    <ProductDetail2
                                        viewModel={this.viewModel}
                                        getSelectedValue={this.getNewProduct}
                                        errorHandler={this.errorHandler} />
                                );
                                break;

                            case 2:
                                content = (
                                    <ProductDetail3
                                        viewsPlacement={'right'}
                                        viewModel={this.viewModel}
                                        getSelectedValue={this.getNewProduct}
                                        errorHandler={this.errorHandler}
                                        rootContainer={this} />
                                );
                                break;

                            case 3:
                                content = (
                                    <ProductDetail4
                                        viewModel={this.viewModel}
                                        getSelectedValue={this.getNewProduct}
                                        errorHandler={this.errorHandler} />
                                );
                                break;

                            case 4:
                                content = (
                                    <ProductDetail5
                                        viewModel={this.viewModel}
                                        getSelectedValue={this.getNewProduct}
                                        errorHandler={this.errorHandler} />
                                );
                                break;
                        }

                        return (
                            <div key={i} style={i === (this.wizardViewModel.stepsStack.length - 1) ? {} : { display: 'none' }}>
                                {content}
                            </div>
                        );
                    })
                }

                <Row>
                    <Col md={6}>
                        {
                            this.wizardViewModel.stepsStack.length > 1 ?
                                <Button
                                    className="s-btn-medium-primary"
                                    onClick={e => {

                                        if (this.wizardViewModel.stepsStack.length > 1) {

                                            this.wizardViewModel.execAction(self => {
                                                self.stepsStack.splice(self.stepsStack.length - 1, 1);
                                            });
                                        }
                                    }}>
                                    {this.activeLang.labels['lbl_Back']}
                                </Button>
                                :
                                null
                        }
                    </Col>
                    <Col md={6} style={{
                        display: 'flex',
                        justifyContent: 'flex-end'
                    }}>
                        <Button
                            className="s-btn-medium-primary"
                            onClick={e => {

                                if (this.wizardViewModel.stepsStack.length < 4) {

                                    if (this.wizardViewModel.target.recordState !== 0 || this.wizardViewModel.target.isModified()) {

                                        let proceed = false;

                                        switch (this.wizardViewModel.stepsStack.length) {

                                            case 1:
                                                if (this.wizardViewModel.isStep1Valid()) {

                                                    proceed = true;

                                                    const temp = this.getNewProduct();

                                                    if (temp) {

                                                        temp.execAction(() => temp.isGroup = this.props.isGroup ? true : false);
                                                    }
                                                }
                                                break;

                                            case 2:
                                                proceed = this.wizardViewModel.isStep2Valid();
                                                break;

                                            case 3:
                                            case 4:
                                                proceed = true;
                                                break;
                                        }

                                        if (proceed) {

                                            this.viewModel.saveProduct(
                                                this.wizardViewModel.target,
                                                result => {

                                                    if (result) {

                                                        this.wizardViewModel.execAction(self => {

                                                            if (self.target !== result) {
                                                                result.setOriginalValueProperty({ type: 0 });
                                                                self.target = result;
                                                            }

                                                            self.stepsStack.push('ProductDetail' + self.stepsStack.length);
                                                        });
                                                    }
                                                });
                                        }
                                    }
                                    else {

                                        this.wizardViewModel.execAction(self => {
                                            self.stepsStack.push('ProductDetail' + self.stepsStack.length);
                                        });
                                    }
                                }
                                else {

                                    this.viewModel.saveProduct(
                                        this.wizardViewModel.target,
                                        result => {

                                            this.props.modalHandler.hide();
                                        });
                                }
                            }}>
                            {this.activeLang.labels[this.wizardViewModel.stepsStack.length >= 4 ? 'lbl_Finish' : 'lbl_Next']}
                        </Button>
                    </Col>
                </Row>

            </div>
        );
    }
}


export default inject('store')(observer(CreateProduct));