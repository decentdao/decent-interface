import { FractalTreasury } from '../../../types';
import { TreasuryActions, TreasuryAction } from './action';

export const initialTreasuryState: FractalTreasury = {
  assetsFungible: [],
  assetsNonFungible: [],
  transfers: undefined,
};

export const treasuryReducer = (
  state: FractalTreasury,
  action: TreasuryActions
): FractalTreasury => {
  switch (action.type) {
    case TreasuryAction.UPDATE_TREASURY:
      return { ...state, ...action.payload };
    case TreasuryAction.RESET:
      return initialTreasuryState;
    default:
      return state;
  }
};
