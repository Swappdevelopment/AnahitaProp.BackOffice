import React from 'react';
import { observer, inject } from 'mobx-react';

import { Row, Col } from "react-bootstrap";

import PageActions from '../../PageComponents/PageActions/PageActions';
import ProductDetail1 from './ProductDetail1';


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
                    hideAdd />

                <div className="container">
                    <div className="s-portlet">
                        <ProductDetail1 viewModel={this.viewModel} errorHandler={this.errorHandler} />
                    </div>
                </div>

            </div>
        );
    }
}


export default inject('store')(observer(ProductDetail));