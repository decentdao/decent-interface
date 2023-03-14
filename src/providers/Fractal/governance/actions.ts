import { TokenClaim } from '@fractal-framework/fractal-contracts';
import { GovernanceContracts, GovernanceTypes, TxProposalsInfo } from '../types';
import { IGoveranceTokenData } from './hooks/useGovernanceTokenData';

export type GovernanceActions =
  | { type: GovernanceAction.SET_USUL_CONTRACTS; payload: GovernanceContracts }
  | { type: GovernanceAction.CONTRACTS_LOADED }
  | { type: GovernanceAction.UPDATE_PROPOSALS; payload: TxProposalsInfo }
  | {
      type: GovernanceAction.SET_GOVERNANCE;
      payload: {
        type: GovernanceTypes | null;
        governanceToken: IGoveranceTokenData;
        governanceIsLoading: boolean;
      };
    }
  | { type: GovernanceAction.SET_CLAIMING_CONTRACT; payload: TokenClaim }
  | { type: GovernanceAction.RESET };

export enum GovernanceAction {
  SET_GOVERNANCE,
  SET_USUL_CONTRACTS,
  UPDATE_PROPOSALS,
  CONTRACTS_LOADED,
  SET_CLAIMING_CONTRACT,
  RESET,
}
