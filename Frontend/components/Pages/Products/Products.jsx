import React from "react";
import LazyLoad from 'react-lazy-load';
import { observer, inject } from "mobx-react";

import { Row, Col, Button, Checkbox } from "react-bootstrap";

import Helper from "../../../Helper/Helper";

import ModalHandler from "../../ModalHandler/ModalHandler";
import WaitControl from "../../WaitControl/WaitControl";
import RowLazyWait from "../../RowLazyWait/RowLazyWait";

import GridRowToolbar from "../../GridRowToolbar/GridRowToolbar";
import PageComponent from "../../PageComponents/PageComponent";

import ProductRow from "./ProductRow";

import ProductsViewModel from "./ProductsViewModel";
import ProductDetail from "./ProductDetail";
import SubProducts from "./SubProducts";

import CreateProduct from './CreateProduct';


class Products extends React.Component {

    constructor(props) {
        super(props);

        this.prodsScrollPos = 0;
        this.groupsScrollPos = 0;

        this.state = {
            tabKey: 0
        };

        this.pageViewModel = props.pageViewModel;
        this.errorHandler = props.errorHandler;
        this.modalHandler = new ModalHandler();

        this.activeLang = this.props.store.langStore.active;

        this.viewModel = ProductsViewModel.init(this.activeLang);
        this.viewModel.showPromiseError = error => {

            switch (error.exceptionID) {
                default:
                    this.errorHandler.showFromLang(this.activeLang);
                    break;
            }
        };
        this.viewModel.triggerPageBlur = activate => {

            this.pageViewModel.pageBlurPixels = activate ? 3 : 0;
            this.pageViewModel.showPageWaitControl = activate ? true : false;
        };

        this.modalHandler = new ModalHandler();


        this.prodsLimit = Helper.LAZY_LOAD_LIMIT + 20;
        this.prodsOffset = 0;

        this.groupsLimit = Helper.LAZY_LOAD_LIMIT + 20;
        this.groupsOffset = 0;
    }

    componentWillMount() {

        this.viewModel.bindOnSelectedValueChange(this.selectedValueChanged);

        this.getProducts();
        this.viewModel.getLookups();
    }

    componentWillUnmount() {

        this.viewModel.unbindOnSelectedValueChange(this.selectedValueChanged);
    }

    clearAndQuery = () => {

        switch (this.state.tabKey) {

            case 0:

                this.prodsOffset = 0;
                this.getProducts();
                break;

            case 1:

                this.groupsOffset = 0;
                this.getProducts(true);
                break;
        }
    }

    getProducts = (getGroups) => {

        this.viewModel.getProducts(
            getGroups ? this.groupsLimit : this.prodsLimit,
            getGroups ? this.groupsOffset : this.prodsOffset,
            getGroups ? true : false);
    }

    selectedValueChanged = () => {

        if (this.viewModel.selectedValue === null) {
            document.documentElement.scrollTop = this.selectedValueChanged.tabKey === 0 ? this.prodsScrollPos : this.groupsScrollPos;
        }
    }

    getProductsRow = (value, index) => (
        <ProductRow
            key={value.genId}
            value={value}
            index={index}
            activeLang={this.activeLang}
            loadLazy={() => {
                this.prodsOffset += this.prodsLimit;
                this.getProducts();
            }}
            onRowClick={() => {

                switch (this.state.tabKey) {

                    case 0:
                        this.prodsScrollPos = document.documentElement.scrollTop;
                        break;

                    case 1:
                        this.groupsScrollPos = document.documentElement.scrollTop;
                        break;
                }

                this.viewModel.execAction(self => {
                    self.selectedValue = value.id;
                });
            }}
            changeBoolean={this.changeBoolean} />
    )

    getGroupsRow = (value, index) => (
        <ProductRow
            key={value.genId}
            isGroupRow
            value={value}
            index={index}
            activeLang={this.activeLang}
            loadLazy={() => {
                this.groupsOffset += this.groupsLimit;
                this.getProducts(true);
            }}
            onRowClick={() => {

                switch (this.state.tabKey) {

                    case 0:
                        this.prodsScrollPos = document.documentElement.scrollTop;
                        break;

                    case 1:
                        this.groupsScrollPos = document.documentElement.scrollTop;
                        break;
                }

                this.viewModel.execAction(self => {
                    self.selectedValue = value.id;
                });
            }}
            changeBoolean={this.changeBoolean}
            onShowSubProducts={e => {

                this.groupsScrollPos = document.documentElement.scrollTop;

                this.viewModel.execAction(self => {
                    self.selectedGroup = value.id;
                });
            }} />
    )

    changeBoolean = (value, action) => {

        if (value) {

            let idCounter = -1;

            value.execAction(() => {

                switch (action) {

                    case 'status':

                    value.isChangingStatus = true;
                        break;

                    case 'hideSearch':

                    value.isChangingHideSearch = true;
                        break;
                }

            });

            Helper.RunPromise(
                {
                    promise: Helper.FetchPromisePost(
                        '/products/ChangeBoolean',
                        {
                            id: value.id,
                            action: action,
                            status: value.status,
                            hideSearch: value.hideSearch
                        }),
                    success: data => {

                        if (value.originalValue) {

                            switch (action) {

                                case 'status':

                                    value.setOriginalValueProperty({ status: value.status });
                                    break;

                                case 'hideSearch':

                                    value.setOriginalValueProperty({ hideSearch: value.hideSearch });
                                    break;
                            }

                        }
                    },
                    incrementSession: () => {

                        this.changeBooleanPromiseID = this.changeBooleanPromiseID ? (this.changeBooleanPromiseID + 1) : 1;
                        idCounter = this.changeBooleanPromiseID;
                    },
                    sessionValid: () => {

                        return idCounter === this.changeBooleanPromiseID;
                    }
                },
                error => {

                    switch (error.exceptionID) {
                        default:
                            this.errorHandler.showFromLang(this.activeLang);
                            break;
                    }
                },
                () => {

                    value.execAction(self => {
                        switch (action) {

                            case 'status':

                                self.isChangingStatus = false;
                                break;

                            case 'hideSearch':

                                self.isChangingHideSearch = false;
                                break;
                        }

                    });
                }
            );
        }
    }

    render() {

        const topButtonsSidePadding = 40;

        return (

            <PageComponent

                paTitle={
                    <table>
                        <tbody>
                            <tr>
                                <td>
                                    <Button
                                        className={'s-btn-empty' + (this.state.tabKey === 0 ? ' border-bottom-primary' : '')}
                                        style={{
                                            borderBottom: this.state.tabKey === 0 ? undefined : 'lightgray solid 1px',
                                            borderBottomLeftRadius: 0,
                                            borderBottomRightRadius: 0,
                                            paddingLeft: topButtonsSidePadding,
                                            paddingRight: topButtonsSidePadding,
                                        }}
                                        onClick={e => {

                                            this.groupsScrollPos = document.documentElement.scrollTop;
                                            this.setState({ tabKey: 0 });
                                            setTimeout(() => document.documentElement.scrollTop = this.prodsScrollPos, 250);
                                        }}>
                                        {
                                            this.state.tabKey === 0 ?
                                                <h4>{this.activeLang.labels["lbl_Menu_products"]}</h4>
                                                :
                                                <h4>{this.activeLang.labels["lbl_Menu_products"]}</h4>
                                        }
                                    </Button>
                                </td>
                                <td>
                                    <Button
                                        className={'s-btn-empty' + (this.state.tabKey === 1 ? ' border-bottom-primary' : '')}
                                        style={{
                                            borderBottom: this.state.tabKey === 1 ? undefined : 'lightgray solid 1px',
                                            borderBottomLeftRadius: 0,
                                            borderBottomRightRadius: 0,
                                            paddingLeft: topButtonsSidePadding,
                                            paddingRight: topButtonsSidePadding,
                                        }}
                                        onClick={e => {

                                            if (this.viewModel.groups.length === 0) {

                                                this.getProducts(true);
                                            }

                                            this.prodsScrollPos = document.documentElement.scrollTop;
                                            this.setState({ tabKey: 1 });

                                            setTimeout(() => document.documentElement.scrollTop = this.groupsScrollPos, 250);
                                        }}>
                                        {
                                            this.state.tabKey === 1 ?
                                                <h4>{this.activeLang.labels["lbl_Groups"]}</h4>
                                                :
                                                <h4>{this.activeLang.labels["lbl_Groups"]}</h4>
                                        }
                                    </Button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                }
                paOnAdd={e => {
                    //this.viewModel.selectedValue = this.viewModel.getNewProducts();
                    this.modalHandler.show();
                }}
                paShowSaveButton={e => {
                    const temp = this.viewModel.products.find((v, i) => !v.isLazyWait && v.recordState !== 0 && !v.isSaving) ? true : false;

                    return !this.viewModel.isModalShown && temp;
                }}
                paRefresh={e => {

                    this.clearAndQuery();
                }}
                paStatusAll={e => {

                    this.viewModel.statusType = null;
                    this.clearAndQuery();
                }}
                paStatusActive={e => {

                    this.viewModel.statusType = 1;
                    this.clearAndQuery();
                }}
                paStatusInactive={e => {

                    this.viewModel.statusType = 0;
                    this.clearAndQuery();
                }}

                getTableHeaders={() => {

                    switch (this.state.tabKey) {

                        case 0:
                            return (

                                <tr>
                                    <th className="s-th-cell-status"></th>
                                    <th className="s-th-cell-name">{this.activeLang.labels["lbl_Name"]}</th>
                                    <th>{this.activeLang.labels["lbl_Type"]}</th>
                                    <th>{this.activeLang.labels["lbl_NetSize"]}</th>
                                    <th>{this.activeLang.labels["lbl_GrossSize"]}</th>
                                    <th>{this.activeLang.labels["lbl_Currency"]}</th>
                                    <th>{this.activeLang.labels["lbl_Price"]}</th>
                                    <th>{this.activeLang.labels["lbl_Family"]}</th>
                                    <th className="s-th-cell-active">{this.activeLang.labels["lbl_Active"]}</th>
                                </tr>

                            );

                        case 1:
                            return (

                                <tr>
                                    <th className="s-th-cell-status"></th>
                                    <th className="s-th-cell-name">{this.activeLang.labels["lbl_Name"]}</th>
                                    <th></th>
                                    <th>{this.activeLang.labels["lbl_Type"]}</th>
                                    <th>{this.activeLang.labels["lbl_NetSize"]}</th>
                                    <th>{this.activeLang.labels["lbl_GrossSize"]}</th>
                                    <th>{this.activeLang.labels["lbl_Currency"]}</th>
                                    <th>{this.activeLang.labels["lbl_Family"]}</th>
                                    <th className="s-th-cell-active">{this.activeLang.labels["lbl_Active"]}</th>
                                </tr>

                            );
                    }
                }}
                getTableRows={() => this.state.tabKey === 0
                    ? this.viewModel.products.map(this.getProductsRow)
                    : this.viewModel.groups.map(this.getGroupsRow)}
                hideNext
                hidePrev
                
                hidePage={this.viewModel.selectedValue || this.viewModel.selectedGroup ? true : false}
                getSiblings={() => {

                    if (this.viewModel.selectedValue || this.viewModel.selectedGroup) {

                        if (this.viewModel.selectedValue) {

                            return (
                                <ProductDetail key="ProductDetail" viewModel={this.viewModel} errorHandler={this.errorHandler} />
                            );
                        }

                        return (
                            <SubProducts key="SubProducts" viewModel={this.viewModel} errorHandler={this.errorHandler} />
                        );
                    }

                    return null;
                }}
                modalHandler={this.modalHandler}
                getModalHeader={() => this.activeLang.labels['lbl_NewProd']}

                getModalInRoot={() => {

                    return <WaitControl opacity50={true} show={this.viewModel.showModalWait} />;
                }}

                getModalBody={() => (
                    <CreateProduct
                        isActive={this.viewModel.isModalShown}
                        viewModel={this.viewModel}
                        errorHandler={this.errorHandler}
                        modalHandler={this.modalHandler} />
                )}

                onModalShow={args => this.viewModel.execAction(self => self.isModalShown = true)}

                onModalHide={args => {

                    this.viewModel.execAction(self => self.isModalShown = false);

                    if (args) {

                        switch (args.action) {

                            case 'noRevert':
                            case 'save':

                                break;

                            default:

                                break;
                        }
                    }
                }} />
        );
    }
}

export default inject("store")(observer(Products));
