import { DecentTreasury } from '../../../types';
import { TreasuryActions, TreasuryAction } from './action';

export const initialTreasuryState: DecentTreasury = {
  assetsFungible: [],
  assetsNonFungible: [],
  transfers: undefined,
  totalUsdValue: 0,
};

export const treasuryReducer = (state: DecentTreasury, action: TreasuryActions): DecentTreasury => {
  switch (action.type) {
    case TreasuryAction.UPDATE_TREASURY:
      return { ...state, ...action.payload };
    case TreasuryAction.RESET:
      return initialTreasuryState;
    default:
      return state;
  }
};
