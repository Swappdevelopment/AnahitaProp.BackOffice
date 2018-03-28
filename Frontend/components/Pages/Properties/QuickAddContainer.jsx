import React from 'react';
import { observer, inject } from 'mobx-react';

import Helper from '../../../Helper/Helper';

import { Row, Col, Button, OverlayTrigger } from 'react-bootstrap';

import WaitBlock from '../../WaitBlock/WaitBlock';
import DropdownEditor from '../../DropdownEditor/DropdownEditor';
import DropdownEditorMenu from '../../DropdownEditor/DropdownEditorMenu';

import PropertiesViewModel from './PropertiesViewModel';
import PropertyModel from '../../../Models/PropertyModel';
import NeighbourhoodModel from '../../../Models/NeighbourhoodModel';
import NbhQuickAddContainer from '../Neighbourhoods/QuickAddContainer';


class QuickAddContainer extends React.Component {

    constructor(props) {

        super(props);

        this.activeLang = this.props.store.langStore.active;

        this.viewModel = PropertiesViewModel.init(this.activeLang);


        this.viewModel.execAction(self => {

            self.properties.push(PropertyModel.toBeAdded());
            self.selectedValue = self.properties[0].id;
        });

        this.state = {
            isPopNewNbhOpen: false,
            isSavingNewNbh: false
        };
    }

    componentWillMount() {

        this.viewModel.getNeighbourhoods();
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


    save = model => {

        if (model && model.isValid()) {

            this.viewModel.save(
                model,
                () => { if (this.props.isSaving) this.props.isSaving(true); },
                this.props.onSuccess,
                () => { if (this.props.isSaving) this.props.isSaving(false); });

            if (this.props.close) this.props.close();
        }
    }


    addAndSetPropertyNbh = (value, model) => {

        if (value && model) {

            this.viewModel.execAction(self => {

                value = NeighbourhoodModel.init(value, self.neighbourhoods.length, this.activeLang.code);

                self.neighbourhoods.splice(0, 0, value);

                this.setNbhOnProperty(model, value);
            });
        }
    };

    setNbhOnProperty = (model, value) => {

        model.execAction(() => {

            model.neighbourhood_Id = value.id;
            model.neighbourhoodRef = value.id;
            model.receivedInput = true;
        });
    }

    render() {

        const model = this.viewModel.selectedValue;

        if (model) {

            const nbhSaveObject = {
                saveNbh: undefined
            };

            return (
                <Row>
                    {
                        this.getInputElement({
                            label: this.activeLang.labels['lbl_Code'],
                            isValid: model.isCodeValid,
                            isWaiting: () => model.isSaving,
                            getValue: () => model.code ? model.code : '',
                            setValue: e => {
                                model.execAction(() => {
                                    model.code = e.target.value;
                                    model.receivedInput = true;
                                });
                            }
                        })
                    }

                    {
                        this.getInputElement({
                            type: 'number',
                            label: this.activeLang.labels['lbl_LotSize'],
                            isValid: model.isLotSizeValid,
                            isWaiting: () => model.isSaving,
                            getValue: () => model.lotSize ? model.lotSize : 0,
                            setValue: e => {
                                model.execAction(self => {
                                    self.lotSize = parseFloat(e.target.value);
                                    self.receivedInput = true;
                                });
                            }
                        })
                    }

                    {
                        this.getInputElement({
                            label: this.activeLang.labels['lbl_Nbh'],
                            getInnerElement: () => (
                                <div>
                                    {
                                        model.isSaving ?
                                            <WaitBlock fullWidth height={38} />
                                            :
                                            <div className="s-dropdown-modal">
                                                <div className="form-group s-form-group">
                                                    {
                                                        this.viewModel.isGettingNeighbourhoods ?
                                                            <span className="spinner"></span>
                                                            :
                                                            <table>
                                                                <tbody>
                                                                    <tr>
                                                                        <td>
                                                                            <DropdownEditor
                                                                                id="drpProperty-Nbh"
                                                                                className={'form-control s-input' + (model.isNbhValid() ? '' : '-error') + ' s-ellipsis'}
                                                                                disabled={
                                                                                    (this.editViewModel ? this.editViewModel.isStep1ReadOnly : false)
                                                                                    || model.group_Id > 0
                                                                                    || this.state.isPopNewNbhOpen}
                                                                                title={model.neighbourhoodRef ? model.neighbourhoodRef.getName() : ''}>
                                                                                {
                                                                                    this.viewModel.neighbourhoods.map((v, i) => {

                                                                                        return (
                                                                                            <DropdownEditorMenu
                                                                                                active={v.id === model.neighbourhood_Id}
                                                                                                key={v.id}
                                                                                                onClick={e => {

                                                                                                    this.setNbhOnProperty(model, v);
                                                                                                }}>
                                                                                                {v.getName()}
                                                                                            </DropdownEditorMenu>
                                                                                        );
                                                                                    })
                                                                                }
                                                                            </DropdownEditor>
                                                                        </td>
                                                                        <td>
                                                                            {
                                                                                this.state.isSavingNewNbh ?
                                                                                    <span className="spinner"></span>
                                                                                    :
                                                                                    <OverlayTrigger
                                                                                        placement="top"
                                                                                        rootClose
                                                                                        overlay={
                                                                                            this.state.isPopNewNbhOpen ?
                                                                                                <span />
                                                                                                :
                                                                                                Helper.getTooltip(
                                                                                                    'tltp-QuickAddPoper-PropNbh',
                                                                                                    this.activeLang.labels['lbl_AddNewNbh'])}>
                                                                                        <Button
                                                                                            onClick={e => this.setState({ isPopNewNbhOpen: !this.state.isPopNewNbhOpen })}
                                                                                            className="s-btn-small-secondary-empty">
                                                                                            <span className={`la la-${this.state.isPopNewNbhOpen ? 'minus' : 'plus'}-square la-2x`}></span>
                                                                                        </Button>
                                                                                    </OverlayTrigger>
                                                                            }
                                                                        </td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>

                                                    }
                                                </div>
                                            </div>
                                    }
                                    {
                                        model.isNbhValid() ?
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

                    {
                        this.state.isPopNewNbhOpen && (!this.editViewModel || !this.editViewModel.isStep2ReadOnly) ?
                            <div className="s-row-center row">
                                <Col mdOffset={1} md={10} style={{ padding: '20px 35px', border: 'gray 1px solid', borderRadius: 8 }}>
                                    <NbhQuickAddContainer
                                        hideSaveButton
                                        saveObject={nbhSaveObject}
                                        close={() => this.setState({ isPopNewNbhOpen: false })}
                                        isSaving={value => this.setState({ isSavingNewNbh: value ? true : false })} />
                                </Col>
                            </div>
                            :
                            null
                    }

                    <br />

                    <Button
                        className="s-btn-primary"
                        onClick={e => {

                            if (this.state.isPopNewNbhOpen && nbhSaveObject.saveNbh) {

                                let saved = false;

                                nbhSaveObject.saveNbh(value => {

                                    this.addAndSetPropertyNbh(value, model);
                                    saved = true;
                                },
                                    () => {

                                        this.setState({ isSavingNewNbh: false });

                                        if (saved) {

                                            this.save(model);
                                        }
                                    });
                            }
                            else {

                                this.save(model);
                            }
                        }}>
                        {this.activeLang.labels[this.state.isPopNewNbhOpen ? 'lbl_SaveNwPropAndNbh' : 'lbl_SaveNwProp']}
                    </Button>

                </Row>
            );
        }

        return null;
    }
}


export default inject('store')(observer(QuickAddContainer));