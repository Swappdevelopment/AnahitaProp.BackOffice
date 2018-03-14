import React from 'react';
import { observer, inject } from 'mobx-react';

import { Row, Col } from "react-bootstrap";
import LazyLoad from 'react-lazy-load';

import Switch from '../../Sw_Switch';

import PageActions from '../../PageComponents/PageActions/PageActions';
import ProductDetail1 from './ProductDetail1';
import ProductDetail2 from './ProductDetail2';
import ProductDetail3 from './ProductDetail3';
import ProductDetail4 from './ProductDetail4';
import ProductDetail5 from './ProductDetail5';

import ProductEditViewModel from './ProductEditViewModel';


class ProductDetail extends React.Component {

    constructor(props) {

        super(props);

        this.editViewModel = ProductEditViewModel.init();

        this.viewModel = props.viewModel;
        this.activeLang = this.props.store.langStore.active;
        this.errorHandler = props.errorHandler;
    }

    componentWillMount() {

        document.documentElement.scrollTop = 0;
    }

    getSelectedValue = () => this.props.isSubProduct ? this.viewModel.selectedSubValue : this.viewModel.selectedValue


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

        const prodModel = this.getSelectedValue();

        let statusColor = null;

        if (prodModel) {

            switch (prodModel.recordState) {

                case 10:
                    statusColor = 's-circle s-status-add';
                    break;

                case 30:
                    statusColor = 's-circle s-status-delete';
                    break;

                default:

                    if (prodModel.isModified()) {

                        statusColor = 's-circle s-status-edit';
                    }
                    break;
            }
        }


        return (
            <div className="s-page">
                <PageActions
                    sideScrollNav={this.getSideScrollNav()}
                    paTitle={
                        prodModel ?
                            prodModel.group ?
                                <span style={{ marginBottom: 20 }}>

                                    <span style={{ fontSize: 16 }}>
                                        <span>{this.activeLang.labels['lbl_Group']}</span>
                                        <span className="la la-angle-right" style={{ margin: '0 8px' }}></span>
                                        <span>{prodModel.group.getNameAndCode()}</span>
                                        <span className="la la-angle-right" style={{ margin: '0 8px' }}></span>
                                    </span>

                                    <span style={{ color: 'black' }}>{prodModel.getNameAndCode()}</span>
                                </span>
                                :
                                prodModel.getNameAndCode()
                            :
                            null
                    }
                    paTitleClick={e => {
                        this.viewModel.execAction(self => {

                            if (this.props.isSubProduct) {
                                self.selectedSubValue = null;
                            }
                            else {
                                self.selectedValue = null;
                            }
                        });
                    }}
                    paRefresh={e => {

                        this.viewModel.getProduct(prodModel);
                    }}
                    paShowSaveButton={() => true}
                    saveBtnDisabled={() => !prodModel || !prodModel.requiresSave()}
                    paGlobalSaveOnClick={() => this.viewModel.saveProduct(prodModel)}
                    hideAdd
                    hideSave
                    hideStatus />

                <div className="container">
                    <Row>
                        <Col md={10} mdOffset={1}>
                            <div className="s-portlet" style={{ padding: '30px 40px' }}>
                                <Row>
                                    <Col md={2}>
                                        <label style={{ marginTop: 8 }}>{this.activeLang.labels['lbl_Active']}</label>
                                    </Col>
                                    <Col md={4}>
                                        <Switch
                                            color='blue'
                                            checked={prodModel.status === 1}
                                            onChange={e => prodModel.execAction(() => prodModel.status = e.target.checked ? 1 : 0)} />
                                        {/* <label className="s-switch" >
                                            <input type="checkbox" />
                                            <span className="slider round"></span>
                                        </label> */}
                                    </Col>
                                </Row>
                            </div>
                            <br />
                            <div className="s-portlet" style={{ padding: '30px 40px' }}>
                                <ProductDetail1
                                    editViewModel={this.editViewModel}
                                    viewModel={this.viewModel}
                                    getSelectedValue={this.getSelectedValue}
                                    errorHandler={this.errorHandler}
                                    rootContainer={this} />
                            </div>
                            <br />
                            <LazyLoad debounce={false}>
                                <div className="s-portlet" style={{ padding: '30px 40px' }}>
                                    <ProductDetail2
                                        editViewModel={this.editViewModel}
                                        viewModel={this.viewModel}
                                        getSelectedValue={this.getSelectedValue}
                                        errorHandler={this.errorHandler} />
                                </div>
                            </LazyLoad>
                            <br />
                            <LazyLoad debounce={false}>
                                <div className="s-portlet" style={{ padding: '30px 40px' }}>
                                    <ProductDetail3
                                        editViewModel={this.editViewModel}
                                        viewModel={this.viewModel}
                                        getSelectedValue={this.getSelectedValue}
                                        errorHandler={this.errorHandler}
                                        rootContainer={this} />
                                </div>
                            </LazyLoad>
                            <br />
                            <LazyLoad debounce={false}>
                                <div className="s-portlet" style={{ padding: '30px 40px' }}>
                                    <ProductDetail4
                                        editViewModel={this.editViewModel}
                                        viewModel={this.viewModel}
                                        getSelectedValue={this.getSelectedValue}
                                        errorHandler={this.errorHandler} />
                                </div>
                            </LazyLoad>
                            <br />
                            <LazyLoad debounce={false}>
                                <div className="s-portlet" style={{ padding: '30px 40px' }}>
                                    <ProductDetail5
                                        viewModel={this.viewModel}
                                        getSelectedValue={this.getSelectedValue}
                                        errorHandler={this.errorHandler} />
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