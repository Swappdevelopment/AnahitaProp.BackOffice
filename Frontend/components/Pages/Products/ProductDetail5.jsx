import React from 'react';
import { observer, inject } from 'mobx-react';

import { Row, Col, Button, Image, Checkbox, OverlayTrigger, Popover } from "react-bootstrap";

import scrollToComponent from 'react-scroll-to-component';

import Helper from '../../../Helper/Helper';


class ProductDetail5 extends React.Component {

    constructor(props) {

        super(props);

        this.state = {
            changingBoolean: false,
            uploading: false
        };

        this.viewModel = props.viewModel;

        this.activeLang = this.props.store.langStore.active;
    }

    componentWillMount() {

        this.viewModel.bindOnSelectedValueChange(this.getFiles);

        this.getFiles();
    }

    componentWillUnmount() {

        this.viewModel.unbindOnSelectedValueChange(this.getFiles);
    }

    getFiles = () => {

        this.viewModel.getFiles();
    }



    popDeleteConfirm = (prodModel, entFile, deleteCallback) => {

        if (prodModel && entFile) {

            return (
                <Popover
                    id="popDelete"
                    className={`popDelete-${entFile.genId}`}
                    title={
                        <div>
                            <span className="la la-exclamation-circle"></span>
                            <span> {this.activeLang.labels['lbl_Delete']}</span>
                            {this.props.deleteTitle}
                        </div>
                    }>

                    <p>{this.activeLang.msgs['msg_SureDelete'].replace('{1}', '')}</p>

                    <div style={{ paddingTop: '8px', textAlign: 'center' }}>
                        <Button
                            className="s-btn-small-redDark"
                            onClick={e => {

                                prodModel.deleteProductFile(entFile);

                                if (deleteCallback) {
                                    deleteCallback();
                                }
                            }}>
                            {this.activeLang.labels['lbl_Delete']}
                        </Button>
                    </div>

                </Popover>
            );
        }
    }


    cancelRankChange = entFile => {

        if (entFile && entFile.originalValue) {

            entFile.execAction(self => self.detailRank = self.originalValue.detailRank);
        }
    }

    changeBoolean = (prodModel, value, action) => {

        if (prodModel && value) {

            let idCounter = -1;

            value.execAction(self => {
                switch (action) {

                    case 'status':

                        self.isChangingStatus = true;
                        break;

                    case 'appearDetail':

                        self.isChangingAppearDetail = true;
                        break;

                    case 'isListImage':

                        self.isChangingIsListImage = true;
                        break;
                }
            });

            this.setState({ changingBoolean: true });

            Helper.RunPromise(
                {
                    promise: Helper.FetchPromisePost(
                        '/products/ChangeProductFileBoolean/',
                        {
                            id: value.id,
                            productId: prodModel.id,
                            action: action,
                            status: value.status,
                            appearDetail: value.appearDetail,
                            isListImage: value.isListImage
                        }),
                    success: data => {

                        if (value.originalValue) {

                            switch (action) {

                                case 'status':

                                    value.setOriginalValueProperty({ status: value.status });
                                    break;

                                case 'appearDetail':

                                    value.setOriginalValueProperty({ appearDetail: value.appearDetail });
                                    break;

                                case 'isListImage':

                                    value.setOriginalValueProperty({ isListImage: value.isListImage });
                                    break;
                            }

                        }
                    },
                    incrementSession: () => {

                        this.changeBooleanPromiseID = this.changeBooleanPromiseID ? (this.changeBooleanPromiseID + 1) : 1;
                        idCounter = this.changeBooleanPromiseID;
                    },
                    sessionValid: () => {

                        return idCounter === this.changeBooleanPromiseID;
                    }
                },
                error => {

                    switch (error.exceptionID) {
                        default:
                            this.errorHandler.showFromLang(this.activeLang);
                            break;
                    }
                },
                () => {

                    value.execAction(self => {
                        switch (action) {

                            case 'status':

                                self.isChangingStatus = false;
                                break;

                            case 'appearDetail':

                                self.isChangingAppearDetail = false;
                                break;

                            case 'isListImage':

                                self.isChangingIsListImage = false;
                                break;
                        }
                    });

                    this.setState({ changingBoolean: false });
                }
            );
        }
    }

    scrollToElement = element => {

        if (element) {

            scrollToComponent(element);
        }
    }


    uploadImage = (prodModel, image, rank, offset) => {

        if (prodModel && image) {

            const formData = new FormData();

            const fwrapper = this.viewModel.genNewProductFile();
            fwrapper.model.execAction(self => self.detailRank = rank);
            fwrapper.model.product_Id = prodModel.id;
            fwrapper.scrollTo = true;

            prodModel.execAction(self => self.files.push(fwrapper));

            formData.append(`ProdFileID:${fwrapper.id}`, JSON.stringify(fwrapper.getValue()));

            if (offset === 0 || offset > 0) {
                formData.append('offset', offset);
            }

            formData.append(`ProdFileID:${fwrapper.id}`, image);

            fwrapper.model.execAction(self => self.isSaving = true);

            this.setState({ uploading: true });

            fetch('/products/uploadProductImage', {
                method: 'POST',
                headers: { 'Accept': 'application/json' },
                body: formData
            })
                .then(data => data.json())
                .then(data => {

                    if (data) {

                        fwrapper.setModelRaw(data);
                    }

                    this.setState({ uploading: false });
                })
                .catch((error) => {

                    this.setState({ uploading: false });
                });
        }
    }

    getImageElement = (prodModel, entFile, isLast) => {

        if (prodModel && entFile) {

            const url = entFile.file ? `${GlobalValues.domains.assets}${entFile.file.optzUrl}?t=${Date.now()}` : '';

            let oTrig = null;

            return (
                <tr key={entFile.genId}>
                    <td>
                        <div ref={r => {

                            if (isLast) {

                                if (entFile.wrapper && entFile.wrapper.scrollTo) {

                                    entFile.wrapper.scrollTo = false;
                                    this.scrollToElement(r);
                                }
                            }
                        }}>
                            <div>
                                <Button
                                    className="s-btn-small-secondary-empty"
                                    disabled={this.state.changingBoolean}
                                    bsSize="xsmall"
                                    onClick={e => {
                                        if (entFile.detailRank > 0) {
                                            entFile.execAction(self => self.detailRank -= 1);
                                            prodModel.sortFilesOnRank(entFile);
                                        }
                                    }}>
                                    <span className="la la-angle-up"></span>
                                </Button>
                            </div>
                            <div>
                                <Button
                                    className="s-btn-small-secondary-empty"
                                    disabled={this.state.changingBoolean}
                                    bsSize="xsmall"
                                    onClick={e => {
                                        entFile.execAction(self => self.detailRank += 1);
                                        prodModel.sortFilesOnRank(entFile);
                                    }}>
                                    <span className="la la-angle-down"></span>
                                </Button>
                            </div>
                        </div>
                    </td>
                    <td style={{ position: 'relative' }}>
                        {
                            entFile.isSaving ?
                                <span className="spinner" style={{ position: 'absolute', left: 70 }}></span>
                                :
                                <a href={url} target="_blank">
                                    <Image style={{ margin: '5px 10px', height: 90 }} src={url} responsive rounded />
                                </a>
                        }
                    </td>
                    <td className="s-td-cell-active">
                        {
                            entFile.isChangingIsListImage ?
                                <span className="spinner" style={{ position: 'absolute', marginLeft: -15, marginTop: -15 }}></span>
                                :
                                <Checkbox
                                    className="s-checkbox"
                                    disabled={entFile.isSaving}
                                    defaultChecked={entFile.isListImage ? true : false}
                                    onChange={e => {

                                        if (entFile.id > 0) {

                                            const tempValue = entFile.isListImage;

                                            entFile.execAction(self => {

                                                self.isListImage = e.target.checked ? true : false;
                                            });

                                            if (tempValue !== entFile.isListImage) {

                                                this.changeBoolean(prodModel, entFile, 'isListImage');
                                            }
                                        }

                                    }}>
                                </Checkbox>
                        }

                    </td>
                    <td className="s-td-cell-active">
                        {
                            entFile.isChangingAppearDetail ?
                                <span className="spinner" style={{ position: 'absolute', marginLeft: -15, marginTop: -15 }}></span>
                                :
                                <Checkbox
                                    className="s-checkbox"
                                    disabled={entFile.isSaving}
                                    defaultChecked={entFile.appearDetail ? true : false}
                                    onChange={e => {

                                        if (entFile.id > 0) {

                                            const tempValue = entFile.appearDetail;

                                            entFile.execAction(self => {

                                                self.appearDetail = e.target.checked ? true : false;
                                            });

                                            if (tempValue !== entFile.appearDetail) {

                                                this.changeBoolean(prodModel, entFile, 'appearDetail');
                                            }
                                        }

                                    }}>
                                </Checkbox>
                        }

                    </td>
                    <td className="s-td-cell-active">
                        {
                            entFile.isChangingStatus ?
                                <span className="spinner" style={{ position: 'absolute', marginLeft: -15, marginTop: -15 }}></span>
                                :
                                <Checkbox className="s-checkbox"
                                    disabled={entFile.isSaving}
                                    defaultChecked={entFile.status === 1 ? true : false}
                                    onChange={e => {

                                        if (entFile.id > 0) {

                                            const tempValue = entFile.status;

                                            entFile.execAction(self => {

                                                self.status = e.target.checked ? 1 : 0;
                                            });

                                            if (tempValue !== entFile.status) {

                                                this.changeBoolean(prodModel, entFile, 'status');
                                            }
                                        }

                                    }}>
                                </Checkbox>
                        }

                    </td>
                    <td>
                        <OverlayTrigger
                            ref={r => oTrig = r}
                            rootClose
                            trigger="click"
                            placement="left"
                            overlay={this.popDeleteConfirm(prodModel, entFile, () => {

                                if (oTrig) {
                                    oTrig.hide();
                                }
                            })}>
                            <OverlayTrigger
                                placement="top"
                                rootClose
                                overlay={Helper.getTooltip(
                                    `tltpDelete-${entFile.genId}`,
                                    this.activeLang.labels["lbl_Delete"]
                                )}>
                                <Button
                                    className="s-btn-small-delete"
                                    disabled={entFile.isSaving}>
                                    <span className="la la-remove" />
                                </Button>
                            </OverlayTrigger>
                        </OverlayTrigger>
                    </td>
                </tr>
            );
        }

        return null;
    }


    render() {

        if (!this.viewModel.isGettingFiles) {

            const prodModel = this.props.getSelectedValue();

            let btnBrowse = null;

            if (prodModel) {

                return (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
                            <input
                                ref={r => btnBrowse = r}
                                style={{ display: 'none' }}
                                type="file" multiple
                                onChange={e => {

                                    const lastRank = prodModel.files[prodModel.files.length - 1].model.detailRank;

                                    for (let i = 0; i < e.target.files.length; i++) {

                                        this.uploadImage(prodModel, e.target.files[i], lastRank + i, i);
                                    }
                                }} />
                            <OverlayTrigger
                                placement="top"
                                rootClose
                                overlay={Helper.getTooltip('tltpUploadImg', this.activeLang.msgs["msg_UploadImgs"])}>
                                <Button
                                    className="s-btn-small-secondary"
                                    disabled={this.state.uploading}
                                    onClick={e => {
                                        if (btnBrowse) {
                                            btnBrowse.click(e);
                                        }
                                    }}>
                                    <span className="la la-upload"></span>
                                    {this.activeLang.labels['lbl_Upload']}
                                </Button>
                            </OverlayTrigger>

                        </div>
                        <table className="s-table table">
                            <thead>
                                <tr>
                                    <th></th>
                                    <th></th>
                                    <th>
                                        {this.activeLang.labels['lbl_LstImg']}
                                    </th>
                                    <th>
                                        {this.activeLang.labels['lbl_AprDtl']}
                                    </th>
                                    <th>
                                        {this.activeLang.labels['lbl_Active']}
                                    </th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    prodModel.files.map((f, i) => this.getImageElement(prodModel, f.model, i === (prodModel.files.length - 1)))
                                }
                            </tbody>
                        </table>
                    </div>
                );
            }
        }

        return null;
    }
}


export default inject('store')(observer(ProductDetail5));