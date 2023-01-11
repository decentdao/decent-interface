import SafeServiceClient, {
  SafeInfoResponse,
  AllTransactionsListResponse,
  SafeBalanceUsdResponse,
  SafeCollectibleResponse,
} from '@safe-global/safe-service-client';
import { BigNumber } from 'ethers';
import { AccountAction, GnosisAction, TreasuryAction } from '../constants';
import { IGnosisModuleData, IGnosisFreezeData, IGnosisVetoContract } from '../governance/types';
import { AllTransfersListResponse } from '../hooks/useGnosisApiServices';
import { IFavorites, IAudit } from './state';

export type GnosisActions =
  | { type: GnosisAction.SET_SAFE_SERVICE_CLIENT; payload: SafeServiceClient }
  | { type: GnosisAction.SET_SAFE; payload: SafeInfoResponse }
  | { type: GnosisAction.SET_SAFE_ADDRESS; payload: string }
  | { type: GnosisAction.SET_SAFE_TRANSACTIONS; payload: AllTransactionsListResponse }
  | { type: GnosisAction.SET_MODULES; payload: IGnosisModuleData[] }
  | { type: GnosisAction.SET_GUARD_CONTRACTS; payload: IGnosisVetoContract }
  | { type: GnosisAction.SET_FREEZE_DATA; payload: IGnosisFreezeData }
  | {
      type: GnosisAction.FREEZE_VOTE_EVENT;
      payload: {
        isVoter: boolean;
        freezeProposalCreatedTime: BigNumber;
        freezeProposalVoteCount: BigNumber;
      };
    }
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
      payload: AllTransfersListResponse;
    }
  | { type: TreasuryAction.RESET };

export type AccountActions =
  | { type: AccountAction.UPDATE_DAO_FAVORITES; payload: IFavorites }
  | { type: AccountAction.UPDATE_AUDIT_MESSAGE; payload: IAudit };
