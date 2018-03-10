import React from 'react';
import { observer, inject } from 'mobx-react';

import { Row, Col, Button, Tabs, Tab } from "react-bootstrap";

import WaitBlock from '../../WaitBlock/WaitBlock';
import WaitControl from '../../WaitControl/WaitControl';

import ProductDetailToolBar from './ProductDetailToolBar';
import UndoManager from '../../../Helper/UndoManager';


class ProductDetail4 extends React.Component {

    constructor(props) {

        super(props);

        this.state = { tabKey: 0 };

        this.viewModel = props.viewModel;

        this.activeLang = this.props.store.langStore.active;

        this.undoManager = new UndoManager();
    }

    componentWillMount() {

        this.undoManager.bindUndoing(this.onUndoing);
        this.viewModel.bindOnSelectedValueChange(this.getDescs);

        this.getDescs();
    }

    componentWillUnmount() {
        this.undoManager.unbindUndoing(this.onUndoing);
        this.viewModel.unbindOnSelectedValueChange(this.getDescs);
    }

    getDescs = () => {

        this.viewModel.getDescs(this.props.getSelectedValue());
    }

    getInputElement = params => {

        if (params) {

            return (
                <div className="s-row-center row" key={params.key}>
                    <Col md={2}>
                        <label>{params.label}</label>
                    </Col>
                    <Col md={params.smallInput ? 5 : 10}>
                        {
                            params.isDisabled() ?
                                <WaitBlock fullWidth height={params.minHeight ? params.minHeight : 200} />
                                :
                                <div className="form-group s-form-group">
                                    <textarea
                                        className={'form-control s-input' + (!params.isValid || params.isValid() ? '' : '-error')}
                                        style={{ minHeight: params.minHeight ? params.minHeight : 200 }}
                                        value={params.getValue()}
                                        onChange={params.setValue} />
                                </div>

                        }
                        {
                            !params.isValid || params.isValid() ?
                                null
                                :
                                <small className="s-label-error">{params.errMsg ? params.errMsg : this.activeLang.msgs['msg_ValReq']}</small>
                        }
                    </Col>
                </div>
            );
        }

        return null;
    }


    onUndoing = (undoItem, e) => {

        if (undoItem && undoItem.tabKey >= 0) {

            this.setState({ tabKey: undoItem.tabKey });
        }
    }


    render() {

        const prodModel = this.props.getSelectedValue();

        if (prodModel) {

            if (prodModel.isGettingDescs) {

                return <WaitControl show={true} />;
            }

            const groups = [];

            for (let [key, value] of Object.entries(this.props.store.langStore.allLanguages)) {

                if (key) {

                    const langCode = key.toUpperCase();

                    groups.push({
                        langCode,
                        descs: prodModel.descs.filter(d => d.language_Code && d.language_Code.toUpperCase() === langCode)
                    });
                }
            }

            return (
                <div>

                    <ProductDetailToolBar
                        activeLang={this.activeLang}
                        undoManager={this.undoManager} />

                    <Tabs id="tab_product_desc" className="s-tabs"
                        defaultActiveKey={0}
                        activeKey={this.state.tabKey}
                        onSelect={key => this.setState({ tabKey: key })}>
                        {
                            groups.map((g, i) => {

                                const listDesc = g.descs.find(d => d.isList);

                                return (
                                    <Tab
                                        key={i}
                                        disabled={prodModel.isSaving}
                                        eventKey={i}
                                        title={<span>{this.activeLang.labels['lbl_Desc']} {g.langCode}</span>}>
                                        <Row style={{ paddingTop: 25 }}>
                                            {
                                                listDesc ?
                                                    this.getInputElement({
                                                        label: this.activeLang.labels['lbl_ShortDesc'],
                                                        minHeight: 120,
                                                        isDisabled: () => prodModel.isSaving,
                                                        getValue: () => listDesc.value ? listDesc.value : '',
                                                        setValue: e => {

                                                            this.undoManager.pushToStack({
                                                                key: 'value',
                                                                value: listDesc.value,
                                                                model: listDesc,
                                                                tabKey: i
                                                            });

                                                            listDesc.execAction(self => self.value = e.target.value);
                                                        }
                                                    })
                                                    :
                                                    null
                                            }
                                            {
                                                g.descs.filter(d => d !== listDesc).map((d, i) =>
                                                    this.getInputElement({
                                                        key: i,
                                                        label: this.activeLang.labels['lbl_DtlPg'] + ` # ${d.detailRank + 1}`,
                                                        isDisabled: () => prodModel.isSaving,
                                                        isValid: () => d.detailRank === 0 ? d.isValueValid() : true,
                                                        getValue: () => d.value ? d.value : '',
                                                        setValue: e => {

                                                            this.undoManager.pushToStack({
                                                                key: 'value',
                                                                value: d.value,
                                                                model: d,
                                                                tabKey: i
                                                            });

                                                            d.execAction(self => {

                                                                self.value = e.target.value;

                                                                if (self.detailRank === 0) {
                                                                    self.recievedInput = true;
                                                                }
                                                            });
                                                        }
                                                    }))
                                            }
                                        </Row>
                                    </Tab>
                                );
                            })
                        }
                    </Tabs>
                </div>
            );
        }

        return null;
    }
}


export default inject('store')(observer(ProductDetail4));