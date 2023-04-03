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

export interface UsulProposal extends GovernanceActivity {
  proposer: string;
  govTokenAddress: string | null;
  votesSummary: ProposalVotesSummary;
  votes: ProposalVote[];
  deadline: number;
  startBlock: BigNumber;
}

export interface MultisigProposal extends GovernanceActivity {
  confirmations: SafeMultisigConfirmationResponse[];
  signersThreshold?: number;
  multisigRejectedProposalNumber?: string;
  nonce?: number;
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

export enum UsulVoteChoice {
  No,
  Yes,
  Abstain,
}

export enum ProposalIsPassedError {
  MAJORITY_YES_VOTES_NOT_REACHED = 'majority yesVotes not reached',
  QUORUM_NOT_REACHED = 'a quorum has not been reached for the proposal',
  PROPOSAL_STILL_ACTIVE = 'voting period has not passed yet',
}
