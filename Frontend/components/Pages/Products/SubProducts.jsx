import React from "react";
import { observer, inject } from "mobx-react";

import PageComponent from "../../PageComponents/PageComponent";

import ProductRow from "./ProductRow";
import ProductDetail from "./ProductDetail";

import Helper from "../../../Helper/Helper";


class SubProducts extends React.Component {

  constructor(props) {
    super(props);

    this.state = { isModalShown: false, modalMode: 'default' };

    this.viewModel = props.viewModel;
    this.errorHandler = props.errorHandler;

    this.activeLang = this.props.store.langStore.active;

    this.limit = Helper.LAZY_LOAD_LIMIT + 20;
    this.offset = 0;
  }

  componentWillMount() {

    const prodGroup = this.viewModel.selectedGroup;

    if (prodGroup && prodGroup.subProducts.length === 0) {

      this.getSubProducts();
    }
  }

  getSubProducts = prodGroup => {

    prodGroup = prodGroup ? prodGroup : this.viewModel.selectedGroup;

    this.viewModel.getProducts(this.limit, this.offset, false, prodGroup.id);
  }

  getProductsRow = (value, index) => (
    <ProductRow
      key={value.genId}
      value={value}
      index={index}
      activeLang={this.activeLang}
      loadLazy={() => {
        this.offset += this.limit;
        this.getSubProducts();
      }}
      onRowClick={() => {

        this.scrollPos = document.documentElement.scrollTop;
        this.viewModel.execAction(self => self.selectedSubValue = value.id);
      }}
      changeBoolean={this.changeBoolean} />
  )

  render() {

    const prodGroup = this.viewModel.selectedGroup;

    if (prodGroup) {

      return (

        <PageComponent
          //notSPage
          //hideActions

          paTitle={
            <span>
              <span>{'Group'}</span>
              <span className="la la-angle-right" style={{ margin: '0 8px' }}></span>
              <span style={{ color: 'black' }}>{prodGroup.getNameAndCode()}</span>
            </span>}
          paTitleClick={e => {
            this.viewModel.execAction(self => self.selectedGroup = null);
          }}

          getTableHeaders={() => (
            <tr>
              <th className="s-th-cell-status"></th>
              <th className="s-th-cell-name">{this.activeLang.labels["lbl_Name"]}</th>
              <th>{this.activeLang.labels["lbl_Type"]}</th>
              <th>{this.activeLang.labels["lbl_NetSize"]}</th>
              <th>{this.activeLang.labels["lbl_GrossSize"]}</th>
              <th>{this.activeLang.labels["lbl_Currency"]}</th>
              <th>{this.activeLang.labels["lbl_Price"]}</th>
              <th>{this.activeLang.labels["lbl_Family"]}</th>
              <th className="s-th-cell-active">{this.activeLang.labels["lbl_Active"]}</th>
            </tr>
          )}
          getTableRows={() => prodGroup.subProducts.map(this.getProductsRow)}

          hidePage={this.viewModel.selectedSubValue ? true : false}

          getSiblings={() => (
            this.viewModel.selectedSubValue ?
              <ProductDetail key="SubProductDetail" viewModel={this.viewModel} errorHandler={this.errorHandler} isSubProduct />
              :
              null
          )} />
      );
    }

    return null;
  }
}

export default inject("store")(observer(SubProducts));
