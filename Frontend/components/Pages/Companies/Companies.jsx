import React from 'react';
import LazyLoad from 'react-lazy-load';
import { observer, inject } from 'mobx-react';

import { Button, FormControl, Checkbox } from "react-bootstrap";


import Helper from "../../../Helper/Helper";

import ModalHandler from "../../ModalHandler/ModalHandler";
import WaitControl from "../../WaitControl/WaitControl";
import RowLazyWait from "../../RowLazyWait/RowLazyWait";

import GridRowToolbar from "../../GridRowToolbar/GridRowToolbar";
import PageComponent from "../../PageComponents/PageComponent";

import CompanyPersons from "./CompanyPersons";
import CompanyEditor from "./CompanyEditor";

import CompanyViewModel from "./CompanyViewModel";

const Companies =
    inject('store')(
        observer(
            class Companies extends React.Component {

                constructor(props) {

                    super(props);

                    this.pageViewModel = props.pageViewModel;

                    this.viewModel = new CompanyViewModel();

                    this.viewModel.backToCompanies = e => {

                        this.viewModel.selectedCompForContacts = null;
                        this.viewModel.selectedCompForParticipants = null;
                        this.pageViewModel.menu.navBarSearch = this.navBarSearch;
                    };

                    this.modalHandler = new ModalHandler();
                    this.errorHandler = props.errorHandler;
                    this.activeLang = this.props.store.langStore.active;

                    this.getCompanies = this.getCompanies.bind(this);
                    this.getCompanyRow = this.getCompanyRow.bind(this);
                    this.getLookups = this.getLookups.bind(this);
                    this.getOccupations = this.getOccupations.bind(this);
                    this.saveCompanies = this.saveCompanies.bind(this);
                    this.changeStatus = this.changeStatus.bind(this);

                    this.limit = Helper.LAZY_LOAD_LIMIT;
                    this.offset = 0;


                    this.navBarSearch = {
                        page: 'companies',
                        searchAction: () => {
                            this.offset = 0;
                            this.getCompanies();
                        },
                        getSearchText: () => this.viewModel.searchText,
                        setSearchText: value => this.viewModel.searchText = value,
                        clearText: () => {

                            this.viewModel.searchText = '';
                            this.offset = 0;
                            this.getCompanies();
                        }
                    };

                    this.pageViewModel.menu.navBarSearch = this.navBarSearch;
                }

                componentWillMount() {
                    this.getCompanies();
                }

                getCompanies() {

                    const isFullRefresh = this.offset === 0;

                    if (isFullRefresh) {

                        this.viewModel.companies.length = 0;

                        this.pageViewModel.pageBlurPixels = 3;
                        this.pageViewModel.showPageWaitControl = true;
                    }
                    else {

                        this.viewModel.isLazyLoading = true;
                    }

                    const params = {
                        limit: this.limit,
                        offset: this.offset,
                        statusFilter: this.viewModel.statusType
                    };

                    if (this.viewModel.searchText) {

                        params['nameFilter'] = this.viewModel.searchText;
                    }

                    let idCounter = -1;

                    Helper.RunPromise(
                        {
                            promise: Helper.FetchPromiseGet('/company/get/', params),
                            success: data => {

                                if (data && data.length > 0) {

                                    this.viewModel.removeLazyWaitRecord();

                                    const temp = [...data.map((v, i) => this.viewModel.syncCompanyItem(v))];
                                    temp.push(this.viewModel.getLazyWaitRecord());

                                    this.viewModel.companies.push(...temp);
                                }
                                else {

                                    this.viewModel.removeLazyWaitRecord();
                                }

                                this.getLookups();
                            },
                            incrementSession: () => {

                                this.getCompaniesPromiseID = this.getCompaniesPromiseID ? (this.getCompaniesPromiseID + 1) : 1;
                                idCounter = this.getCompaniesPromiseID;
                            },
                            sessionValid: () => {

                                return idCounter === this.getCompaniesPromiseID;
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
                            this.viewModel.isLazyLoading = false;
                        }
                    );
                }

                getCompanyRow(value, index) {

                    let statusColor = null;

                    switch (value.recordState) {

                        case 10:
                            statusColor = 's-status-add';
                            break;

                        case 20:
                            statusColor = 's-status-edit';
                            break;

                        case 30:
                            statusColor = 's-status-delete';
                            break;

                    }

                    return (

                        value.isLazyWait ?
                            <tr key={value.genId}>
                                <RowLazyWait colSpan={6} spin={true} onAppear={() => {

                                    this.offset += this.limit;
                                    this.getCompanies();

                                }} />
                            </tr>
                            :

                            <tr key={value.genId}>

                                <td className="s-td-cell-status">
                                    <div className={statusColor}>
                                    </div>
                                </td>
                                <td className="s-td-cell-name"
                                    onClick={e => {
                                        this.getOccupations();
                                        this.viewModel.selectedCompForContacts = value;
                                    }}>{value.name}</td>
                                <td className="hidden-xs">{value.businessTypeName}</td>
                                <td className="hidden-xs hidden-sm">{value.brn}</td>
                                <td className="hidden-xs hidden-sm">{value.tva}</td>

                                <td className="s-td-cell-active">

                                    {
                                        value.isChangingStatus ?
                                            null
                                            :
                                            <Checkbox className="s-checkbox"
                                                defaultChecked={value.status === 1}
                                                onChange={e => {

                                                    if (value.id > 0) {

                                                        let tempValue = value.status;

                                                        value.status = e.target.checked ? 1 : 0;

                                                        if (tempValue !== value.status) {

                                                            this.changeStatus(value);
                                                        }
                                                    }

                                                }}>
                                            </Checkbox>
                                    }

                                </td>

                                <GridRowToolbar
                                    currentValue={value}
                                    displayName={value ? value.name : ''}
                                    onEdit={e => {

                                        this.viewModel.selectedValue = value;
                                        this.modalHandler.show();
                                    }}
                                    onDelete={e => {

                                        if (value.recordState === 10) {

                                            this.viewModel.removeCompany(value);
                                        }
                                        else {

                                            value.recordState = 30;
                                            this.saveCompanies();
                                        }
                                    }}
                                    deleteTitle={this.activeLang.labels["lbl_DeleteCompany"]} />
                            </tr>
                    );
                }

                getLookups() {

                    if (!this.gettingLookups) {

                        const promises = [];

                        if (this.viewModel.businessTypes.length === 0) {

                            let idCounter = -1;

                            promises.push(
                                {
                                    promise: Helper.FetchPromiseGet(
                                        '/lookup/getbusinesstypes/',
                                        {
                                            cvh: Helper.getCacheVersion(),
                                            dbv: Helper.getDbVersion(),
                                            btv: Helper.getVersion('BusinessType'),
                                        }),
                                    success: data => {

                                        if (data) {

                                            this.viewModel.businessTypes.push(...data);
                                        }
                                    },
                                    incrementSession: () => {

                                        this.getBusinessTypesPromiseID = this.getBusinessTypesPromiseID ? (this.getBusinessTypesPromiseID + 1) : 1;
                                        idCounter = this.getBusinessTypesPromiseID;
                                    },
                                    sessionValid: () => {

                                        return idCounter === this.getBusinessTypesPromiseID;
                                    }
                                });
                        }

                        if (this.viewModel.countries.length === 0) {

                            let idCounter = -1;

                            promises.push(
                                {
                                    promise: Helper.FetchPromiseGet(
                                        '/lookup/getcountries/',
                                        {
                                            cvh: Helper.getCacheVersion(),
                                            dbv: Helper.getDbVersion(),
                                            ctv: Helper.getCountriesVersion(),
                                        }),
                                    success: data => {

                                        if (data) {

                                            this.viewModel.countries.push(...data.countries);
                                            this.viewModel.defCountry = data.defCountry;
                                        }
                                    },
                                    incrementSession: () => {

                                        this.getCountriesPromiseID = this.getCountriesPromiseID ? (this.getCountriesPromiseID + 1) : 1;
                                        idCounter = this.getCountriesPromiseID;
                                    },
                                    sessionValid: () => {

                                        return idCounter === this.getCountriesPromiseID;
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

                getOccupations() {

                    if (this.viewModel.occupations.length === 0) {

                        let idCounter = -1;

                        Helper.RunPromise(
                            {
                                promise: Helper.FetchPromiseGet(
                                    '/lookup/getoccupations/',
                                    {
                                        cvh: Helper.getCacheVersion(),
                                        dbv: Helper.getDbVersion(),
                                        ocv: Helper.getVersion('occupationsVersion'),
                                    }),
                                success: data => {
                                    if (data) {
                                        this.viewModel.occupations.push(...data);
                                    }
                                },
                                incrementSession: () => {

                                    this.getOccupationsPromiseID = this.getOccupationsPromiseID ? (this.getOccupationsPromiseID + 1) : 1;
                                    idCounter = this.getOccupationsPromiseID;
                                },
                                sessionValid: () => {

                                    return idCounter === this.getOccupationsPromiseID;
                                }
                            },
                            error => {
                                switch (error.exceptionID) {
                                    default:
                                        this.errorHandler.showFromLang(this.activeLang);
                                        break;
                                }
                            }
                        );
                    }
                }

                saveCompanies() {

                    let idCounter = -1;

                    const savePromises = {
                        options: this.viewModel.companies
                            .filter((v, i) => ((v.toEdit && v.toEdit.recordState && v.toEdit.recordState > 0) || v.recordState === 30) && !v.isSaving)
                            .map((toSave, index) => {

                                toSave.isSaving = true;

                                return {
                                    promise: Helper.FetchPromisePost('/company/Save', toSave.toEdit ? toSave.toEdit.getValue() : { id: toSave.id, uid: toSave.uid, recordState: toSave.recordState }),
                                    success: data => {

                                        if (toSave.recordState === 30) {

                                            this.viewModel.removeCompany(toSave);
                                        }
                                        else if (data) {

                                            toSave.sync(data);
                                            toSave.toEdit = null;
                                        }
                                    },
                                    failure: error => {

                                        tosave.error = this.activeLang.msgs['errMsg_Aplgs'];
                                    },
                                    complete: () => {

                                        toSave.isSaving = false;
                                    }
                                };
                            }),
                        incrementSession: () => {

                            this.saveCompaniesPromiseID = this.saveCompaniesPromiseID ? (this.saveCompaniesPromiseID + 1) : 1;
                            idCounter = this.saveCompaniesPromiseID;
                        },
                        sessionValid: () => {

                            return idCounter === this.saveCompaniesPromiseID;
                        }
                    };

                    Helper.RunPromise(savePromises);
                }

                changeStatus(value) {


                    if (value) {

                        let idCounter = -1;

                        value.isChangingStatus = true;

                        Helper.RunPromise(
                            {
                                promise: Helper.FetchPromisePost('/company/changeStatus', { id: value.id, status: value.status }),
                                success: data => {


                                    if (value.originalValue) {

                                        value.originalValue.status = value.status;
                                    }
                                },
                                incrementSession: () => {

                                    this.changeStatusPromiseID = this.changeStatusPromiseID ? (this.changeStatusPromiseID + 1) : 1;
                                    idCounter = this.changeStatusPromiseID;
                                },
                                sessionValid: () => {

                                    return idCounter === this.changeStatusPromiseID;
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
                                value.isChangingStatus = false;
                            }
                        );
                    }
                }

                render() {

                    return (

                        <PageComponent
                            paTitle={this.activeLang.labels["lbl_Menu_companies"]}
                            paSearchPlaceholder={this.activeLang.labels["lbl_SearchCompanies"]}
                            paSearchValue={this.viewModel.searchText}
                            paOnSearchValueChange={e => this.viewModel.searchText = e.target.value}
                            paOnSearch={e => {
                                this.offset = 0;
                                this.getCompanies()
                            }}
                            paClearSearchValue={e => this.viewModel.searchText = ''}
                            paOnAdd={e => {
                                this.viewModel.selectedValue = this.viewModel.getNewCompany();
                                this.modalHandler.show();
                            }}
                            paShowSaveButton={e => {
                                const temp = this.viewModel.companies.find((v, i) => !v.isLazyWait && v.recordState !== 0 && !v.isSaving) ? true : false;

                                return !this.viewModel.isModalShown && temp;
                            }}
                            paGlobalSaveOnClick={e => {
                                this.saveCompanies();
                            }}
                            paRefresh={e => {
                                this.offset = 0;
                                this.getCompanies();
                            }}
                            paStatusAll={e => {

                                this.viewModel.statusType = null;
                                this.offset = 0;
                                this.getCompanies();

                            }}
                            paStatusActive={e => {

                                this.viewModel.statusType = 1;
                                this.offset = 0;
                                this.getCompanies();

                            }}
                            paStatusInactive={e => {

                                this.viewModel.statusType = 0;
                                this.offset = 0;
                                this.getCompanies();

                            }}
                            getTableHeaders={() => {

                                return (

                                    <tr>
                                        <th className="s-th-cell-status"></th>
                                        <th className="s-th-cell-name">{this.activeLang.labels["lbl_Name"]}</th>
                                        <th className="hidden-xs">{this.activeLang.labels["lbl_BusinessType"]}</th>
                                        <th className="hidden-xs hidden-sm">{this.activeLang.labels["lbl_BRN"]}</th>
                                        <th className="hidden-xs hidden-sm">{this.activeLang.labels["lbl_TVA"]}</th>
                                        <th className="s-th-cell-active">{this.activeLang.labels["lbl_Active"]}</th>
                                        <th className="s-th-cell-controls" />
                                    </tr>

                                );
                            }}
                            getTableRows={() => this.viewModel.companies.map(this.getCompanyRow)}

                            hidePage={this.viewModel.selectedCompForContacts ? true : false}
                            hideNext
                            hidePrev
                            getSiblings={() => {

                                return (
                                    this.viewModel.selectedCompForContacts ?
                                        <CompanyPersons
                                            key={'id-Persons'}
                                            pageViewModel={this.pageViewModel}
                                            companyViewModel={this.viewModel}
                                            errorHandler={this.errorHandler}
                                            goLazyWait={() => {
                                                this.offset += this.limit;
                                                this.getCompanies();
                                            }} />
                                        :
                                        null
                                );
                            }}

                            modalHandler={this.modalHandler}
                            getModalHeader={() => {

                                return this.activeLang.labels[
                                    this.viewModel.selectedValue
                                        && this.viewModel.selectedValue.recordState === 10 ? 'lbl_NewCompany' : 'lbl_EditCompany'];
                            }}

                            getModalInRoot={() => {

                                return <WaitControl opacity50={true} show={this.viewModel.showModalWait} />;
                            }}

                            getModalBody={() => {

                                return (
                                    <CompanyEditor companyViewModel={this.viewModel} modalHandler={this.modalHandler} errorHandler={this.errorHandler} />
                                );
                            }}

                            getModalFooter={() => {

                                return (

                                    <div>
                                        <Button
                                            disabled={this.viewModel.showModalWait}
                                            className="s-btn-medium-blue"
                                            onClick={e => {

                                                if (this.viewModel.selectedValue
                                                    && this.viewModel.selectedValue.toEdit
                                                    && this.viewModel.selectedValue.toEdit.isValid()) {

                                                    this.modalHandler.hide('noRevert');
                                                }
                                            }}>
                                            {this.activeLang.labels["lbl_SaveLater"]}
                                        </Button>

                                        <Button
                                            disabled={this.viewModel.showModalWait}
                                            className="s-btn-medium-primary"
                                            onClick={e => {

                                                if (this.viewModel.selectedValue
                                                    && this.viewModel.selectedValue.toEdit
                                                    && this.viewModel.selectedValue.toEdit.isValid()) {

                                                    this.modalHandler.hide('save');
                                                }
                                            }}>
                                            {this.activeLang.labels["lbl_Save"]}
                                        </Button>

                                    </div>

                                );

                            }}

                            onModalShow={args => this.viewModel.isModalShown = true}
                            onModalHide={args => {

                                this.viewModel.isModalShown = false;

                                if (args) {

                                    switch (args.action) {

                                        case 'noRevert':
                                        case 'save':

                                            if (this.viewModel.selectedValue
                                                && this.viewModel.selectedValue.recordState === 10) {

                                                this.viewModel.addNewCompany(this.viewModel.selectedValue);
                                            }

                                            if (args.action === 'save') {

                                                this.saveCompanies();
                                            }
                                            break;

                                        default:

                                            if (this.viewModel.selectedValue) {

                                                if (this.viewModel.selectedValue.recordState === 10) {

                                                    this.viewModel.removeCompany(this.viewModel.selectedValue);
                                                }
                                                else {

                                                    this.viewModel.selectedValue.sync(this.viewModel.selectedValue.originalValue);
                                                }
                                            }
                                            break;
                                    }

                                    this.viewModel.selectedValue = null;
                                }
                            }} />

                    );
                }
            }));

export default Companies;
