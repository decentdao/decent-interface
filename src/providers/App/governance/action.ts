import { ERC20Claim } from '@fractal-framework/fractal-contracts';
import { BigNumber } from 'ethers';
import {
  FractalProposal,
  ProposalVotesSummary,
  TokenData,
  FractalProposalState,
  VotesData,
  VotingStrategy,
  UnderlyingTokenData,
  GovernanceSelectionType,
} from '../../../types';
import { ProposalTemplate } from '../../../types/createProposalTemplate';

export enum FractalGovernanceAction {
  SET_PROPOSALS = 'SET_PROPOSALS',
  SET_SNAPSHOT_PROPOSALS = 'SET_SNAPSHOT_PROPOSALS',
  SET_PROPOSAL_TEMPLATES = 'SET_PROPOSAL_TEMPLATES',
  SET_STRATEGY = 'SET_STRATEGY',
  UPDATE_PROPOSALS_NEW = 'UPDATE_PROPOSALS_NEW',
  UPDATE_NEW_AZORIUS_VOTE = 'UPDATE_NEW_AZORIUS_VOTE',
  UPDATE_PROPOSAL_STATE = 'UPDATE_PROPOSAL_STATE',
  UPDATE_VOTING_PERIOD = 'UPDATE_VOTING_PERIOD',
  UPDATE_VOTING_QUORUM = 'UPDATE_VOTING_QUORUM',
  UPDATE_TIMELOCK_PERIOD = 'UPDATE_TIMELOCK_PERIOD',
  SET_TOKEN_DATA = 'SET_TOKEN_DATA',
  SET_TOKEN_ACCOUNT_DATA = 'SET_TOKEN_ACCOUNT_DATA',
  SET_CLAIMING_CONTRACT = 'SET_CLAIMING_CONTRACT',
  RESET_TOKEN_ACCOUNT_DATA = 'RESET_TOKEN_ACCOUNT_DATA',
  SET_UNDERLYING_TOKEN_DATA = 'SET_UNDERLYING_TOKEN_DATA',
}

export type FractalGovernanceActions =
  | { type: FractalGovernanceAction.SET_STRATEGY; payload: VotingStrategy }
  | {
      type: FractalGovernanceAction.SET_PROPOSALS;
      payload: { type: GovernanceSelectionType; proposals: FractalProposal[] };
    }
  | {
      type: FractalGovernanceAction.SET_SNAPSHOT_PROPOSALS;
      payload: FractalProposal[];
    }
  | { type: FractalGovernanceAction.SET_PROPOSAL_TEMPLATES; payload: ProposalTemplate[] }
  // @todo update with proposal type
  | { type: FractalGovernanceAction.UPDATE_PROPOSALS_NEW; payload: FractalProposal }
  | {
      type: FractalGovernanceAction.UPDATE_NEW_AZORIUS_VOTE;
      payload: {
        proposalId: string;
        voter: string;
        support: number;
        weight: BigNumber;
        votesSummary: ProposalVotesSummary;
      };
    }
  // @todo update with proposal state
  | {
      type: FractalGovernanceAction.UPDATE_PROPOSAL_STATE;
      payload: { state: FractalProposalState; proposalId: string };
    }
  | {
      type: FractalGovernanceAction.UPDATE_VOTING_PERIOD;
      payload: BigNumber;
    }
  | {
      type: FractalGovernanceAction.UPDATE_VOTING_QUORUM;
      payload: BigNumber;
    }
  | {
      type: FractalGovernanceAction.UPDATE_TIMELOCK_PERIOD;
      payload: BigNumber;
    }
  | {
      type: FractalGovernanceAction.SET_TOKEN_DATA;
      payload: TokenData;
    }
  | {
      type: FractalGovernanceAction.SET_UNDERLYING_TOKEN_DATA;
      payload: UnderlyingTokenData;
    }
  | {
      type: FractalGovernanceAction.SET_TOKEN_ACCOUNT_DATA;
      payload: VotesData;
    }
  | { type: FractalGovernanceAction.SET_CLAIMING_CONTRACT; payload: ERC20Claim }
  | {
      type: FractalGovernanceAction.RESET_TOKEN_ACCOUNT_DATA;
    };
