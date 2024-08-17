import { DecentTreasury } from '../../../types';
import { TreasuryActions, TreasuryAction } from './action';

export const initialTreasuryState: DecentTreasury = {
  assetsFungible: [],
  assetsNonFungible: [],
  assetsDeFi: [],
  transfers: null,
  totalUsdValue: 0,
  transfersLoaded: false,
};

export const treasuryReducer = (state: DecentTreasury, action: TreasuryActions): DecentTreasury => {
  switch (action.type) {
    case TreasuryAction.UPDATE_TREASURY:
      return { ...state, ...action.payload };
    case TreasuryAction.ADD_TRANSFER:
      const transfers = state.transfers ?? [];
      return { ...state, transfers: [...transfers, action.payload] };
    case TreasuryAction.RESET:
      return initialTreasuryState;
    default:
      return state;
  }
};
