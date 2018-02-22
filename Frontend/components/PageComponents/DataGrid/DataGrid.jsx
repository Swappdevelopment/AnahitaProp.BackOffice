import React from "react";
import { observer, inject } from "mobx-react";
import { Table } from "react-bootstrap";

import "./DataGrid.scss";

const DataGrid = inject("store")(
    observer(
        class DataGrid extends React.Component {

            constructor(props) {
                super(props);

                this.activeLang = props.store.langStore.active;
            }

            render() {

                return (

                    <Table className="s-table">
                        <thead>
                            {this.props.getTableHeaders && this.props.getTableHeaders()}
                        </thead>
                        <tbody>{this.props.getTableRows && this.props.getTableRows()}</tbody>
                    </Table>

                );
            }
        }
    )
);

export default DataGrid;
