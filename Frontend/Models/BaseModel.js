import { types } from 'mobx-state-tree';
import moment from 'moment-es6';

import Helper from '../Helper/Helper';


export default class BaseModel {

    static getBaseObject() {

        return {
            id: types.identifier(types.number),
            recordState: types.optional(types.number, 0),
            status: types.optional(types.number, 1)
        };
    }

    static setPropValue(self, value, listenForChange) {

        if (self && value) {

            let prevValue = null;

            for (let [key, value] of Object.entries(value)) {

                if (key !== 'id' && self.hasOwnProperty(key) && !Array.isArray(value)) {

                    prevValue = self[key];

                    if (!value) {

                        switch (prevValue.constructor.name) {

                            case 'String':
                                value = '';
                                break;

                            case 'Number':
                                value = 0;
                                break;
                        }
                    }

                    self[key] = value;

                    if (listenForChange && !BaseModel.compareProps(prevValue, value)) {

                        switch (self.recordState) {

                            case 0:
                                self.recordState = 20; //Modified
                                break;
                        }
                    }
                }
            }
        }
    }

    static compareProps(prop1, prop2) {

        if (prop1 instanceof Date) {
            prop1 = moment(prop1);
        }
        if (prop2 instanceof Date) {
            prop2 = moment(prop2);
        }

        if (prop1 instanceof moment && prop2 instanceof moment) {

            return Helper.compareDate(prop1, prop2);
        }

        return (prop1 === prop2);
    }

    static clearValues(self) {

        if (self) {

            self.originalValue = null;

            self.id = 0;
            self.status = 0;
            self.recordState = 0;
        }
    }

    static getValueFromSelf(self) {

        if (self) {

            return {
                recordState: self.recordState,
                id: self.id,
                status: self.status
            };
        }

        return {};
    }
}