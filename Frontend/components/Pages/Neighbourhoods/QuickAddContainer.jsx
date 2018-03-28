import React from 'react';
import { observer, inject } from 'mobx-react';

import { Row, Col, Button } from 'react-bootstrap';

import WaitBlock from '../../WaitBlock/WaitBlock';
import DropdownEditor from '../../DropdownEditor/DropdownEditor';
import DropdownEditorMenu from '../../DropdownEditor/DropdownEditorMenu';

import NeighbourhoodsViewModel from './NeighbourhoodsViewModel';
import NeighbourhoodModel from '../../../Models/NeighbourhoodModel';


class QuickAddContainer extends React.Component {

    constructor(props) {

        super(props);

        this.activeLang = this.props.store.langStore.active;

        this.viewModel = NeighbourhoodsViewModel.init(this.activeLang);


        this.viewModel.execAction(self => {

            self.neighbourhoods.push(NeighbourhoodModel.toBeAdded(this.props.store.langStore));
            self.selectedValue = self.neighbourhoods[0].id;
        });
    }

    componentWillUnmount() {

        if (this.props.saveObject) {

            this.props.saveObject.saveNbh = undefined;
        }
    }


    getInputElement = (params) => {

        if (params) {

            return (
                <div className="s-row-center row" key={params.key}>
                    <Col md={3}>
                        <label>{params.label}</label>
                    </Col>
                    {
                        params.getInnerElement ?

                            <Col md={9}>
                                {params.getInnerElement()}
                            </Col>
                            :
                            <Col md={9}>
                                {
                                    params.isWaiting && params.isWaiting() ?
                                        <WaitBlock fullWidth height={38} />
                                        :
                                        <div className="form-group s-form-group">
                                            <input
                                                type={params.inputType ? params.inputType : 'text'}
                                                className={'form-control s-input' + (!params.isValid || params.isValid() ? '' : '-error')}
                                                value={params.getValue()}
                                                min={params.inputType === 'number' ? params.min : undefined}
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
                    }
                </div>
            );
        }

        return null;
    }



    render() {

        const model = this.viewModel.selectedValue;

        if (model) {

            const save = (onSuccessCallback, onCompleteCallback) => {

                if (model.isValid()) {

                    this.viewModel.save(
                        model,
                        () => { if (this.props.isSaving) this.props.isSaving(true); },
                        onSuccessCallback,
                        onCompleteCallback ? onCompleteCallback : () => { if (this.props.isSaving) this.props.isSaving(false); });

                    if (this.props.close) this.props.close();
                }
            };

            if (this.props.saveObject) {

                this.props.saveObject.saveNbh = save;
            }

            return (
                <Row>
                    {
                        model.names.map((modelName, i) => {

                            return this.getInputElement({
                                key: `names-${i}`,

                                label: this.activeLang.labels['lbl_Name'] + ' ' +
                                (modelName.language_Code ?
                                    modelName.language_Code.toUpperCase() :
                                    (
                                        modelName.language ? modelName.language.code : ''
                                    )),

                                isValid: modelName.isValueValid,
                                isWaiting: () => model.isSaving,
                                getValue: () => modelName.value ? modelName.value : '',
                                setValue: e => {

                                    modelName.execAction(self => {

                                        self.value = e.target.value;
                                        self.receivedInput = true;
                                    });
                                    model.execAction(self => self.receivedInput = true);
                                }
                            });
                        })
                    }

                    {
                        this.props.hideSaveButton ?
                            null
                            :
                            <br />
                    }

                    {
                        this.props.hideSaveButton ?
                            null
                            :
                            <Button
                                className="s-btn-primary"
                                onClick={e => save(this.props.onSuccess)}>
                                {this.activeLang.labels['lbl_SaveNwProp']}
                            </Button>
                    }

                </Row>
            );
        }

        return null;
    }
}


export default inject('store')(observer(QuickAddContainer));