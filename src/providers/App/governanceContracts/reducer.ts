import { FractalGovernanceContracts } from '../../../types';
import { GovernanceContractAction, GovernanceContractActions } from './action';

export const initialGovernanceContractsState: FractalGovernanceContracts = {
  erc721LinearVotingContractAddress: undefined,
  ozLinearVotingContractAddress: undefined,
  azoriusContractAddress: undefined,
  votesTokenContractAddress: undefined,
  lockReleaseContractAddress: undefined,
  isLoaded: false,
};

export const governanceContractsReducer = (
  state: FractalGovernanceContracts,
  action: GovernanceContractActions,
) => {
  switch (action.type) {
    case GovernanceContractAction.SET_GOVERNANCE_CONTRACT_ADDRESSES:
      return { ...action.payload, isLoaded: true };
    default:
      return state;
  }
};
