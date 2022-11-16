import { BigNumber } from 'ethers';
import { DecodedTransaction } from '../../../types';

export const VOTE_CHOICES = ['no', 'yes', 'abstain'] as const;

export enum ProposalState {
  Active = 'stateActive',
  Canceled = 'stateCanceled',
  TimeLocked = 'stateTimeLocked',
  Executed = 'stateExecuted',
  Executing = 'stateExecuting',
  Uninitialized = 'stateUninitialized',
  Pending = 'statePending',
  Failed = 'stateFailed',
  Rejected = 'stateRejected',
}

export const strategyProposalStates = Object.values(ProposalState);

export type ProposalVotesSummary = {
  yes: BigNumber;
  no: BigNumber;
  abstain: BigNumber;
  quorum: BigNumber;
};

export type ProposalVote = {
  voter: string;
  choice: typeof VOTE_CHOICES[number];
  weight: BigNumber;
};

export type Proposal = {
  state: ProposalState;
  govTokenAddress: string | null;
  votes: ProposalVotesSummary;
  startBlock: BigNumber;
  deadline: number;
  proposer: string;
  proposalNumber: BigNumber;
  userVote?: ProposalVote;
  txHashes: string[];
  decodedTransactions: DecodedTransaction[];
};

export enum ProposalIsPassedError {
  MAJORITY_YES_VOTES_NOT_REACHED = 'majority yesVotes not reached',
  QUORUM_NOT_REACHED = 'a quorum has not been reached for the proposal',
  PROPOSAL_STILL_ACTIVE = 'voting period has not passed yet',
}
