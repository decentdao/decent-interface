import { IConnectedAccount, AccountActions, AccountAction } from '../../../types';

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
    default:
      return state;
  }
};
