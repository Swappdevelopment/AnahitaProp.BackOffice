import React from 'react';
import { observer, inject } from 'mobx-react';

import { Row, Col, Button, Tabs, Tab, Label, OverlayTrigger } from "react-bootstrap";

import Helper from '../../../Helper/Helper';

import DropdownEditor from '../../DropdownEditor/DropdownEditor';
import DropdownEditorMenu from '../../DropdownEditor/DropdownEditorMenu';

import WaitControl from '../../WaitControl/WaitControl';
import WaitBlock from '../../WaitBlock/WaitBlock';

import ProductDetailToolBar from './ProductDetailToolBar';
import UndoManager from '../../../Helper/UndoManager';

import ProdPropertyQuickAddContainer from '../Properties/QuickAddContainer';
import ProjPropertyQuickAddContainer from '../Projects/QuickAddContainer';
import PropertyModel from '../../../Models/PropertyModel';
import ProjectModel from '../../../Models/ProjectModel';


class ProductDetail2 extends React.Component {

    constructor(props) {

        super(props);

        this.editViewModel = props.editViewModel;
        this.viewModel = props.viewModel;

        this.activeLang = this.props.store.langStore.active;

        this.undoManager = new UndoManager();

        this.state = {
            isPopNewPropOpen: false,
            isPopNewProjOpen: false,
            isSavingNewProperty: false,
            isSavingNewProject: false
        };
    }

    onTabSelect = (prodModel, key) => {

        if (prodModel) {

            if (self.type !== key) {

                const undoItem = {
                    key: 'type',
                    value: prodModel.type,
                    model: prodModel
                };

                prodModel.execAction(self => self.type = key);

                if (undoItem.value !== prodModel.type) {

                    this.undoManager.pushToStack(undoItem);
                }
            }

            switch (key) {

                case 10:

                    if (prodModel.originalValue) {

                        prodModel.execAction(self => {

                            self.project_Id = self.originalValue.project_Id ? self.originalValue.project_Id : 0;
                            self.project = self.project_Id > 0 ? self.project_Id : null;
                        });

                        this.undoManager.clearStack('project_Id');
                    }
                    break;

                case 20:

                    this.viewModel.getProjects();
                    break;

                case 30:

                    if (prodModel.originalValue) {

                        prodModel.execAction(self => {

                            self.property_Id = self.originalValue.property_Id ? self.originalValue.property_Id : 0;
                            self.property = self.property_Id > 0 ? self.property_Id : null;
                        });

                        this.undoManager.clearStack('property_Id');
                    }

                    this.viewModel.getProjects();
                    break;
            }
        }
    }

    getTabHeader = (prodModel, label, index) => {

        const isTabActive = prodModel.type === index;

        return (
            <span>
                <span
                    className={'la ' + (isTabActive ? 'la-check-circle' : 'la-circle')}
                    style={{ marginRight: 5 }}>
                </span>
                <span>{label}</span>
            </span>
        );
    }


    addAndSetProductProperty = (value, prodModel) => {

        if (value && prodModel) {

            this.viewModel.execAction(self => {

                value = PropertyModel.init(value, self.properties.length, this.activeLang.code);

                self.properties.splice(0, 0, value);

                this.setPropertyOnProdModel(prodModel, value);
            });
        }
    };

    setPropertyOnProdModel = (prodModel, value) => {

        this.undoManager.pushToStack([
            {
                key: 'property_Id',
                value: prodModel.property_Id,
                model: prodModel
            },
            {
                key: 'property',
                value: prodModel.property_Id > 0 ? prodModel.property_Id : null,
                model: prodModel
            }
        ]);

        prodModel.execAction(() => {

            prodModel.property_Id = value.id;
            prodModel.property = value.id;
            prodModel.receivedInput = true;
        });
    }


    addAndSetProductProject = (value, prodModel) => {

        if (value && prodModel) {

            this.viewModel.execAction(self => {

                value = ProjectModel.init(value, self.projects.length, this.activeLang.code);

                self.projects.splice(0, 0, value);

                this.setProjectOnProdModel(prodModel, value);
            });
        }
    };

    setProjectOnProdModel = (prodModel, value) => {

        this.undoManager.pushToStack([
            {
                key: 'project_Id',
                value: prodModel.project_Id,
                model: prodModel
            },
            {
                key: 'project',
                value: prodModel.project_Id,
                model: prodModel
            }
        ]);

        prodModel.execAction(self => {

            self.project_Id = value.id;
            self.project = value.id;
            self.receivedInput = true;
        });
    }



    getPropertyChoiceContent = params => {

        if (!params) return null;


        const { prodModel, hideProperty, hideProject, projectsFilter } = params;

        const prodGroup = prodModel.group;

        return (
            <Row style={{ padding: '0 20px' }}>
                {
                    hideProperty ?
                        null
                        :
                        <div>
                            <div className="s-row-center row">
                                <Col md={2}>
                                    <label>{this.activeLang.labels['lbl_SlctProp']}</label>
                                </Col>
                                <Col md={4}>
                                    {
                                        prodModel.isSaving ?
                                            <WaitBlock fullWidth height={38} />
                                            :
                                            <div className="s-dropdown-modal">
                                                <div className="form-group s-form-group">
                                                    <table style={{ width: '100%' }}>
                                                        <tbody>
                                                            <tr>
                                                                <td>
                                                                    <DropdownEditor
                                                                        id="drpProdProp"
                                                                        className={'form-control s-input' + (prodModel.isPropertyValid() ? '' : '-error') + ' s-ellipsis'}
                                                                        disabled={(this.editViewModel ? this.editViewModel.isStep2ReadOnly : false)
                                                                            || (prodGroup && prodGroup.property ? true : false)
                                                                            || this.state.isPopNewPropOpen}
                                                                        title={
                                                                            prodGroup && prodGroup.property ?
                                                                                prodGroup.property.getFullName()
                                                                                :
                                                                                prodModel.property ? prodModel.property.getFullName() : null
                                                                        }>
                                                                        {
                                                                            this.viewModel.properties.map((v, i) => {

                                                                                return (
                                                                                    <DropdownEditorMenu
                                                                                        active={v.id === prodModel.property_Id}
                                                                                        key={v.id}
                                                                                        onClick={e => {

                                                                                            this.setPropertyOnProdModel(prodModel, v);
                                                                                        }}>
                                                                                        {v.getFullName()}
                                                                                    </DropdownEditorMenu>
                                                                                );
                                                                            })
                                                                        }
                                                                    </DropdownEditor>
                                                                </td>
                                                                <td>
                                                                    {
                                                                        this.state.isSavingNewProperty ?
                                                                            <span className="spinner"></span>
                                                                            :
                                                                            <OverlayTrigger
                                                                                placement="top"
                                                                                trigger={['hover', 'focus']}
                                                                                rootClose
                                                                                overlay={
                                                                                    this.state.isPopNewPropOpen ?
                                                                                        <span />
                                                                                        :
                                                                                        Helper.getTooltip(
                                                                                            'tltp-QuickAdd-ProdProps',
                                                                                            this.activeLang.labels['lbl_AddNewProperty'])}>
                                                                                <Button
                                                                                    disabled={(this.editViewModel ? this.editViewModel.isStep2ReadOnly : false) || (prodGroup && prodGroup.property ? true : false)}
                                                                                    onClick={e => this.setState({ isPopNewPropOpen: !this.state.isPopNewPropOpen })}
                                                                                    className="s-btn-small-secondary-empty">
                                                                                    <span className={`la la-${this.state.isPopNewPropOpen ? 'minus' : 'plus'}-square la-2x`}></span>
                                                                                </Button>
                                                                            </OverlayTrigger>
                                                                    }
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>

                                                </div>
                                            </div>
                                    }
                                    {
                                        prodModel.isSaving || prodModel.isPropertyValid() ?
                                            null
                                            :
                                            <small className="s-label-error">{this.activeLang.msgs['msg_InvldValue']}</small>
                                    }
                                </Col>
                            </div>

                            {
                                this.state.isPopNewPropOpen && (!this.editViewModel || !this.editViewModel.isStep2ReadOnly) ?
                                    <div className="s-row-center row">
                                        <Col mdOffset={1} md={10} style={{ padding: '20px 35px', border: 'gray 1px solid', borderRadius: 8 }}>
                                            <ProdPropertyQuickAddContainer
                                                close={() => this.setState({ isPopNewPropOpen: false })}
                                                onSuccess={value => this.addAndSetProductProperty(value, prodModel)}
                                                isSaving={value => this.setState({ isSavingNewProperty: value ? true : false })} />
                                        </Col>
                                    </div>
                                    :
                                    null
                            }

                            <div className="s-row-center row">
                                <Col md={2}>
                                    <label>{this.activeLang.labels['lbl_LotSize']}</label>
                                </Col>
                                <Col md={4}>
                                    {
                                        prodModel.isSaving ?
                                            <WaitBlock fullWidth height={38} />
                                            :
                                            <div className="form-group s-form-group">
                                                <input
                                                    disabled={this.editViewModel ? this.editViewModel.isStep2ReadOnly : false}
                                                    type="number"
                                                    min={0}
                                                    className={'form-control s-input' + (!prodModel.property || prodModel.property.isLotSizeValid() ? '' : '-error')}
                                                    value={prodModel.property && prodModel.property.lotSize ? prodModel.property.lotSize : 0}
                                                    onChange={e => {

                                                        this.undoManager.pushToStack({
                                                            key: 'lotSize',
                                                            value: prodModel.property.lotSize,
                                                            model: prodModel.property
                                                        });
                                                        prodModel.property.execAction(self => {

                                                            self.lotSize = parseFloat(e.target.value);
                                                            self.receivedInput = true;
                                                        });
                                                    }} />
                                            </div>
                                    }
                                    {
                                        !prodModel.property || prodModel.property.isLotSizeValid() ?
                                            null
                                            :
                                            <small className="s-label-error">{this.activeLang.msgs['msg_InvldValue']}</small>
                                    }
                                </Col>
                            </div>
                        </div>
                }

                {
                    hideProject ?
                        null
                        :
                        <React.Fragment>
                            <div className="s-row-center row">
                                <Col md={2}>
                                    <label>{this.activeLang.labels['lbl_SlctProj']}</label>
                                </Col>
                                <Col md={4}>
                                    {
                                        prodModel.isSaving ?
                                            <WaitBlock fullWidth height={38} />
                                            :
                                            <div className="s-dropdown-modal">
                                                <div className="form-group s-form-group">
                                                    <table style={{ width: '100%' }}>
                                                        <tbody>
                                                            <tr>
                                                                <td>
                                                                    <DropdownEditor
                                                                        id="drpProdProj"
                                                                        className={'form-control s-input' + (prodModel.isProjectValid() ? '' : '-error') + ' s-ellipsis'}
                                                                        disabled={(this.editViewModel ? this.editViewModel.isStep2ReadOnly : false)
                                                                            || (prodGroup && prodGroup.project ? true : false)
                                                                            || this.state.isPopNewProjOpen}
                                                                        title={
                                                                            prodGroup && prodGroup.project ?
                                                                                prodGroup.project.getName()
                                                                                :
                                                                                prodModel.project ? prodModel.project.getName() : ''
                                                                        }>
                                                                        {
                                                                            (projectsFilter ?
                                                                                this.viewModel.projects.filter(projectsFilter)
                                                                                :
                                                                                this.viewModel.projects).map((v, i) => {

                                                                                    return (
                                                                                        <DropdownEditorMenu
                                                                                            active={v.id === prodModel.project_Id}
                                                                                            key={v.id}
                                                                                            onClick={e => this.setProjectOnProdModel(prodModel, v)}>
                                                                                            {v.getName()}
                                                                                        </DropdownEditorMenu>
                                                                                    );
                                                                                })
                                                                        }
                                                                    </DropdownEditor>
                                                                </td>
                                                                <td>
                                                                    {
                                                                        this.state.isSavingNewProject ?
                                                                            <span className="spinner"></span>
                                                                            :
                                                                            <OverlayTrigger
                                                                                placement="top"
                                                                                trigger={['hover', 'focus']}
                                                                                rootClose
                                                                                overlay={
                                                                                    this.state.isPopNewProjOpen ?
                                                                                        <span />
                                                                                        :
                                                                                        Helper.getTooltip(
                                                                                            'tltp-QuickAdd-ProdProjs',
                                                                                            this.activeLang.labels['lbl_AddNewProject'])}>
                                                                                <Button
                                                                                    disabled={(this.editViewModel ? this.editViewModel.isStep2ReadOnly : false) || (prodGroup && prodGroup.project ? true : false)}
                                                                                    onClick={e => this.setState({ isPopNewProjOpen: !this.state.isPopNewProjOpen })}
                                                                                    className="s-btn-small-secondary-empty">
                                                                                    <span className={`la la-${this.state.isPopNewProjOpen ? 'minus' : 'plus'}-square la-2x`}></span>
                                                                                </Button>
                                                                            </OverlayTrigger>
                                                                    }
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>

                                                </div>
                                            </div>
                                    }
                                    {
                                        prodModel.isSaving || prodModel.isProjectValid() ?
                                            null
                                            :
                                            <small className="s-label-error">{this.activeLang.msgs['msg_InvldValue']}</small>
                                    }
                                </Col>
                            </div>
                            {
                                this.state.isPopNewProjOpen && (!this.editViewModel || !this.editViewModel.isStep2ReadOnly) ?
                                    <div className="s-row-center row">
                                        <Col mdOffset={1} md={10} style={{ padding: '20px 35px', border: 'gray 1px solid', borderRadius: 8 }}>
                                            <ProjPropertyQuickAddContainer
                                                close={() => this.setState({ isPopNewProjOpen: false })}
                                                onSuccess={value => this.addAndSetProductProject(value, prodModel)}
                                                isSaving={value => this.setState({ isSavingNewProject: value ? true : false })} />
                                        </Col>
                                    </div>
                                    :
                                    null
                            }
                        </React.Fragment>
                }

            </Row>
        );
    }


    render() {

        const prodModel = this.props.getSelectedValue();

        if (prodModel) {

            this.onTabSelect(prodModel, prodModel.type);

            return (
                <div style={{ minHeight: 250 }}>

                    <ProductDetailToolBar
                        isReadOnly={this.editViewModel && this.editViewModel.isStep2ReadOnly}
                        isEditDisabled={this.editViewModel && !this.editViewModel.isEditable()}
                        onEdit={e => {

                            if (this.editViewModel && this.editViewModel.isEditable()) {
                                this.editViewModel.execAction(self => self.isStep2ReadOnly = false);
                            }
                        }}
                        onRevert={e => {

                            if (this.editViewModel && !this.editViewModel.isStep2ReadOnly) {
                                this.editViewModel.execAction(self => self.isStep2ReadOnly = true);
                            }
                        }}
                        onSave={e => {

                            if (prodModel.isStep2Valid()) {
                                this.viewModel.saveProduct(prodModel, () => this.editViewModel.execAction(self => self.isStep2ReadOnly = true));
                            }
                        }}
                        activeLang={this.activeLang}
                        undoManager={this.undoManager} />

                    <Tabs id="tab_product_type" className="s-tabs"
                        defaultActiveKey={prodModel.type}
                        activeKey={prodModel.type}
                        onSelect={key => this.onTabSelect(prodModel, key)}>
                        <Tab
                            style={{ position: 'relative' }}
                            disabled={prodModel.isSaving || (this.editViewModel ? this.editViewModel.isStep2ReadOnly : false)}
                            eventKey={10}
                            title={this.getTabHeader(prodModel, this.activeLang.labels['lbl_Rsl'], 10)}>
                            {
                                this.viewModel.isGettingProperties ?
                                    <WaitControl show={true} isRelative height={200} />
                                    :
                                    this.getPropertyChoiceContent({ prodModel, hideProject: true })

                            }
                        </Tab>
                        <Tab
                            style={{ position: 'relative' }}
                            disabled={prodModel.isSaving || (this.editViewModel ? this.editViewModel.isStep2ReadOnly : false)}
                            eventKey={20}
                            title={this.getTabHeader(prodModel, this.activeLang.labels['lbl_Lfs'], 20)}>
                            {
                                this.viewModel.isGettingProperties || this.viewModel.isGettingProjects ?
                                    <WaitControl show={true} isRelative height={200} />
                                    :

                                    this.getPropertyChoiceContent(
                                        {
                                            prodModel,
                                            projectsFilter: (v, i) => v.type === 10
                                        })

                            }
                        </Tab>
                        <Tab
                            style={{ position: 'relative' }}
                            disabled={prodModel.isSaving || (this.editViewModel ? this.editViewModel.isStep2ReadOnly : false)}
                            eventKey={30}
                            title={this.getTabHeader(prodModel, this.activeLang.labels['lbl_Prj'], 30)}>
                            {
                                this.viewModel.isGettingProjects ?
                                    <WaitControl show={true} isRelative height={200} />
                                    :
                                    this.getPropertyChoiceContent(
                                        {
                                            prodModel,
                                            hideProperty: true,
                                            projectsFilter: (v, i) => v.type !== 10
                                        })
                            }
                        </Tab>
                    </Tabs>
                </div>
            );
        }


        return null;
    }
}


export default inject('store')(observer(ProductDetail2));