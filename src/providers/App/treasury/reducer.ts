import { DecentTreasury } from '../../../types';
import { TreasuryActions, TreasuryAction } from './action';

export const initialTreasuryState: DecentTreasury = {
  assetsFungible: [],
  assetsNonFungible: [],
  assetsDeFi: [],
  transfers: null,
  totalUsdValue: 0,
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
    case TreasuryAction.SET_TRANSFERS_LOADED:
      return { ...state, transfers: state.transfers ?? [] };
    default:
      return state;
  }
};
