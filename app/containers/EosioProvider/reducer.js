/*
 *
 * EosioProvider reducer
 *
 */

import { fromJS } from 'immutable';
import { INIT_EOSIO, INIT_EOSIO_SUCCESS, INIT_EOSIO_ERROR } from './constants';

export const initialState = fromJS({
  initializing: false,
  eos: null,
  scatter: null,
  error: null,
});

function eosioProviderReducer(state = initialState, action) {
  const { type, error, eos, scatter } = action;

  switch (type) {
    case INIT_EOSIO:
      return state.set('initializing', true);
    case INIT_EOSIO_SUCCESS:
      return state
        .set('initializing', false)
        .set('eos', eos)
        .set('scatter', scatter || state.get('scatter'));
    case INIT_EOSIO_ERROR:
      return state.set('initializing', false).set('error', error);
    default:
      return state;
  }
}

export default eosioProviderReducer;
