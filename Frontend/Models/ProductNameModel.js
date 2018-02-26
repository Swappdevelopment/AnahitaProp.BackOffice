import { types } from 'mobx-state-tree';

import BaseModel from './BaseModel';



const ProductNameModel = types.model(
    'ProductNameModel',
    {
        recordState: types.optional(types.number, 0),
        value: types.optional(types.string, ''),
    }
).actions(
    self => ({
        setPropValue: value => {

            BaseModel.setPropValue(self, value);
        },
        setValue: value => {

            const nrs = value === self.value ? self.recordState : 20;

            self.value = value;

            switch (self.recordState) {

                case 0:
                    self.recordState = nrs;
                    break;
            }
        }
    }));

ProductNameModel.init = value => {

    const self = ProductNameModel.create({ recordState: 0 });

    self.setPropValue(value);

    self.id = value.id;
    self.status = value.status;
    self.language_Id = value.language_Id;
    self.language_Code = value.language_Code;


    self.getValue = () => {

        return Object.assign(
            BaseModel.getValueFromSelf(self),
            {
                value: self.value,
                language_Id: self.language_Id,
                language_Code: self.language_Code
            });
    };


    return self;
};


export default ProductNameModel;