import { createSelector } from 'reselect';
import { selectUsers } from 'containers/DataCacheProvider/selectors';

import { initialState } from './reducer';

const selectAccountProviderDomain = state =>
  state.get('accountProvider', initialState).toJS();

const makeSelectLoading = () =>
  createSelector(selectAccountProviderDomain, substate => substate.loading);

const makeSelectError = () =>
  createSelector(selectAccountProviderDomain, substate => substate.error);

const makeSelectAccount = () =>
  createSelector(selectAccountProviderDomain, substate => substate.account);

const makeSelectBalance = () =>
  createSelector(selectAccountProviderDomain, substate => substate.balance);

const makeSelectProfileInfo = () =>
  createSelector(
    state => state,
    state => {
      const account = makeSelectAccount()(state);
      const balance = makeSelectBalance()(state);
      const profileInfo = selectUsers(account)(state);

      if (typeof profileInfo === 'object') {
        return {
          ...profileInfo,
          balance,
        };
      }

      return profileInfo;
    },
  );

const makeSelectFollowedCommunities = () =>
  createSelector(
    state => state,
    state => {
      const profileInfo = makeSelectProfileInfo()(state);
      return profileInfo ? profileInfo.followed_communities : null;
    },
  );

export {
  selectAccountProviderDomain,
  makeSelectLoading,
  makeSelectError,
  makeSelectAccount,
  makeSelectProfileInfo,
  makeSelectFollowedCommunities,
  makeSelectBalance,
};
