import React from 'react';
import { observer, inject } from 'mobx-react';
import { BrowserRouter } from 'react-router-dom';

import Account from '../Account/Account';
import ChangePassword from '../Account/ChangePassword/ChangePassword';
import Navbar from '../NavBar/Navbar';

import Page from '../Pages/Page';

import WaitControl from '../WaitControl/WaitControl';
import NoAccess from '../Account/NoAccess/NoAccess';

import AppRoute from '../Routing/AppRoute';
import RouteStore from '../../stores/RouteStore';

import './Shell.scss';


const Shell =
    inject('store')(
        observer(
            class Shell extends React.Component {

                constructor(props) {

                    super(props);

                    this.activeLang = this.props.store.langStore.active;

                    this.uiStore = this.props.store.uiStore;
                    this.accessStore = this.props.store.accessStore;
                    this.routeStore = this.props.store.routeStore;

                    this.pathingContent = this.pathingContent.bind(this);
                }

                pathingContent() {

                    if (this.accessStore.status === 0) {

                        return <WaitControl show={true} />;
                    }
                    else if ((this.accessStore.status === 1 || this.accessStore.status === 3) && this.routeStore.currentRoute.pageName === 'login') {

                        return <WaitControl show={true} />;
                    }

                    if (this.routeStore && this.routeStore.currentRoute) {


                        switch (this.routeStore.currentRoute.pageName) {

                            case 'login':
                            case 'forgotpassword':
                            case 'confirmemail':
                            case 'completeregistration':
                            case 'resetpassword':

                                return (
                                    <Account />
                                );

                                break;

                            default:

                                if (RouteStore.PrivatePages.indexOf(this.routeStore.currentRoute.pageName) >= 0) {

                                    return (

                                        this.accessStore.status === 3 ?

                                            <ChangePassword redirectOnSuccess={true} subTitles={[this.activeLang.msgs['errMsg_PswrdPolicy']]} />

                                            :

                                            <div className="s-thinkbox-wrapper">
                                                <div className="s-navbar">
                                                    <Navbar />
                                                </div>

                                                <div className="s-container">
                                                    {
                                                        this.accessStore.hasPageAccess ?
                                                            this.uiStore.openPages.slice().map((wrapper, index) => {

                                                                return (

                                                                    <Page key={wrapper.slug} menuWrapper={wrapper} />
                                                                );
                                                            })
                                                            :
                                                            <NoAccess />
                                                    }
                                                </div>
                                            </div>

                                    );
                                }
                                break;
                        }
                    }

                    return null;
                }

                render() {

                    var uiClass = 's';

                    switch (this.accessStore.status) {

                        case 0:
                            uiClass += '-spinner';
                            break;

                        case 1:
                            uiClass += '-thinkbox';
                            break;

                        default:
                            uiClass += '-account'
                            break;
                    }

                    return (
                        <BrowserRouter>
                            <div className={uiClass}>
                                <AppRoute renderPath={this.renderPath} />

                                {
                                    this.pathingContent()
                                }

                            </div>
                        </BrowserRouter>
                    );
                }
            }));

export default Shell;