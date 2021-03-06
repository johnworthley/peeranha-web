import { all, call, put, takeLatest } from 'redux-saga/effects';
import { getUserProfileSuccess } from 'containers/DataCacheProvider/actions';

import { GET_USERS } from './constants';
import { getUsersSuccess, getUsersErr } from './actions';

export function* getUsersWorker({ loadMore, fetcher }) {
  try {
    const { items } = yield call(() => fetcher.getNextItems());

    yield all(items.map(profile => put(getUserProfileSuccess(profile))));

    yield put(getUsersSuccess(items, loadMore));
  } catch (err) {
    yield put(getUsersErr(err.message));
  }
}

export default function*() {
  yield takeLatest(GET_USERS, getUsersWorker);
}
