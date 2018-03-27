import React from 'react';
import { observer, inject } from 'mobx-react';

import { Row, Col, Button } from 'react-bootstrap';

import WaitBlock from '../../WaitBlock/WaitBlock';
import DropdownEditor from '../../DropdownEditor/DropdownEditor';
import DropdownEditorMenu from '../../DropdownEditor/DropdownEditorMenu';

import ProductFamiliesViewModel from './ProductFamiliesViewModel';


class QuickAddContainer extends React.Component {

    constructor(props) {

        super(props);

        this.activeLang = this.props.store.langStore.active;

        this.viewModel = ProductFamiliesViewModel.init();


        this.viewModel.execAction(self => {

            if (props.model) {
                self.families.push(props.model);
                self.selectedValue = props.model.id;
            }

            if (props.familyTypes && props.familyTypes.length > 0) {
                self.types.push(...props.familyTypes);
            }
        });
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
                        this.getInputElement({
                            label: this.activeLang.labels['lbl_Type'],
                            getInnerElement: () => (
                                <div>
                                    {
                                        model.isSaving ?
                                            <WaitBlock fullWidth height={38} />
                                            :
                                            <div className="s-dropdown-modal">
                                                <div className="form-group s-form-group">
                                                    <DropdownEditor
                                                        id="drpFamily-Type"
                                                        className={'form-control s-input' + (model.isTypeValid() ? '' : '-error') + ' s-ellipsis'}
                                                        disabled={(this.editViewModel ? this.editViewModel.isStep1ReadOnly : false) || model.group_Id > 0}
                                                        title={model.type ? model.type.name : ''}>
                                                        {
                                                            this.viewModel.types.map((v, i) => {

                                                                return (
                                                                    <DropdownEditorMenu
                                                                        active={v.id === model.productFamily_Id}
                                                                        key={v.id}
                                                                        onClick={e => {

                                                                            model.execAction(self => {

                                                                                self.type_Id = v.id;
                                                                                self.type = Object.assign({}, v);
                                                                                self.receivedInput = true;
                                                                            });
                                                                        }}>
                                                                        {v.name}
                                                                    </DropdownEditorMenu>
                                                                );
                                                            })
                                                        }
                                                    </DropdownEditor>
                                                </div>
                                            </div>
                                    }
                                    {
                                        model.isTypeValid() ?
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

                    <br />

                    <Button
                        className="s-btn-primary"
                        onClick={e => {

                            if (this.props.isSaving) this.props.isSaving(true);

                            this.viewModel.save(
                                model,
                                this.props.onSuccess,
                                () => { if (this.props.isSaving) this.props.isSaving(false); });

                            if (this.props.close) this.props.close();
                        }}>
                        {this.activeLang.labels['lbl_Save']}
                    </Button>

                </Row>
            );
        }

        return null;
    }
}


export default inject('store')(observer(QuickAddContainer));