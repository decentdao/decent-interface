import { FractalModule, VotesToken } from '@fractal-framework/fractal-contracts';
import { OZLinearVoting, Usul } from '../../../assets/typechain-types/usul';
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
  proposalList?: any[];
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
  OZlinearVotingContract?: OZLinearVoting;
  usulContract?: Usul;
  tokenContract?: VotesToken;
  contractsIsLoading: boolean;
}
