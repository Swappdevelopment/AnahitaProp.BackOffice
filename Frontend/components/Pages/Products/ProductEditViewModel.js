import { types, detach } from 'mobx-state-tree';

import ProductModel from '../../../Models/ProductModel';


const ProductEditViewModel = types.model(
    'ProductEditViewModel',
    {
        isStep1ReadOnly: true,
        isStep2ReadOnly: true,
        isStep3ReadOnly: true,
        isStep4ReadOnly: true,
        isStep5ReadOnly: true,
    }
).actions(self => ({

    execAction: cb => {

        if (cb) {
            cb(self);
        }
    }
})).views(self => ({

    isEditable: () => self.isStep1ReadOnly && self.isStep2ReadOnly && self.isStep3ReadOnly && self.isStep4ReadOnly && self.isStep5ReadOnly
}));


ProductEditViewModel.init = () => {

    const self = ProductEditViewModel.create();


    return self;
}


export default ProductEditViewModel;