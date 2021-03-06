import { GET_USERS, GET_USERS_SUCCESS, GET_USERS_ERROR } from './constants';

export function getUsers({ searchText, loadMore, sorting, fetcher }) {
  return {
    type: GET_USERS,
    searchText,
    sorting,
    loadMore,
    fetcher,
  };
}

export function getUsersSuccess(users, loadMore) {
  return {
    type: GET_USERS_SUCCESS,
    users,
    loadMore,
  };
}

export function getUsersErr(getUsersError) {
  return {
    type: GET_USERS_ERROR,
    getUsersError,
  };
}
