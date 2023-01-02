import {
  FractalModule,
  FractalUsul,
  OZLinearVoting,
  UsulVetoGuard,
  VetoERC20Voting,
  VetoGuard,
  VetoMultisigVoting,
  VotesToken,
} from '@fractal-framework/fractal-contracts';
import {
  SafeMultisigConfirmationResponse,
  SafeMultisigTransactionWithTransfersResponse,
  SafeModuleTransactionWithTransfersResponse,
  EthereumTxWithTransfersResponse,
} from '@safe-global/safe-service-client';
import { BigNumber } from 'ethers';
import { DecodedTransaction, MetaTransaction } from '../../../types';
import { IGoveranceTokenData } from './hooks/useGovernanceTokenData';

export enum GovernanceTypes {
  GNOSIS_SAFE = 'labelMultisigGov',
  GNOSIS_SAFE_USUL = 'labelUsulGov',
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
  active?: number; // active/queued (usul) | not executed (multisig)
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

export enum VetoVotingType {
  ERC20,
  MULTISIG,
  UNKNOWN,
}

export enum VetoGuardType {
  MULTISIG,
  USUL,
  UNKNOWN,
}

export interface IGnosisVetoContract {
  vetoGuardContract: VetoGuard | UsulVetoGuard | undefined;
  vetoVotingContract: VetoERC20Voting | VetoMultisigVoting | undefined;
  vetoGuardType: VetoGuardType;
  vetoVotingType: VetoVotingType;
}

export interface IGnosisFreezeData {
  freezeVotesThreshold: BigNumber; // Number of freeze votes required to activate a freeze
  freezeProposalCreatedTime: BigNumber; // Block number the freeze proposal was created at
  freezeProposalVoteCount: BigNumber; // Number of accrued freeze votes
  freezeProposalPeriod: BigNumber; // Number of blocks a freeze proposal has to succeed
  freezePeriod: BigNumber; // Number of blocks a freeze lasts, from time of freeze proposal creation
  userHasFreezeVoted: boolean;
  isFrozen: boolean;
  userHasVotes: boolean;
}

export interface GnosisDAO extends DAODetails, GnosisConfig {}

export interface GovernanceContracts {
  ozLinearVotingContract?: OZLinearVoting;
  usulContract?: FractalUsul;
  tokenContract?: VotesToken;
  contractsIsLoading: boolean;
}

// @note its important that the other of Usul-specific states matches whats on the contract
export enum TxProposalState {
  // Usul contract states https://github.com/SekerDAO/Usul/blob/0cb39c0dd941b2825d401de69d16d41138a26717/contracts/Usul.sol#L23
  Active = 'stateActive', // also used as the first state of a Multisig proposal
  Canceled = 'stateCanceled',
  TimeLocked = 'stateTimeLocked',
  Executed = 'stateExecuted',
  // @note Usul calls this state 'Executing', however from our UI we display it as 'Executable', to
  // be more clear to the user that it is an actionable state.
  Executing = 'stateExecuting', // also used as the second state for a Multisig proposal
  Uninitialized = 'stateUninitialized',
  Failed = 'stateFailed',
  // End Usul contract states
  // Multisig states
  Approved = 'ownerApproved',
  Rejected = 'stateRejected',
  Module = 'stateModule',
  // End Multisig states
  // subDAO states (Usul / Multisig)
  Queueable = 'stateQueueable',
  Queued = 'stateQueued', // Timelock for multisig starts when queued
  Expired = 'stateExpired',
  // end subDAO states
}

export enum DAOState {
  freezeInit = 'stateFreezeInit',
  frozen = 'stateFrozen',
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
  state: TxProposalState | null;
  proposalNumber: string;
  targets: string[];
  metaData?: ProposalMetaData;
}
export interface ActivityBase {
  eventDate: Date;
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
  Module,
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
