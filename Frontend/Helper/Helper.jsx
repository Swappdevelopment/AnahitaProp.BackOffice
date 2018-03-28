import React from 'react';
import ReactDOM from 'react-dom';
import moment from 'moment-es6';
import { Tooltip } from 'react-bootstrap';

let _setNoAccess = null;

export default class Helper {

    static get DATE_FORMAT() {
        return 'DD/MM/YYYY';
    }

    static get EMAIL_REGEX() {
        return /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    }

    static get LAZY_LOAD_LIMIT() {
        return 20;
    }

    static get setNoAccess() {
        return _setNoAccess;
    }
    static set setNoAccess(value) {
        _setNoAccess = value;
    }


    static RunPromise(option, failure, complete) {

        if (option) {

            let incrementSession = null;
            let sessionValid = null;

            if (!Array.isArray(option)) {

                if (option.options) {

                    incrementSession = option.incrementSession;
                    sessionValid = option.sessionValid;

                    option = Array.isArray(option.options) ? option.options : [option.options];
                }
                else {

                    option = [option];
                }
            }

            if (option.length > 0) {

                incrementSession = incrementSession ? incrementSession : option[0].incrementSession;
                sessionValid = sessionValid ? sessionValid : option[0].sessionValid;
    
                if (incrementSession) {
                    incrementSession();
                }
    
                const verifyAccess = error => {
    
                    if (error && error.statusCode === 403 && Helper.setNoAccess) {
    
                        Helper.setNoAccess();
    
                        return false;
                    }
    
                    return true;
                };


                Promise.all(option.map((v, i) => v.promise))
                    .then(responses => {

                        if (!Array.isArray(responses)) {

                            responses = [responses];
                        }

                        if (!sessionValid || sessionValid()) {

                            for (let index = 0; index < responses.length; index++) {

                                const resp = responses[index];

                                // if (resp.url && resp.url.indexOf('getProductsFlags') >= 0) {

                                //     resp.text().then(data => {

                                //     });
                                // }

                                resp.json().then(data => {

                                    if (data.type === 'error') {

                                        if (verifyAccess(data)) {

                                            if (option[index].failure) {

                                                option[index].failure(data);
                                            }
                                            else if (failure) {

                                                failure(data);
                                            }
                                        }
                                    }
                                    else {

                                        if (option[index].success) {

                                            option[index].success(data);
                                        }
                                    }

                                    if (option[index].complete) {

                                        option[index].complete();
                                    }
                                    else if (complete) {

                                        complete(data);
                                    }
                                })
                                // .catch(error => {

                                // });

                                // }
                                // else {

                                //     const error = {
                                //         type: 'error',
                                //         statusCode: resp.status
                                //     };

                                //     if (verifyAccess(error)) {

                                //         if (option[index].failure) {

                                //             option[index].failure(error);
                                //         }
                                //         else if (failure) {

                                //             failure(error);
                                //         }

                                //         if (option[index].complete) {

                                //             option[index].complete();
                                //         }
                                //         else if (complete) {

                                //             complete(data);
                                //         }
                                //     }
                                // }
                            }
                        }
                    })
                    .catch(error => {

                        if (verifyAccess(error)) {

                            if (!sessionValid || sessionValid()) {

                                if (failure) {

                                    failure(error);
                                }
                                else if (option) {

                                    for (const optn of option) {

                                        if (optn.failure) {

                                            optn.failure(error);
                                        }
                                    }
                                }

                                if (complete) {

                                    complete(error);
                                }
                                else if (option) {

                                    for (const optn of option) {

                                        if (optn.complete) {

                                            optn.complete(error);
                                        }
                                    }
                                }
                            }
                        }
                    });
            }
        }
    }

    static CreateGetPromise(url, params) {

        if (params) {

            let p = '';
            for (let prop of Object.entries(params)) {
                if (prop && Array.isArray(prop) && prop.length > 1) {
                    p += (p ? '&' : '?') + `${prop[0]}=${prop[1]}`;
                }
            }
            url += p;
        }

        return fetch(url, { credentials: 'same-origin' });
    }

    static CreatePostPromise(url, param) {

        return fetch(url,
            {
                method: 'POST',
                body: JSON.stringify(param),
                headers: {
                    'content-type': 'application/json; charset=utf-8'
                },
                credentials: 'same-origin'
            });
    }


    static validateEmail(value, checkIfEmpty) {

        if (checkIfEmpty) {

            return value && Helper.EMAIL_REGEX.test(value);
        }
        else if (!value) {

            return true;
        }

        return Helper.EMAIL_REGEX.test(value);
    }


    static stringToParagraphs(value) {

        if (value) {

            value = value.replace(/\r\n/g, '<~>').replace(/\r/g, '<~>').replace(/\n/g, '<~>').replace(/<~><~>/g, '<~>');

            return value.split('<~>').map((v, i) => <p key={i}>{v}</p>);
        }

        return <p></p>
    }


    static getTooltip(id, value) {

        let className = '';

        if (id) {

            if (id.indexOf('-') >= 0) {

                className = id.split('-');

                if (className && className.length > 0) {

                    className = className.filter((v, i) => i < (className.length - 1)).join('-');

                } else {
                    className = '';
                }
            }
            else {
                className = id;
            }
        }

        return <Tooltip id={id} className={className}>{value}</Tooltip>;
    }

    static focusOnLoad(element) {

        if (element) {

            element = ReactDOM.findDOMNode(element);

            if (element) {

                element.focus();
                element.select();
            }
        }
    }

    static reactElementToDOM(element) {

        if (element) {

            element = ReactDOM.findDOMNode(element);
        }

        return element;
    }


    static getGenders() {

        return GlobalValues.enumValues.genders;
    }

    static getLangVersion() {

        return Helper.getVersion('langVersion');
    }

    static getCacheVersion() {

        return Helper.getVersion('cacheVersion');
    }

    static getDbVersion() {

        return Helper.getVersion('dbVersion');
    }

    static getCountriesVersion() {

        return Helper.getVersion('countriesVersion');
    }

    static getVersion(key) {

        const temp = GlobalValues.versions[key];

        return temp ? temp : '0';
    }

    static setVersion(key, value) {

        GlobalValues.versions[key] = value;
    }

    static compareDate(date1, date2, compareTime) {

        if (typeof date1 === 'undefined' && typeof date2 === 'undefined') return true;


        if (typeof date1 === 'undefined'
            || typeof date2 === 'undefined') return false;


        if (date1 === null && date2 === null) return true;


        if (date1 === null || date2 === null) return true;


        if (date1 instanceof moment) {

            date1 = date1.toDate();
        }
        else {

            date1 = moment(date1).toDate();
        }

        if (date2 instanceof moment) {

            date2 = date2.toDate();
        }
        else {

            date2 = moment(date2).toDate();
        }

        if (!(date1 instanceof Date)
            || !(date2 instanceof Date)) return false;


        if (typeof compareTime === 'undefined') {

            compareTime = true;
        }


        return date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth() && date1.getDay() === date2.getDay()
            && (!compareTime || (date1.getHours() === date2.getHours() && date1.getMinutes() === date2.getMinutes()))
    }

    static minsToDDHHMMSS(value, hideSeconds) {

        if (value) {

            // get total seconds between the times
            const delta = typeof value === 'string' ? parseInt(value) : value;


            return Helper.secsToDDHHMMSS(delta * 60, hideSeconds);
        }

        return '0';
    }

    static secsToDDHHMMSS(value, hideSeconds) {

        const temp = Helper.getValuesFromSecs(value);

        if (temp) {

            return (temp.days > 0 ? `${temp.days > 9 ? temp.days : ('0' + temp.days)}` : '') +
                `${temp.hours > 9 ? temp.hours : ('0' + temp.hours)}:${temp.minutes > 9 ? temp.minutes : ('0' + temp.minutes)}` +
                (hideSeconds ? '' : `:${temp.seconds > 9 ? temp.seconds : ('0' + temp.seconds)}`);
        }

        return '0';
    }


    static getValuesFromMins(value) {

        if (value) {

            // get total seconds between the times
            const delta = typeof value === 'string' ? parseInt(value) : value;


            return Helper.getValuesFromSecs(delta * 60);
        }

        return '0';
    }

    static getValuesFromSecs(value) {

        if (value) {

            // get total seconds between the times
            let delta = typeof value === 'string' ? parseInt(value) : value;

            // calculate (and subtract) whole days
            const days = Math.floor(delta / 86400);
            delta -= days * 86400;

            // calculate (and subtract) whole hours
            const hours = Math.floor(delta / 3600) % 24;
            delta -= hours * 3600;

            // calculate (and subtract) whole minutes
            const minutes = Math.floor(delta / 60) % 60;
            delta -= minutes * 60;


            return { days: days, hours: hours, minutes: minutes, seconds: delta };
        }

        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
}