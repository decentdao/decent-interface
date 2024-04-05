import {
  FractalGovernance,
  AzoriusProposal,
  VOTE_CHOICES,
  SnapshotProposal,
  ERC721ProposalVote,
  AzoriusGovernance,
  DecentGovernance,
} from '../../../types';
import {
  FractalGovernanceAction,
  FractalGovernanceActions,
  DecentGovernanceAction,
} from './action';

export const initialGovernanceState: FractalGovernance = {
  proposals: null,
  proposalTemplates: null,
  type: undefined,
  votingStrategy: undefined,
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
    case FractalGovernanceAction.SET_GOVERNANCE_TYPE:
      return { ...state, type: action.payload };
    case FractalGovernanceAction.SET_PROPOSALS: {
      return {
        ...state,
        proposals: [
          ...action.payload,
          ...(proposals || []).filter(
            proposal => !!(proposal as SnapshotProposal).snapshotProposalId,
          ),
        ],
      };
    }
    case FractalGovernanceAction.SET_AZORIUS_PROPOSAL: {
      return {
        ...state,
        proposals: [...(proposals || []), action.payload],
      };
    }
    case FractalGovernanceAction.SET_PROPOSAL_TEMPLATES: {
      return { ...state, proposalTemplates: action.payload };
    }
    case FractalGovernanceAction.SET_STRATEGY: {
      return {
        ...state,
        votingStrategy: action.payload,
      };
    }
    case FractalGovernanceAction.SET_SNAPSHOT_PROPOSALS:
      return { ...state, proposals: [...(proposals || []), ...action.payload] };
    case FractalGovernanceAction.UPDATE_PROPOSALS_NEW:
      return {
        ...state,
        // TODO - Investigate a better way of avoiding duplicate proposals
        // It seems like UPDATE_PROPOSALS_NEW dispatched multiple times with the same proposal sometimes
        // Yet, I'm not sure of the cause :(
        proposals: [...(proposals || []), action.payload].filter(
          (proposal, index, array) =>
            index === array.findIndex(p => p.proposalId === proposal.proposalId),
        ),
      };
    case FractalGovernanceAction.UPDATE_NEW_AZORIUS_ERC20_VOTE: {
      const { proposalId, voter, support, votesSummary, weight } = action.payload;
      const updatedProposals = ((proposals || []) as AzoriusProposal[]).map(proposal => {
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
    case FractalGovernanceAction.UPDATE_NEW_AZORIUS_ERC721_VOTE: {
      const { proposalId, voter, support, votesSummary, tokenAddresses, tokenIds } = action.payload;
      const updatedProposals = ((proposals || []) as AzoriusProposal[]).map(proposal => {
        if (proposal.proposalId === proposalId) {
          const foundVote = proposal.votes.find(vote => vote.voter === voter);
          const newProposal: AzoriusProposal = {
            ...proposal,
            votesSummary,
            votes: foundVote
              ? [...proposal.votes]
              : ([
                  ...proposal.votes,
                  { voter, choice: VOTE_CHOICES[support], tokenAddresses, tokenIds },
                ] as ERC721ProposalVote[]),
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
      const updatedProposals = ((proposals || []) as AzoriusProposal[]).map(proposal => {
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
      const { votingStrategy } = state as AzoriusGovernance;
      return { ...state, votingStrategy: { ...votingStrategy, votingPeriod: action.payload } };
    }
    case FractalGovernanceAction.UPDATE_VOTING_QUORUM_THRESHOLD: {
      const { votingStrategy } = state as AzoriusGovernance;
      return { ...state, votingStrategy: { ...votingStrategy, quorumThreshold: action.payload } };
    }
    case FractalGovernanceAction.UPDATE_VOTING_QUORUM: {
      const { votingStrategy } = state as AzoriusGovernance;
      return { ...state, votingStrategy: { ...votingStrategy, votingQuorum: action.payload } };
    }
    case FractalGovernanceAction.UPDATE_TIMELOCK_PERIOD: {
      const { votingStrategy } = state as AzoriusGovernance;
      return { ...state, votingStrategy: { ...votingStrategy, timelockPeriod: action.payload } };
    }
    case FractalGovernanceAction.SET_TOKEN_DATA: {
      const { votesToken } = state as AzoriusGovernance;
      return { ...state, votesToken: { ...votesToken, ...action.payload } };
    }
    case FractalGovernanceAction.SET_ERC721_TOKENS_DATA: {
      return { ...state, erc721Tokens: action.payload };
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
    // Decent Governance only
    case DecentGovernanceAction.SET_LOCKED_TOKEN_ACCOUNT_DATA: {
      const { lockedVotesToken } = state as DecentGovernance;
      return { ...state, lockedVotesToken: { ...(lockedVotesToken || {}), ...action.payload } };
    }
    case DecentGovernanceAction.RESET_LOCKED_TOKEN_ACCOUNT_DATA: {
      return { ...state, lockedVotesToken: undefined };
    }
    default:
      return state;
  }
};
