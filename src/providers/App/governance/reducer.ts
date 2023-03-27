import { FractalGovernance, UsulProposal, VOTE_CHOICES } from '../../../types';
import { AzoriusGovernance, FractalProposal } from './../../../types/fractal';
import { FractalGovernanceAction, FractalGovernanceActions } from './action';

export const initialGovernanceState: FractalGovernance = {
  proposals: [] as FractalProposal[],
};

export const initialVotesTokenAccountData = {
  balance: null,
  delegatee: null,
  votingWeight: null,
  isDelegatesSet: null,
};

export const governanceReducer = (state: FractalGovernance, action: FractalGovernanceActions) => {
  const { proposals } = state;
  switch (action.type) {
    case FractalGovernanceAction.SET_PROPOSALS: {
      return { ...state, proposals: action.payload };
    }
    case FractalGovernanceAction.SET_STRATEGY: {
      return { ...state, strategy: action.payload };
    }
    case FractalGovernanceAction.UPDATE_PROPOSALS_NEW:
      return { ...state, proposals: [...proposals, action.payload] };
    case FractalGovernanceAction.UPDATE_NEW_USUL_VOTE: {
      const { proposalNumber, voter, support, weight, votesSummary } = action.payload;
      const updatedProposals = (proposals as UsulProposal[]).map(proposal => {
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
      const updatedProposals = (proposals as UsulProposal[]).map(proposal => {
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
    case FractalGovernanceAction.UPDATE_VOTING_PERIOD: {
      const { votesStrategy } = state as AzoriusGovernance;
      return { ...state, votesStrategy: { ...votesStrategy, votingPeriod: action.payload } };
    }
    case FractalGovernanceAction.UPDATE_VOTING_QUORUM: {
      const { votesStrategy } = state as AzoriusGovernance;
      return { ...state, votesStrategy: { ...votesStrategy, votingQuorum: action.payload } };
    }
    case FractalGovernanceAction.UPDATE_TIMELOCK_PERIOD: {
      const { votesStrategy } = state as AzoriusGovernance;
      return { ...state, votesStrategy: { ...votesStrategy, timelockPeriod: action.payload } };
    }
    case FractalGovernanceAction.SET_TOKEN_DATA: {
      const { votesToken } = state as AzoriusGovernance;
      return { ...state, votesToken: { ...votesToken, ...action.payload } };
    }
    case FractalGovernanceAction.SET_TOKEN_ACCOUNT_DATA: {
      const { votesToken } = state as AzoriusGovernance;
      return { ...state, votesToken: { ...votesToken, ...action.payload } };
    }
    case FractalGovernanceAction.RESET_TOKEN_ACCOUNT_DATA: {
      const { votesToken } = state as AzoriusGovernance;
      return { ...state, votesToken: { ...votesToken, ...initialVotesTokenAccountData } };
    }
    case FractalGovernanceAction.RESET:
      return initialGovernanceState;
    default:
      return state;
  }
};
