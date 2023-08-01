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
