import React from 'react';
import { observer, inject } from 'mobx-react';

import { Row, Col, Button, Tabs, Tab } from "react-bootstrap";

import WaitBlock from '../../WaitBlock/WaitBlock';
import WaitControl from '../../WaitControl/WaitControl';


class ProductDetail4 extends React.Component {

    constructor(props) {

        super(props);

        this.viewModel = props.viewModel;

        this.activeLang = this.props.store.langStore.active;
    }

    componentWillMount() {

        this.viewModel.bindOnSelectedValueChange(this.getDescs);

        this.getDescs();
    }

    componentWillUnmount() {
        this.viewModel.unbindOnSelectedValueChange(this.getDescs);
    }

    getDescs = () => {

        this.viewModel.getDescs();
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
                                <textarea
                                    className={'form-control s-input' + (!params.isValid || params.isValid() ? '' : '-error')}
                                    style={{ minHeight: params.minHeight ? params.minHeight : 200 }}
                                    value={params.getValue()}
                                    onChange={params.setValue} />
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


    render() {

        if (this.viewModel.isGettingDescs) {

            return <WaitControl show={true} />;
        }

        const prodModel = this.viewModel.selectedValue;

        if (prodModel) {

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
                    <Tabs id="tab_product_desc"
                        defaultActiveKey={0}
                        onSelect={this.onTabSelect}>
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
                                                        getValue: () => listDesc.value,
                                                        setValue: e => listDesc.execAction(self => self.value = e.target.value)
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
                                                        getValue: () => d.value,
                                                        setValue: e => d.execAction(self => self.value = e.target.value)
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