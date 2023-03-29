import { GovernanceContractsRefactored } from '../../../types';

export enum GovernanceContractAction {
  SET_GOVERNANCE_CONTRACT,
  RESET,
}

export type GovernanceContractActions =
  | {
      type: GovernanceContractAction.SET_GOVERNANCE_CONTRACT;
      payload: Omit<GovernanceContractsRefactored, 'isLoaded'>;
    }
  | {
      type: GovernanceContractAction.RESET;
    };
