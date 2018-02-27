import React from 'react';
import { observer, inject } from 'mobx-react';

import { Row, Col } from "react-bootstrap";

class ProductDetail1 extends React.Component {

    constructor(props) {

        super(props);

        this.productModel = props.productModel;

        this.activeLang = this.props.store.langStore.active;
    }


    render() {

        return (
            <div style={{ padding: 20 }}>
                <Row>
                    <Col md={6} mdOffset={3}>
                        <div className="s-row-center row">
                            <Col md={3}>
                                <label>{this.activeLang.labels['lbl_Name']}</label>
                            </Col>
                            <Col md={9}>
                                <input type="text" className="form-control" />
                            </Col>
                        </div>
                    </Col>
                </Row>
            </div>
        );
    }
}


export default inject('store')(observer(ProductDetail1));