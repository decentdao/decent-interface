import { FractalTreasury } from '../../../types';

export enum TreasuryAction {
  UPDATE_TREASURY,
  RESET,
}

export type TreasuryActions =
  | {
      type: TreasuryAction.UPDATE_TREASURY;
      payload: FractalTreasury;
    }
  | { type: TreasuryAction.RESET };
