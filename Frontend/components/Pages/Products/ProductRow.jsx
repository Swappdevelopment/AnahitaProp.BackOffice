import React from 'react';
import { observer } from "mobx-react";
import { Checkbox, Button, OverlayTrigger } from "react-bootstrap";

import RowLazyWait from "../../RowLazyWait/RowLazyWait";

import Helper from '../../../Helper/Helper';


class ProductRow extends React.Component {

    render() {

        const { value, index, activeLang, loadLazy, onRowClick, changeBoolean, isGroupRow } = this.props;

        if (value && index >= 0) {

            // value.isChangingStatus = true;

            if (value.isLazyWait) {

                return (
                    <tr>
                        <RowLazyWait colSpan={9} spin={true} onAppear={loadLazy} />
                    </tr>
                );
            }
            else {

                let statusColor = null;

                switch (value.recordState) {

                    case 10:
                        statusColor = 's-status-add';
                        break;

                    case 30:
                        statusColor = 's-status-delete';
                        break;

                    default:

                        if (value.isModified()) {

                            statusColor = 's-status-edit';
                        }
                        break;
                }

                return (
                    <tr>
                        <td className="s-td-cell-status">
                            <div className={statusColor}>
                            </div>
                        </td>
                        <td
                            className="s-td-cell-name"
                            onClick={onRowClick}>
                            {value.getNameAndCode()}
                        </td>

                        {
                            isGroupRow ?
                                <td>
                                    <OverlayTrigger
                                        placement="top"
                                        rootClose
                                        overlay={Helper.getTooltip(`tltp-VwSubProds-${value.genId}`, activeLang.labels["lbl_VwSubProds"])}>

                                        <Button
                                            className="s-btn-small-secondary-empty"
                                            onClick={this.props.onShowSubProducts}>
                                            <span className="la la-arrow-right"></span>
                                        </Button>

                                    </OverlayTrigger>
                                </td>
                                :
                                null
                        }

                        <td>
                            {
                                value.group ?
                                    value.group.type === 10 ? activeLang.labels['lbl_Rsl']
                                        :
                                        (value.group.type === 20 ? activeLang.labels['lbl_Lfs']
                                            :
                                            (value.group.type === 30 ? activeLang.labels['lbl_Prj'] : ''))
                                    :
                                    value.type === 10 ? activeLang.labels['lbl_Rsl']
                                        :
                                        (value.type === 20 ? activeLang.labels['lbl_Lfs']
                                            :
                                            (value.type === 30 ? activeLang.labels['lbl_Prj'] : ''))
                            }
                        </td>

                        <td>{value.netSize.format(0, 3)}</td>
                        <td>{value.grossSize.format(0, 3)}</td>
                        <td>{value.currencyCode}</td>
                        {
                            isGroupRow ?
                                null
                                :
                                <td style={{ textAlign: 'right' }}>{value.price.format(2, 3)}</td>
                        }
                        <td>{value.productFamily ? value.productFamily.getName() : 'No Family'}</td>

                        <td className="s-td-cell-active">
                            {
                                value.isChangingStatus ?
                                    <span className="spinner"></span>
                                    :
                                    <Checkbox className="s-checkbox"
                                        checked={value.status === 1}
                                        onChange={e => {

                                            if (value.id > 0) {

                                                let tempValue = value.status;

                                                value.execAction(self => {

                                                    self.status = e.target.checked ? 1 : 0;
                                                });

                                                if (tempValue !== value.status) {

                                                    if (changeBoolean) changeBoolean(value, 'status');
                                                }
                                            }

                                        }}>
                                    </Checkbox>
                            }

                        </td>
                    </tr>
                );
            }
        }
    }
}


export default observer(ProductRow);