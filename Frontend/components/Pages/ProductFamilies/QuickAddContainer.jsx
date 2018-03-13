import React from 'react';

import { Row, Col, Button } from 'react-bootstrap';

import WaitBlock from '../../WaitBlock/WaitBlock';


export default class QuickAddContainer extends React.Component {

    constructor(props) {

        super(props);
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

        return (
            <div></div>
        );
    }
}