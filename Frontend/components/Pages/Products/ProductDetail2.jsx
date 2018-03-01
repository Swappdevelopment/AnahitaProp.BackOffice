import React from 'react';
import { observer, inject } from 'mobx-react';

import { Row, Col, Button, Tabs, Tab, Label } from "react-bootstrap";

import DropdownEditor from '../../DropdownEditor/DropdownEditor';
import DropdownEditorMenu from '../../DropdownEditor/DropdownEditorMenu';


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
                    this.viewModel.getProperties(this.activeLang.code);
                    break;
            }
        }
    }

    getTabHeader = (label, index, hideSpinner) => (
        <span>
            <span
                className={'la ' + (this.getTabIndex() === index ? 'la-check-circle' : 'la-circle')}
                style={{ marginRight: 5, fontSize: '1.3em' }}>
            </span>
            <span>{label}</span>
            {
                !hideSpinner && this.viewModel.isGettingProperties ?
                    <span className="spinner" />
                    :
                    null
            }
        </span>
    )

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
                        eventKey={0}
                        title={this.getTabHeader(this.activeLang.labels['lbl_Rsl'], 0)}>
                        {
                            this.viewModel.isGettingProperties ?
                                null
                                :
                                (() => {

                                    if (prodModel.property) {

                                        return (
                                            <Row style={{ paddingTop: 30 }}>
                                                <div className="s-row-center row">
                                                    <Col md={2}>
                                                        <label>{this.activeLang.labels['lbl_SlctProp']}</label>
                                                    </Col>
                                                    <Col md={4}>
                                                        <DropdownEditor
                                                            id="drpProdProp"
                                                            className="form-control s-input s-ellipsis"
                                                            disabled={prodModel.isSaving}
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
                                                    </Col>
                                                </div>

                                                <div className="s-row-center row">
                                                    <Col md={2}>
                                                        <label>{this.activeLang.labels['lbl_LotSize']}</label>
                                                    </Col>
                                                    <Col md={4}>
                                                        <input
                                                            type="number"
                                                            className="form-control s-input"
                                                            disabled={prodModel.isSaving}
                                                            value={prodModel.property.lotSize}
                                                            onChange={e => prodModel.property.execAction(self => self.lotSize = parseFloat(e.target.value))} />
                                                    </Col>
                                                </div>
                                            </Row>
                                        );
                                    }

                                    return null;
                                })()
                        }
                    </Tab>
                    <Tab
                        eventKey={1}
                        title={this.getTabHeader(this.activeLang.labels['lbl_Lfs'], 1, true)}>
                    </Tab>
                    <Tab
                        eventKey={2}
                        title={this.getTabHeader(this.activeLang.labels['lbl_Prj'], 2, true)}>
                    </Tab>
                </Tabs>
            </div>
        );
    }
}


export default inject('store')(observer(ProductDetail2));