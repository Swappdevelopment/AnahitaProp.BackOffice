import React from 'react';
import { inject } from 'mobx-react';

import { withRouter, Route } from 'react-router-dom';


const AppRoute =
    withRouter(
        inject('store')(
            class AppRoute extends React.Component {

                constructor(props) {

                    super(props);

                    this.routeStore = this.props.store.routeStore;
                    this.accessStore = this.props.store.accessStore;

                    props.store.accessStore.location = this.props.location;
                    props.store.accessStore.history = this.props.history;
                }

                componentWillMount() {

                    //this.props.store.accessStore.getMenus();
                    this.routeStore.setRoute(this.props.location.pathname);
                }

                componentDidUpdate(prevProps) {

                    if (this.props.location !== prevProps.location) {

                        this.routeStore.setRoute(this.props.location.pathname);
                    }
                }

                processPath(reqAccess) {

                    if (reqAccess
                        && (this.accessStore.status === -1
                            || this.accessStore.status === 2)) {

                        this.accessStore.status = 0;
                    }

                    return null;
                }


                render() {

                    return (
                        <div style={{ display: 'none' }}>
                            <Route exact path="/" render={p => this.processPath(true)} />
                            <Route exact path="/dashboard" render={p => this.processPath(true)} />
                            <Route exact path="/trainings" render={p => this.processPath(true)} />
                            <Route exact path="/contacts" render={p => this.processPath(true)} />
                            <Route exact path="/companies" render={p => this.processPath(true)} />
                            <Route exact path="/clubs" render={p => this.processPath(true)} />
                            <Route exact path="/catalogs" render={p => this.processPath(true)} />

                            <Route exact path="/user-profile" render={p => this.processPath(true)} />
                            <Route exact path="/user-management" render={p => this.processPath(true)} />

                            <Route exact path="/login" render={p => this.processPath()} />
                            <Route exact path="/changepassword" render={p => this.processPath()} />
                            <Route exact path="/forgotpassword" render={p => this.processPath()} />
                            <Route exact path="/confirmemail" render={p => this.processPath()} />
                            <Route exact path="/completeregistration" render={p => this.processPath()} />
                        </div>
                    );
                }
            }));

export default AppRoute;