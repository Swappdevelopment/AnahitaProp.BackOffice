import React from 'react';
import { observer, inject } from 'mobx-react';

import { Row, Col, Button, Tabs, Tab, Label } from "react-bootstrap";

import DropdownEditor from '../../DropdownEditor/DropdownEditor';
import DropdownEditorMenu from '../../DropdownEditor/DropdownEditorMenu';

import WaitControl from '../../WaitControl/WaitControl';
import WaitBlock from '../../WaitBlock/WaitBlock';

import ProductDetailToolBar from './ProductDetailToolBar';
import UndoManager from '../../../Helper/UndoManager';


class ProductDetail2 extends React.Component {

    constructor(props) {

        super(props);

        this.viewModel = props.viewModel;

        this.activeLang = this.props.store.langStore.active;

        this.undoManager = new UndoManager();
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
                                                    <DropdownEditor
                                                        id="drpProdProp"
                                                        className={'form-control s-input' + (prodModel.isPropertyValid() ? '' : '-error') + ' s-ellipsis'}
                                                        disabled={prodModel.isSaving || (prodGroup && prodGroup.property ? true : false)}
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

                                                                            this.undoManager.pushToStack([
                                                                                {
                                                                                    key: 'property_Id',
                                                                                    value: prodModel.property_Id,
                                                                                    model: prodModel
                                                                                },
                                                                                {
                                                                                    key: 'property',
                                                                                    value: prodModel.property_Id,
                                                                                    model: prodModel
                                                                                }
                                                                            ]);

                                                                            prodModel.execAction(self => {

                                                                                self.property_Id = v.id;
                                                                                self.property = v.id;
                                                                                self.receivedInput = true;
                                                                            });
                                                                        }}>
                                                                        {v.getFullName()}
                                                                    </DropdownEditorMenu>
                                                                );
                                                            })
                                                        }
                                                    </DropdownEditor>
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
                                                <DropdownEditor
                                                    id="drpProdProp"
                                                    className={'form-control s-input' + (prodModel.isProjectValid() ? '' : '-error') + ' s-ellipsis'}
                                                    disabled={prodModel.isSaving || (prodGroup && prodGroup.project ? true : false)}
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
                                                                        onClick={e => {

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

                                                                                self.project_Id = v.id;
                                                                                self.project = v.id;
                                                                                self.receivedInput = true;
                                                                            });
                                                                        }}>
                                                                        {v.getName()}
                                                                    </DropdownEditorMenu>
                                                                );
                                                            })
                                                    }
                                                </DropdownEditor>
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
                        activeLang={this.activeLang}
                        undoManager={this.undoManager} />

                    <Tabs id="tab_product_type" className="s-tabs"
                        defaultActiveKey={prodModel.type}
                        activeKey={prodModel.type}
                        onSelect={key => this.onTabSelect(prodModel, key)}>
                        <Tab
                            style={{ position: 'relative' }}
                            disabled={prodModel.isSaving}
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
                            disabled={prodModel.isSaving}
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
                            disabled={prodModel.isSaving}
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