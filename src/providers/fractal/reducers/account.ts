import { AccountAction } from '../constants';
import { AccountActions, IConnectedAccount } from '../types';

export const initializeConnectedAccount = (_initialState: any) => {
  return _initialState;
};

export const connectedAccountReducer = (state: IConnectedAccount, action: AccountActions): any => {
  switch (action.type) {
    case AccountAction.UPDATE_DAO_FAVORITES: {
      return { ...state, favorites: action.payload };
    }
    default:
      return state;
  }
};
