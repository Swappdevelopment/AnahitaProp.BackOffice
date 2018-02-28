
import { types, destroy } from 'mobx-state-tree';

import BaseModel from '../../../Models/BaseModel';

import UserModel from '../../../Models/UserModel';
import RoleModel from '../../../Models/RoleModel';


const UserManagementViewModel = types.model(
    'UserManagementViewModel',
    {
        isModalShown: false,
        gettingRoles: false,
        targetRoleUser: types.maybe(types.reference(UserModel), types.null),
        searchText: types.optional(types.string, ''),
        toBeAdded: types.maybe(UserModel, types.null),
        users: types.optional(types.array(UserModel), []),
        roles: types.optional(types.array(RoleModel), []),
        statusType: types.optional(types.number, 1)
    }).actions(
    self => ({
        execAction: func => {

            if (func) {
                func(self);
            }
        },
        setPropsValue: value => {

            BaseModel.setPropsValue(self, value);
        },
        pushUser: (...user) => {

            if (user) {

                self.users.push(...user);
            }
        },
        pushRole: (...role) => {

            if (role) {

                self.roles.push(...role);
            }
        },
        addNewUser: value => {

            if (value) {

                self.users.splice(0, 0, value);
            }

            return value;
        },
        removeUser: user => {

            if (user) {

                destroy(user);
            }
        },
        getNewUser: () => {

            const user = UserModel.init({ id: -1 }, ++self.idGenerator);
            user.setRecordState(10);

            return user;
        },
        syncUser: value => {

            return UserModel.init(value, ++self.idGenerator);
        }
    }));


UserManagementViewModel.init = () => {

    const self = UserManagementViewModel.create({});

    self.idGenerator = 0;


    return self;
};


export default UserManagementViewModel;