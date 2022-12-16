import {
  FractalModule,
  UsulVetoGuard,
  VetoERC20Voting,
  VetoGuard,
  VetoMultisigVoting,
  FractalUsul,
} from '@fractal-framework/fractal-contracts';
import { BigNumber } from 'ethers';
import { IGoveranceTokenData } from '../governance/hooks/useGovernanceTokenData';

export enum GovernanceTypes {
  GNOSIS_SAFE = 'safe',
  GNOSIS_SAFE_USUL = 'usul safe',
}

export enum GnosisModuleType {
  USUL,
  FRACTAL,
  UNKNOWN,
}

export enum VetoVotingType {
  ERC20,
  MULTISIG,
  UNKNOWN,
}

// TODO left untranslated because this is likely going away
export enum ModuleTypes {
  TIMELOCK = 'Timelock Module',
  TOKEN_VOTING_GOVERNANCE = 'Token Governance',
  TREASURY = 'Treasury Module',
  CLAIMING = 'Claiming Contract',
  GNOSIS_WRAPPER = 'Gnosis Safe Governance',
}
export interface ModuleSelectState {
  isLoading: boolean;
  moduleType: string | null;
  moduleAddress: string | null;
}

export interface IModuleData {
  moduleAddress: string;
  moduleType: ModuleTypes;
}

export interface IGnosisModuleData {
  moduleContract: FractalUsul | FractalModule | undefined;
  moduleAddress: string;
  moduleType: GnosisModuleType;
}

export interface IGnosisVetoContract {
  vetoGuardContract: VetoGuard | UsulVetoGuard | undefined;
  vetoVotingContract: VetoERC20Voting | VetoMultisigVoting | undefined;
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
  createProposalFunc?: CreateProposalFunc;
  isCreateProposalPending?: boolean;
  isConnectedUserAuth?: boolean;
  createSubDAOFunc?: CreateDAOFunc;
  isCreateSubDAOPending?: boolean;
  proposalList?: any[];
  governanceIsLoading: boolean;
  governanceToken?: IGoveranceTokenData;
}

export interface GnosisConfig {
  trustedAddresses: TrustedAddress[];
  signatureThreshold: string;
}

export interface GnosisDAO extends DAODetails, GnosisConfig {}
