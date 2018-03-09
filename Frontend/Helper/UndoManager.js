
const _onUndoingList = [];
const _onUndidList = [];

const onUndoing = (undoItem, arg) => {
    for (const cb of _onUndoingList) {
        if (cb) {
            cb(undoItem, arg);
        }
    }
};

const onUndid = undoItem => {
    for (const cb of _onUndidList) {
        if (cb) {
            cb(undoItem);
        }
    }
};

export default class UndoManager {

    constructor() {

        this.undoStack = [];

        this.isUndoing = false;
    }

    bindUndoing = callback => {
        if (callback) {
            _onUndoingList.push(callback);
        }
    }

    unbindUndoing = callback => {

        if (callback) {

            const index = _onUndoingList.indexOf(callback);

            _onUndoingList.splice(index, 1);
        }
    }

    bindUndid = callback => {
        if (callback) {
            _onUndidList.push(callback);
        }
    }

    unbindUndid = callback => {

        if (callback) {

            const index = _onUndidList.indexOf(callback);

            _onUndidList.splice(index, 1);
        }
    }

    pushToStack = undoItem => {

        if (undoItem) {
            this.undoStack.push(undoItem);
        }
    }


    genUndoItem = (key, value, model) => ({ key, value, model })


    undo = () => {

        if (!this.isUndoing
            && this.undoStack && this.undoStack.length) {

            this.isUndoing = true;

            const lastIndex = this.undoStack.length - 1;

            let undoItem = this.undoStack[lastIndex];

            const arg = { cancel: false };

            onUndoing(undoItem, arg);

            if (!arg.cancel) {

                if (!Array.isArray(undoItem)) {

                    undoItem = [undoItem];
                }

                for (const uItem of undoItem) {

                    if (uItem && uItem.key && uItem.model && uItem.model.execAction) {

                        if (Array.isArray(uItem.model[uItem.key])
                            || (uItem.model[uItem.key] && uItem.model[uItem.key].constructor.name === 'ObservableArray')) {

                            if (uItem.action) {

                                switch (uItem.action) {

                                    case 'remove':

                                        if (uItem.propKey) {

                                            let index = -1;

                                            uItem.model[uItem.key].find((v, i) => {

                                                if (v && v[uItem.propKey] === uItem.value) {

                                                    index = i;
                                                    return true;
                                                }

                                                return false;
                                            });

                                            if (index >= 0) {

                                                uItem.model.execAction(self => self[uItem.key].splice(index, 1));
                                            }
                                        }
                                        else {

                                            const index = uItem.model[uItem.key].indexOf(uItem.value);

                                            uItem.model.execAction(self => self[uItem.key].splice(index, 1));
                                        }
                                        break;
                                }
                            }
                        }
                        else {

                            uItem.model.execAction(self => self[uItem.key] = uItem.value);
                        }
                    }
                }

                undoItem = this.undoStack[lastIndex];
                this.undoStack.splice(lastIndex, 1);

                onUndid(undoItem);
            }

            this.isUndoing = false;
        }
    }

    clearStack = key => {

        if (key) {

            const indexes = [];

            const temp = this.undoStack.filter(uItem => {

                if (uItem) {

                    if (Array.isArray(uItem)) {

                        return uItem.find(suItem => suItem.key === key) ? true : false;
                    }

                    return uItem.key === key;
                }

                return false;
            });


            let index = -1;

            for (const item of temp) {

                index = this.undoStack.indexOf(item);
                this.undoStack.splice(index, 1);
            }
        }
        else {

            this.undoStack.length = 0;
        }
    }


    revert = () => {

        if (this.undoStack && this.undo) {

            while (this.undoStack.length > 0) {

                this.undo();
            }
        }
    }
}