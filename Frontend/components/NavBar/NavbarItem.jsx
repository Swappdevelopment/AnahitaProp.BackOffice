import React from 'react';
import { observer, inject } from 'mobx-react';

import { NavLink } from 'react-router-dom';


const NavbarItem =
    inject('store')(
        observer(
            class NavbarItem extends React.Component {

                constructor(props) {

                    super(props);

                    this.wrapper = props.menuWrapper;

                    this.accessStore = this.props.store.accessStore;
                    this.activeLang = this.props.store.langStore.active;

                    this.uiStore = props.store.uiStore;

                    this.onClick = this.onClick.bind(this);
                }

                componentWillMount() {

                    if (this.wrapper.slug === this.props.currentSlug) {

                        this.accessStore.setMenuActive(this.wrapper);

                        if (this.uiStore.openPages.indexOf(this.wrapper) < 0) {

                            this.uiStore.openPages.push(this.wrapper);
                        }
                    }
                }

                onClick(e) {

                    this.accessStore.setMenuActive(this.wrapper);
                }

                render() {

                    let title = this.activeLang.labels[`lbl_Menu_${this.wrapper.slug}`];

                    return (
                        <li className={this.wrapper.isActive || this.props.currentSlug === this.wrapper.slug ? 's-nav-list-item active' : 's-nav-list-item'}>
                            <NavLink className="s-nav-link" to={'/' + this.wrapper.slug} onClick={this.onClick}>
                                <span>{title}</span>
                                {/* <span className={this.wrapper.isActive || this.props.currentSlug === this.wrapper.slug ? 's-nav-link-active' : ''}></span> */}
                            </NavLink>

                        </li>
                    );
                }
            }));

export default NavbarItem;