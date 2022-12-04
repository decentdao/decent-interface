import { FractalModule, VotesToken } from '@fractal-framework/fractal-contracts';
import { BigNumber } from 'ethers';
import { OZLinearVoting, Usul } from '../../../assets/typechain-types/usul';
import { DecodedTransaction } from '../../../types';
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
  moduleContract: Usul | FractalModule | undefined;
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
  txProposalsInfo: TxProposlsInfo;
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
  usulContract?: Usul;
  tokenContract?: VotesToken;
  contractsIsLoading: boolean;
}

export enum TxProposalState {
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

export interface TxProposal {
  // BOTH
  state: TxProposalState; // TxProposalState
  startBlock: BigNumber; // submittedDate | block number
  proposer: string; // created by | this can stay the same
  proposalNumber: BigNumber; // proposal/safeTxHash id
  txHashes: string[]; // number of transactions?
  decodedTransactions: DecodedTransaction[]; // update recursive method?
  // USUL
  govTokenAddress: string | null; // don't need this
  votes: ProposalVotesSummary;
  deadline: number;
  userVote?: ProposalVote | undefined;
  // MULTISIG
}

export interface TxProposlsInfo {
  txProposals: TxProposal[];
  pending?: number; // active/queued (usul) | not executed (multisig)
  passed?: number; // executed (usul/multisig)
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
