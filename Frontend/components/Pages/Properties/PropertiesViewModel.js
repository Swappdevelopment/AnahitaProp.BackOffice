import { types, destroy, isAlive } from 'mobx-state-tree';

import Helper from '../../../Helper/Helper';

import PropertyModel from '../../../Models/PropertyModel';
import NeighbourhoodModel from '../../../Models/NeighbourhoodModel';


const PropertiesViewModel = types.model(
    'PropertiesViewModel',
    {
        isGettingNeighbourhoods: types.optional(types.boolean, false),
        properties: types.optional(types.array(PropertyModel), []),
        selectedValue: types.maybe(types.reference(PropertyModel), null),
        neighbourhoods: types.optional(types.array(NeighbourhoodModel), [])
    })
    .actions(self => ({

        execAction: func => { if (func) func(self); },

        save: (records, onStartCallback, successCallback, onDoneCallback) => {

            if (records) {

                records = Array.isArray(records) ? records : [records];
            }
            else {

                records = self.properties;
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
                        promise: Helper.CreatePostPromise('/property/save', param),
                        success: data => {

                            if (data) {

                                if (toSave.recordState === 30) {

                                    destroy(toSave);
                                }
                                else if (!data.ok) {

                                    if (toSave.recordState === 10) {

                                        const index = self.properties.indexOf(toSave);

                                        if (index >= 0) {

                                            const temp = PropertyModel.init(data, ++self.idGenerator);
                                            temp.execAction(() => temp.isSaving = true);

                                            self.execAction(() => {
                                                self.properties.splice(index, 0, temp);
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
        },

        alignPropertiesNbhRef: () => {

            if (self.neighbourhoods.length > 0) {

                for (const prp of self.properties) {

                    prp.execAction(() => prp.neighbourhoodRef = prp.neighbourhood_Id);
                }
            }
        },

        getNeighbourhoods: () => {

            if (self.neighbourhoods.length === 0 && !self.isGettingNeighbourhoods) {

                self.isGettingNeighbourhoods = true;

                let idCounter = -1;

                Helper.RunPromise(
                    {
                        promise: Helper.CreateGetPromise('/neighbourhood/get'),
                        success: data => {

                            if (data && data.length) {

                                self.execAction(() => {

                                    self.neighbourhoods.push(...data.map((nbh, i) => NeighbourhoodModel.init(nbh, ++self.idGenerator, self.activeLang.code)));
                                });

                                self.alignPropertiesNbhRef();
                            }
                        },
                        incrementSession: () => {

                            self.getPropertiesPromiseID = self.getPropertiesPromiseID ? (self.getPropertiesPromiseID + 1) : 1;
                            idCounter = self.getPropertiesPromiseID;
                        },
                        sessionValid: () => {

                            return idCounter === self.getPropertiesPromiseID;
                        }
                    },
                    error => {

                        if (self.showPromiseError) {
                            self.showPromiseError(error);
                        }
                    },
                    () => {

                        self.execAction(() => self.isGettingNeighbourhoods = false);
                    }
                );
            }
        },
    }));


PropertiesViewModel.init = activeLang => {

    const self = PropertiesViewModel.create();

    self.idGenerator = 0;
    self.activeLang = activeLang;


    return self;
}


export default PropertiesViewModel;