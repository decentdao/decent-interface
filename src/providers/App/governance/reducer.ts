import { FractalGovernance, AzoriusProposal, VOTE_CHOICES } from '../../../types';
import { AzoriusGovernance, StrategyType } from './../../../types/fractal';
import { FractalGovernanceAction, FractalGovernanceActions } from './action';

export const initialGovernanceState: FractalGovernance = {
  proposals: null,
  proposalTemplates: null,
  type: undefined,
  votesStrategy: undefined,
  votesToken: undefined,
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
      const { type, proposals: newProposals } = action.payload;
      return { ...state, type, proposals: newProposals };
    }
    case FractalGovernanceAction.SET_PROPOSAL_TEMPLATES: {
      return { ...state, proposalTemplates: action.payload };
    }
    case FractalGovernanceAction.SET_STRATEGY: {
      return { ...state, type: StrategyType.AZORIUS, votesStrategy: action.payload };
    }
    case FractalGovernanceAction.UPDATE_PROPOSALS_NEW:
      return { ...state, proposals: [...(proposals || []), action.payload] };
    case FractalGovernanceAction.UPDATE_NEW_AZORIUS_VOTE: {
      const { proposalId, voter, support, weight, votesSummary } = action.payload;
      const updatedProposals = [...(proposals as AzoriusProposal[])].map(proposal => {
        if (proposal.proposalId === proposalId) {
          const foundVote = proposal.votes.find(vote => vote.voter === voter);
          const newProposal: AzoriusProposal = {
            ...proposal,
            votesSummary,
            votes: foundVote
              ? [...proposal.votes]
              : [...proposal.votes, { voter, choice: VOTE_CHOICES[support], weight }],
          };
          return newProposal;
        }
        return proposal;
      });
      return { ...state, proposals: updatedProposals };
    }
    case FractalGovernanceAction.UPDATE_PROPOSAL_STATE: {
      const { proposalId, state: proposalState } = action.payload;
      if (!proposals) {
        return state;
      }
      const updatedProposals = (proposals as AzoriusProposal[]).map(proposal => {
        if (proposal.proposalId === proposalId) {
          const newProposal: AzoriusProposal = {
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
    case FractalGovernanceAction.SET_UNDERLYING_TOKEN_DATA: {
      const { votesToken } = state as AzoriusGovernance;
      return { ...state, votesToken: { ...votesToken, underlyingTokenData: action.payload } };
    }
    case FractalGovernanceAction.SET_TOKEN_ACCOUNT_DATA: {
      const { votesToken } = state as AzoriusGovernance;
      return { ...state, votesToken: { ...votesToken, ...action.payload } };
    }
    case FractalGovernanceAction.SET_CLAIMING_CONTRACT: {
      return { ...state, tokenClaimContract: action.payload };
    }
    case FractalGovernanceAction.RESET_TOKEN_ACCOUNT_DATA: {
      const { votesToken } = state as AzoriusGovernance;
      return { ...state, votesToken: { ...votesToken, ...initialVotesTokenAccountData } };
    }
    default:
      return state;
  }
};
