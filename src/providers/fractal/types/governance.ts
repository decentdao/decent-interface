import { FractalModule } from '@fractal-framework/fractal-contracts/dist/typechain-types';
import { Usul } from '../../../assets/typechain-types/usul';
import { IGoveranceTokenData } from '../hooks/useGovernanceTokenData';

export enum GovernanceTypes {
  GNOSIS_SAFE = 'safe',
  GNOSIS_SAFE_USUL = 'usul safe',
}

export enum GnosisModuleType {
  USUL,
  FRACTAL,
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
