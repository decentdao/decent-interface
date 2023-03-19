import SafeServiceClient, {
  SafeInfoResponse,
  AllTransactionsListResponse,
} from '@safe-global/safe-service-client';
import { BigNumber } from 'ethers';
import { IGnosisVetoContract } from '../daoGuard';
import { IGnosisModuleData, IGnosisFreezeData } from '../fractal';

// @todo Rename to NodeActions and NodeAction
export enum GnosisAction {
  SET_SAFE_SERVICE_CLIENT,
  SET_SAFE,
  SET_SAFE_ADDRESS,
  SET_SAFE_TRANSACTIONS,
  SET_MODULES,
  SET_GUARD_CONTRACTS,
  SET_FREEZE_DATA,
  FREEZE_VOTE_EVENT,
  SET_DAO_NAME,
  SET_DAO_PARENT,
  INVALIDATE,
  RESET,
}

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
  | { type: GnosisAction.INVALIDATE }
  | { type: GnosisAction.RESET };

export enum NodeAction {
  Reset,
}

export const NodeActions = { type: NodeAction.Reset };
