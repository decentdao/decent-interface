import { DecentTreasury } from '../../../types';
import { TreasuryActions, TreasuryAction } from './action';

export const initialTreasuryState: DecentTreasury = {
  assetsFungible: [],
  assetsNonFungible: [],
  transfers: undefined,
  totalUsdValue: 0,
  transfersLoading: true,
  transfersLoaded: false,
};

export const treasuryReducer = (state: DecentTreasury, action: TreasuryActions): DecentTreasury => {
  switch (action.type) {
    case TreasuryAction.UPDATE_TREASURY:
      return { ...state, ...action.payload };
    case TreasuryAction.ADD_TRANSFER:
      const transfers = state.transfers ?? [];
      return { ...state, transfers: [...transfers, action.payload] };
    case TreasuryAction.SET_TRANSFERS_LOADING:
      return { ...state, transfersLoading: action.payload };
    case TreasuryAction.SET_TRANSFERS_LOADED:
      return { ...state, transfersLoaded: true };
    case TreasuryAction.RESET:
      return initialTreasuryState;
    default:
      return state;
  }
};
