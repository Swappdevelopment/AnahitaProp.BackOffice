import { extendObservable } from 'mobx';

import Helper from '../Helper/Helper';

export default class LangStore {

    constructor() {

        this.allLanguages = {};

        extendObservable(this, {
            active: { code: '', labels: {}, msgs: {}, others: {} }
        });


        this.getLanguages();
    }

    getLanguages() {

        let idCounter = -1;

        Helper.RunPromise(
            {
                promise: Helper.CreateGetPromise(
                    '/language/getlangscontent/',
                    {
                        lgv: Helper.getLangVersion(),
                        chv: Helper.getCacheVersion(),
                    }),
                success: data => {

                    if (data && data.active) {

                        for (let p of Object.entries(data)) {

                            if (p && p.length === 2 && p[0] !== 'active') {

                                this.allLanguages[p[0]] = p[1];

                                p[1].code = p[0].toLowerCase();

                                if (p[1].code === data.active) {

                                    this.active.code = p[1].code;
                                    this.active.labels = p[1].labels;
                                    this.active.msgs = p[1].msgs;
                                    this.active.others = p[1].others;
                                }
                            }
                        }
                    }
                },
                incrementSession: () => {

                    this.getLanguagesPromiseID = this.getLanguagesPromiseID ? (this.getLanguagesPromiseID + 1) : 1;
                    idCounter = this.getLanguagesPromiseID;
                },
                sessionValid: () => {

                    return idCounter === this.getLanguagesPromiseID;
                }
            },
            error => {

            }
        );
    }

    setLanguage(newLangCode) {

        if (newLangCode) {

            newLangCode = newLangCode.toLowerCase();

            if (this.allLanguages[newLangCode]) {

                this.active.code = this.allLanguages[newLangCode].code;
                this.active.labels = this.allLanguages[newLangCode].labels;
                this.active.msgs = this.allLanguages[newLangCode].msgs;
                this.active.others = this.allLanguages[newLangCode].others;


                let idCounter = -1;

                Helper.RunPromise(
                    {
                        promise: fetch("/language/changelanguage", {
                            method: "POST",
                            body: JSON.stringify({ langCode: newLangCode }),
                            headers: {
                                'content-type': 'application/json; charset=utf-8'
                            },
                            credentials: 'same-origin'
                        }),
                        success: data => {

                        },
                        incrementSession: () => {

                            this.setLanguagePromiseID = this.setLanguagePromiseID ? (this.setLanguagePromiseID + 1) : 1;
                            idCounter = this.setLanguagePromiseID;
                        },
                        sessionValid: () => {

                            return idCounter === this.setLanguagePromiseID;
                        }
                    },
                    error => {

                    });
            }
        }
    }
}