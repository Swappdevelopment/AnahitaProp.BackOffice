import React from 'react';
import { observer, inject } from 'mobx-react';

import { Row, Col } from "react-bootstrap";
import LazyLoad from 'react-lazy-load';

import PageActions from '../../PageComponents/PageActions/PageActions';
import ProductDetail1 from './ProductDetail1';
import ProductDetail2 from './ProductDetail2';
import ProductDetail3 from './ProductDetail3';
import ProductDetail4 from './ProductDetail4';
import ProductDetail5 from './ProductDetail5';


class ProductDetail extends React.Component {

    constructor(props) {

        super(props);

        this.viewModel = props.viewModel;
        this.errorHandler = props.errorHandler;
    }


    getSideScrollNav = () => {

        return {
            isLeftVisible: () => {

                return this.viewModel.getSelectedValueIndex() > 0;
            },
            isRightVisible: () => {

                return this.viewModel.getSelectedValueIndex() < (this.viewModel.products.length - 1)
            },
            getLeftLabel: () => {

                const index = this.viewModel.getSelectedValueIndex();

                if (index > 0) {

                    return this.viewModel.products[index - 1].getNameAndCode();
                }

                return '';
            },
            getRightLabel: () => {

                const index = this.viewModel.getSelectedValueIndex();

                if (index < (this.viewModel.products.length - 1)) {

                    return this.viewModel.products[index + 1].getNameAndCode();
                }

                return '';
            },
            onLeftClick: e => {

                const index = this.viewModel.getSelectedValueIndex();

                if (index > 0) {

                    this.viewModel.execAction(self => {

                        self.selectedValue = self.products[index - 1];
                    });
                }
            },
            onRightClick: e => {

                let index = this.viewModel.getSelectedValueIndex();

                if (index < (this.viewModel.products.length - 1)) {

                    this.viewModel.execAction(self => {

                        self.selectedValue = self.products[index + 1];
                    });

                    index = this.viewModel.getSelectedValueIndex();

                    if (index < (this.viewModel.products.length - 1)
                        && this.viewModel.products[index + 1].isLazyWait
                        && this.props.goLazyWait) {

                        this.props.goLazyWait();
                    }
                }
            }
        };
    }

    render() {

        let statusColor = null;

        if (this.viewModel.selectedValue) {

            switch (this.viewModel.selectedValue.recordState) {

                case 10:
                    statusColor = 's-circle s-status-add';
                    break;

                case 30:
                    statusColor = 's-circle s-status-delete';
                    break;

                default:

                    if (this.viewModel.selectedValue.isModified()) {

                        statusColor = 's-circle s-status-edit';
                    }
                    break;
            }
        }


        return (
            <div className="s-page">

                <PageActions
                    sideScrollNav={this.getSideScrollNav()}
                    paTitle={this.viewModel.selectedValue.getNameAndCode()}
                    paTitleClick={e => {
                        this.viewModel.execAction(self => {

                            self.selectedValue = null;
                        });
                    }}
                    paShowSaveButton={() => true}
                    saveBtnDisabled={() => !this.viewModel.selectedValue || !this.viewModel.selectedValue.requiresSave()}
                    paGlobalSaveOnClick={() => this.viewModel.saveProduct(this.viewModel.selectedValue)}
                    hideAdd />

                <div className="container">
                    <Row>
                        <Col md={9} mdOffset={1}>
                            <div className="s-portlet" style={{ padding: '30px 40px' }}>
                                <ProductDetail1 viewModel={this.viewModel} errorHandler={this.errorHandler} />
                            </div>
                            <br />
                            <LazyLoad debounce={false}>
                                <div className="s-portlet" style={{ padding: '30px 40px' }}>
                                    <ProductDetail2 viewModel={this.viewModel} errorHandler={this.errorHandler} />
                                </div>
                            </LazyLoad>
                            <br />
                            <LazyLoad debounce={false}>
                                <div className="s-portlet" style={{ padding: '30px 40px' }}>
                                    <ProductDetail3 viewModel={this.viewModel} errorHandler={this.errorHandler} rootContainer={this} />
                                </div>
                            </LazyLoad>
                            <br />
                            <LazyLoad debounce={false}>
                                <div className="s-portlet" style={{ padding: '30px 40px' }}>
                                    <ProductDetail4 viewModel={this.viewModel} errorHandler={this.errorHandler} />
                                </div>
                            </LazyLoad>
                            <br />
                            <LazyLoad debounce={false}>
                                <div className="s-portlet" style={{ padding: '30px 40px' }}>
                                    <ProductDetail5 viewModel={this.viewModel} errorHandler={this.errorHandler} />
                                </div>
                            </LazyLoad>
                        </Col>
                    </Row>
                </div>

            </div>
        );
    }
}


export default inject('store')(observer(ProductDetail));