import { types } from 'mobx-state-tree';

import EntityFileModel from './EntityFileModel';


const EntityFileModelWrapper = types.model(
    'EntityFileModelWrapper',
    {
        id: types.identifier(types.number),
        model: types.maybe(EntityFileModel, types.null)
    }).actions(
    self => ({
        setModelRaw: rawModel => {

            if (rawModel) {

                const model = EntityFileModel.init(rawModel, self.id);
                self.setModel(model);
            }
        },
        setModel: model => {

            self.model = model;

            if (model) {

                model.wrapper = self;
                //model.execAction(() => model.wrapper = self.id);
            }
        }
    }));


EntityFileModelWrapper.init = (id, model) => {

    const self = EntityFileModelWrapper.create({ id });

    if (model) {

        self.setModel(model);
    }

    self.getValue = () => self.model ? self.model.getValue() : null;

    return self;
}

export default EntityFileModelWrapper;