import { DecentTreasury, TransferDisplayData } from '../../../types';

export enum TreasuryAction {
  UPDATE_TREASURY,
  ADD_TRANSFER,
  SET_TRANSFERS_LOADING,
  SET_TRANSFERS_LOADED,
  RESET,
}

export type TreasuryActions =
  | {
      type: TreasuryAction.UPDATE_TREASURY;
      payload: DecentTreasury;
    }
  | {
      type: TreasuryAction.ADD_TRANSFER;
      payload: TransferDisplayData;
    }
  | {
      type: TreasuryAction.SET_TRANSFERS_LOADING;
      payload: boolean;
    }
  | {
      type: TreasuryAction.SET_TRANSFERS_LOADED;
      payload: boolean;
    }
  | { type: TreasuryAction.RESET };
