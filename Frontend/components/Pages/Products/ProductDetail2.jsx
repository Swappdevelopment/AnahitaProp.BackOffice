import React from 'react';
import { observer, inject } from 'mobx-react';

import { Row, Col, Button, Tabs, Tab, Label } from "react-bootstrap";

import DropdownEditor from '../../DropdownEditor/DropdownEditor';
import DropdownEditorMenu from '../../DropdownEditor/DropdownEditorMenu';

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

            const undoItem = {
                key: 'type',
                value: prodModel.type,
                model: prodModel
            };

            prodModel.execAction(self => self.type = key);

            if (undoItem.value !== prodModel.type) {

                this.undoManager.pushToStack(undoItem);
            }


            switch (key) {

                case 0:

                    if (prodModel.originalValue) {

                        prodModel.execAction(self => {

                            self.project_Id = self.originalValue.project_Id ? self.originalValue.project_Id : 0;
                            self.project = self.project_Id > 0 ? self.project_Id : null;
                        });
                    }
                    break;

                case 1:

                    this.viewModel.getProjects(this.activeLang.code);
                    break;

                case 2:

                    if (prodModel.originalValue) {

                        prodModel.execAction(self => {

                            self.property_Id = self.originalValue.property_Id ? self.originalValue.property_Id : 0;
                            self.property = self.property_Id > 0 ? self.property_Id : null;
                        });
                    }

                    this.viewModel.getProjects(this.activeLang.code);
                    break;
            }
        }
    }

    getTabHeader = (prodModel, label, index, showSpinnerAction) => {

        const isTabActive = prodModel.type === index;

        return (
            <span>
                <span
                    className={'la ' + (isTabActive ? 'la-check-circle' : 'la-circle')}
                    style={{ marginRight: 5 }}>
                </span>
                <span>{label}</span>
                {
                    isTabActive && showSpinnerAction && showSpinnerAction() ?
                        <span className="spinner" />
                        :
                        null
                }
            </span>
        );
    }

    getPropertyChoiceContent = params => {

        if (!params) return null;


        const { prodModel, hideProperty, hideProject, projectsFilter } = params;

        return (
            <Row style={{ paddingTop: 30 }}>
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
                                                        className="form-control s-input s-ellipsis"
                                                        title={prodModel.property.code}>
                                                        {
                                                            this.viewModel.properties.map((v, i) => {

                                                                return (
                                                                    <DropdownEditorMenu
                                                                        active={v.id === prodModel.property_Id}
                                                                        key={v.id}
                                                                        onClick={e => {

                                                                            prodModel.execAction(self => {

                                                                                self.property_Id = v.id;
                                                                                self.property = v.id;
                                                                            });
                                                                        }}>
                                                                        {v.code}
                                                                    </DropdownEditorMenu>
                                                                );
                                                            })
                                                        }
                                                    </DropdownEditor>
                                                </div>
                                            </div>
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
                                                    className="form-control s-input"
                                                    value={prodModel.property.lotSize}
                                                    onChange={e => prodModel.property.execAction(self => self.lotSize = parseFloat(e.target.value))} />
                                            </div>
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
                                                    className="form-control s-input s-ellipsis"
                                                    disabled={prodModel.isSaving}
                                                    title={prodModel.project ? prodModel.project.getName() : ''}>
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

                                                                            prodModel.execAction(self => {

                                                                                self.project_Id = v.id;
                                                                                self.project = v.id;
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
                            </Col>
                        </div>
                }

            </Row>
        );
    }


    render() {

        const prodModel = this.viewModel.selectedValue;

        if (prodModel) {

            this.onTabSelect(prodModel);

            return (
                <div style={{ minHeight: 250 }}>

                    <ProductDetailToolBar
                        activeLang={this.activeLang}
                        undoManager={this.undoManager} />

                    <Tabs id="tab_product_type" className="s-tabs"
                        defaultActiveKey={prodModel.type}
                        onSelect={key => this.onTabSelect(prodModel, key)}>
                        <Tab
                            disabled={prodModel.isSaving}
                            eventKey={10}
                            title={this.getTabHeader(prodModel, this.activeLang.labels['lbl_Rsl'], 10, () => this.viewModel.isGettingProperties)}>
                            {
                                this.viewModel.isGettingProperties ?
                                    null
                                    :
                                    (() => {

                                        if (prodModel.property) {

                                            return this.getPropertyChoiceContent({ prodModel, hideProject: true });
                                        }

                                        return null;
                                    })()
                            }
                        </Tab>
                        <Tab
                            disabled={prodModel.isSaving}
                            eventKey={20}
                            title={this.getTabHeader(prodModel, this.activeLang.labels['lbl_Lfs'], 20, () => this.viewModel.isGettingProperties || this.viewModel.isGettingProjects)}>
                            {
                                this.viewModel.isGettingProperties || this.viewModel.isGettingProjects ?
                                    null
                                    :
                                    (() => {

                                        if (prodModel.property) {

                                            return this.getPropertyChoiceContent(
                                                {
                                                    prodModel,
                                                    projectsFilter: (v, i) => v.type === 10
                                                });
                                        }

                                        return null;
                                    })()
                            }
                        </Tab>
                        <Tab
                            disabled={prodModel.isSaving}
                            eventKey={30}
                            title={this.getTabHeader(prodModel, this.activeLang.labels['lbl_Prj'], 30, () => this.viewModel.isGettingProjects)}>
                            {
                                this.viewModel.isGettingProjects ?
                                    null
                                    :
                                    (() => {

                                        if (prodModel.property) {

                                            return this.getPropertyChoiceContent(
                                                {
                                                    prodModel,
                                                    hideProperty: true,
                                                    projectsFilter: (v, i) => v.type !== 10
                                                });
                                        }

                                        return null;
                                    })()
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