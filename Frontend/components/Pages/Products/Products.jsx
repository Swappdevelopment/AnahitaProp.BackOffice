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

import ProductsViewModel from "./ProductsViewModel";
import ProductDetail from "./ProductDetail";


class Products extends React.Component {

    constructor(props) {
        super(props);

        this.state = { isModalShown: false };

        this.pageViewModel = props.pageViewModel;
        this.errorHandler = props.errorHandler;

        this.viewModel = ProductsViewModel.init();
        this.viewModel.showPromiseError = error => {

            switch (error.exceptionID) {
                default:
                    this.errorHandler.showFromLang(this.activeLang);
                    break;
            }
        };

        this.modalHandler = new ModalHandler();
        this.activeLang = this.props.store.langStore.active;

        this.getProducts = this.getProducts.bind(this);
        this.getProductsRow = this.getProductsRow.bind(this);
        this.saveProducts = this.saveProducts.bind(this);

        this.limit = Helper.LAZY_LOAD_LIMIT + 20;
        this.offset = 0;
    }

    componentWillMount() {

        this.getProducts();
        this.getLookups();
    }

    getLookups = () => {

        if (!this.gettingLookups) {

            const promises = [];

            if (this.viewModel.prodFamilyTypes.length === 0) {

                let idCounter = -1;

                promises.push(
                    {
                        promise: Helper.FetchPromiseGet(
                            '/lookup/GetProductFamilyTypes/'),
                        success: data => {

                            if (data && data.length > 0) {

                                this.viewModel.execAction(self => {

                                    self.prodFamilyTypes.push(...data.map((v, i) => {

                                        const name = v.names ?
                                            v.names.find(nm => (nm.language_Code ? nm.language_Code.toLowerCase() : '') == this.activeLang.code)
                                            :
                                            null;

                                        return Object.assign(v, {
                                            name: name ? name.value : null
                                        });
                                    }));
                                });
                            }
                        },
                        incrementSession: () => {

                            this.getProductFamilyTypesPromiseID = this.getProductFamilyTypesPromiseID ? (this.getProductFamilyTypesPromiseID + 1) : 1;
                            idCounter = this.getProductFamilyTypesPromiseID;
                        },
                        sessionValid: () => {

                            return idCounter === this.getProductFamilyTypesPromiseID;
                        }
                    });
            }

            if (this.viewModel.prodFamilies.length === 0) {

                let idCounter = -1;

                promises.push(
                    {
                        promise: Helper.FetchPromiseGet(
                            '/lookup/GetProductFamilies/'),
                        success: data => {

                            if (data && data.length > 0) {

                                this.viewModel.execAction(self => {

                                    self.prodFamilies.push(...data.map((v, i) => {

                                        const name = v.names ?
                                            v.names.find(nm => (nm.language_Code ? nm.language_Code.toLowerCase() : '') == this.activeLang.code)
                                            :
                                            null;

                                        return Object.assign(v, {
                                            name: name ? name.value : null
                                        });
                                    }));
                                });
                            }
                        },
                        incrementSession: () => {

                            this.getProductFamiliesPromiseID = this.getProductFamiliesPromiseID ? (this.getProductFamiliesPromiseID + 1) : 1;
                            idCounter = this.getProductFamiliesPromiseID;
                        },
                        sessionValid: () => {

                            return idCounter === this.getProductFamiliesPromiseID;
                        }
                    });
            }

            if (this.viewModel.currencies.length === 0) {

                let idCounter = -1;

                promises.push(
                    {
                        promise: Helper.FetchPromiseGet(
                            '/lookup/GetCurrencies/'),
                        success: data => {

                            if (data && data.length > 0) {

                                this.viewModel.execAction(self => {

                                    self.currencies.push(...data);
                                });
                            }
                        },
                        incrementSession: () => {

                            this.getCurrenciesPromiseID = this.getCurrenciesPromiseID ? (this.getCurrenciesPromiseID + 1) : 1;
                            idCounter = this.getCurrenciesPromiseID;
                        },
                        sessionValid: () => {

                            return idCounter === this.getCurrenciesPromiseID;
                        }
                    });
            }


            if (promises.length > 0) {

                this.gettingLookups = true;

                let idCounter = -1;

                Helper.RunPromise(
                    {
                        options: promises,
                        incrementSession: () => {

                            this.getLookupsPromiseID = this.getLookupsPromiseID ? (this.getLookupsPromiseID + 1) : 1;
                            idCounter = this.getLookupsPromiseID;
                        },
                        sessionValid: () => {

                            return idCounter === this.getLookupsPromiseID;
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

                        this.gettingLookups = false;
                    });
            }
        }
    }

    getProducts() {

        if (!this.isGettingProducts) {

            this.isGettingProducts = true;

            const isFullRefresh = this.offset === 0;

            if (isFullRefresh) {

                this.viewModel.clearProducts();

                this.pageViewModel.pageBlurPixels = 3;
                this.pageViewModel.showPageWaitControl = true;
            }
            else {

                this.viewModel.setPropsValue({ isLazyLoading: true });
            }

            const params = {
                limit: this.limit,
                offset: this.offset,
                statusFilter: this.viewModel.statusType,
                withProperties: (this.viewModel.properties.length === 0)
            };

            if (this.viewModel.searchText) {

                params['nameFilter'] = this.viewModel.searchText;
            }

            let idCounter = -1;

            Helper.RunPromise(
                {
                    promise: Helper.FetchPromiseGet('/products/get/', params),
                    success: data => {

                        if (data) {

                            if (data.properties && data.properties.length > 0) {

                                this.viewModel.syncProperties(this.activeLang.code, data.properties);
                            }

                            if (data.products && data.products.length > 0) {

                                this.viewModel.removeLazyWaitRecord();

                                const temp = [...data.products.map((v, i) => this.viewModel.syncProduct(v, this.activeLang.code))];
                                temp.push(this.viewModel.getLazyWaitRecord());

                                this.viewModel.pushProduct(...temp);
                            }
                            else {

                                this.viewModel.removeLazyWaitRecord();
                            }
                        }
                    },
                    incrementSession: () => {

                        this.getProductsPromiseID = this.getProductsPromiseID ? (this.getProductsPromiseID + 1) : 1;
                        idCounter = this.getProductsPromiseID;
                    },
                    sessionValid: () => {

                        return idCounter === this.getProductsPromiseID;
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
                    this.pageViewModel.pageBlurPixels = 0;
                    this.pageViewModel.showPageWaitControl = false;

                    this.viewModel.setPropsValue({ isLazyLoading: false });

                    this.isGettingProducts = false;
                }
            );
        }
    }

    getProductsRow(value, index) {

        if (value.isLazyWait) {

            return (
                <tr key={value.genId}>
                    <RowLazyWait colSpan={7} spin={true} onAppear={() => {

                        this.offset += this.limit;
                        this.getProducts();
                    }} />
                </tr>
            );
        }
        else {

            let ovtObjectivesTarget = null;
            let statusColor = null;

            switch (value.recordState) {

                case 10:
                    statusColor = 's-status-add';
                    break;

                case 30:
                    statusColor = 's-status-delete';
                    break;

                default:

                    if (value.isModified()) {

                        statusColor = 's-status-edit';
                    }
                    break;
            }

            return (
                <tr key={value.genId}>

                    <td className="s-td-cell-status">
                        <div className={statusColor}>
                        </div>
                    </td>
                    <td
                        className="s-td-cell-name-short"
                        onClick={e => {

                            this.viewModel.execAction(self => {
                                self.selectedValue = value.id;
                            });
                        }}>{value.getNameAndCode()}</td>

                    <td>{
                        value.type === 10 ? this.activeLang.labels['lbl_Rsl']
                            :
                            (value.type === 20 ? this.activeLang.labels['lbl_Lfs']
                                :
                                (value.type === 30 ? this.activeLang.labels['lbl_Prj'] : ''))
                    }</td>

                    <td>{value.netSize.format(0, 3)}</td>
                    <td>{value.grossSize.format(0, 3)}</td>
                    <td>{value.currencyCode}</td>
                    <td style={{ textAlign: 'right' }}>{value.price.format(2, 3)}</td>
                    <td>{value.productFamily ? value.productFamily.getName() : 'No Family'}</td>

                    <td className="s-td-cell-active">
                        {
                            value.isChangingHideSearch ?
                                <span className="spinner"></span>
                                :
                                <Checkbox className="s-checkbox"

                                    defaultChecked={value.hideSearch ? false : true}
                                    onChange={e => {

                                        if (value.id > 0) {

                                            let tempValue = value.hideSearch;

                                            value.execAction(self => {

                                                self.hideSearch = e.target.checked ? false : true;
                                            });

                                            if (tempValue !== value.hideSearch) {

                                                this.changeBoolean(value, 'hideSearch');
                                            }
                                        }

                                    }}>
                                </Checkbox>
                        }

                    </td>

                    {/* <td className="s-td-cell-active">
                        {
                            value.isChangingStatus ?
                                <span className="spinner"></span>
                                :
                                <Checkbox className="s-checkbox"

                                    defaultChecked={value.status === 1}
                                    onChange={e => {

                                        if (value.id > 0) {

                                            let tempValue = value.status;

                                            value.execAction(self => {

                                                self.status = e.target.checked ? 1 : 0;
                                            });

                                            if (tempValue !== value.status) {

                                                this.changeBoolean(value, 'status');
                                            }
                                        }

                                    }}>
                                </Checkbox>
                        }

                    </td> */}

                    <GridRowToolbar hideEdit
                        currentValue={value}
                        displayName={value ? value.title : ''}
                        onEdit={e => {

                            this.getProductsObjectives(value);
                            this.viewModel.selectedValue = value;
                            this.modalHandler.show();
                        }}
                        onDelete={e => {

                            // if (value.recordState === 10) {

                            //     this.viewModel.removeProducts(value);
                            // }
                            // else {

                            //     value.recordState = 30;
                            //     this.saveProducts();
                            // }
                        }}
                        deleteTitle={this.activeLang.labels["lbl_DeleteProducts"]} />
                </tr >
            );
        }
    }

    saveProducts() {

        let idCounter = -1;

        const savePromises = {
            options: this.viewModel.products
                .filter((v, i) => v.recordState && v.recordState !== 0 && !v.isSaving)
                .map((toSave, index) => {

                    toSave.isSaving = true;

                    return {
                        promise: Helper.FetchPromisePost('/products/Save', toSave.getValue()),
                        success: data => {

                            if (data) {

                                if (toSave.recordState === 30) {

                                    this.viewModel.removeProducts(toSave);
                                }
                                else if (!data.ok) {

                                    toSave.sync(data);
                                }
                            }
                        },
                        failure: error => {

                            toSave.error = this.activeLang.msgs['errMsg_Aplgs'];
                        },
                        complete: () => {

                            toSave.isSaving = false;
                        }
                    };
                }),
            incrementSession: () => {

                this.saveProductsPromiseID = this.saveProductsPromiseID ? (this.saveProductsPromiseID + 1) : 1;
                idCounter = this.saveProductsPromiseID;
            },
            sessionValid: () => {

                return idCounter === this.saveProductsPromiseID;
            }
        };

        Helper.RunPromise(savePromises);
    }

    changeBoolean = (value, action) => {

        if (value) {

            let idCounter = -1;

            value.execAction(self => {
                switch (action) {

                    case 'status':

                        self.isChangingStatus = true;
                        break;

                    case 'hideSearch':

                        self.isChangingHideSearch = true;
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

        return (

            <PageComponent

                paTitle={this.activeLang.labels["lbl_Menu_products"]}
                paSearchPlaceholder={this.activeLang.labels["lbl_SearchProducts"]}
                paSearchValue={this.viewModel.searchText}
                paOnSearchValueChange={e => this.viewModel.searchText = e.target.value}
                paOnSearch={e => {
                    this.offset = 0;
                    this.getProducts();
                }}
                paClearSearchValue={e => this.viewModel.searchText = ''}
                paOnAdd={e => {
                    this.viewModel.selectedValue = this.viewModel.getNewProducts();
                    this.modalHandler.show();
                }}
                paShowSaveButton={e => {
                    const temp = this.viewModel.products.find((v, i) => !v.isLazyWait && v.recordState !== 0 && !v.isSaving) ? true : false;

                    return !this.viewModel.isModalShown && temp;
                }}
                paGlobalSaveOnClick={e => {
                    this.saveProducts();
                }}
                paRefresh={e => {

                    this.offset = 0;
                    this.getProducts();
                }}
                paStatusAll={e => {

                    this.viewModel.statusType = null;
                    this.offset = 0;
                    this.getProducts();

                }}
                paStatusActive={e => {

                    this.viewModel.statusType = 1;
                    this.offset = 0;
                    this.getProducts();

                }}
                paStatusInactive={e => {

                    this.viewModel.statusType = 0;
                    this.offset = 0;
                    this.getProducts();

                }}

                getTableHeaders={() => {

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
                            {/* <th className="s-th-cell-active">{this.activeLang.labels["lbl_HideInWs"]}</th> */}
                            <th className="s-th-cell-active">{this.activeLang.labels["lbl_Active"]}</th>
                            <th className="s-th-cell-controls" />
                        </tr>

                    );
                }}
                getTableRows={() => this.viewModel.products.map(this.getProductsRow)}
                hideNext
                hidePrev

                hidePage={this.viewModel.selectedValue ? true : false}
                getSiblings={() => {

                    return (

                        this.viewModel.selectedValue ?

                            <ProductDetail key="ProductDetail" viewModel={this.viewModel} errorHandler={this.errorHandler} />
                            :
                            null

                    );
                }} />
        );
    }
}

export default inject("store")(observer(Products));
