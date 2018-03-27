import { extendObservable } from 'mobx';

import MenuWrapper from '../Objects/MenuWrapper';
import Helper from '../Helper/Helper';


export default class AccessStore {

    //Login Status: 0 = waiting ; 1 = Authorized ; 2 = Unauthorized
    constructor(activeLang, uiStore) {

        this.uiStore = uiStore;
        this.location = null;
        this.history = null;
        this.redirectToPath = null;
        this.activeLang = activeLang;

        this.identifierBeforeForgot = null;

        this.toSignOutList = [];

        this.allMenus = [];

        this.staticMenus = [

            new MenuWrapper({
                slug: 'user-profile'
            }, uiStore),
            new MenuWrapper({
                slug: 'user-management'
            }, uiStore)
        ];

        extendObservable(this, {
            hasPageAccess: true,
            status: -1,
            userName: '',
            userEmail: '',
            userGender: 0,
            sideMenus: [],
            topMenus: [],
            userMenus: []
        });

        Helper.setNoAccess = () => {

            this.hasPageAccess = false;

            if (uiStore && uiStore.openPages && uiStore.openPages.length > 0) {

                uiStore.openPages.length = 0;
            }
        };
    }

    setUserName(value) {

        this.userName = value;
    }

    setUserEmail(value) {

        this.userEmail = value;
    }

    setUserGender(value) {

        this.userGender = value;
    }

    signOut(noRedirect) {

        let idCounter = -1;

        Helper.RunPromise(
            {
                promise: Helper.CreatePostPromise('/account/signout/', { signOut: true }),
                success: data => {
                },
                incrementSession: () => {

                    this.signOutPromiseID = this.signOutPromiseID ? (this.signOutPromiseID + 1) : 1;
                    idCounter = this.signOutPromiseID;
                },
                sessionValid: () => {

                    return idCounter === this.signOutPromiseID;
                }
            },
            error => {
            }
        );

        this.status = 2;

        this.sideMenus.length = 0;
        this.topMenus.length = 0;
        this.userMenus.length = 0;
        this.allMenus.length = 0;

        for (let toSignOut of this.toSignOutList) {

            if (toSignOut) {

                toSignOut();
            }
        }

        if (!noRedirect) {

            this.redirectToLogin();
        }
    }

    addOnSignOutHandler(handler) {

        if (handler) {

            this.toSignOutList.push(handler);
        }
    }

    redirectToLogin() {

        if (this.location && this.history) {

            this.redirectToPath = this.location.pathname.toLowerCase();

            const isPathLogin = this.redirectToPath.startsWith('/login');
            this.redirectToPath = isPathLogin ? '/' : this.redirectToPath;

            if (!isPathLogin) {

                this.history.replace('/login');
            }
        }
    }

    redirectToHome() {

        if (this.location && this.history) {

            this.history.replace('/');
        }
    }

    isPathOntoLogin() {

        return this.location && this.location.pathname && this.location.pathname.toLowerCase().startsWith('/login');
    }

    setMenuActive(menuWrapper) {

        if (this.sideMenus) {

            var mnus = this.sideMenus.slice();

            mnus.push(...this.topMenus.slice());
            mnus.push(...this.userMenus.slice());
            mnus.push(...this.staticMenus.slice());

            if (menuWrapper && mnus.indexOf(menuWrapper) >= 0) {

                for (var i = 0; i < mnus.length; i++) {

                    mnus[i].isActive = (mnus[i] === menuWrapper);
                }
            }
        }
    }

    getMenus() {

        this.sideMenus.length = 0;
        this.topMenus.length = 0;
        this.userMenus.length = 0;
        this.allMenus.length = 0;

        let idCounter = -1;

        Helper.RunPromise(
            {
                promise: fetch('/menu/getaccexs', { credentials: 'same-origin' }),
                success: data => {

                    this.status = 1;

                    if (data) {

                        this.setUserName(data.fullName);
                        this.setUserEmail(data.email);
                        this.setUserGender(data.gender);

                        if (data.result && data.result.length > 0) {

                            let setParent = parent => {

                                if (parent && parent.children && parent.children.length > 0) {

                                    for (let child of parent.children) {

                                        child.parent = parent;
                                        setParent(child);
                                    }
                                }
                            }

                            let result = data.result.filter((v, i) => v.type === 10).map(value => {

                                setParent(value);
                                return new MenuWrapper(value, this.uiStore)
                            });

                            this.sideMenus.push(...result);
                            this.allMenus.push(...result);


                            result = data.result.filter((v, i) => v.type === 20).map(value => {

                                setParent(value);
                                return new MenuWrapper(value, this.uiStore)
                            });

                            this.topMenus.push(...result);
                            this.allMenus.push(...result);


                            result = data.result.filter((v, i) => v.type === 50).map(value => {

                                setParent(value);
                                return new MenuWrapper(value, this.uiStore)
                            });

                            this.userMenus.push(...result);
                            this.allMenus.push(...result);
                        }
                    }
                },
                incrementSession: () => {

                    this.getMenusPromiseID = this.getMenusPromiseID ? (this.getMenusPromiseID + 1) : 1;
                    idCounter = this.getMenusPromiseID;
                },
                sessionValid: () => {

                    return idCounter === this.getMenusPromiseID;
                }
            },
            error => {

                if (error.statusCode === 206) {

                    this.status = 3;
                }
                else if (error.statusCode !== 200) {

                    this.redirectToLogin();
                    this.status = 2;
                }
            }
        );
    }
}