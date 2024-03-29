import React from 'react';
import { observer, inject } from 'mobx-react';

import { Row, Col, Button, OverlayTrigger, Popover } from "react-bootstrap";

import WaitBlock from '../../WaitBlock/WaitBlock';
import WaitControl from '../../WaitControl/WaitControl';

import ProductDetailToolBar from './ProductDetailToolBar';
import UndoManager from '../../../Helper/UndoManager';


class ProductDetail3 extends React.Component {

    constructor(props) {

        super(props);

        this.editViewModel = props.editViewModel;
        this.viewModel = props.viewModel;

        this.activeLang = this.props.store.langStore.active;

        this.undoManager = new UndoManager();
    }

    componentWillMount() {

        this.viewModel.bindOnSelectedValueChange(this.viewModel.getFlags);
        this.viewModel.bindOnPropertyChanged(this.viewModel.getFlags);

        this.viewModel.getFlags(this.props.getSelectedValue());
    }

    componentWillUnmount() {
        this.viewModel.unbindOnSelectedValueChange(this.viewModel.getFlags);
        this.viewModel.unbindOnPropertyChanged(this.viewModel.getFlags);
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
                                                disabled={this.editViewModel ? this.editViewModel.isStep3ReadOnly : false}
                                                type={params1.inputType ? params1.inputType : 'text'}
                                                min={params1.inputType === 'number' ? params1.min : undefined}
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
                                                disabled={this.editViewModel ? this.editViewModel.isStep3ReadOnly : false}
                                                type={params2.inputType ? params2.inputType : 'text'}
                                                min={params2.inputType === 'number' ? params2.min : undefined}
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

        const prodModel = this.props.getSelectedValue();

        if (prodModel) {

            if (prodModel.isGettingFlags) {

                return <WaitControl show={true} isRelative height={200} />
            }
            else {

                let flBedRoomCount = null, flOptnDen = null, flViews = null;

                flBedRoomCount = prodModel.flags.find((v, i) => v.flag && v.flag.colValueRef === GlobalValues.constants.FLAG_NUM_BEDROOMS_REF);

                if (prodModel.productFamily
                    && prodModel.productFamily.type
                    && prodModel.productFamily.type.slug === GlobalValues.constants.PRODFAMILY_APPARTMENT_VALUE) {

                    flOptnDen = prodModel.flags.find((v, i) => v.flag && v.flag.colValueRef === GlobalValues.constants.FLAG_OPTION_ROOM_DEN);
                }

                flViews = prodModel.getPropertyFlags(GlobalValues.constants.FLAG_VIEW_REF);

                const propModel = prodModel.property;

                if (flBedRoomCount != null || flOptnDen != null || flViews != null) {

                    const viewsToBeAdded = flViews ?
                        this.viewModel.flags.filter(f => !flViews.find(flv => flv.flag && flv.flag.id === f.id))
                        : null;

                    return (
                        <div>
                            <ProductDetailToolBar
                                isReadOnly={this.editViewModel && this.editViewModel.isStep3ReadOnly}
                                isEditDisabled={this.editViewModel && !this.editViewModel.isEditable()}
                                onEdit={e => {

                                    if (this.editViewModel && this.editViewModel.isEditable()) {
                                        this.editViewModel.execAction(self => self.isStep3ReadOnly = false);
                                    }
                                }}
                                onRevert={e => {

                                    if (this.editViewModel && !this.editViewModel.isStep3ReadOnly) {
                                        this.editViewModel.execAction(self => self.isStep3ReadOnly = true);
                                    }
                                }}
                                onSave={e => {

                                    this.viewModel.saveProduct(prodModel, () => this.editViewModel.execAction(self => self.isStep3ReadOnly = true));
                                }}
                                activeLang={this.activeLang}
                                undoManager={this.undoManager} />

                            <Row style={{ padding: '0 20px' }}>
                                {
                                    flBedRoomCount ?
                                        this.getInputElement({
                                            inputType: 'number',
                                            min: 0,
                                            smallInput: true,
                                            label: this.activeLang.labels['lbl_BdRmsCnt'],
                                            isValid: flBedRoomCount.isBedNumberValueValid,
                                            isDisabled: () => prodModel.isSaving,
                                            getValue: () => flBedRoomCount.valueInt ? flBedRoomCount.valueInt : 0,
                                            setValue: e => {

                                                this.undoManager.pushToStack({
                                                    key: 'valueInt',
                                                    value: flBedRoomCount.valueInt,
                                                    model: flBedRoomCount
                                                });

                                                flBedRoomCount.execAction(self => {
                                                    self.valueInt = parseInt(e.target.value);
                                                    self.receivedInput = true;
                                                });
                                            }
                                        })
                                        :
                                        null
                                }
                                {
                                    flOptnDen ?
                                        this.getInputElement({
                                            inputType: 'number',
                                            min: 0,
                                            smallInput: true,
                                            label: this.activeLang.labels['lbl_OptnRmDen'],
                                            isValid: flOptnDen.isRoomDenNumberValueValid,
                                            isDisabled: () => prodModel.isSaving,
                                            getValue: () => flOptnDen.valueInt ? flOptnDen.valueInt : 0,
                                            setValue: e => {

                                                this.undoManager.pushToStack({
                                                    key: 'valueInt',
                                                    value: flOptnDen.valueInt,
                                                    model: flOptnDen
                                                });

                                                flOptnDen.execAction(self => {
                                                    self.valueInt = parseInt(e.target.value);
                                                    self.receivedInput = true;
                                                });
                                            }
                                        })
                                        :
                                        null
                                }
                                {
                                    flViews && viewsToBeAdded ?
                                        <div className="s-row-center row">
                                            <Col md={2}>
                                                <label>{this.activeLang.labels['lbl_Views']}</label>
                                                <OverlayTrigger
                                                    rootClose
                                                    trigger="click"
                                                    placement={this.props.viewsPlacement ? this.props.viewsPlacement : 'top'}
                                                    container={this.props.rootContainer}
                                                    overlay={
                                                        <Popover
                                                            id="popViews"
                                                            style={viewsToBeAdded && viewsToBeAdded.length > 0 ? {} : { display: 'none' }}>
                                                            {
                                                                viewsToBeAdded.map((f, i) => (
                                                                    <Button
                                                                        key={i}
                                                                        disabled={this.editViewModel ? this.editViewModel.isStep3ReadOnly : false}
                                                                        className={'s-btn-small-secondary'}
                                                                        style={{
                                                                            borderBottomLeftRadius: 5,
                                                                            borderBottomRightRadius: 5,
                                                                            borderTopLeftRadius: 5,
                                                                            borderTopRightRadius: 5,
                                                                            marginRight: 5,
                                                                            marginBottom: 5
                                                                        }}
                                                                        onClick={e => {

                                                                            const fValue = f.getValue();

                                                                            this.undoManager.pushToStack({
                                                                                key: 'flags',
                                                                                value: fValue.id,
                                                                                propKey: 'flag_Id',
                                                                                action: 'remove',
                                                                                model: propModel
                                                                            });

                                                                            propModel.addViewFlag(fValue);
                                                                        }}>
                                                                        <span className="la la-plus"></span>
                                                                        <span style={{ marginLeft: 10, color: 'white' }}>
                                                                            {f.getType()}
                                                                        </span>
                                                                    </Button>
                                                                ))
                                                            }
                                                        </Popover>
                                                    }>
                                                    <Button
                                                        disabled={this.editViewModel ? this.editViewModel.isStep3ReadOnly : false}
                                                        style={{ padding: '0 12px' }}
                                                        className="s-btn-small-secondary-empty">
                                                        <i className="flaticon-add"></i>
                                                    </Button>
                                                </OverlayTrigger>
                                            </Col>
                                            <Col md={10}>
                                                {
                                                    prodModel.isSaving ?
                                                        <WaitBlock fullWidth height={38} />
                                                        :
                                                        <table className="table-responsive">
                                                            <tbody>
                                                                <tr style={{ display: 'block' }}>

                                                                    {
                                                                        flViews.map((v, i) => {

                                                                            if (v.flag) {

                                                                                let icon = 'flaticon-close';

                                                                                switch (v.recordState) {

                                                                                    case 30:
                                                                                        icon = 'la la-undo';
                                                                                        break;
                                                                                }

                                                                                return (
                                                                                    <td
                                                                                        key={v.genId}
                                                                                        style={{ paddingRight: 8, paddingBottom: 8, float: 'left' }}>
                                                                                        <Button
                                                                                            disabled={this.editViewModel ? this.editViewModel.isStep3ReadOnly : false}
                                                                                            className={'s-btn-small-' +
                                                                                                (v.recordState === 30
                                                                                                    ? 'red'
                                                                                                    : (v.recordState === 10 ? 'secondary' : 'primary'))}
                                                                                            style={{
                                                                                                borderBottomLeftRadius: 5,
                                                                                                borderBottomRightRadius: 5,
                                                                                                borderTopLeftRadius: 5,
                                                                                                borderTopRightRadius: 5
                                                                                            }}
                                                                                            onClick={e => {

                                                                                                v.execAction(self => {
                                                                                                    switch (self.recordState) {

                                                                                                        case 0:

                                                                                                            this.undoManager.pushToStack({
                                                                                                                key: 'recordState',
                                                                                                                value: self.recordState,
                                                                                                                model: self
                                                                                                            });
                                                                                                            self.recordState = 30;
                                                                                                            break;

                                                                                                        case 10:
                                                                                                            propModel.destroySubModel(self);
                                                                                                            break;

                                                                                                        case 30:
                                                                                                            self.recordState = 0;
                                                                                                            break;
                                                                                                    }
                                                                                                });
                                                                                            }}>
                                                                                            <span className={icon}></span>
                                                                                            <span style={{ marginLeft: 10, color: 'white' }}>
                                                                                                {v.flag.getType()}
                                                                                            </span>
                                                                                        </Button>
                                                                                    </td>
                                                                                );
                                                                            }

                                                                            return null;
                                                                        })
                                                                    }
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                }
                                            </Col>
                                        </div>
                                        :
                                        null
                                }
                            </Row>
                        </div>
                    );
                }
            }
        }

        return null;
    }
}


export default inject('store')(observer(ProductDetail3));