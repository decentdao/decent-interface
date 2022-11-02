export enum GovernanceTypes {
  GNOSIS_SAFE = 'safe',
  GNOSIS_SAFE_USUL = 'usul safe',
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
}

export interface GnosisConfig {
  trustedAddresses: TrustedAddress[];
  signatureThreshold: string;
}

export interface GnosisDAO extends DAODetails, GnosisConfig {}
