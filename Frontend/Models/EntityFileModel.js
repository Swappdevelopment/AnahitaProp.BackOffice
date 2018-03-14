import { types } from 'mobx-state-tree';

import BaseModel from './BaseModel';
import FileModel from './FileModel';


const getObject = () => {

    return Object.assign(
        {
            isListImage: types.optional(types.boolean, false),
            isFeaturedImage: types.optional(types.boolean, false),
            appearDetail: types.optional(types.boolean, false),
            detailRank: types.optional(types.number, -1),
            version: types.optional(types.number, 0),
            file_Id: types.optional(types.number, 0),
            file: types.maybe(FileModel, types.null),
            originalValue: types.optional(types.frozen, null)
        },
        BaseModel.getBaseObject());
};


const EntityFileModel = types.model(
    'EntityFileModel',
    Object.assign(
        {
            isChangingStatus: false,
            isChangingAppearDetail: false,
            isChangingIsListImage: false,
            isSaving: false
        },
        getObject())
).actions(
    self => ({
        execAction: func => {

            if (func) {
                func(self);
            }
        },
        setPropsValue: value => {

            BaseModel.setPropsValue(self, value);
        },
        setOriginalValueProperty: value => {

            if (value) {

                self.originalValue = Object.assign({}, self.originalValue, value);
            }
        },
        sync: value => {

            self.originalValue = value;

            BaseModel.setPropsValue(self, value, ['file']);

            if (value.file) {

                self.file = FileModel.init(value.file, self.genId);
            }
            else {

                self.file = null;
            }
        }
    }))
    .views(self => ({

        isModified: () => {

            const modified = BaseModel.isSelfModified(self, self.originalValue);

            return modified;
        }
    }));


EntityFileModel.getObject = getObject;

EntityFileModel.init = (value, genId) => {

    const self = EntityFileModel.create({
        id: value && value.id >= 0 ? value.id : 0
    });

    self.genId = genId;

    self.sync(value);

    self.initDone = true;


    self.getValue = () => {

        return Object.assign(
            BaseModel.getValueFromSelf(self),
            {
                isListImage: self.isListImage,
                isFeaturedImage: self.isFeaturedImage,
                appearDetail: self.appearDetail,
                detailRank: self.detailRank,
                product_Id: self.product_Id,
                file_Id: self.file_Id,
                file: self.file ? self.file.getValue() : null
            });
    };

    return self;
};

export default EntityFileModel;