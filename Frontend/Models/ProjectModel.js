import { types, clone } from 'mobx-state-tree';

import BaseModel from './BaseModel';
import ItemNameModel from './ItemNameModel';


const getObject = () => {

    return Object.assign(
        {
            uid: types.optional(types.string, ''),
            slug: types.optional(types.string, ''),
            type: types.optional(types.number, 0),
            names: types.optional(types.array(ItemNameModel), []),
        },
        BaseModel.getBaseObject());
};


const ProjectModel = types.model(
    'ProjectModel',
    Object.assign(
        {
            isSaving: false,
            activeLangCode: types.optional(types.string, ''),
            originalValue: types.optional(types.frozen, null),
        },
        getObject())
).actions(
    self => ({
        execAction: func => {

            if (func) {
                func(self);
            }
        },
        sync: value => {

            self.originalValue = value;

            BaseModel.setPropsValue(self, value);

            self.names.length = 0;

            if (value.names && value.names.length > 0) {

                self.names.push(...value.names.map((v, i) => {

                    return ItemNameModel.init({
                        id: v.id,
                        status: v.status,
                        value: v.value,
                        language_Id: v.language_Id,
                        language_Code: v.language_Code ? v.language_Code.toLowerCase() : '',
                    });
                }));
            }
        }
    })).views(self => ({
        isModified: () => excludeSubs => {

            const modified = BaseModel.isSelfModified(self, self.originalValue, true);

            if (!modified && !excludeSubs) {

                return self.names.filter((v, i) => v.isModified()).length > 0;
            }

            return modified;
        },
        getName: () => {

            if (self.names && self.names.length > 0) {

                if (self.activeLangCode) {

                    const nameItem = self.names.find(v => v.language_Code == self.activeLangCode);

                    if (nameItem) {

                        return nameItem.value;
                    }
                }

                return self.names[0].value;
            }

            return '';
        }
    }));


ProjectModel.getObject = getObject;

ProjectModel.init = (value, genId, activeLangCode) => {

    const self = ProjectModel.create({
        id: value && value.id >= 0 ? value.id : 0
    });

    self.genId = genId;
    self.execAction(() => self.activeLangCode = activeLangCode);

    self.sync(value);

    self.initDone = true;


    self.getValue = () => {

        return Object.assign(
            BaseModel.getValueFromSelf(self),
            {
                uid: self.uid,
                slug: self.slug,
                type: self.type,
                names: self.names.map((v, i) => v.getValue())
            });
    };

    return self;
};

export default ProjectModel;