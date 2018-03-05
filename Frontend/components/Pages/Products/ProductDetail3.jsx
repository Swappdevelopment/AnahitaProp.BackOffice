import React from 'react';
import { observer, inject } from 'mobx-react';

import { Row, Col, Button, OverlayTrigger, Popover } from "react-bootstrap";

import WaitBlock from '../../WaitBlock/WaitBlock';


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

            if (prodModel.isGettingFlags) {

            }
            else if (prodModel.flags.length > 0) {

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

                    return (
                        <div>
                            <Row>
                                {
                                    flBedRoomCount ?
                                        this.getInputElement({
                                            inputType: 'number',
                                            smallInput: true,
                                            label: this.activeLang.labels['lbl_BdRmsCnt'],
                                            isValid: flBedRoomCount.isBedNumberValueValid,
                                            isDisabled: () => prodModel.isSaving,
                                            getValue: () => flBedRoomCount.valueInt,
                                            setValue: e => flBedRoomCount.execAction(self => self.valueInt = parseInt(e.target.value))
                                        })
                                        :
                                        null
                                }
                                {
                                    flOptnDen ?
                                        this.getInputElement({
                                            inputType: 'number',
                                            smallInput: true,
                                            label: this.activeLang.labels['lbl_OptnRmDen'],
                                            isValid: flOptnDen.isBedNumberValueValid,
                                            isDisabled: () => prodModel.isSaving,
                                            getValue: () => flOptnDen.valueInt,
                                            setValue: e => flOptnDen.execAction(self => self.valueInt = parseInt(e.target.value))
                                        })
                                        :
                                        null
                                }
                                {
                                    flViews ?
                                        <div className="s-row-center row">
                                            <Col md={2}>
                                                <label>{this.activeLang.labels['lbl_Views']}</label>
                                            </Col>
                                            <Col md={6}>
                                                {
                                                    prodModel.isSaving ?
                                                        <WaitBlock fullWidth height={34} />
                                                        :
                                                        <table>
                                                            <tbody>
                                                                <tr>
                                                                    <td>
                                                                        <OverlayTrigger
                                                                            rootClose
                                                                            trigger="click"
                                                                            placement="top"
                                                                            container={this.props.rootContainer}
                                                                            overlay={
                                                                                <Popover id="popoverViews">
                                                                                    <div style={{ minHeight: 200 }}>
                                                                                        <Row>
                                                                                            {
                                                                                                this.viewModel.flags.filter(f => {
                                                                                                    return !flViews.find(flv => flv.flag && flv.flag.id === f.id);
                                                                                                }).map((f, i) => (
                                                                                                    <Col md={4} key={f.genId}>
                                                                                                        <Button
                                                                                                            className={'s-btn-small-red'}
                                                                                                            style={{
                                                                                                                borderBottomLeftRadius: 5,
                                                                                                                borderBottomRightRadius: 5,
                                                                                                                borderTopLeftRadius: 5,
                                                                                                                borderTopRightRadius: 5
                                                                                                            }}
                                                                                                            onClick={e => propModel.addViewFlag(f.getValue())}>
                                                                                                            <span className="la la-plus"></span>
                                                                                                            <span style={{ marginLeft: 10, color: 'white' }}>
                                                                                                                {f.getType()}
                                                                                                            </span>
                                                                                                        </Button>
                                                                                                    </Col>
                                                                                                ))
                                                                                            }
                                                                                        </Row>
                                                                                    </div>
                                                                                </Popover>
                                                                            }>
                                                                            <Button
                                                                                style={{ padding: '0 12px' }}
                                                                                className="s-btn-small-blue-empty">
                                                                                <i className="flaticon-add"></i>
                                                                            </Button>
                                                                        </OverlayTrigger>
                                                                    </td>
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
                                                                                        style={{ paddingLeft: 8 }}>
                                                                                        <Button
                                                                                            className={'s-btn-small-' + (v.recordState === 30 ? 'red' : 'primary')}
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