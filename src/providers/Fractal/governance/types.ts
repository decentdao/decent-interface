import {
  FractalModule,
  FractalUsul,
  OZLinearVoting,
  VotesToken,
} from '@fractal-framework/fractal-contracts';
import {
  SafeMultisigTransactionWithTransfersResponse,
  SafeModuleTransactionWithTransfersResponse,
  EthereumTxWithTransfersResponse,
  SafeMultisigConfirmationResponse,
} from '@gnosis.pm/safe-service-client';
import { BigNumber } from 'ethers';
import { DecodedTransaction, MetaTransaction } from '../../../types';
import { IGoveranceTokenData } from './hooks/useGovernanceTokenData';

export enum GovernanceTypes {
  GNOSIS_SAFE = 'Multisig',
  GNOSIS_SAFE_USUL = 'Usul',
}

export enum GnosisModuleType {
  USUL,
  FRACTAL,
  UNKNOWN,
}

export interface IGnosisModuleData {
  moduleContract: FractalUsul | FractalModule | undefined;
  moduleAddress: string;
  moduleType: GnosisModuleType;
}

export type TrustedAddress = { address: string; error: boolean };
export type CreateDAOFunc = (daoData: GnosisDAO, successCallback: DeployDAOSuccessCallback) => void;
export type DeployDAOSuccessCallback = (daoAddress: string) => void;
export type DAODetails = {
  daoName: string;
  governance: GovernanceTypes;
};

export type CreateProposalFunc = (proposal: {
  proposalData: {};
  successCallback: () => void;
}) => void;

export interface TxProposalsInfo {
  txProposals: TxProposal[];
  pending?: number; // active/queued (usul) | not executed (multisig)
  passed?: number; // executed (usul/multisig)
}

export interface IGovernance {
  actions: {
    createProposal?: {
      func: CreateProposalFunc;
      pending: boolean;
    };
    createSubDAO?: {
      func: CreateDAOFunc;
      pending: boolean;
    };
  };
  type: GovernanceTypes | null;
  txProposalsInfo: TxProposalsInfo;
  governanceToken?: IGoveranceTokenData;
  contracts: GovernanceContracts;
  governanceIsLoading: boolean;
}

export interface GnosisConfig {
  trustedAddresses: TrustedAddress[];
  signatureThreshold: string;
}

export interface GnosisDAO extends DAODetails, GnosisConfig {}

export interface GovernanceContracts {
  ozLinearVotingContract?: OZLinearVoting;
  usulContract?: FractalUsul;
  tokenContract?: VotesToken;
  contractsIsLoading: boolean;
}

export enum TxProposalState {
  Approved = 'ownerApproved',
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

export type ProposalMetaData = {
  title?: string;
  description?: string;
  documentationUrl?: string;
  transactions?: MetaTransaction[];
  decodedTransactions: DecodedTransaction[];
};

export enum TreasuryActivityTypes {
  DEPOSIT,
  WITHDRAW,
}

export interface UsulProposal extends GovernanceActivity {
  proposer: string;
  govTokenAddress: string | null;
  votesSummary: ProposalVotesSummary;
  votes: ProposalVote[];
  deadline: number;
  startBlock: BigNumber;
  userVote?: ProposalVote;
}

export interface TreasuryActivity extends ActivityBase {
  transferAddresses: string[];
  transferAmountTotals: string[];
  isDeposit: boolean;
}

export interface MultisigProposal extends GovernanceActivity {
  confirmations: SafeMultisigConfirmationResponse[];
  signersThreshold?: number;
  multisigRejectedProposalNumber?: string;
}

export interface GovernanceActivity extends ActivityBase {
  state: TxProposalState;
  proposalNumber: string;
  targets: string[];
  txHashes: string[];
  metaData?: ProposalMetaData;
}
export interface ActivityBase {
  eventDate: string;
  eventType: ActivityEventType;
  transaction?: ActivityTransactionType;
  transactionHash?: string | null;
}

export type Activity = TreasuryActivity | MultisigProposal | UsulProposal;

export type ActivityTransactionType =
  | SafeMultisigTransactionWithTransfersResponse
  | SafeModuleTransactionWithTransfersResponse
  | EthereumTxWithTransfersResponse;

export enum ActivityEventType {
  Treasury,
  Governance,
}

export enum GnosisTransferType {
  ERC721 = 'ERC721_TRANSFER',
  ERC20 = 'ERC20_TRANSFER',
  ETHER = 'ETHER_TRANSFER',
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

export type TxProposal = UsulProposal | MultisigProposal;
