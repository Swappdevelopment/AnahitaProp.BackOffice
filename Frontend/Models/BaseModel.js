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

    static setPropsValue(self, value) {

        if (self && value) {

            for (let [key, value] of Object.entries(value)) {

                if (key !== 'id' && self.hasOwnProperty(key) && !Array.isArray(value)) {

                    if (!value) {

                        switch (self[key].constructor.name) {

                            case 'String':
                                value = '';
                                break;

                            case 'Number':
                                value = 0;
                                break;
                        }
                    }

                    self[key] = value;
                }
            }
        }
    }

    static isSelfModified(self, value, skipObjects) {

        if (self && value && self.recordState === 0) {

            for (let [key, value] of Object.entries(value)) {

                let selfValue = null;

                if (key !== 'id' && self.hasOwnProperty(key) && !Array.isArray(value)) {

                    selfValue = self[key];

                    if (!BaseModel.compareProps(self[key], value)
                        && ((skipObjects
                            && (!selfValue || selfValue.constructor.name !== 'Object')
                            && (!value || value.constructor.name !== 'Object'))
                            || !skipObjects)) {

                        return true;
                    }
                }
            }
        }

        return false;
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

        if (prop1 === prop2) {

            return true;
        }

        if (!prop1 && !prop2) {

            return true;
        }



        return false;
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
                recordState: BaseModel.isSelfModified(self, self.originalValue) ? 20 : self.recordState,
                id: self.id,
                status: self.status
            };
        }

        return {};
    }
}