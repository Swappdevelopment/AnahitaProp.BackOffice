import React from "react";
import { observer, inject } from "mobx-react";

import { Checkbox, Button, Alert } from "react-bootstrap";
import { NavLink } from "react-router-dom";

import Login from './Login/Login';
import ForgotPassword from './ForgotPassword/ForgotPassword';
import ConfirmEmail from './ConfirmEmail/ConfirmEmail';
import CompleteRegistration from './CompleteRegistration/CompleteRegistration';
import ResetPassword from './ResetPassword/ResetPassword';

import Helper from "../../Helper/Helper";
import WaitControl from "../WaitControl/WaitControl";

import "./Account.scss";

const Account = inject("store")(
  observer(
    class Account extends React.Component {
      constructor(props) {
        super(props);

        this.activeLang = this.props.store.langStore.active;

        this.accessStore = this.props.store.accessStore;
        this.routeStore = this.props.store.routeStore;

        this.pathingContent = this.pathingContent.bind(this);
      }

      pathingContent() {
        if (this.accessStore.status === 0) {
          return <WaitControl show={true} />;
        } else if (
          (this.accessStore.status === 1 || this.accessStore.status === 3) &&
          this.routeStore.currentRoute.pageName === "login"
        ) {
          return <WaitControl show={true} />;
        }

        if (this.routeStore && this.routeStore.currentRoute) {
          switch (this.routeStore.currentRoute.pageName) {
            case "login":
              return <Login />;

            case "forgotpassword":
              return <ForgotPassword />;

            case "confirmemail":
              return <ConfirmEmail />;

            case "completeregistration":
              return <CompleteRegistration />;

            case "resetpassword":
              return <ResetPassword />;
          }
        }

        return null;
      }

      render() {
        return (
          <div className="s-account-content">
            <div className="container">
              <div className="row">
                <div className="col-md-7 col-sm-12">
                  <div className="s-account-background" />
                </div>

                <div className="col-md-5 col-sm-12">
                  <div className="s-account-wrapper">
                    <div className="s-logo">
                      <img src="../images/logo.jpg" width="300px" />
                      {this.pathingContent()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }
    }
  )
);

export default Account;
