import { AccountAction } from '../constants';
import { AccountActions, IConnectedAccount } from '../types';

export const initializeConnectedAccount = (_initialState: IConnectedAccount) => {
  return _initialState;
};

export const connectedAccountReducer = (
  state: IConnectedAccount,
  action: AccountActions
): IConnectedAccount => {
  switch (action.type) {
    case AccountAction.UPDATE_DAO_FAVORITES: {
      return { ...state, favorites: action.payload };
    }
    case AccountAction.UPDATE_AUDIT_MESSAGE: {
      return { ...state, audit: action.payload };
    }
    default:
      return state;
  }
};
