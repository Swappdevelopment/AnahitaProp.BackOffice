import React from 'react';
import { observer, inject } from 'mobx-react';

import { Tabs, Tab } from "react-bootstrap";

import PageActions from '../../PageComponents/PageActions/PageActions';

import CompanyContacts from "./CompanyContacts";
import CompanyParticipants from "./CompanyParticipants";
import CompanyTrainings from "./CompanyTrainings";


const CompanyPersons =
    inject('store')(
        observer(
            class CompanyPersons extends React.Component {

                constructor(props) {

                    super(props);

                    this.state = { tabIndex: 0 };

                    this.activeLang = this.props.store.langStore.active;

                    this.pageViewModel = props.pageViewModel;
                    this.companyViewModel = props.companyViewModel;
                    this.errorHandler = props.errorHandler;

                    this.tabActions = {
                        contacts: {},
                        participants: {},
                        trainings: {}
                    };

                    this.onTabSelect = this.onTabSelect.bind(this);
                }

                componentWillMount() {
                }

                componentDidMount() {

                    this.onTabSelect(0);
                }

                onTabSelect(key) {

                    this.setState({ tabIndex: key });

                    switch (key) {

                        case 0:

                            if (this.tabActions.contacts.getNavBarSearch) {

                                this.pageViewModel.menu.navBarSearch = this.tabActions.contacts.getNavBarSearch();
                            }
                            break;

                        case 1:

                            if (this.tabActions.participants.getNavBarSearch) {

                                this.pageViewModel.menu.navBarSearch = this.tabActions.participants.getNavBarSearch();
                            }
                            break;

                        case 2:

                            if (this.tabActions.trainings.getNavBarSearch) {

                                this.pageViewModel.menu.navBarSearch = this.tabActions.trainings.getNavBarSearch();
                            }
                            break;
                    }
                }


                render() {

                    const getIndex = () => {

                        if (this.companyViewModel.selectedCompForContacts) {

                            const index = this.companyViewModel.companies.indexOf(this.companyViewModel.selectedCompForContacts);

                            return index;
                        }

                        return -1;
                    };

                    return (
                        <div className="s-page">

                            <PageActions
                                sideScrollNav={{
                                    isLeftVisible: () => {

                                        return getIndex() > 0;
                                    },
                                    isRightVisible: () => {

                                        return getIndex() < (this.companyViewModel.companies.length - 1)
                                    },
                                    getLeftLabel: () => {

                                        const index = getIndex();

                                        if (index > 0) {

                                            return this.companyViewModel.companies[index - 1].name;
                                        }

                                        return '';
                                    },
                                    getRightLabel: () => {

                                        const index = getIndex();

                                        if (index < (this.companyViewModel.companies.length - 1)) {

                                            return this.companyViewModel.companies[index + 1].name;
                                        }

                                        return '';
                                    },
                                    onLeftClick: e => {

                                        const index = getIndex();

                                        if (index > 0) {

                                            this.companyViewModel.selectedCompForContacts = this.companyViewModel.companies[index - 1];
                                        }
                                    },
                                    onRightClick: e => {

                                        let index = getIndex();

                                        if (index < (this.companyViewModel.companies.length - 1)) {

                                            this.companyViewModel.selectedCompForContacts = this.companyViewModel.companies[index + 1];

                                            index = getIndex();

                                            if (index < (this.companyViewModel.companies.length - 1)
                                                && this.companyViewModel.companies[index + 1].isLazyWait
                                                && this.props.goLazyWait) {

                                                this.props.goLazyWait();
                                            }
                                        }
                                    }
                                }}
                                paTitle={this.companyViewModel.selectedCompForContacts.name}
                                paTitleClick={this.companyViewModel.backToCompanies}
                                paOnAdd={e => {
                                    if (this.state.tabIndex === 0) {
                                        if (this.tabActions.contacts.onAdd) {
                                            this.tabActions.contacts.onAdd();
                                        }
                                    }
                                }}
                                paShowSaveButton={e => {
                                    if (this.state.tabIndex === 0) {
                                        return this.tabActions.contacts.showSaveButton ? this.tabActions.contacts.showSaveButton() : false;
                                    }
                                    return false;
                                }}
                                paGlobalSaveOnClick={e => {

                                    if (this.state.tabIndex === 0) {
                                        if (this.tabActions.contacts.onSave) {
                                            this.tabActions.contacts.onSave();
                                        }
                                    }
                                }}
                                hideAdd={this.state.tabIndex > 0}
                                hideStatus={this.state.tabIndex > 0}
                                paRefresh={e => {

                                    switch (this.state.tabIndex) {

                                        case 0:
                                            if (this.tabActions.contacts.onRefresh) {
                                                this.tabActions.contacts.onRefresh();
                                            }
                                            break;

                                        case 1:
                                            if (this.tabActions.participants.onRefresh) {
                                                this.tabActions.participants.onRefresh();
                                            }
                                            break;

                                        case 2:
                                            if (this.tabActions.trainings.onRefresh) {
                                                this.tabActions.trainings.onRefresh();
                                            }
                                            break;
                                    }
                                }}
                                paStatusAll={e => {

                                    switch (this.state.tabIndex) {

                                        case 0:
                                            if (this.tabActions.contacts.onStatusAll) {
                                                this.tabActions.contacts.onStatusAll();
                                            }
                                            break;

                                        case 1:
                                            if (this.tabActions.participants.onStatusAll) {
                                                this.tabActions.participants.onStatusAll();
                                            }
                                            break;

                                        case 2:
                                            if (this.tabActions.trainings.onStatusAll) {
                                                this.tabActions.trainings.onStatusAll();
                                            }
                                            break;
                                    }
                                }}
                                paStatusActive={e => {

                                    switch (this.state.tabIndex) {

                                        case 0:
                                            if (this.tabActions.contacts.onStatusActive) {
                                                this.tabActions.contacts.onStatusActive();
                                            }
                                            break;

                                        case 1:
                                            if (this.tabActions.participants.onStatusActive) {
                                                this.tabActions.participants.onStatusActive();
                                            }
                                            break;

                                        case 2:
                                            if (this.tabActions.trainings.onStatusActive) {
                                                this.tabActions.trainings.onStatusActive();
                                            }
                                            break;
                                    }
                                }}
                                paStatusInactive={e => {

                                    switch (this.state.tabIndex) {

                                        case 0:
                                            if (this.tabActions.contacts.onStatusInactive) {
                                                this.tabActions.contacts.onStatusInactive();
                                            }
                                            break;

                                        case 1:
                                            if (this.tabActions.participants.onStatusInactive) {
                                                this.tabActions.participants.onStatusInactive();
                                            }
                                            break;

                                        case 2:
                                            if (this.tabActions.trainings.onStatusInactive) {
                                                this.tabActions.trainings.onStatusInactive();
                                            }
                                            break;
                                    }
                                }} />

                            <div className="container">
                                <Tabs className="s-tabs-nb" activeKey={this.state.key} onSelect={this.onTabSelect} id="tabCompanies">
                                    <Tab eventKey={0} title={this.activeLang.labels['lbl_Contacts']}>
                                        <CompanyContacts
                                            currentTabIndex={this.state.tabIndex}
                                            setNavBarSearch={this.setNavBarSearch}
                                            tabActions={this.tabActions.contacts}
                                            pageViewModel={this.pageViewModel}
                                            companyViewModel={this.companyViewModel}
                                            errorHandler={this.errorHandler} />
                                    </Tab>
                                    <Tab eventKey={1} title={this.activeLang.labels['lbl_Participants']}>
                                        <CompanyParticipants
                                            currentTabIndex={this.state.tabIndex}
                                            setNavBarSearch={this.setNavBarSearch}
                                            tabActions={this.tabActions.participants}
                                            contactsTabActions={this.tabActions.contacts}
                                            pageViewModel={this.pageViewModel}
                                            companyViewModel={this.companyViewModel}
                                            errorHandler={this.errorHandler} />
                                    </Tab>
                                    <Tab eventKey={2} title={this.activeLang.labels['lbl_Menu_trainings']}>
                                        <CompanyTrainings
                                            currentTabIndex={this.state.tabIndex}
                                            setNavBarSearch={this.setNavBarSearch}
                                            tabActions={this.tabActions.trainings}
                                            contactsTabActions={this.tabActions.contacts}
                                            pageViewModel={this.pageViewModel}
                                            companyViewModel={this.companyViewModel}
                                            errorHandler={this.errorHandler} />
                                    </Tab>
                                </Tabs>

                            </div>
                        </div>
                    );
                }
            }));

export default CompanyPersons;
