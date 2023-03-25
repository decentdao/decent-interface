import { BigNumber } from 'ethers';
import {
  FractalProposal,
  ProposalVotesSummary,
  TokenData,
  TxProposalState,
  VotesData,
  VotesStrategy,
} from '../../../types';

export enum FractalGovernanceAction {
  SET_PROPOSALS,
  SET_STRATEGY,
  UPDATE_PROPOSALS_NEW,
  UPDATE_NEW_USUL_VOTE,
  UPDATE_PROPOSAL_STATE,
  UPDATE_VOTING_PERIOD,
  UPDATE_VOTING_QUORUM,
  UPDATE_TIMELOCK_PERIOD,
  SET_TOKEN_DATA,
  SET_TOKEN_ACCOUNT_DATA,
  RESET_TOKEN_ACCOUNT_DATA,
  RESET,
}

export type FractalGovernanceActions =
  | { type: FractalGovernanceAction.SET_STRATEGY; payload: VotesStrategy }
  | { type: FractalGovernanceAction.SET_PROPOSALS; payload: FractalProposal[] }
  // @todo update with proposal type
  | { type: FractalGovernanceAction.UPDATE_PROPOSALS_NEW; payload: FractalProposal }
  | {
      type: FractalGovernanceAction.UPDATE_NEW_USUL_VOTE;
      payload: {
        proposalNumber: string;
        voter: string;
        support: number;
        weight: BigNumber;
        votesSummary: ProposalVotesSummary;
      };
    }
  // @todo update with proposal state
  | {
      type: FractalGovernanceAction.UPDATE_PROPOSAL_STATE;
      payload: { state: TxProposalState; proposalNumber: string };
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
      type: FractalGovernanceAction.SET_TOKEN_ACCOUNT_DATA;
      payload: VotesData;
    }
  | {
      type: FractalGovernanceAction.RESET_TOKEN_ACCOUNT_DATA;
    }
  | { type: FractalGovernanceAction.RESET };
