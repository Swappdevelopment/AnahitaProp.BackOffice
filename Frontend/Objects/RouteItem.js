
export default class RouteItem {

    constructor(path) {

        this.pageName = null;
        this.mainParams = [];
        this.subParams = null;

        let splitted = path.split('?');
        let urlParams = null;

        if (splitted.length > 0) {

            path = splitted[0];
        }
        if (splitted.length > 1) {

            urlParams = splitted[1];
        }

        if (path) {

            splitted = path.split('/');

            for (let value of splitted) {

                if (this.pageName) {

                    if (value) {
                        this.mainParams.push(value);
                    }
                }
                else if (value) {

                    this.pageName = value.toLowerCase();
                }
            }
        }
        
        this.path = path;
        
        if (urlParams) {

            splitted = urlParams.split('&');

            urlParams = {};

            for (let value of splitted) {

                if (value) {

                    let subsplit = value.split('=');

                    if (subsplit.length === 2) {

                        urlParams[subsplit[0]] = subsplit[1];
                    }
                }
            }

            this.subParams = urlParams;
        }
    }
}