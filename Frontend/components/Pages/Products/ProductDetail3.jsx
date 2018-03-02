import React from 'react';
import { observer, inject } from 'mobx-react';

import { Row, Col, Button } from "react-bootstrap";


class ProductDetail3 extends React.Component {

    constructor(props) {

        super(props);

        this.viewModel = props.viewModel;

        this.activeLang = this.props.store.langStore.active;
    }

    componentWillMount() {

        this.viewModel.getFlags(this.activeLang.code);
    }

    getInputElement = (params1, params2) => {

        if (params1) {

            return (
                <div className="s-row-center row" key={params1.key}>
                    <Col md={2}>
                        <label>{params1.label}</label>
                    </Col>
                    {
                        params1.getInnerElement ?

                            <Col md={params2 ? 4 : (params1.smallInput ? 4 : 8)}>
                                {params1.getInnerElement()}
                            </Col>
                            :
                            <Col md={params2 ? 4 : (params1.smallInput ? 4 : 8)}>
                                {
                                    params1.isDisabled() ?
                                        <WaitBlock fullWidth height={34} />
                                        :
                                        <input
                                            type={params1.inputType ? params1.inputType : 'text'}
                                            className={'form-control s-input' + (!params1.isValid || params1.isValid() ? '' : '-error')}
                                            value={params1.getValue()}
                                            onChange={params1.setValue} />
                                }
                                {
                                    !params1.isValid || params1.isValid() ?
                                        null
                                        :
                                        <small className="s-label-error">{params1.errMsg ? params1.errMsg : this.activeLang.msgs['msg_ValReq']}</small>
                                }
                            </Col>
                    }
                    {
                        params2 ?
                            <Col md={2}>
                                <label>{params2.label}</label>
                            </Col>
                            :
                            null
                    }
                    {
                        params2 ?
                            <Col md={4}>
                                {
                                    params1.isDisabled() ?
                                        <WaitBlock fullWidth height={34} />
                                        :
                                        <input
                                            type={params2.inputType ? params2.inputType : 'text'}
                                            className={'form-control s-input' + (!params2.isValid || params2.isValid() ? '' : '-error')}
                                            value={params2.getValue()}
                                            onChange={params2.setValue} />
                                }
                                {
                                    !params2.isValid || params2.isValid() ?
                                        null
                                        :
                                        <small className="s-label-error">{params2.errMsg ? params2.errMsg : this.activeLang.msgs['msg_ValReq']}</small>
                                }
                            </Col>
                            :
                            null
                    }
                </div>
            );
        }

        return null;
    }


    render() {

        const prodModel = this.viewModel.selectedValue;

        if (prodModel) {

            return (
                <div>
                    <Row>
                        {
                            prodModel.flags.map((prodFlag, i) => {

                                debugger;

                                // return this.getInputElement({
                                //     key: `names-${i}`,
                                //     label: this.activeLang.labels['lbl_Name'] + ' ' + (prodName.language_Code ? prodName.language_Code.toUpperCase() : ''),
                                //     isValid: prodName.isValueValid,
                                //     isDisabled: () => prodModel.isSaving,
                                //     getValue: () => prodName.value,
                                //     setValue: e => prodName.execAction(self => self.value = e.target.value)
                                // });
                            })
                        }
                    </Row>
                </div>
            );
        }

        return null;
    }
}


export default inject('store')(observer(ProductDetail3));