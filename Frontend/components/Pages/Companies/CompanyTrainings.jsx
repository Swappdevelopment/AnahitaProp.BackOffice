import React from "react";
import ReactDOM from "react-dom";
import { observer, inject } from "mobx-react";
import { observe } from "mobx";

import { Checkbox, Button, Row, Col, Overlay, OverlayTrigger, Popover } from "react-bootstrap";

import moment from "moment-es6";
import Helper from "../../../Helper/Helper";

import ModalHandler from "../../ModalHandler/ModalHandler";
import WaitControl from "../../WaitControl/WaitControl";

import GridRowToolbar from "../../GridRowToolbar/GridRowToolbar";
import PageComponent from "../../PageComponents/PageComponent";

import CompanyPartTrngViewModel from "./CompanyPartTrngViewModel";

import RowLazyWait from "../../RowLazyWait/RowLazyWait";
import CompanyContactDetails from "./CompanyContactDetails";


const CompanyTrainings =
  inject("store")(
    observer(
      class CompanyTrainings extends React.Component {

        constructor(props) {
          super(props);

          this.pageViewModel = props.pageViewModel;
          this.companyViewModel = props.companyViewModel;

          this.viewModel = new CompanyPartTrngViewModel();

          this.viewModel.showCourseDetails = true;

          this.contactsViewModel = this.props.contactsTabActions.viewModel;

          this.errorHandler = props.errorHandler;

          this.modalHandler = new ModalHandler();

          this.state = {};

          this.activeLang = this.props.store.langStore.active;

          this.getParticipants = this.getParticipants.bind(this);
          this.getParticipantRow = this.getParticipantRow.bind(this);
          this.getTrainings = this.getTrainings.bind(this);
          this.getTrainingRow = this.getTrainingRow.bind(this);
          this.getObjectiveElement = this.getObjectiveElement.bind(this);
          this.popObjectives = this.popObjectives.bind(this);
          this.getObjectives = this.getObjectives.bind(this);
          this.onMainRowClicked = this.onMainRowClicked.bind(this);
          this.isValidTabIndex = this.isValidTabIndex.bind(this);

          observe(this.companyViewModel, 'selectedCompForContacts', change => {

            this.navBarSearch.searchAction();
          });


          this.limit = Helper.LAZY_LOAD_LIMIT;
          this.offset = 0;

          this.subLimit = Helper.LAZY_LOAD_LIMIT;
          this.subOffset = 0;


          this.navBarSearch = {
            page: 'CompanyTrainings',
            searchAction: () => {
              this.offset = 0;
              this.getTrainings();
            },
            getSearchText: () => this.viewModel.mainSearchText,
            setSearchText: value => this.viewModel.mainSearchText = value,
            clearText: () => {

              this.viewModel.mainSearchText = '';
              this.offset = 0;
              this.getTrainings();
            }
          };

          this.props.tabActions.getNavBarSearch = () => {

            return this.navBarSearch;
          };

          this.props.tabActions.onRefresh = () => {

            this.offset = 0;
            this.getTrainings()
          };

          this.handleScroll = this.handleScroll.bind(this);

        }

        componentWillMount() {

          this.getTrainings();
        }

        componentDidMount() {
          window.addEventListener('scroll', this.handleScroll);
        }

        componentWillUnmount() {

          window.removeEventListener('scroll', this.handleScroll);

          this.affixTarget = null;
        }

        handleScroll(e) {

          if (e.srcElement.scrollingElement.scrollTop >= 103) {

            this.setState({
              affix: true
            });
          }
          else {
            this.setState({
              affix: false
            });
          }
        }
        componentWillReceiveProps(nextProps) {

          this.nextProps = nextProps;

          if (nextProps.currentTabIndex !== this.props.currentTabIndex) {

            if (this.viewModel.trainings.length === 0) {

              this.navBarSearch.searchAction();
            }
          }
        }

        isValidTabIndex() {

          return this.props.currentTabIndex === 2 || (this.nextProps && this.nextProps.currentTabIndex === 2);
        }

        getParticipants() {

          if (this.viewModel.selectedMainIndex >= 0 && this.viewModel.selectedMainIndex < this.viewModel.trainings.length) {

            const training = this.viewModel.trainings[this.viewModel.selectedMainIndex];

            const params = {
              companyID: this.companyViewModel.selectedCompForContacts.id,
              courseDetailID: training.id,
              withOccupations: true,
              statusFilter: 1,
              offset: this.subOffset,
              limit: this.subLimit,
            };

            const isFullRefresh = this.subOffset === 0;

            if (isFullRefresh) {

              this.viewModel.participants.length = 0;
              this.viewModel.gettingSubRecords = true;
            }
            else {

              this.viewModel.isTrngLazyLoading = true;
            }

            let idCounter = -1;

            Helper.RunPromise(
              {
                promise: Helper.FetchPromiseGet('/company/getParticipants', params),
                success: data => {

                  if (data && data.length > 0) {

                    this.viewModel.removePartLazyWaitRecord();

                    const temp = [...data.map((v, i) => this.viewModel.syncParticipantItem(v))];

                    if (data.length >= this.limit) {

                      temp.push(this.viewModel.getPartLazyWaitRecord());
                    }

                    this.viewModel.participants.push(...temp);
                  }
                  else {

                    this.viewModel.removePartLazyWaitRecord();
                  }
                },
                incrementSession: () => {

                  this.getParticipantsPromiseID = this.getParticipantsPromiseID ? (this.getParticipantsPromiseID + 1) : 1;
                  idCounter = this.getParticipantsPromiseID;
                },
                sessionValid: () => {

                  return idCounter === this.getParticipantsPromiseID;
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
                this.viewModel.gettingSubRecords = false;
                this.viewModel.isTrngLazyLoading = false;
              }
            );
          }
        }

        onMainRowClicked(index) {

          if (this.viewModel.selectedMainIndex !== index) {

            this.viewModel.selectedMainIndex = index;
            this.getParticipants();
          }
        }

        getParticipantRow(value, index) {

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

          return (
            value.isLazyWait ?
              <tr key={value.genId}>
                <RowLazyWait colSpan={this.viewModel.showCourseDetails ? 1 : 2} spin={true} onAppear={() => {

                  this.subOffset += this.subLimit;
                  this.getParticipants();

                }} />
              </tr>
              :
              <tr
                key={value.genId}>
                <td className="s-td-cell-name">
                  <img style={{ width: '30px', height: '30px', borderRadius: '50%', marginRight: '15px' }}
                    src={`../images/${genderName}_avatar.png`} />
                  {`${value.lName} ${value.fName}`}
                </td>
                {
                  this.viewModel.showCourseDetails ?
                    null
                    :
                    <td>
                      {value.email}
                    </td>
                }
                {
                  this.viewModel.showCourseDetails ?
                    null
                    :
                    <td>
                      {value.occupationName}
                    </td>
                }
                <td>
                  <OverlayTrigger
                    placement="top"
                    rootClose
                    overlay={Helper.getTooltip(
                      "tltpTopAdd",
                      this.activeLang.labels["lbl_AddAsCntct"]
                    )}>
                    <Button
                      className="s-btn-small-blue-empty"
                      onClick={e => {
                        e.stopPropagation();

                        let idCounter = -1;

                        Helper.RunPromise(
                          {
                            promise: Helper.FetchPromiseGet('/company/CanParticipantBeContact', { companyID: this.companyViewModel.selectedCompForContacts.id, personID: value.id }),
                            success: data => {

                              if (data && data.ok) {

                                value.occupation_Id = data.occupationID;
                                value.occupationName = data.occupationName;

                                this.contactsViewModel.toAddContact = value;
                                this.modalHandler.show();
                              }
                              else {

                                this.errorHandler.show(
                                  this.activeLang.labels['lbl_Warning'],
                                  this.activeLang.msgs['msg_AlrdExstAsCntct']
                                    .replace('{1}', `'${value.lName} ${value.fName}'`)
                                    .replace('{2}', `'${this.companyViewModel.selectedCompForContacts.name}'`));
                              }
                            },
                            incrementSession: () => {

                              this.canParticipantBeContactPromiseID = this.canParticipantBeContactPromiseID ? (this.canParticipantBeContactPromiseID + 1) : 1;
                              idCounter = this.canParticipantBeContactPromiseID;
                            },
                            sessionValid: () => {

                              return idCounter === this.canParticipantBeContactPromiseID;
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
                            this.viewModel.isPartLazyLoading = false;
                          }
                        );


                      }}>
                      <i className="la la-plus" />
                    </Button>

                  </OverlayTrigger>
                </td>
              </tr>
          );
        }

        getTrainings() {

          if (this.isValidTabIndex()) {

            if (this.companyViewModel.selectedCompForContacts) {

              const params = {
                companyID: this.companyViewModel.selectedCompForContacts.id,
                statusFilter: 1,
                includeObjectivesLength: true,
                offset: this.offset,
                limit: this.limit
              };

              if (this.viewModel.mainSearchText) {
                params['nameFilter'] = this.viewModel.mainSearchText;
              }

              const isFullRefresh = this.offset === 0;

              const prevSelectedMainIndex = this.viewModel.selectedMainIndex;

              if (isFullRefresh) {

                this.viewModel.trainings.length = 0;

                this.pageViewModel.pageBlurPixels = 3;
                this.pageViewModel.showPageWaitControl = true;

                this.viewModel.selectedMainIndex = -1;
                this.viewModel.participants.length = 0;
              }
              else {

                this.viewModel.isTrngLazyLoading = true;
              }

              this.viewModel.trainings.length = 0;

              let idCounter = -1;

              Helper.RunPromise(
                {
                  promise: Helper.FetchPromiseGet('/company/GetCourses', params),
                  success: data => {

                    if (data && data.length > 0) {

                      this.viewModel.removeTrngLazyWaitRecord();

                      const temp = [...data.map((v, i) => this.viewModel.syncTrainingItem(v))];

                      if (data.length >= this.subLimit) {

                        temp.push(this.viewModel.getTrngLazyWaitRecord());
                      }

                      this.viewModel.trainings.push(...temp);


                      if (this.viewModel.trainings.length > 0) {

                        if (prevSelectedMainIndex >= 0 && prevSelectedMainIndex !== this.viewModel.selectedMainIndex) {

                          this.onMainRowClicked(prevSelectedMainIndex);
                        }
                        else if (this.viewModel.selectedMainIndex < 0) {

                          this.onMainRowClicked(0);
                        }
                      }
                    }
                    else {

                      this.viewModel.removeTrngLazyWaitRecord();
                    }
                  },
                  incrementSession: () => {

                    this.getTrainingsPromiseID = this.getTrainingsPromiseID ? (this.getTrainingsPromiseID + 1) : 1;
                    idCounter = this.getTrainingsPromiseID;
                  },
                  sessionValid: () => {

                    return idCounter === this.getTrainingsPromiseID;
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
                  this.viewModel.isPartLazyLoading = false;
                }
              );
            }
          }
          else {

            this.viewModel.trainings.length = 0
          }
        }

        getTrainingRow(value, index) {

          return (

            value.isLazyWait ?
              <tr key={value.genId}>
                <RowLazyWait colSpan={this.viewModel.showCourseDetails ? 8 : 5} spin={true} onAppear={() => {

                  this.offset += this.limit;
                  this.getTrainings();

                }} />
              </tr>
              :
              <tr
                key={value.genId}
                className={`cursor-pointer ${index === this.viewModel.selectedMainIndex ? 'selected' : ''}`}
                onClick={e => {

                  this.onMainRowClicked(index);
                }}>

                <td className="s-td-cell-name-xshort">{value.header.title}</td>
                <td>{moment(value.startDate).format("DD/MM/YYYY")}</td>

                {
                  this.viewModel.showCourseDetails ?
                    <td>{value.closedDate ? moment(value.closedDate).format("DD/MM/YYYY") : ''}</td>
                    :
                    null
                }

                <td>
                  {this.getObjectiveElement(value)}
                </td>

                {
                  this.viewModel.showCourseDetails ?
                    <td>{this.activeLang.labels[`lbl_CourseHType_${value.header.type}`]}</td>
                    :
                    null
                }

                {/* {
                  this.viewModel.showCourseDetails ?
                    <td>{this.activeLang.labels[`lbl_CourseHApproach_${value.header.approach}`]}</td>
                    :
                    null
                } */}

                <td>{Helper.minsToDDHHMMSS(value.header.expectedDuration, true)}</td>
                {/* <td>{value.header.happeningsCount}</td> */}
              </tr >
          );
        }

        getObjectiveElement(value, placement) {

          if (value) {

            let ovtObjectivesTarget = null;

            if (value.header.hasObjectives) {

              placement = placement ? placement : 'top';

              return (
                <div>
                  <Overlay
                    rootClose
                    target={p => ovtObjectivesTarget}
                    show={value.header.showObjectives}
                    onHide={() => value.header.showObjectives = false}
                    placement={placement}>
                    {
                      this.popObjectives(
                        value,
                        e => {
                          value.header.showObjectives = false;
                        })
                    }
                  </Overlay>
                  <Button
                    className="s-btn-small-blue-empty"
                    ref={r => ovtObjectivesTarget = Helper.reactElementToDOM(r)}
                    onClick={e => this.getObjectives(value, () => value.header.showObjectives = true)}>
                    <span className={`la ${value.header.isGettingObjectives ? 'la-circle-o-notch la-spin' : 'la-comment-o'}`}></span>
                  </Button>
                </div>
              );
            }

            return (
              <span className="la la-comment-o lightgray2"></span>
            );
          }

          return null;
        }

        getObjectives(value, onSuccess) {

          if (value && value.header && value.header.id > 0 && !value.isGettingObjectives) {

            if (value.header.fromObjectives) {

              if (onSuccess) {
                onSuccess();
              }
            }
            else {

              let idCounter = -1;

              value.header.isGettingObjectives = true;

              Helper.RunPromise(
                {
                  promise: Helper.FetchPromiseGet('/training/GetObjectives/', { headerID: value.header.id }),
                  success: data => {

                    if (data && data.result) {

                      value.header.fromObjectives = data.result;

                      if (value.header.originalValue) {

                        value.header.originalValue.fromObjectives = data.result;
                      }

                      if (onSuccess) {
                        onSuccess();
                      }
                    }
                  },
                  incrementSession: () => {

                    this.getObjectivesPromiseID = this.getObjectivesPromiseID ? (this.getObjectivesPromiseID + 1) : 1;
                    idCounter = this.getObjectivesPromiseID;
                  },
                  sessionValid: () => {

                    return idCounter === this.getObjectivesPromiseID;
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
                  value.header.isGettingObjectives = false;
                }
              );
            }
          }
        }

        popObjectives(value, onClose) {

          if (value) {

            return (

              <Popover id="popObjectives">

                <div className="popover-close">

                  <Button className="s-btn-small-red-empty"
                    onClick={e => {
                      if (onClose) {
                        onClose(e);
                      }
                    }}>
                  </Button>

                </div>
                <p>
                  {value.header.fromObjectives}
                </p>
              </Popover >
            );
          }
        }

        render() {

          return (

            <div className="s-hightlight container s-p-0">
              <Row className="s-row-top">
                <Col xs={12} sm={this.viewModel.showCourseDetails ? 9 : 7}>
                  <div className="s-portlet">
                    <div className="s-portlet-body">
                      <table className="s-table" style={{ marginBottom: 20 }}>
                        <tbody>
                          <tr>
                            <td>
                              <h4 className="s-section-header s-m-0">{this.activeLang.labels['lbl_Menu_trainings']}</h4>
                            </td>
                            {
                              this.viewModel.showCourseDetails ?
                                null
                                :
                                <td className="td-right">
                                  <Button style={{ padding: "0 0 0 8px" }} className="s-btn-small-blue-empty" onClick={e => {
                                    this.viewModel.showCourseDetails = !this.viewModel.showCourseDetails;
                                  }}>
                                    <i className="la la-chevron-right"></i>
                                  </Button>
                                </td>
                            }
                          </tr>
                        </tbody>
                      </table>

                      <PageComponent
                        notSPage
                        hideActions

                        getTableHeaders={() => {
                          return (
                            <tr>
                              <th className="s-th-cell-name">{this.activeLang.labels['lbl_Title']}</th>
                              <th>{this.activeLang.labels['lbl_StartDate']}</th>
                              {
                                this.viewModel.showCourseDetails ?
                                  <th>{this.activeLang.labels['lbl_ClosedDate']}</th>
                                  :
                                  null
                              }
                              <th>{this.activeLang.labels['lbl_Objectives']}</th>
                              {
                                this.viewModel.showCourseDetails ?
                                  <th>{this.activeLang.labels['lbl_CourseType']}</th>
                                  :
                                  null
                              }
                              {/* {
                                this.viewModel.showCourseDetails ?
                                  <th>{this.activeLang.labels['lbl_CourseApproach']}</th>
                                  :
                                  null
                              } */}
                              <th>{this.activeLang.labels['lbl_Duration']}</th>
                              {/* <th>{this.activeLang.labels['lbl_Happenings']}</th> */}
                            </tr>
                          );
                        }}
                        getTableRows={() => this.viewModel.trainings.map(this.getTrainingRow)}
                      />

                    </div>
                  </div>
                </Col>
                <Col xs={12} sm={this.viewModel.showCourseDetails ? 3 : 5}>
                  <div ref={r => this.affixTarget = ReactDOM.findDOMNode(r)} className={this.state.affix ? 's-portlet-fixed' : 's-portlet'}
                    style={{
                      width: this.viewModel.showCourseDetails ? 270 : 470
                    }}
                  >
                    <div className="s-portlet-body">
                      <table className="s-table" style={{ marginBottom: 20 }}>
                        <tbody>
                          <tr>
                            {
                              this.viewModel.showCourseDetails ?
                                <td className="td-left">
                                  <Button style={{ padding: "0 8px 0 0" }} className="s-btn-small-blue-empty" onClick={e => {
                                    this.viewModel.showCourseDetails = !this.viewModel.showCourseDetails;
                                  }}>
                                    <i className="la la-chevron-left"></i>
                                  </Button>
                                </td>
                                :
                                null
                            }
                            <td>
                              <h4 className="s-section-header s-m-0">{this.activeLang.labels['lbl_Participants']}</h4>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      {
                        this.viewModel.gettingSubRecords ?
                          <div className="wait-container">
                            <WaitControl show={this.viewModel.gettingSubRecords} height={300} />
                          </div>
                          :
                          <div style={{ position: 'relative', height: 'calc(100vh - 340px)', overflowY: 'auto', overflowX: 'hidden' }}>
                            <PageComponent
                              notSPage
                              hideActions
                              getTableHeaders={() => {
                                return (
                                  <tr>
                                    <th className="s-th-cell-name">{this.activeLang.labels["lbl_LName"]}</th>
                                    {
                                      this.viewModel.showCourseDetails ?
                                        null
                                        :
                                        <th>{this.activeLang.labels["lbl_Email"]}</th>
                                    }
                                    {
                                      this.viewModel.showCourseDetails ?
                                        null
                                        :
                                        <th>{this.activeLang.labels["lbl_Occup"]}</th>
                                    }
                                  </tr>
                                );
                              }}
                              getTableRows={() => this.viewModel.participants.map(this.getParticipantRow)}

                              modalHandler={this.modalHandler}
                              getModalHeader={() => this.activeLang.labels['lbl_AddAsCntct']}

                              getModalInRoot={() => <WaitControl opacity50={true} />}

                              getModalBody={() => {

                                return (
                                  <CompanyContactDetails
                                    autoAddContact
                                    hideSaveLater
                                    errorHandler={this.errorHandler}
                                    companyItem={this.companyViewModel.selectedCompForContacts}
                                    modalHandler={this.modalHandler}
                                    saveContacts={this.props.contactsTabActions.saveContacts}
                                    viewModel={this.contactsViewModel}
                                    pageViewModel={this.pageViewModel} />
                                );

                              }}

                              getModalFooter={() => {

                              }}

                              onModalShow={args => this.viewModel.isModalShown = true}
                              onModalHide={args => {

                                this.viewModel.isModalShown = false;

                                if (args) {

                                  switch (args.action) {

                                    case 'later':
                                    case 'save':
                                      if (this.contactsViewModel.selectedValue
                                        && this.contactsViewModel.selectedValue.recordState === 10) {

                                        this.contactsViewModel.addNewContact(this.contactsViewModel.selectedValue);
                                      }

                                      if (args.action === 'save') {

                                        this.props.contactsTabActions.saveContacts();
                                      }
                                      break;

                                    default:

                                      if (this.contactsViewModel.selectedValue) {

                                        if (this.contactsViewModel.selectedValue.recordState === 10) {

                                          this.contactsViewModel.removeContact(this.contactsViewModel.selectedValue);
                                        }
                                        else {

                                          this.contactsViewModel.selectedValue.sync(this.contactsViewModel.selectedValue.originalValue);
                                        }
                                      }
                                      break;
                                  }

                                  this.contactsViewModel.selectedValue = null;
                                  this.contactsViewModel.verifyingToAdd = false;
                                  this.contactsViewModel.toAddContact = null;
                                  this.contactsViewModel.foundToAdd.length = 0;
                                }
                              }}
                            />
                          </div>
                      }
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
          );
        }
      }
    )
  );

export default CompanyTrainings;
