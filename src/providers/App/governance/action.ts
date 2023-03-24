import { BigNumber } from 'ethers';
import {
  FractalGovernance,
  FractalProposal,
  ProposalVotesSummary,
  TxProposalState,
} from '../../../types';

export enum FractalGovernanceAction {
  SET_GOVERNANCE,
  UPDATE_PROPOSALS_NEW,
  UPDATE_NEW_USUL_VOTE,
  UPDATE_PROPOSAL_STATE,
  UPDATE_VOTING_PERIOD,
  UPDATE_VOTING_QUORUM,
  UPDATE_TIMELOCK_PERIOD,
  RESET,
}

export type FractalGovernanceActions =
  | { type: FractalGovernanceAction.SET_GOVERNANCE; payload: FractalGovernance }
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
      payload: { votingPeriod: BigNumber; proposalNumber: BigNumber };
    }
  | {
      type: FractalGovernanceAction.UPDATE_VOTING_QUORUM;
      payload: { votingQuorum: BigNumber; proposalNumber: BigNumber };
    }
  | {
      type: FractalGovernanceAction.UPDATE_TIMELOCK_PERIOD;
      payload: { timelockPeriod: BigNumber; proposalNumber: BigNumber };
    }
  | { type: FractalGovernanceAction.RESET };
