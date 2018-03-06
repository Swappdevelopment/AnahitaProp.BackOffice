import { types, clone } from 'mobx-state-tree';

import BaseModel from './BaseModel';


const getObject = () => {

    return Object.assign(
        {
            uid: types.optional(types.string, ''),
            name: types.optional(types.string, ''),
            format: types.optional(types.string, ''),
            isImage: types.optional(types.boolean, false),
            isUploaded: types.optional(types.boolean, false),
            optzUrl: types.optional(types.string, '')
        },
        BaseModel.getBaseObject());
};


const FileModel = types.model(
    'FileModel',
    Object.assign(
        {
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
        sync: value => {

            self.originalValue = value;

            BaseModel.setPropsValue(self, value);
        }
    }));


FileModel.getObject = getObject;

FileModel.init = (value, genId) => {

    const self = FileModel.create({
        id: value && value.id >= 0 ? value.id : 0
    });

    self.genId = genId;

    self.sync(value);

    self.initDone = true;


    self.getValue = () => {

        return Object.assign(
            BaseModel.getValueFromSelf(self),
            {
                uid: self.uid,
                name: self.name,
                format: self.format,
                isImage: self.isImage,
                isUploaded: self.isUploaded,
                optzUrl: self.optzUrl
            });
    };

    return self;
};

export default FileModel;