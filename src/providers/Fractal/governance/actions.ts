import { GovernanceContracts, GovernanceTypes } from '../types';
import { IGoveranceTokenData } from './hooks/useGovernanceTokenData';

export type GovernanceActions =
  | { type: GovernanceAction.SET_USUL_CONTRACTS; payload: GovernanceContracts }
  | {
      type: GovernanceAction.SET_GOVERNANCE;
      payload: {
        type: GovernanceTypes | null;
        governanceToken: IGoveranceTokenData;
        governanceIsLoading: boolean;
      };
    }
  | { type: GovernanceAction.RESET };

export enum GovernanceAction {
  SET_GOVERNANCE,
  SET_USUL_CONTRACTS,
  RESET,
}
