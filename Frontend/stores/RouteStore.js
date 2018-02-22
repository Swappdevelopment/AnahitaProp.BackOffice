import { extendObservable, intercept, observe } from 'mobx';

import RouteItem from '../Objects/RouteItem';


export default class RouteStore {

    static DefaultPage = 'dashboard';

    static PrivatePages = [
        RouteStore.DefaultPage,
        'changepassword',
        'user-profile',
        'user-management',
        'trainings',
        'contacts',
        'companies',
        'clubs',
        'catalogs'
    ];

    constructor(accessStore, uiStore) {

        this.accessStore = accessStore;
        this.uiStore = uiStore;

        extendObservable(this, {
            currentRoute: null
        });

        this.setRoute = this.setRoute.bind(this);

        intercept(accessStore, 'status', change => {

            if (accessStore.status !== change.newValue) {

                switch (change.newValue) {

                    case 0:
                        this.accessStore.getMenus();
                        break;

                    case 2:
                        this.accessStore.sideMenus.length = 0;
                        this.accessStore.topMenus.length = 0;
                        this.accessStore.userMenus.length = 0;
                        this.accessStore.allMenus.length = 0;
                        break;
                }
            }

            return change;
        });

        observe(accessStore, 'status', change => {

            if (change.newValue !== 0) {

                this.setRoute(this.currentRoute == null ? null : this.currentRoute.path);
            }
        });
    }

    goToRootPage(replace) {

        if (this.accessStore && this.accessStore.history) {

            if (replace) {

                this.accessStore.history.replace('/');
            }
            else {

                this.accessStore.history.push('/');
            }
        }
    }

    setRoute(routeValue) {

        const temp = new RouteItem(routeValue);

        if (!temp.pageName) {

            temp.pageName = RouteStore.DefaultPage;
        }

        let isOk = false;

        switch (temp.pageName) {

            case 'login':

                if (this.accessStore.status === 1 || this.accessStore.status === 3) {

                    this.accessStore.redirectToHome();
                }
                else {

                    this.uiStore.openPages.length = 0;
                    isOk = true;
                }
                break;

            case 'completeregistration':
            case 'forgotpassword':

                this.uiStore.openPages.length = 0;
                isOk = true;
                break;

            default:

                if (this.accessStore.status === 2) {

                    this.accessStore.redirectToLogin();
                }
                else {

                    let activeWrapper = this.accessStore.allMenus.find((mnu, i) => mnu && mnu.slug === temp.pageName);

                    activeWrapper = activeWrapper ? activeWrapper : this.accessStore.staticMenus.find((mnu, i) => mnu && mnu.slug === temp.pageName);

                    if (activeWrapper) {

                        let temp = this.uiStore.openPages.indexOf(activeWrapper);

                        if (temp < 0) {

                            temp = this.uiStore.openPages.find((v, i) => v.slug === activeWrapper.slug);

                            if (temp) {

                                activeWrapper = temp;
                            }
                            else {

                                this.uiStore.openPages.push(activeWrapper);
                            }
                        }

                        this.accessStore.setMenuActive(activeWrapper);
                    }
                    else {


                    }

                    isOk = true;
                }
                break;
        }

        if (isOk) {

            if (this.accessStore) {

                this.accessStore.hasPageAccess = true;
            }

            this.currentRoute = temp;
        }
    }
}