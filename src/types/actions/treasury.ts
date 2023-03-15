import { SafeBalanceUsdResponse, SafeCollectibleResponse } from '@safe-global/safe-service-client';
import { AllTransfersListResponse } from '../safeGlobal';

export enum TreasuryAction {
  UPDATE_GNOSIS_SAFE_FUNGIBLE_ASSETS,
  UPDATE_GNOSIS_SAFE_NONFUNGIBLE_ASSETS,
  UPDATE_GNOSIS_SAFE_TRANSFERS,
  RESET,
}

export type TreasuryActions =
  | {
      type: TreasuryAction.UPDATE_GNOSIS_SAFE_FUNGIBLE_ASSETS;
      payload: SafeBalanceUsdResponse[];
    }
  | {
      type: TreasuryAction.UPDATE_GNOSIS_SAFE_NONFUNGIBLE_ASSETS;
      payload: SafeCollectibleResponse[];
    }
  | {
      type: TreasuryAction.UPDATE_GNOSIS_SAFE_TRANSFERS;
      payload: AllTransfersListResponse;
    }
  | { type: TreasuryAction.RESET };
