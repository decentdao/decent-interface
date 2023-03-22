import { FractalGovernance } from '../../../types';
import { FractalGovernanceAction, FractalGovernanceActions } from './action';

export const initialGovernanceState: FractalGovernance = {
  proposals: [],
};

export const governanceReducer = (state: FractalGovernance, action: FractalGovernanceActions) => {
  switch (action.type) {
    case FractalGovernanceAction.SET_GOVERNANCE:
      return action.payload;
    case FractalGovernanceAction.UPDATE_PROPOSALS_NEW:
      // @todo should add new proposal to list of proposals
      return state;
    case FractalGovernanceAction.UPDATE_PROPOSALS_STATE:
      // @todo should update state of proposal
      return { ...state };
    case FractalGovernanceAction.UPDATE_VOTING_PERIOD:
      // const { votingPeriod, proposalNumber } = action.payload;
      return { ...state };
    case FractalGovernanceAction.UPDATE_VOTING_QUORUM:
      // const { votingQuorum, proposalNumber } = action.payload;
      return { ...state };
    case FractalGovernanceAction.UPDATE_TIMELOCK_PERIOD:
      // const { timelockPeriod, proposalNumber } = action.payload;
      return { ...state };
    case FractalGovernanceAction.RESET:
      return initialGovernanceState;
    default:
      return state;
  }
};
