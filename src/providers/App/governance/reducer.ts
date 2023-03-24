import { FractalGovernance, UsulProposal, VOTE_CHOICES } from '../../../types';
import { FractalProposal } from './../../../types/fractal';
import { FractalGovernanceAction, FractalGovernanceActions } from './action';

export const initialGovernanceState: FractalGovernance = {
  proposals: [] as FractalProposal[],
};

export const governanceReducer = (state: FractalGovernance, action: FractalGovernanceActions) => {
  const { proposals } = state;
  switch (action.type) {
    case FractalGovernanceAction.SET_GOVERNANCE:
      return action.payload;
    case FractalGovernanceAction.UPDATE_PROPOSALS_NEW:
      return { ...state, proposals: [...proposals, action.payload] };
    case FractalGovernanceAction.UPDATE_NEW_USUL_VOTE: {
      const { proposalNumber, voter, support, weight, votesSummary } = action.payload;
      const updatedProposals = ([...proposals] as UsulProposal[]).map(proposal => {
        if (proposal.proposalNumber === proposalNumber) {
          const newProposal: UsulProposal = {
            ...proposal,
            votesSummary,
            votes: [...proposal.votes, { voter, choice: VOTE_CHOICES[support], weight }],
          };
          return newProposal;
        }
        return proposal;
      });
      return { ...state, proposals: updatedProposals };
    }
    case FractalGovernanceAction.UPDATE_PROPOSAL_STATE: {
      const { proposalNumber, state: proposalState } = action.payload;
      const updatedProposals = ([...proposals] as UsulProposal[]).map(proposal => {
        if (proposal.proposalNumber === proposalNumber) {
          const newProposal: UsulProposal = {
            ...proposal,
            state: proposalState,
          };
          return newProposal;
        }
        return proposal;
      });
      return { ...state, proposals: updatedProposals };
    }
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
