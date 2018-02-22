import React from "react";
import { observer, inject } from "mobx-react";
import LazyLoad from 'react-lazy-load';

import { Button, FormControl, Checkbox, Row, Col } from "react-bootstrap";

import Datepicker from "react-datepicker";
import moment from "moment-es6";

import Helper from "../../../Helper/Helper";

import ModalHandler from "../../ModalHandler/ModalHandler";
import WaitControl from "../../WaitControl/WaitControl";
import RowLazyWait from "../../RowLazyWait/RowLazyWait";

import GridRowToolbar from "../../GridRowToolbar/GridRowToolbar";
import PageComponent from "../../PageComponents/PageComponent";

import ClubMembers from "./ClubMembers";
import ClubViewModel from "./ClubViewModel";


const Clubs = inject("store")(
  observer(
    class Clubs extends React.Component {

      constructor(props) {
        super(props);

        this.state = { isModalShown: false };

        this.pageViewModel = props.pageViewModel;
        this.errorHandler = props.errorHandler;

        this.viewModel = new ClubViewModel();

        this.viewModel.backToCompanies = e => {

          this.viewModel.selectedClubForMembers = null;
          this.pageViewModel.menu.navBarSearch = this.navBarSearch;
        };

        this.modalHandler = new ModalHandler();
        this.activeLang = this.props.store.langStore.active;

        this.getClubs = this.getClubs.bind(this);
        this.getClubRow = this.getClubRow.bind(this);
        this.saveClubs = this.saveClubs.bind(this);
        this.getLookups = this.getLookups.bind(this);

        this.changeStatus = this.changeStatus.bind(this);

        this.navBarSearch = {
          page: 'clubs',
          searchAction: () => {
            this.offset = 0;
            this.getClubs();
          },
          getSearchText: () => this.viewModel.searchText,
          setSearchText: value => this.viewModel.searchText = value,
          clearText: () => {

            this.viewModel.searchText = '';
            this.offset = 0;
            this.getClubs();
          }
        };

        this.pageViewModel.menu.navBarSearch = this.navBarSearch;

        this.limit = Helper.LAZY_LOAD_LIMIT;
        this.offset = 0;
      }

      componentWillMount() {
        this.getClubs();
      }

      getLookups() {

        if (!this.gettingLookups) {

          const promises = [];

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

          if (this.viewModel.occupations.length === 0) {

            let idCounter = -1;

            promises.push(
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

      getClubs() {

        const isFullRefresh = this.offset === 0;

        if (isFullRefresh) {

          this.viewModel.clubs.length = 0;

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
            promise: Helper.FetchPromiseGet('/club/get/', params),
            success: data => {

              if (data && data.length > 0) {

                this.viewModel.removeLazyWaitRecord();

                const temp = [...data.map((v, i) => this.viewModel.syncClubItem(v))];
                temp.push(this.viewModel.getLazyWaitRecord());

                this.viewModel.clubs.push(...temp);
              }
              else {

                this.viewModel.removeLazyWaitRecord();
              }
            },
            incrementSession: () => {

              this.getClubsPromiseID = this.getClubsPromiseID ? (this.getClubsPromiseID + 1) : 1;
              idCounter = this.getClubsPromiseID;
            },
            sessionValid: () => {

              return idCounter === this.getClubsPromiseID;
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

      getClubRow(value, index) {

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
              <RowLazyWait colSpan={4} spin={true} onAppear={() => {

                this.offset += this.limit;
                this.getClubs();

              }} />
            </tr>
            :
            <tr key={value.genId}>

              <td className="s-td-cell-status">
                <div className={statusColor}>
                </div>
              </td>
              <td className="s-td-cell-name" onClick={e => {
                this.getLookups();
                this.viewModel.selectedClubForMembers = value;
              }}>
                {value.name}
              </td>

              <td>
                {value.endDate
                  ? moment(value.endDate).format("DD/MM/YYYY")
                  : null}
              </td>

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
                deleteTitle={this.activeLang.labels["lbl_DeleteClub"]}/>
            </tr>
        );
      }

      saveClubs() {

        let idCounter = -1;

        const savePromises = {
          options: this.viewModel.clubs
            .filter((v, i) => v.recordState && v.recordState !== 0 && !v.isSaving)
            .map((toSave, index) => {

              toSave.isSaving = true;

              return {
                promise: Helper.FetchPromisePost('/club/Save', toSave.getValue()),
                success: data => {

                  if (data) {

                    if (toSave.recordState === 30) {

                      this.viewModel.removeClub(toSave);
                    }
                    else if (!data.ok) {

                      toSave.sync(data);
                    }
                  }
                },
                failure: error => {

                  switch (error.exceptionID) {

                    case 1062:

                      toSave.error = this.activeLang.msgs['errMsg_ClubExists'].replace('{1}', `'${toSave.name}'`);
                      break;

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

            this.saveClubsPromiseID = this.saveClubsPromiseID ? (this.saveClubsPromiseID + 1) : 1;
            idCounter = this.saveClubsPromiseID;
          },
          sessionValid: () => {

            return idCounter === this.saveClubsPromiseID;
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
              promise: Helper.FetchPromisePost('/club/changeStatus', { id: value.id, status: value.status }),
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

            paTitle={this.activeLang.labels["lbl_Menu_clubs"]}
            paSearchPlaceholder={this.activeLang.labels["lbl_SearchClubs"]}
            paSearchValue={this.viewModel.searchText}
            paOnSearchValueChange={e => this.viewModel.searchText = e.target.value}
            paOnSearch={e => this.getClubs(this.viewModel.searchText)}
            paClearSearchValue={e => this.viewModel.searchText = ''}
            paOnAdd={e => {
              this.viewModel.selectedValue = this.viewModel.getNewClub();
              this.modalHandler.show();
            }}
            paShowSaveButton={e => {
              const temp = this.viewModel.clubs.find((v, i) => !v.isLazyWait && v.recordState !== 0 && !v.isSaving) ? true : false;

              return !this.viewModel.isModalShown && temp;
            }}
            paGlobalSaveOnClick={e => {
              this.saveClubs();
            }}

            paRefresh={e => {
              this.offset = 0;
              this.getClubs();
            }}

            paStatusAll={e => {

              this.viewModel.statusType = null;
              this.offset = 0;
              this.getClubs();

            }}
            paStatusActive={e => {

              this.viewModel.statusType = 1;
              this.offset = 0;
              this.getClubs();

            }}
            paStatusInactive={e => {

              this.viewModel.statusType = 0;
              this.offset = 0;
              this.getClubs();

            }}

            getTableHeaders={() => {

              return (

                <tr>

                  <th className="s-th-cell-status"></th>
                  <th className="s-th-cell-name">{this.activeLang.labels["lbl_Name"]}</th>
                  <th>{this.activeLang.labels["lbl_EndDate"]}</th>
                  <th className="s-th-cell-active">{this.activeLang.labels["lbl_Active"]}</th>
                  <th className="s-th-cell-controls" />
                </tr>

              );
            }}
            getTableRows={() => this.viewModel.clubs.map(this.getClubRow)}

            hidePage={this.viewModel.selectedClubForMembers ? true : false}
            hideNext
            hidePrev
            
            getSiblings={() => {

              return (

                this.viewModel.selectedClubForMembers ?

                  <ClubMembers key="ClubMembers" pageViewModel={this.pageViewModel} clubViewModel={this.viewModel} errorHandler={this.errorHandler} />
                  :
                  null

              );
            }}

            modalHandler={this.modalHandler}
            getModalHeader={() => {

              return this.activeLang.labels[
                this.viewModel.selectedValue
                  && this.viewModel.selectedValue.recordState === 10 ? 'lbl_NewClub' : 'lbl_EditClub'];
            }}

            getModalInRoot={() => {

              return <WaitControl opacity50={true} />;
            }}


            getModalBody={() => {

              return (
                this.viewModel.selectedValue === null ?
                  null
                  :

                  <div className="s-modal-form">
                    <Row>

                      <Col sm={12}>

                        <div className="form-group s-form-group s-form-input">
                          <div className="s-label">
                            <span>{this.activeLang.labels['lbl_Name']}</span>
                          </div>
                          <input className={this.viewModel.selectedValue.isNameValid() ? 'form-control s-input' : 'form-control s-input-error'}
                            type="text"
                            value={this.viewModel.selectedValue.name}
                            onChange={e => {

                              this.viewModel.selectedValue.name = e.target.value;
                              this.viewModel.selectedValue.checkRecordState();

                            }} />
                          {
                            this.viewModel.selectedValue.isNameValid() ?
                              null
                              :
                              <small className="s-label-error">{this.activeLang.msgs['msg_ValReq']}</small>
                          }
                        </div>
                      </Col>

                      <Col sm={12}>

                        <div className="form-group s-form-group s-form-input">
                          <div className="s-label">
                            <span>{this.activeLang.labels['lbl_EndDate']}</span>
                          </div>
                          <Datepicker
                            dateFormat={Helper.DATE_FORMAT}
                            className="form-control s-input"
                            placeholderText={this.activeLang.labels["lbl_EndDate"]}
                            selected={this.viewModel.selectedValue.endDate}
                            onChange={date => {

                              this.viewModel.selectedValue.endDate = date;
                              this.viewModel.selectedValue.checkRecordState();
                            }
                            }

                          />

                        </div>
                      </Col>

                    </Row>

                  </div>
              );
            }}

            getModalFooter={() => {

              return (

                <div>
                  <Button className="s-btn-medium-blue"
                    onClick={e => {

                      if (this.viewModel.selectedValue.isValid()) {

                        this.modalHandler.hide('noRevert');
                      }
                    }}>
                    {this.activeLang.labels["lbl_SaveLater"]}
                  </Button>

                  <Button className="s-btn-medium-primary"
                    onClick={e => {

                      if (this.viewModel.selectedValue.isValid()) {

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

                      this.viewModel.addNewClub(this.viewModel.selectedValue);
                    }

                    if (args.action === 'save') {

                      this.saveClubs();
                    }
                    break;

                  default:

                    if (this.viewModel.selectedValue) {

                      if (this.viewModel.selectedValue.recordState === 10) {

                        this.viewModel.removeClub(this.viewModel.selectedValue);
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
    }
  )
);

export default Clubs;
