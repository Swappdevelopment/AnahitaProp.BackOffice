import { types, destroy, isAlive } from 'mobx-state-tree';

import Helper from '../../../Helper/Helper';

import ProdFamilyModel from '../../../Models/ProdFamilyModel';


const ProductFamiliesViewModel = types.model(
    'ProductFamiliesViewModel',
    {
        families: types.optional(types.array(ProdFamilyModel), []),
        selectedValue: types.maybe(types.reference(ProdFamilyModel), null),
        types: types.optional(types.array(types.frozen), [])
    })
    .actions(self => ({

        execAction: func => { if (func) func(self); },

        save: (records, successCallback, onDoneCallback) => {

            if (records) {

                records = Array.isArray(records) ? records : [records];
            }
            else {

                records = self.types;
            }

            records = records.filter(r => r.requiresSaving() && r.isValid());


            const savePromises = {
                options:
                records.map((toSave, index) => {

                    toSave.execAction(() => toSave.isSaving = true);

                    const param = toSave.getValue();

                    return {
                        promise: Helper.CreatePostPromise('/family/Save', param),
                        success: data => {

                            if (data) {

                                if (toSave.recordState === 30) {

                                    destroy(toSave);
                                }
                                else if (!data.ok) {

                                    if (toSave.recordState === 10) {

                                        const index = self.families.indexOf(toSave);

                                        if (index >= 0) {

                                            const temp = ProdFamilyModel.init(data, ++self.idGenerator);
                                            temp.execAction(() => temp.isSaving = true);

                                            self.execAction(() => {
                                                self.families.splice(index, 0, temp);
                                                destroy(toSave);
                                            });

                                            toSave = temp;
                                        }
                                    }
                                    else {

                                        toSave.sync(data);
                                    }
                                }
                            }

                            if (successCallback) {
                                successCallback(isAlive(toSave) ? toSave.getValue() : undefined);
                            }
                        },
                        failure: error => {

                        },
                        complete: () => {

                            if (isAlive(toSave)) {
                                toSave.execAction(() => toSave.isSaving = false);
                            }

                            if (onDoneCallback) {
                                onDoneCallback();
                            }
                        }
                    };
                })
            };

            Helper.RunPromise(savePromises);
        }
    }));


ProductFamiliesViewModel.init = () => {

    const self = ProductFamiliesViewModel.create();

    self.idGenerator = 0;


    return self;
}


export default ProductFamiliesViewModel;