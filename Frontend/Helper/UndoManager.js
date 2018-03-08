
export default class UndoManager {

    constructor() {

        this.undoStack = [];

        this.isUndoing = false;
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

            if (!Array.isArray(undoItem)) {

                undoItem = [undoItem];
            }

            for (const uItem of undoItem) {

                if (uItem && uItem.key && uItem.model && uItem.model.execAction) {

                    uItem.model.execAction(self => self[uItem.key] = uItem.value);
                }
            }

            this.undoStack.splice(lastIndex, 1);

            this.isUndoing = false;
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