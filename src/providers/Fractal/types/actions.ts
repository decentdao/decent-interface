import SafeServiceClient, {
  SafeInfoResponse,
  AllTransactionsListResponse,
  SafeBalanceUsdResponse,
  SafeCollectibleResponse,
  TransferListResponse,
} from '@safe-global/safe-service-client';
import { BigNumber } from 'ethers';
import { AccountAction, GnosisAction, GuardAction, TreasuryAction } from '../constants';
import { IGnosisModuleData } from '../governance/types';
import { IGnosisVetoData } from './governance';
import { IFavorites, IAudit } from './state';

export type GnosisActions =
  | { type: GnosisAction.SET_SAFE_SERVICE_CLIENT; payload: SafeServiceClient }
  | { type: GnosisAction.SET_SAFE; payload: SafeInfoResponse }
  | { type: GnosisAction.SET_SAFE_ADDRESS; payload: string }
  | { type: GnosisAction.SET_SAFE_TRANSACTIONS; payload: AllTransactionsListResponse }
  | { type: GnosisAction.SET_MODULES; payload: IGnosisModuleData[] }
  | { type: GnosisAction.SET_GUARD; payload: IGnosisVetoData }
  | { type: GnosisAction.SET_DAO_NAME; payload: string }
  | { type: GnosisAction.SET_DAO_PARENT; payload: string }
  | { type: GnosisAction.SET_DAO_CHILDREN; payload: string[] }
  | { type: GnosisAction.INVALIDATE }
  | { type: GnosisAction.RESET };

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
      payload: TransferListResponse;
    }
  | { type: TreasuryAction.RESET };

export type GuardActions =
  | {
      type: GuardAction.UPDATE_FREEZE_VOTES;
      payload: BigNumber;
    }
  | { type: TreasuryAction.RESET };

export type AccountActions =
  | { type: AccountAction.UPDATE_DAO_FAVORITES; payload: IFavorites }
  | { type: AccountAction.UPDATE_AUDIT_MESSAGE; payload: IAudit };
