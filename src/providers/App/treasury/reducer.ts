import { FractalTreasury } from '../../../types';
import { TreasuryActions, TreasuryAction } from './action';

export const initialTreasuryState: FractalTreasury = {
  transactions: [],
  assetsFungible: [],
  assetsNonFungible: [],
  transfers: undefined,
};

export const TreasuryReducer = (
  state: FractalTreasury,
  action: TreasuryActions
): FractalTreasury => {
  switch (action.type) {
    case TreasuryAction.UPDATE_GNOSIS_SAFE_FUNGIBLE_ASSETS:
      return { ...state, assetsFungible: action.payload };
    case TreasuryAction.UPDATE_GNOSIS_SAFE_NONFUNGIBLE_ASSETS:
      return { ...state, assetsNonFungible: action.payload };
    case TreasuryAction.UPDATE_GNOSIS_SAFE_TRANSFERS:
      return { ...state, transfers: action.payload };
    case TreasuryAction.RESET:
      return initialTreasuryState;
    default:
      return state;
  }
};
