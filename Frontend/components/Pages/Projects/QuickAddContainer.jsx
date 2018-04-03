import React from 'react';
import { observer, inject } from 'mobx-react';

import { Row, Col, Button } from 'react-bootstrap';

import WaitBlock from '../../WaitBlock/WaitBlock';
import DropdownEditor from '../../DropdownEditor/DropdownEditor';
import DropdownEditorMenu from '../../DropdownEditor/DropdownEditorMenu';

import ProjectsViewModel from './ProjectsViewModel';
import ProjectModel from '../../../Models/ProjectModel';
import Helper from '../../../Helper/Helper';


class QuickAddContainer extends React.Component {

    constructor(props) {

        super(props);

        this.activeLang = this.props.store.langStore.active;

        this.viewModel = ProjectsViewModel.init(this.activeLang);


        this.viewModel.execAction(self => {

            self.projects.push(ProjectModel.toBeAdded(this.props.store.langStore));
            self.selectedValue = self.projects[0].id;
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
                        <React.Fragment>
                            {
                                this.getInputElement({
                                    label: this.activeLang.labels['lbl_Type'],
                                    getInnerElement: () => (
                                        <div className="s-dropdown-modal">
                                            <div className="form-group s-form-group">
                                                {
                                                    this.viewModel.isGettingNeighbourhoods ?
                                                        <span className="spinner"></span>
                                                        :
                                                        <DropdownEditor
                                                            id="drpProject-Type"
                                                            className={'form-control s-input' + (model.isTypeValid() ? '' : '-error') + ' s-ellipsis'}
                                                            title={this.activeLang.labels[`lbl_ProjType_${model.type}`]}>
                                                            {
                                                                Helper.getProjectTypes().map(({ key }, i) => {

                                                                    return (
                                                                        <DropdownEditorMenu
                                                                            active={model.type === key}
                                                                            key={key}
                                                                            onClick={e => {
                                                                                model.execAction(() => {
                                                                                    model.type = key;
                                                                                    model.receivedInput = true;
                                                                                });
                                                                            }}>
                                                                            {this.activeLang.labels[`lbl_ProjType_${key}`]}
                                                                        </DropdownEditorMenu>
                                                                    );
                                                                })
                                                            }
                                                        </DropdownEditor>
                                                }
                                            </div>
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
                        </React.Fragment>
                    }
                    {
                        this.props.hideSaveButton ?
                            null
                            :
                            <React.Fragment>
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
                                    {this.activeLang.labels['lbl_SaveNwProj']}
                                </Button>
                            </React.Fragment>
                    }

                </Row>
            );
        }

        return null;
    }
}


export default inject('store')(observer(QuickAddContainer));