import * as ActionTypes from '../action-types';
import * as UserHelper from '../../helpers/user/user-helper';

export const fetchUsers = (apiProps) => ({
  type: ActionTypes.FETCH_USERS,
  payload: UserHelper.fetchUsers(apiProps),
});

export const updateUsersFilters = (filters) => ({
  type: ActionTypes.UPDATE_USERS_FILTERS,
  payload: filters,
});
