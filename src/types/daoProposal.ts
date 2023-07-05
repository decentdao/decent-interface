import { BigNumber, BigNumberish } from 'ethers';
import { GovernanceActivity } from './fractal';
import { SafeMultisigConfirmationResponse } from './safeGlobal';
import { MetaTransaction, DecodedTransaction } from './transaction';

export interface ProposalExecuteData extends ExecuteData {
  title: string;
  description: string;
  documentationUrl: string;
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

export type ProposalMetaData = {
  title?: string;
  description?: string;
  documentationUrl?: string;
  transactions?: MetaTransaction[];
  decodedTransactions: DecodedTransaction[];
};

export interface AzoriusProposal extends GovernanceActivity {
  proposer: string;
  govTokenAddress: string | null;
  votesSummary: ProposalVotesSummary;
  votes: ProposalVote[];
  /** The deadline timestamp for the proposal, in milliseconds. */
  deadlineMs: number;
  startBlock: BigNumber;
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

export const VOTE_CHOICES = ['no', 'yes', 'abstain'] as const;

export enum AzoriusVoteChoice {
  No,
  Yes,
  Abstain,
}
