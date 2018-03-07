import React from 'react';
import { observer, inject } from 'mobx-react';

import Cleave from 'cleave.js/react';

import { Row, Col, Button } from "react-bootstrap";

import DropdownEditor from '../../DropdownEditor/DropdownEditor';
import DropdownEditorMenu from '../../DropdownEditor/DropdownEditorMenu';

import WaitBlock from '../../WaitBlock/WaitBlock';


class ProductDetail1 extends React.Component {

    constructor(props) {

        super(props);

        this.viewModel = props.viewModel;

        this.activeLang = this.props.store.langStore.active;
    }

    getInputElement = (params1, params2) => {

        if (params1) {

            //     <Row className="s-row-center">
            //     <Col xs={4} md={3}>
            //         <span>{this.activeLang.labels['lbl_LName']}</span>
            //     </Col>
            //     <Col xs={8} md={6}>
            // <div className="form-group s-form-group">
            //     <input
            //         className="form-control s-input"
            //         value={this.viewModel.lName}
            //         onChange={e => { this.onValueChange(e, 'lName') }} />
            // </div>
            //     </Col>
            // </Row>

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
                                        <WaitBlock fullWidth height={38} />
                                        :
                                        <div className="form-group s-form-group">
                                            <input
                                                type={params1.inputType ? params1.inputType : 'text'}
                                                className={'form-control s-input' + (!params1.isValid || params1.isValid() ? '' : '-error')}
                                                value={params1.getValue()}
                                                onChange={params1.setValue} />
                                        </div>

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
                                        <WaitBlock fullWidth height={38} />
                                        :
                                        <div className="form-group s-form-group">
                                            <input
                                                type={params2.inputType ? params2.inputType : 'text'}
                                                className={'form-control s-input' + (!params2.isValid || params2.isValid() ? '' : '-error')}
                                                value={params2.getValue()}
                                                onChange={params2.setValue} />
                                        </div>
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
                            this.getInputElement({
                                smallInput: true,
                                label: this.activeLang.labels['lbl_Code'],
                                isValid: prodModel.isCodeValid,
                                isDisabled: () => prodModel.isSaving,
                                getValue: () => prodModel.code,
                                setValue: e => prodModel.execAction(self => self.code = e.target.value)
                            })
                        }
                        {
                            prodModel.names.map((prodName, i) =>

                                this.getInputElement({
                                    key: `names-${i}`,
                                    label: this.activeLang.labels['lbl_Name'] + ' ' + (prodName.language_Code ? prodName.language_Code.toUpperCase() : ''),
                                    isValid: prodName.isValueValid,
                                    isDisabled: () => prodModel.isSaving,
                                    getValue: () => prodName.value,
                                    setValue: e => prodName.execAction(self => self.value = e.target.value)
                                }))
                        }
                        {
                            this.getInputElement({
                                label: this.activeLang.labels['lbl_NetSize'],
                                inputType: 'number',
                                isDisabled: () => prodModel.isSaving,
                                getValue: () => prodModel.netSize,
                                setValue: e => prodModel.execAction(self => self.netSize = parseFloat(e.target.value))
                            },
                                {
                                    label: this.activeLang.labels['lbl_GrossSize'],
                                    inputType: 'number',
                                    isDisabled: () => prodModel.isSaving,
                                    getValue: () => prodModel.grossSize,
                                    setValue: e => prodModel.execAction(self => self.grossSize = parseFloat(e.target.value))
                                })
                        }
                        {
                            this.getInputElement({
                                label: this.activeLang.labels['lbl_Price'],
                                isValid: prodModel.isCodeValid,
                                getInnerElement: () => (
                                    <table style={{ width: '80%' }}>
                                        <tbody>
                                            <tr>
                                                <td style={{ width: 75 }}>
                                                    {
                                                        prodModel.isSaving ?
                                                            <WaitBlock fullWidth height={38} />
                                                            :
                                                            <div className="s-dropdown-modal">
                                                                <div className="form-group s-form-group">
                                                                    <DropdownEditor
                                                                        id="drpCurrency"
                                                                        className="form-control s-input s-ellipsis"
                                                                        disabled={prodModel.isSaving}
                                                                        title={prodModel.currencyCode}>
                                                                        {
                                                                            this.viewModel.currencies.map((v, i) => {

                                                                                return (
                                                                                    <DropdownEditorMenu
                                                                                        active={v.id === prodModel.currency_Id}
                                                                                        key={v.id}
                                                                                        onClick={e => {

                                                                                            prodModel.execAction(self => {

                                                                                                self.currency_Id = v.id;
                                                                                                self.currencyCode = v.code;
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
                                                </td>
                                                <td style={{ paddingLeft: 10 }}>
                                                    {
                                                        prodModel.isSaving ?
                                                            <WaitBlock fullWidth height={38} />
                                                            :
                                                            <div className="form-group s-form-group">
                                                                <Cleave
                                                                    type="text"
                                                                    className={'form-control s-input' + (prodModel.isPriceAndCurrencyValid() ? '' : '-error')}
                                                                    disabled={prodModel.isSaving}
                                                                    options={{
                                                                        numeral: true,
                                                                        numeralThousandsGroupStyle: 'thousand',
                                                                        numeralDecimalScale: 2
                                                                    }}
                                                                    value={prodModel.price}
                                                                    onChange={e => prodModel.execAction(self => {

                                                                        self.price = parseFloat(e.target.rawValue);
                                                                    })} />
                                                            </div>
                                                    }
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                )
                            })
                        }

                        {/* <div className="s-row-center row" style={{ paddingTop: 20 }}>
                            <Button
                                className="s-btn-medium-primary"
                                disabled={!prodModel.requiresSave()}
                                onClick={e => { this.viewModel.saveProduct(prodModel) }}
                                style={{ padding: '12px 36px', marginLeft: "5px" }}>
                                {
                                    this.viewModel.savingProfile ?
                                        <span>{this.activeLang.labels['lbl_SaveChanges']}<i className="spinner-right"></i></span>
                                        :
                                        this.activeLang.labels['lbl_SaveChanges']
                                }
                            </Button>
                        </div> */}
                    </Row>
                </div>
            );
        }

        return null;
    }
}


export default inject('store')(observer(ProductDetail1));