import { FractalGovernanceContracts } from '../../../types';

export enum GovernanceContractAction {
  SET_GOVERNANCE_CONTRACT = 'SET_GOVERNANCE_CONTRACT',
}

export type GovernanceContractActions = {
  type: GovernanceContractAction.SET_GOVERNANCE_CONTRACT;
  payload: Omit<FractalGovernanceContracts, 'isLoaded'>;
};
