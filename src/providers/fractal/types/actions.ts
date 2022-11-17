import SafeServiceClient, {
  SafeBalanceUsdResponse,
  SafeCollectibleResponse,
  TransferListResponse,
} from '@gnosis.pm/safe-service-client';
import { AccountAction, GnosisAction, GovernanceAction, TreasuryAction } from '../constants';
import { GnosisTransactionsResponse } from './gnosis';
import { IGnosisModuleData, IGovernance } from './governance';
import { GnosisSafe, IFavorites, IAudit } from './state';

export type GnosisActions =
  | { type: GnosisAction.SET_SAFE_SERVICE_CLIENT; payload: SafeServiceClient }
  | { type: GnosisAction.SET_SAFE; payload: GnosisSafe }
  | { type: GnosisAction.SET_SAFE_TRANSACTIONS; payload: GnosisTransactionsResponse }
  | { type: GnosisAction.SET_MODULES; payload: IGnosisModuleData[] }
  | { type: GnosisAction.SET_DAO_NAME; payload: string }
  | { type: GnosisAction.INVALIDATE }
  | { type: GnosisAction.RESET };

export type GovernanceActions =
  | { type: GovernanceAction.ADD_GOVERNANCE_DATA; payload: IGovernance }
  | { type: GovernanceAction.RESET };

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

export type AccountActions =
  | { type: AccountAction.UPDATE_DAO_FAVORITES; payload: IFavorites }
  | { type: AccountAction.UPDATE_AUDIT_MESSAGE; payload: IAudit };
