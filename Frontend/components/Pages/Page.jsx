import React from 'react';
import { observer, inject } from 'mobx-react';

import ErrorHandler from '../ErrorHandler/ErrorHandler';
import PageViewModel from './PageViewModel';
import WaitControl from '../WaitControl/WaitControl';

import UserProfile from './UserProfile/UserProfile';
import UserManagement from './UserManagement/UserManagement';
import Companies from './Companies/Companies';
import Clubs from './Clubs/Clubs';
import Catalogs from './Catalogs/Catalogs';
import Trainings from './Trainings/Trainings';

const Page =
    inject('store')(
        observer(
            class Page extends React.Component {

                constructor(props) {

                    super(props);

                    this.menuWrapper = props.menuWrapper;

                    this.errorHandler = new ErrorHandler();

                    this.viewModel = new PageViewModel(this.menuWrapper);

                    this.activeLang = this.props.store.langStore.active;

                    this.getMenuPage = this.getMenuPage.bind(this);
                }

                getMenuPage() {

                    switch (this.menuWrapper.slug) {

                        case 'companies':
                            return (
                                <Companies pageViewModel={this.viewModel} errorHandler={this.errorHandler} />
                            );

                        case 'clubs':
                            return (
                                <Clubs pageViewModel={this.viewModel} errorHandler={this.errorHandler} />
                            );

                        case 'catalogs':
                            return (
                                <Catalogs pageViewModel={this.viewModel} errorHandler={this.errorHandler} />
                            );

                        case 'trainings':
                            return (
                                <Trainings pageViewModel={this.viewModel} errorHandler={this.errorHandler} />
                            );

                        case 'user-profile':
                            return (
                                <UserProfile pageViewModel={this.viewModel} errorHandler={this.errorHandler} />
                            );

                        case 'user-management':
                            return (
                                <UserManagement pageViewModel={this.viewModel} errorHandler={this.errorHandler} />
                            );
                    }

                    return null;
                };

                render() {

                    const style = { display: this.menuWrapper.isActive ? 'block' : 'none' };

                    const blurStyle = {};

                    if (this.viewModel.pageBlurPixels > 0) {

                        blurStyle['filter'] = `blur(${this.viewModel.pageBlurPixels}px)`;
                    }

                    return (
                        <div style={style}>
                            {this.errorHandler.getComponent()}
                            <WaitControl show={this.viewModel.showPageWaitControl} opacity50={this.viewModel.waitOpacity50} />

                            <div style={blurStyle}>
                                {this.getMenuPage()}
                            </div>

                        </div>
                    );
                }
            }));

export default Page;