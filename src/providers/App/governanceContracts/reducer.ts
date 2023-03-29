import { GovernanceContractsRefactored } from '../../../types';
import { GovernanceContractAction, GovernanceContractActions } from './action';

export const initialGovernanceContractsState: GovernanceContractsRefactored = {
  ozLinearVotingContract: null,
  usulContract: null,
  tokenContract: null,
  isLoaded: false,
};

export const governanceContractsReducer = (
  state: GovernanceContractsRefactored,
  action: GovernanceContractActions
) => {
  switch (action.type) {
    case GovernanceContractAction.SET_GOVERNANCE_CONTRACT:
      return { ...action.payload, isLoaded: true };
    case GovernanceContractAction.RESET:
      return initialGovernanceContractsState;
    default:
      return state;
  }
};
