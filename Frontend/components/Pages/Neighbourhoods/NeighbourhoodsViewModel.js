import { types, destroy, isAlive } from 'mobx-state-tree';

import Helper from '../../../Helper/Helper';

import NeighbourhoodModel from '../../../Models/NeighbourhoodModel';


const NeighbourhoodsViewModel = types.model(
    'NeighbourhoodsViewModel',
    {
        selectedValue: types.maybe(types.reference(NeighbourhoodModel), null),
        neighbourhoods: types.optional(types.array(NeighbourhoodModel), [])
    })
    .actions(self => ({

        execAction: func => { if (func) func(self); },

        save: (records, onStartCallback, successCallback, onDoneCallback) => {

            if (records) {

                records = Array.isArray(records) ? records : [records];
            }
            else {

                records = self.neighbourhoods;
            }

            records = records.filter(r => r.requiresSaving() && r.isValid());


            const savePromises = {
                options:
                records.map((toSave, index) => {

                    toSave.execAction(() => toSave.isSaving = true);

                    if (onStartCallback) {
                        onStartCallback();
                    }

                    const param = toSave.getValue();

                    return {
                        promise: Helper.CreatePostPromise('/neighbourhood/save', param),
                        success: data => {

                            if (data) {

                                if (toSave.recordState === 30) {

                                    destroy(toSave);
                                }
                                else if (!data.ok) {

                                    if (toSave.recordState === 10) {

                                        const index = self.neighbourhoods.indexOf(toSave);

                                        if (index >= 0) {

                                            const temp = NeighbourhoodModel.init(data, ++self.idGenerator);
                                            temp.execAction(() => temp.isSaving = true);

                                            self.execAction(() => {
                                                self.neighbourhoods.splice(index, 0, temp);
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


NeighbourhoodsViewModel.init = activeLang => {

    const self = NeighbourhoodsViewModel.create();

    self.idGenerator = 0;
    self.activeLang = activeLang;


    return self;
}


export default NeighbourhoodsViewModel;