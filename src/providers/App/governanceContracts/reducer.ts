import { FractalGovernanceContracts } from '../../../types';
import { GovernanceContractAction, GovernanceContractActions } from './action';

export const initialGovernanceContractsState: FractalGovernanceContracts = {
  ozLinearVotingContract: null,
  usulContract: null,
  tokenContract: null,
  isLoaded: false,
};

export const governanceContractsReducer = (
  state: FractalGovernanceContracts,
  action: GovernanceContractActions
) => {
  switch (action.type) {
    case GovernanceContractAction.SET_GOVERNANCE_CONTRACT:
      return { ...action.payload, isLoaded: true };
    default:
      return state;
  }
};
