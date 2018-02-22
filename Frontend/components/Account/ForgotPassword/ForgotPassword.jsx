import React from "react";
import { observer, inject } from "mobx-react";
import { Checkbox, Button, Alert } from "react-bootstrap";
import { NavLink } from "react-router-dom";

import { errorHandler } from "../../ErrorHandler/ErrorHandler";

import Helper from "../../../Helper/Helper";

import ForgotPasswordViewModel from "./ForgotPasswordViewModel";

import "./ForgotPassword.scss";

const ForgotPassword = inject("store")(
  observer(
    class ForgotPassword extends React.Component {
      constructor(props) {
        super(props);

        this.accountIdentifier = null;

        this.viewModel = new ForgotPasswordViewModel();

        this.accessStore = this.props.store.accessStore;
        this.viewModel.identifier = this.accessStore.identifierBeforeForgot
          ? this.accessStore.identifierBeforeForgot
          : this.viewModel.identifier;
        this.accessStore.identifierBeforeForgot = null;

        this.activeLang = this.props.store.langStore.active;

        this.inputChange = this.inputChange.bind(this);
        this.sendForToken = this.sendForToken.bind(this);
        this.onKeyPress = this.onKeyPress.bind(this);
      }

      inputChange(e, value) {
        this.viewModel.showErrMsg = false;

        this.viewModel.identifier = e.target.value;
      }

      onKeyPress(e) {
        if (e.key === "Enter") {
          this.sendForToken(e);
        }
      }

      sendForToken(e) {
        this.viewModel.showErrMsg = false;
        this.viewModel.queryingServer = true;

        let idCounter = -1;

        Helper.RunPromise(
          {
            promise: fetch("/account/forgotpasswordgentoken", {
              method: "POST",
              body: JSON.stringify({
                accountIdentifier: this.viewModel.identifier
              }),
              headers: {
                "content-type": "application/json; charset=utf-8"
              },
              credentials: "same-origin"
            }),
            success: data => {
              this.viewModel.tokenSent = data && data.ok ? true : false;
            },
            incrementSession: () => {
              this.sendForTokenPromiseID = this.sendForTokenPromiseID
                ? this.sendForTokenPromiseID + 1
                : 1;
              idCounter = this.sendForTokenPromiseID;
            },
            sessionValid: () => {
              return idCounter === this.sendForTokenPromiseID;
            }
          },
          error => {
            if (error.exceptionID) {
              this.viewModel.showErrMsg = true;
            } else {
              errorHandler.showFromLang(this.activeLang);
            }
          },
          () => {
            this.viewModel.queryingServer = false;
          }
        );
      }

      render() {

        return (
          <div className="s-forgot">
            {errorHandler.getComponent()}

            <div className="s-forgot-header">
              <h3>{this.activeLang.labels["lbl_FrgtPsswrd"]}</h3>
              {
                this.viewModel.tokenSent ?
                  null
                  :
                  <h5>{this.activeLang.msgs["msg_FrgtPsswrdDtls"]}</h5>

              }
            </div>


            <div className="s-forgot-form">
              {
                this.viewModel.tokenSent ?

                  <div className="s-forgot-sent">
                    <p>{this.activeLang.msgs["msg_RstEmailSent"]}</p>

                    <NavLink to="/login">
                      <Button className="s-btn-big-primary">
                        {this.activeLang.labels['lbl_Back']}
                      </Button>
                    </NavLink>
                  </div>

                  :
                  <div>
                    <div className="form-group s-form-group">
                      <input className="form-control s-input-empty"
                        type="text"
                        placeholder={this.activeLang.labels['lbl_UsrNmEmail']}
                        name="username"
                        value={this.viewModel.identifier}
                        onKeyPress={this.onKeyPress}
                        onChange={e => this.inputChange(e, 'username')} />
                    </div>

                    <div className="s-forgot-form-alert">
                      {
                        this.viewModel.showErrMsg ?
                          <Alert className="s-alert">
                            <span>{this.activeLang.msgs['msg_EmailPsswrdNotExists'].replace('{1}', this.viewModel.identifier)}</span>
                          </Alert>
                          : null
                      }
                    </div>

                    <div className="s-forgot-form-action">

                      <Button onClick={this.sendForToken} className="s-btn-big-primary">
                        {
                          this.viewModel.queryingServer ?
                            <span>{this.activeLang.labels['lbl_Request']}<i className="spinner-right"></i></span>
                            :
                            this.activeLang.labels['lbl_Request']
                        }
                      </Button>

                      <NavLink to="/login">
                        <Button className="s-btn-big-primary-border">
                          {this.activeLang.labels['lbl_Cancel']}
                        </Button>
                      </NavLink>
                    </div>

                  </div>
              }
            </div>
          </div>
        );
      }
    }
  )
);

export default ForgotPassword;
