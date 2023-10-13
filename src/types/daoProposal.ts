import { BigNumber, BigNumberish } from 'ethers';
import { ProposalMetadata } from './createProposal';
import { GovernanceActivity } from './fractal';
import { SafeMultisigConfirmationResponse } from './safeGlobal';
import { MetaTransaction, DecodedTransaction } from './transaction';

export interface ProposalExecuteData extends ExecuteData {
  metaData: ProposalMetadata;
}

export interface ExecuteData {
  targets: string[];
  values: BigNumberish[];
  calldatas: string[];
}

export type CreateProposalFunc = (proposal: {
  proposalData: {};
  successCallback: () => void;
}) => void;

export type ProposalData = {
  metaData?: ProposalMetadata;
  transactions?: MetaTransaction[];
  decodedTransactions: DecodedTransaction[];
};

export interface AzoriusProposal extends GovernanceActivity {
  proposer: string;
  votesSummary: ProposalVotesSummary;
  votes: ProposalVote[] | ERC721ProposalVote[];
  /** The deadline timestamp for the proposal, in milliseconds. */
  deadlineMs: number;
  startBlock: BigNumber;
}

export interface AzoriusERC721Proposal extends AzoriusProposal {
  votes: ERC721ProposalVote[];
}

export interface MultisigProposal extends GovernanceActivity {
  confirmations: SafeMultisigConfirmationResponse[];
  signersThreshold?: number;
  multisigRejectedProposalNumber?: string;
  nonce?: number;
}

export interface SnapshotProposal extends GovernanceActivity {
  snapshotProposalId: string;
  title: string;
  description: string;
  startTime: number;
  endTime: number;
}

interface SnapshotVotingStrategy {
  name: string;
  network: string;
  params: {
    addresses?: string[];
    symbol?: string;
  };
}

interface SnapshotPlugin {}

/**
 * @interface ExtendedSnapshotProposal - extension of `SnapshotProposal` to inject voting strategy data, votes, quorum, etc.
 * Their data model is quite different comparing to our, so there's not much of point to reuse existing
 */

export interface SnapshotVote {
  id: string;
  voter: string;
  votingWeight: number;
  votingWeightByStrategy: number[];
  votingState: string;
  created: number;
  choice: string;
}

export interface SnapshotVoteBreakdown {
  // Choice might be dynamically created by proposal's author.
  // So "For" | "Against" | "Abstain" are not hardcoded/guaranteed
  // However, it's not a big deal cause we don't need to rely on that
  [voteChoice: string]: {
    total: number;
    votes: SnapshotVote[];
  };
}

export type SnapshotProposalType =
  | 'single-choice'
  | 'approval'
  | 'quadratic'
  | 'ranked-choice'
  | 'weighted'
  | 'basic';
export interface ExtendedSnapshotProposal extends SnapshotProposal {
  snapshot: number; // Number of block
  snapshotState: string; // State retrieved from Snapshot
  type: SnapshotProposalType;
  quorum?: number;
  privacy?: string;
  ipfs: string;
  strategies: SnapshotVotingStrategy[];
  choices: string[];
  plugins: SnapshotPlugin[];
  votes: SnapshotVote[];
  votesBreakdown: SnapshotVoteBreakdown;
}

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

export type ERC721ProposalVote = {
  tokenAddresses: string[];
  tokenIds: string[];
} & ProposalVote;

export const VOTE_CHOICES = ['no', 'yes', 'abstain'] as const;

export enum AzoriusVoteChoice {
  No,
  Yes,
  Abstain,
}
