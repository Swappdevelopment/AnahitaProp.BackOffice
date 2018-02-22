import React from "react";
import { observer, inject } from "mobx-react";
import { observe } from "mobx";

import { Checkbox, Button, OverlayTrigger } from "react-bootstrap";

import moment from "moment-es6";
import Helper from "../../../Helper/Helper";

import ModalHandler from "../../ModalHandler/ModalHandler";
import WaitControl from "../../WaitControl/WaitControl";

import GridRowToolbar from "../../GridRowToolbar/GridRowToolbar";
import PageComponent from "../../PageComponents/PageComponent";

import CompanyContactsViewModel from "./CompanyContactsViewModel";
import CompanyContactDetails from "./CompanyContactDetails";
import CompanyContactRecipientType from "./CompanyContactRecipientType";


const CompanyContacts = inject("store")(
  observer(
    class CompanyContacts extends React.Component {

      constructor(props) {
        super(props);

        this.state = { isModalShown: false, modalMode: 'default' };

        this.pageViewModel = props.pageViewModel;
        this.companyViewModel = props.companyViewModel;

        this.viewModel = new CompanyContactsViewModel(this.companyViewModel);

        this.props.tabActions.viewModel = this.viewModel;
        this.props.tabActions.saveContacts = this.saveContacts;

        this.modalHandler = new ModalHandler();
        this.errorHandler = props.errorHandler;

        this.activeLang = this.props.store.langStore.active;

        this.getContacts = this.getContacts.bind(this);
        this.getContactRow = this.getContactRow.bind(this);
        this.saveContacts = this.saveContacts.bind(this);
        this.isValidTabIndex = this.isValidTabIndex.bind(this);


        observe(this.companyViewModel, 'selectedCompForContacts', change => {

          this.navBarSearch.searchAction();
        });


        this.navBarSearch = {
          page: 'companyContacts',
          searchAction: () => {
            this.offset = 0;
            this.getContacts();
          },
          getSearchText: () => this.viewModel.searchText,
          setSearchText: value => this.viewModel.searchText = value,
          clearText: () => {

            this.viewModel.searchText = '';
            this.offset = 0;
            this.getContacts();
          }
        };


        this.props.tabActions.getNavBarSearch = () => {

          return this.navBarSearch;
        };

        this.props.tabActions.onAdd = () => {

          this.viewModel.toAddContact = this.viewModel.getNewContact();
          this.modalHandler.show();
        };

        this.props.tabActions.showSaveButton = () => {

          const temp = this.viewModel.contacts.find((v, i) => !v.isLazyWait && v.recordState !== 0 && !v.isSaving) ? true : false;
          return !this.viewModel.isModalShown && temp;
        };

        this.props.tabActions.onSave = () => {

          this.saveContacts();
        };

        this.props.tabActions.onRefresh = () => {

          this.offset = 0;
          this.getContacts()
        };

        this.props.tabActions.onStatusAll = () => {

          this.viewModel.statusType = null;
          this.offset = 0;
          this.getContacts();
        };

        this.props.tabActions.onStatusActive = () => {

          this.viewModel.statusType = 1;
          this.offset = 0;
          this.getContacts();
        };

        this.props.tabActions.onStatusInactive = () => {

          this.viewModel.statusType = 0;
          this.offset = 0;
          this.getContacts();
        };
      }

      componentWillMount() {

        this.getContacts();
      }

      componentWillReceiveProps(nextProps) {

        this.nextProps = nextProps;

        if (nextProps.currentTabIndex !== this.props.currentTabIndex) {

          if (this.viewModel.contacts.length === 0) {

            this.navBarSearch.searchAction();
          }
        }
      }

      isValidTabIndex() {

        return this.props.currentTabIndex === 0 || (this.nextProps && this.nextProps.currentTabIndex === 0);
      }

      getContacts() {

        if (this.isValidTabIndex()) {

          if (this.companyViewModel.selectedCompForContacts) {

            const params = {
              companyID: this.companyViewModel.selectedCompForContacts.id,
              statusFilter: this.viewModel.statusType
            };

            if (this.viewModel.searchText) {
              params['nameFilter'] = this.viewModel.searchText;
            }

            this.viewModel.contacts.length = 0;

            this.pageViewModel.showPageWaitControl = true;
            this.pageViewModel.pageBlurPixels = 3;

            let idCounter = -1;

            Helper.RunPromise(
              {
                promise: Helper.FetchPromiseGet('/company/GetContacts', params),
                success: data => {
                  if (data) {
                    this.viewModel.syncContacts(data);
                    if (data.length > 0) {
                      this.viewModel.selectedCompanyIndex = 0;
                    }
                  }
                },
                incrementSession: () => {

                  this.getContactsPromiseID = this.getContactsPromiseID ? (this.getContactsPromiseID + 1) : 1;
                  idCounter = this.getContactsPromiseID;
                },
                sessionValid: () => {

                  return idCounter === this.getContactsPromiseID;
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
              }
            );
          }
        }
        else {

          this.viewModel.contacts.length = 0
        }
      }

      getContactRow(value, index) {

        let deleteOverlay = null;

        const popDeleteConfirmNoClick = () => {

          if (deleteOverlay) {

            deleteOverlay.hide()
          }
        }

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

        let genderName = 'unknown';

        switch (value.gender) {

          case 10:
            genderName = 'male';
            break;

          case 20:
            genderName = 'female';
            break;
        }

        if (value.errorID === 1062) {

          return (
            <tr key={value.genId}>
              <td className="s-td-cell-status">
                <div className={statusColor}>
                </div>
              </td>
              <td className="s-td-cell-namenl">
                <img style={{ width: '30px', height: '30px', borderRadius: '50%', marginRight: '15px' }}
                  src={`../images/${genderName}_avatar.png`} />
                {value.lName}
              </td>
              <td>
                {value.fName}
              </td>
              <td className="s-td-cell-exist" colSpan={5}>

                <span className="red">{this.activeLang.msgs['msg_PrsnExists']}</span>

                <Button
                  style={{ margin: '0 5px' }}
                  className="s-btn-small-primary-border"
                  onClick={e => {

                    if (value.recordState === 10) {

                      this.viewModel.removeContact(value);
                    }
                    else {

                      value.sync(value.originalValue);
                    }
                  }}>
                  {this.activeLang.labels['lbl_No']}
                </Button>

                <Button
                  className="s-btn-small-primary"
                  onClick={e => {
                    value.forceSave = true;
                    this.saveContacts(value);
                  }}>
                  {this.activeLang.labels['lbl_Yes']}
                </Button>

              </td>
            </tr>
          );
        }

        let receipientTltp = null;

        if (value.contactTypes) {

          receipientTltp = value.contactTypes.filter((v, i) => v.id > 0);

          if (!receipientTltp || receipientTltp.length === 0) {

            receipientTltp = null;
          }
        }

        if (receipientTltp) {

          receipientTltp =
            (
              <div>
                {
                  receipientTltp.map((v, i) => {
                    return (
                      <p key={v.value} style={{margin: 0}}>
                        {this.activeLang.labels[`enum_CntTpVal_${v.value}`]}
                      </p>
                    );
                  })
                }
              </div>
            );
        }
        else {

          receipientTltp = <p style={{margin: 0}}>{this.activeLang.labels['enum_CntTpVal_0']}</p>;
        }


        return (
          <tr key={value.genId}>
            <td className="s-td-cell-status">
              <div className={statusColor}>
              </div>
            </td>
            <td className="s-td-cell-namenl">
              <img style={{ width: '30px', height: '30px', borderRadius: '50%', marginRight: '15px' }}
                src={`../images/${genderName}_avatar.png`} />
              {value.lName}
            </td>
            <td>
              {value.fName}
            </td>
            <td className="hidden-xs hidden-sm">
              {value.email}
            </td>
            <td className="hidden-xs hidden-sm">
              {
                value.telNumbers && value.telNumbers.length > 0 ?
                  `${(value.telNumbers[0].countryPhoneCode ? `(${value.telNumbers[0].countryPhoneCode}) ` : '')}${value.telNumbers[0].number}`
                  :
                  null
              }
            </td>
            <td className="hidden-xs hidden-sm hidden-md">
              {value.occupationName
                ? value.occupationName
                : this.activeLang.labels["lbl_Unknown"]}
            </td>

            <td>
              <OverlayTrigger
                placement="top"
                rootClose
                overlay={Helper.getTooltip("tltpReceipient-${value.genId}", receipientTltp)}>
                <Button
                  className="s-btn-small-blue-empty"
                  onClick={e => {

                    if (!this.state.isModalShown) {

                      this.setState({ modalMode: 'receipient' });
                      this.contactReceipientTarget = value;

                      this.modalHandler.show();
                    }
                  }}>
                  <i className="la la-inbox" />
                </Button>

              </OverlayTrigger>

            </td>

            <td className="s-td-cell-active">

              {
                value.isChangingStatus ?
                  <span className="spinner"></span>
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
              displayName={value ? `${value.lName}, ${value.fName}` : ''}
              onEdit={e => {

                this.viewModel.selectedValue = value;
                value.verifyIdNumber();
                value.checkRecordState();
                this.modalHandler.show();
              }}
              onDelete={e => {

                if (value.recordState === 10) {

                  this.viewModel.removeContact(value);
                }
                else {

                  value.recordState = 30;
                  this.saveContacts();
                }
              }}
              deleteTitle={this.activeLang.labels["lbl_DeleteContact"]} />

          </tr>
        );
      }

      saveContacts(contactsToSave) {

        let idCounter = -1;

        contactsToSave = contactsToSave ? contactsToSave : this.viewModel.contacts.slice();

        if (!Array.isArray(contactsToSave)) {
          contactsToSave = [contactsToSave];
        }

        const savePromises = {
          options: contactsToSave
            .filter((v, i) => v.recordState && v.recordState !== 0 && !v.isSaving)
            .map((toSave, index) => {

              toSave.isSaving = true;

              return {
                promise: Helper.FetchPromisePost('/company/SaveContact', toSave.getValue()),
                success: data => {

                  if (data) {

                    if (toSave.recordState === 30) {

                      this.viewModel.removeContact(toSave);
                    }
                    else if (!data.ok) {

                      toSave.sync(data);
                    }
                  }
                },
                failure: error => {

                  toSave.errorID = error.exceptionID ? error.exceptionID : 0;

                  switch (error.exceptionID) {
                    default:
                      toSave.error = this.activeLang.msgs['errMsg_Aplgs'];
                      break;
                  }
                },
                complete: () => {

                  toSave.isSaving = false;
                }
              };
            }),
          incrementSession: () => {

            this.saveContactsPromiseID = this.saveContactsPromiseID ? (this.saveContactsPromiseID + 1) : 1;
            idCounter = this.saveContactsPromiseID;
          },
          sessionValid: () => {

            return idCounter === this.saveContactsPromiseID;
          }
        };

        Helper.RunPromise(savePromises);
      }

      render() {

        return (

          <PageComponent
            notSPage
            hideActions

            getTableHeaders={() => {

              return (
                <tr>
                  <th className="s-th-cell-status"></th>
                  <th className="s-th-cell-name">{this.activeLang.labels["lbl_LName"]}</th>
                  <th >{this.activeLang.labels["lbl_FName"]}</th>
                  <th className="hidden-xs hidden-sm">{this.activeLang.labels["lbl_Email"]}</th>
                  <th className="hidden-xs hidden-sm">{this.activeLang.labels["lbl_PhoneNumbers"]}</th>
                  <th className="hidden-xs hidden-sm hidden-md">{this.activeLang.labels["lbl_Occup"]}</th>
                  <th>{this.activeLang.labels["lbl_RecptTp"]}</th>
                  <th className="s-th-cell-active">{this.activeLang.labels["lbl_Active"]}</th>
                  <th className="s-th-cell-controls" />
                </tr>
              );
            }}
            getTableRows={() => this.viewModel.contacts.map(this.getContactRow)}

            modalHandler={this.modalHandler}
            getModalHeader={() => this.state.modalMode === 'receipient' ? this.activeLang.labels['lbl_MngRcptntTp'] : this.activeLang.labels['lbl_AddContact']}

            getModalInRoot={() => <WaitControl opacity50={true} />}

            getModalBody={() => {

              switch (this.state.modalMode) {

                case 'receipient':
                  return (
                    <CompanyContactRecipientType
                      contactReceipientTarget={this.contactReceipientTarget}
                      errorHandler={this.errorHandler}
                      companyContactsViewModel={this.viewModel}
                      pageViewModel={this.pageViewModel} />
                  );
              }

              return (
                <CompanyContactDetails
                  errorHandler={this.errorHandler}
                  companyItem={this.companyViewModel.selectedCompForContacts}
                  modalHandler={this.modalHandler}
                  saveContacts={this.saveContacts}
                  viewModel={this.viewModel}
                  pageViewModel={this.pageViewModel} />
              );
            }}

            getModalFooter={() => {

            }}

            onModalShow={args => this.viewModel.isModalShown = true}
            onModalHide={args => {

              this.viewModel.isModalShown = false;

              switch (this.state.modalMode) {

                case 'receipient':

                  break;

                default:

                  if (args) {

                    switch (args.action) {

                      case 'later':
                      case 'save':
                        if (this.viewModel.selectedValue
                          && this.viewModel.selectedValue.recordState === 10) {

                          this.viewModel.addNewContact(this.viewModel.selectedValue);
                        }

                        if (args.action === 'save') {

                          this.saveContacts();
                        }
                        break;

                      default:

                        if (this.viewModel.selectedValue) {

                          if (this.viewModel.selectedValue.recordState === 10) {

                            this.viewModel.removeContact(this.viewModel.selectedValue);
                          }
                          else {

                            this.viewModel.selectedValue.sync(this.viewModel.selectedValue.originalValue);
                          }
                        }
                        break;
                    }

                    this.viewModel.selectedValue = null;
                    this.viewModel.verifyingToAdd = false;
                    this.viewModel.toAddContact = null;
                    this.viewModel.foundToAdd.length = 0;
                  }
                  break;
              }

              this.setState({ modalMode: 'default' });
            }} />


        );
      }
    }
  )
);

export default CompanyContacts;
