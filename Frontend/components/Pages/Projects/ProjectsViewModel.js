import { types, destroy, isAlive } from 'mobx-state-tree';

import Helper from '../../../Helper/Helper';

import ProjectModel from '../../../Models/ProjectModel';


const ProjectsViewModel = types.model(
    'ProjectsViewModel',
    {
        selectedValue: types.maybe(types.reference(ProjectModel), null),
        projects: types.optional(types.array(ProjectModel), [])
    })
    .actions(self => ({

        execAction: func => { if (func) func(self); },

        save: (records, successCallback, onDoneCallback) => {

            if (records) {

                records = Array.isArray(records) ? records : [records];
            }
            else {

                records = self.projects;
            }

            records = records.filter(r => r.requiresSaving() && r.isValid());


            const savePromises = {
                options:
                records.map((toSave, index) => {

                    toSave.execAction(() => toSave.isSaving = true);

                    const param = toSave.getValue();

                    return {
                        promise: Helper.CreatePostPromise('/project/save', param),
                        success: data => {

                            if (data) {

                                if (toSave.recordState === 30) {

                                    destroy(toSave);
                                }
                                else if (!data.ok) {

                                    if (toSave.recordState === 10) {

                                        const index = self.projects.indexOf(toSave);

                                        if (index >= 0) {

                                            const temp = ProjectModel.init(data, ++self.idGenerator);
                                            temp.execAction(() => temp.isSaving = true);

                                            self.execAction(() => {
                                                self.projects.splice(index, 0, temp);
                                                self.selectedValue = temp.id;
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


ProjectsViewModel.init = activeLang => {

    const self = ProjectsViewModel.create();

    self.idGenerator = 0;
    self.activeLang = activeLang;


    return self;
}


export default ProjectsViewModel;