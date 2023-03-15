import { ITreasury, TreasuryActions, TreasuryAction } from '../../../types';
import { treasuryInitialState } from '../constants';

export const initializeTreasuryState = (_initialState: ITreasury) => {
  return _initialState;
};

export const TreasuryReducer = (state: ITreasury, action: TreasuryActions): ITreasury => {
  switch (action.type) {
    case TreasuryAction.UPDATE_GNOSIS_SAFE_FUNGIBLE_ASSETS:
      return { ...state, assetsFungible: action.payload, treasuryIsLoading: false };
    case TreasuryAction.UPDATE_GNOSIS_SAFE_NONFUNGIBLE_ASSETS:
      return { ...state, assetsNonFungible: action.payload, treasuryIsLoading: false };
    case TreasuryAction.UPDATE_GNOSIS_SAFE_TRANSFERS:
      return { ...state, transfers: action.payload, treasuryIsLoading: false };
    case TreasuryAction.RESET:
      return initializeTreasuryState(treasuryInitialState);
    default:
      return state;
  }
};
