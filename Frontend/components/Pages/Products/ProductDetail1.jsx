import React from 'react';
import { observer, inject } from 'mobx-react';

import Cleave from 'cleave.js/react';

import { Row, Col, Button } from "react-bootstrap";

import DropdownEditor from '../../DropdownEditor/DropdownEditor';
import DropdownEditorMenu from '../../DropdownEditor/DropdownEditorMenu';

import WaitBlock from '../../WaitBlock/WaitBlock';

import ProductDetailToolBar from './ProductDetailToolBar';
import UndoManager from '../../../Helper/UndoManager';


class ProductDetail1 extends React.Component {

    constructor(props) {

        super(props);

        this.viewModel = props.viewModel;

        this.activeLang = this.props.store.langStore.active;

        this.undoManager = new UndoManager();
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
                                        <WaitBlock fullWidth height={38} />
                                        :
                                        <div className="form-group s-form-group">
                                            <input
                                                type={params1.inputType ? params1.inputType : 'text'}
                                                className={'form-control s-input' + (!params1.isValid || params1.isValid() ? '' : '-error')}
                                                value={params1.getValue()}
                                                min={params1.inputType === 'number' ? params1.min : undefined}
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
                                                min={params2.inputType === 'number' ? params2.min : undefined}
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

        const prodModel = this.props.getSelectedValue();

        if (prodModel) {

            return (
                <div>

                    <ProductDetailToolBar
                        activeLang={this.activeLang}
                        undoManager={this.undoManager} />

                    <Row>
                        {
                            this.getInputElement({
                                smallInput: true,
                                label: this.activeLang.labels['lbl_Code'],
                                isValid: prodModel.isCodeValid,
                                isDisabled: () => prodModel.isSaving,
                                getValue: () => prodModel.code ? prodModel.code : '',
                                setValue: e => {

                                    this.undoManager.pushToStack(
                                        {
                                            key: 'code',
                                            value: prodModel.code,
                                            model: prodModel
                                        });

                                    prodModel.execAction(self => {
                                        self.code = e.target.value;
                                        self.recievedInput = true;
                                    });
                                }
                            })
                        }
                        {
                            prodModel.names.map((prodName, i) =>

                                this.getInputElement({
                                    key: `names-${i}`,
                                    label: this.activeLang.labels['lbl_Name'] + ' ' + (prodName.language_Code ? prodName.language_Code.toUpperCase() : ''),
                                    isValid: prodName.isValueValid,
                                    isDisabled: () => prodModel.isSaving,
                                    getValue: () => prodName.value ? prodName.value : '',
                                    setValue: e => {

                                        this.undoManager.pushToStack(
                                            {
                                                key: 'value',
                                                value: prodName.value,
                                                model: prodName
                                            });

                                        prodName.execAction(self => {

                                            self.value = e.target.value;
                                            self.recievedInput = true;
                                        });
                                    }
                                }))
                        }
                        {
                            this.getInputElement({
                                label: this.activeLang.labels['lbl_NetSize'],
                                inputType: 'number',
                                min: 0,
                                isValid: prodModel.isNetSizeValid,
                                errMsg: this.activeLang.msgs['msg_InvldValue'],
                                isDisabled: () => prodModel.isSaving,
                                getValue: () => prodModel.netSize ? prodModel.netSize : 0,
                                setValue: e => {

                                    this.undoManager.pushToStack(
                                        {
                                            key: 'netSize',
                                            value: prodModel.netSize,
                                            model: prodModel
                                        });

                                    prodModel.execAction(self => self.netSize = parseFloat(e.target.value));
                                }
                            },
                                {
                                    label: this.activeLang.labels['lbl_GrossSize'],
                                    inputType: 'number',
                                    min: 0,
                                    isValid: prodModel.isGrossSizeValid,
                                    errMsg: this.activeLang.msgs['msg_InvldValue'],
                                    isDisabled: () => prodModel.isSaving,
                                    getValue: () => prodModel.grossSize ? prodModel.grossSize : 0,
                                    setValue: e => {

                                        this.undoManager.pushToStack(
                                            {
                                                key: 'grossSize',
                                                value: prodModel.grossSize,
                                                model: prodModel
                                            });

                                        prodModel.execAction(self => self.grossSize = parseFloat(e.target.value));
                                    }
                                })
                        }
                        {
                            this.getInputElement({
                                label: this.activeLang.labels['lbl_Price'],
                                isValid: prodModel.isCodeValid,
                                getInnerElement: () => (
                                    <div>
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
                                                                            className={'form-control s-input' + (prodModel.isPriceValid() ? '' : '-error') + ' s-ellipsis'}
                                                                            disabled={prodModel.isSaving}
                                                                            title={prodModel.currencyCode}>
                                                                            {
                                                                                this.viewModel.currencies.map((v, i) => {

                                                                                    return (
                                                                                        <DropdownEditorMenu
                                                                                            active={v.id === prodModel.currency_Id}
                                                                                            key={v.id}
                                                                                            onClick={e => {

                                                                                                this.undoManager.pushToStack(
                                                                                                    [
                                                                                                        {
                                                                                                            key: 'currency_Id',
                                                                                                            value: prodModel.currency_Id,
                                                                                                            model: prodModel
                                                                                                        },
                                                                                                        {
                                                                                                            key: 'currencyCode',
                                                                                                            value: prodModel.currencyCode,
                                                                                                            model: prodModel
                                                                                                        }
                                                                                                    ]);

                                                                                                prodModel.execAction(self => {

                                                                                                    self.currency_Id = v.id;
                                                                                                    self.currencyCode = v.code;
                                                                                                    self.recievedInput = true;
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
                                                                        className={'form-control s-input' + (prodModel.isPriceValid() ? '' : '-error')}
                                                                        disabled={prodModel.isSaving}
                                                                        options={{
                                                                            numeral: true,
                                                                            numeralThousandsGroupStyle: 'thousand',
                                                                            numeralDecimalScale: 2
                                                                        }}
                                                                        min={0}
                                                                        value={prodModel.price ? prodModel.price : 0}
                                                                        onChange={e => prodModel.execAction(self => {

                                                                            this.undoManager.pushToStack(
                                                                                {
                                                                                    key: 'price',
                                                                                    value: prodModel.price,
                                                                                    model: prodModel
                                                                                });

                                                                            self.price = parseFloat(e.target.rawValue);
                                                                        })} />
                                                                </div>
                                                        }
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                        {
                                            prodModel.isCurrencyValid() && prodModel.isPriceValid() ?
                                                null
                                                :
                                                <small className="s-label-error">
                                                    {this.activeLang.msgs['msg_InvldValue']}
                                                </small>
                                        }
                                    </div>
                                )
                            })
                        }
                    </Row>
                </div>
            );
        }

        return null;
    }
}


export default inject('store')(observer(ProductDetail1));