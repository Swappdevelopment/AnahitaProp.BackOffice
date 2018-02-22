import React from 'react';
import ReactDOM from 'react-dom';

import { observer, inject } from 'mobx-react';
import { NavDropdown, MenuItem, Button, } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';

import NavbarItem from './NavbarItem';

import './Navbar.scss';


const Navbar =
    inject('store')(
        observer(
            class Navbar extends React.Component {

                constructor(props) {
                    super(props);

                    this.state = { affix: false };

                    this.langStore = this.props.store.langStore;
                    this.activeLang = this.props.store.langStore.active;

                    this.uiStore = this.props.store.uiStore;
                    this.accessStore = this.props.store.accessStore;
                    this.routeStore = props.store.routeStore;

                    this.handleScroll = this.handleScroll.bind(this);

                }

                componentDidMount() {

                    window.addEventListener('scroll', this.handleScroll);
                }

                componentWillUnmount() {

                    window.removeEventListener('scroll', this.handleScroll);

                    this.affixTarget = null;
                }

                handleScroll(e) {


                    if (e.srcElement.scrollingElement.scrollTop >= 73) {

                        this.setState({
                            affix: true
                        });
                    }
                    else {
                        this.setState({
                            affix: false
                        });
                    }

                }

                render() {

                    let currentSlug = this.routeStore.currentRoute ? this.routeStore.currentRoute.pageName : null;

                    let userFName = this.accessStore.userName ? this.accessStore.userName.split(' ') : this.activeLang.labels['lbl_Unknown'];

                    if (Array.isArray(userFName)) {
                        userFName = userFName && userFName.length > 1 ? userFName[1] : this.activeLang.labels['lbl_Unknown'];
                    }

                    let genderName = 'unknown';

                    switch (this.accessStore.userGender) {

                        case 10:
                            genderName = 'male';
                            break;

                        case 20:
                            genderName = 'female';
                            break;
                    }

                    const affixStyle = {};

                    if (this.state.affix) {
                        affixStyle.position = 'fixed';
                        affixStyle.top = '0';
                        affixStyle.width = '100%';
                        affixStyle.zIndex = '999';
                    }

                    return (

                        <div className="s-navbar-wrapper">
                            <div className="container">
                                <div className="row">
                                    <div className="s-navbar-top">
                                        <div className="col-xs-3 col-sm-4">
                                            <div className="s-brand">
                                                <a href="/" className="hidden-xs">
                                                    <img src="../images/logo.png" height="50" />
                                                </a>
                                                <a href="/" className="visible-xs">
                                                    <img src="../images/logo-sm.png" height="40" />
                                                </a>
                                            </div>
                                        </div>
                                        <div className="col-xs-9 col-sm-8">
                                            <div className="s-menu">
                                                <ul className="s-menu-list">
                                                    <li className="s-menu-list-item">
                                                        <a className="s-menu-link">
                                                            <span className="s-menu-link-icon">
                                                                <i className="flaticon-music-2"></i>
                                                            </span>
                                                        </a>
                                                    </li>
                                                    <NavDropdown id="drpProfile" className="s-menu-list-item s-dropdown-menu"
                                                        noCaret
                                                        title={
                                                            <div className="s-menu-link" >
                                                                <span className="s-menu-welcome">{this.activeLang.labels['lbl_Hello']},&nbsp;</span>
                                                                <span className="s-menu-user">{userFName}&nbsp;&nbsp;</span>
                                                                <span className="s-menu-avatar">
                                                                    <img src={`../images/${genderName}_avatar.png`} />
                                                                </span>
                                                            </div>
                                                        }>
                                                        <div className="s-dropdown-wrapper">
                                                            <span className="s-dropdown-arrow"></span>
                                                            <div className="s-dropdown-header">
                                                                    <div className="s-dropdown-user-img">
                                                                        <img src={`../images/${genderName}_avatar.png`} />
                                                                    </div>
                                                                    <div className="s-dropdown-user-detail">
                                                                        <h4>{this.accessStore.userName ? this.accessStore.userName : this.activeLang.labels['lbl_Unknown']}</h4>
                                                                        <h5>{this.accessStore.userEmail}</h5>
                                                                    </div>
                                                            </div>
                                                            <div className="s-dropdown-content">
                                                                <li className="s-dropdown-list-item" role="presentation">
                                                                    <NavLink className="s-dropdown-link" role="menuitem" tabIndex="-1" to="/user-profile">
                                                                        <i className="flaticon-profile-1"></i>
                                                                        <span>{this.activeLang.labels['lbl_Profile']}</span>
                                                                    </NavLink>
                                                                </li>


                                                                <NavDropdown className="s-dropdown-language" id="drpLang" noCaret
                                                                    title={

                                                                        <div className="s-dropdown-list-item" role="presentation">
                                                                            <div className="s-dropdown-link">
                                                                                <i className="flaticon-location"></i>
                                                                                <span>{this.activeLang.labels['lbl_Langs']}</span>
                                                                                <i className="s-caret-down la la-angle-down"></i>
                                                                            </div>
                                                                        </div>

                                                                    }>

                                                                    {
                                                                        Object.entries(this.langStore.allLanguages).map((lang, index) => {

                                                                            if (lang && lang.length === 2 && lang[1]) {
                                                                                let langDetail = lang[1];
                                                                                return (
                                                                                    <div key={langDetail.code}>
                                                                                        <li className="s-dropdown-language-item" onClick={e => { this.langStore.setLanguage(langDetail.code) }}>
                                                                                            <a className="s-dropdown-language-link">{`${langDetail.name} (${langDetail.code.toUpperCase()})`}</a>
                                                                                        </li>
                                                                                    </div>
                                                                                );
                                                                            }

                                                                            return null;
                                                                        })
                                                                    }
                                                                </NavDropdown>

                                                                {
                                                                    this.accessStore.userMenus.length > 0 ?
                                                                        <div className="s-separator"></div>
                                                                        :
                                                                        null
                                                                }

                                                                {
                                                                    this.accessStore.userMenus.map((v, i) => {

                                                                        return (

                                                                            <li key={v.slug} className="s-dropdown-list-item" role="presentation">
                                                                                <NavLink className="s-dropdown-link" role="menuitem" tabIndex="-1" to={`/${v.slug}`}>
                                                                                    <i className="flaticon-lock-1"></i>
                                                                                    <span>{this.activeLang.labels[`lbl_Menu_${v.slug.split('-').join('')}`]}</span>
                                                                                </NavLink>
                                                                            </li>
                                                                        );
                                                                    })
                                                                }

                                                                <div className="s-separator"></div>
                                                                <li className="s-dropdown-list-item" role="presentation">
                                                                    <Button className="s-btn-medium-primary-border" onClick={e => this.accessStore.signOut()}>
                                                                        {this.activeLang.labels['lbl_SignOut']}
                                                                    </Button>
                                                                </li>

                                                            </div>
                                                        </div>

                                                    </NavDropdown>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style={affixStyle} ref={r => this.affixTarget = ReactDOM.findDOMNode(r)} className="s-navbar-bottom">
                                <div className="container">
                                    <div className="row">
                                        <div className="col-xs-9">
                                            <div className="s-nav">
                                                <ul className="s-nav-list hidden-xs hidden-sm">
                                                    {
                                                        this.accessStore.sideMenus.slice().map((wrapper, index) => {

                                                            return <NavbarItem key={wrapper.slug} menuWrapper={wrapper} currentSlug={currentSlug} />
                                                        })
                                                    }
                                                </ul>
                                            </div>
                                        </div>
                                        <div className="col-xs-3">

                                            {
                                                this.uiStore.navBarSearch ?
                                                    <div className="s-search">
                                                        <div className="form-group s-form-group">

                                                            <input className="form-control s-input-search"
                                                                type="text"
                                                                placeholder={`${this.activeLang.labels['lbl_Search']}...`}
                                                                value={this.uiStore.navBarSearch.getSearchText ? this.uiStore.navBarSearch.getSearchText() : ''}
                                                                onChange={e => {

                                                                    if (this.uiStore.navBarSearch.setSearchText) {

                                                                        this.uiStore.navBarSearch.setSearchText(e.target.value);
                                                                    }
                                                                }}
                                                                onKeyPress={e => {

                                                                    switch (e.key) {
                                                                        case 'Enter':

                                                                            if (this.uiStore.navBarSearch.setSearchText) {

                                                                                this.uiStore.navBarSearch.searchAction();
                                                                            }
                                                                            break;
                                                                    }
                                                                }}
                                                                name="search" />

                                                            <Button
                                                                className="s-btn-small-search"
                                                                onClick={e => {

                                                                    if (this.uiStore.navBarSearch.searchAction) {

                                                                        this.uiStore.navBarSearch.searchAction();
                                                                    }
                                                                }}>
                                                                <i className="la la-search" />
                                                            </Button>

                                                            {
                                                                this.uiStore.navBarSearch.getSearchText && this.uiStore.navBarSearch.getSearchText() ?
                                                                    <Button
                                                                        className="s-btn-small-clear"
                                                                        onClick={e => {

                                                                            if (this.uiStore.navBarSearch.clearText) {

                                                                                this.uiStore.navBarSearch.clearText();
                                                                            }
                                                                        }}>
                                                                        <i className="la la-remove" />
                                                                    </Button>
                                                                    :
                                                                    null
                                                            }

                                                        </div>
                                                    </div>
                                                    :
                                                    null
                                            }

                                        </div>
                                    </div>
                                </div>
                            </div>


                        </div>

                    );
                }
            }));

export default Navbar;

