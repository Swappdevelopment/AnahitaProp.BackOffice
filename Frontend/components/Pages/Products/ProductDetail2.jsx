import React from 'react';
import { observer, inject } from 'mobx-react';

import { Row, Col, Button, Tabs, Tab, Label } from "react-bootstrap";

import DropdownEditor from '../../DropdownEditor/DropdownEditor';
import DropdownEditorMenu from '../../DropdownEditor/DropdownEditorMenu';

import WaitBlock from '../../WaitBlock/WaitBlock';


class ProductDetail2 extends React.Component {

    constructor(props) {

        super(props);

        this.viewModel = props.viewModel;

        this.activeLang = this.props.store.langStore.active;
    }

    onTabSelect = key => {

        if (this.viewModel.selectedValue) {

            this.viewModel.selectedValue.execAction(self => self.type = (key + 1) * 10);

            switch (key) {

                case 0:

                    if (this.viewModel.selectedValue.originalValue) {

                        this.viewModel.selectedValue.execAction(self => {

                            self.project_Id = self.originalValue.project_Id ? self.originalValue.project_Id : 0;
                            self.project = self.project_Id > 0 ? self.project_Id : null;
                        });
                    }

                    this.viewModel.getProperties(this.activeLang.code);
                    break;

                case 1:

                    this.viewModel.getProperties(this.activeLang.code);
                    this.viewModel.getProjects(this.activeLang.code);
                    break;

                case 2:

                    if (this.viewModel.selectedValue.originalValue) {

                        this.viewModel.selectedValue.execAction(self => {

                            self.property_Id = self.originalValue.property_Id ? self.originalValue.property_Id : 0;
                            self.property = self.property_Id > 0 ? self.property_Id : null;
                        });
                    }

                    this.viewModel.getProjects(this.activeLang.code);
                    break;
            }
        }
    }

    getTabHeader = (label, index, showSpinnerAction) => {

        const isTabActive = this.getTabIndex() === index;

        return (
            <span>
                <span
                    className={'la ' + (isTabActive ? 'la-check-circle' : 'la-circle')}
                    style={{ marginRight: 5, fontSize: '1.3em' }}>
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
                                            <WaitBlock fullWidth height={34} />
                                            :
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
                                            <WaitBlock fullWidth height={34} />
                                            :
                                            <input
                                                type="number"
                                                className="form-control s-input"
                                                value={prodModel.property.lotSize}
                                                onChange={e => prodModel.property.execAction(self => self.lotSize = parseFloat(e.target.value))} />
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
                                        <WaitBlock fullWidth height={34} />
                                        :
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
                                }
                            </Col>
                        </div>
                }

            </Row>
        );
    }

    getTabIndex = () => (this.viewModel.selectedValue ? (this.viewModel.selectedValue.type / 10) - 1 : -1)

    render() {

        const prodModel = this.viewModel.selectedValue;

        this.onTabSelect(this.getTabIndex());

        return (
            <div style={{ minHeight: 250 }}>
                <Tabs id="tab_product_type"
                    defaultActiveKey={this.getTabIndex()}
                    onSelect={this.onTabSelect}>
                    <Tab
                        disabled={prodModel.isSaving}
                        eventKey={0}
                        title={this.getTabHeader(this.activeLang.labels['lbl_Rsl'], 0, () => this.viewModel.isGettingProperties)}>
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
                        eventKey={1}
                        title={this.getTabHeader(this.activeLang.labels['lbl_Lfs'], 1, () => this.viewModel.isGettingProperties || this.viewModel.isGettingProjects)}>
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
                        eventKey={2}
                        title={this.getTabHeader(this.activeLang.labels['lbl_Prj'], 2, () => this.viewModel.isGettingProjects)}>
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
}


export default inject('store')(observer(ProductDetail2));