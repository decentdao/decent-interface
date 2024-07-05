import { DecentTreasury } from '../../../types';

export enum TreasuryAction {
  UPDATE_TREASURY,
  RESET,
}

export type TreasuryActions =
  | {
      type: TreasuryAction.UPDATE_TREASURY;
      payload: DecentTreasury;
    }
  | { type: TreasuryAction.RESET };
