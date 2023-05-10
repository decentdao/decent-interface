import { SafeBalanceUsdResponse, SafeCollectibleResponse } from '@safe-global/safe-service-client';
import { BigNumber } from 'ethers';
import { FormikProps } from 'formik';
import { BigNumberValuePair } from './common';
import { GovernanceModuleType } from './fractal';
import { EthAddress } from './utils';
export enum CreatorSteps {
  ESSENTIALS = 'essentials',
  MULTISIG_DETAILS = 'multisig',
  TOKEN_DETAILS = 'token',
  AZORIUS_DETAILS = 'azorius',
  FREEZE_DETAILS = 'freeze',
}

export enum TokenCreationType {
  IMPORTED = 'imported',
  NEW = 'new',
}
export interface ICreationStepProps extends Omit<FormikProps<CreatorFormState>, 'handleSubmit'> {
  transactionPending?: boolean;
  isSubDAO?: boolean;
  step: CreatorSteps;
  updateStep: (newStep: CreatorSteps) => void;
}

export interface CreatorFormState<T = BigNumberValuePair> {
  essentials: DAOEssentials;
  multisig: GnosisConfiguration;
  token: DAOGovenorToken<T>;
  azorius: DAOGovenorModuleConfig<T>;
  freeze: DAOFreezeGuardConfig<T>;
}

export type DAOEssentials = {
  daoName: string;
  governance: GovernanceModuleType;
};

export type DAOGovenorToken<T = BigNumber> = {
  tokenCreationType: TokenCreationType;
  tokenImportAddress?: string;
  tokenName: string;
  tokenSymbol: string;
  tokenSupply: T;
  tokenAllocations: TokenAllocation<T>[];
  parentAllocationAmount: T;
};

export type DAOGovenorModuleConfig<T = BigNumber> = {
  quorumPercentage: T;
  timelock: T;
  votingPeriod: T;
  executionPeriod: T;
};

export type DAOFreezeGuardConfig<T = BigNumber> = {
  executionPeriod: T;
  timelockPeriod: T;
  freezeVotesThreshold: T;
  freezeProposalPeriod: T;
  freezePeriod: T;
};

export interface GnosisConfiguration {
  trustedAddresses: string[];
  signatureThreshold: number;
  numOfSigners?: number;
  customNonce: number;
}

export interface SubDAO<T = BigNumber>
  extends GnosisConfiguration,
    AzoriusGovernanceDAO<T>,
    DAOFreezeGuardConfig<T> {}

export interface AzoriusGovernanceDAO<T = BigNumber>
  extends DAOGovenorToken<T>,
    DAOEssentials,
    DAOGovenorModuleConfig<T> {
  isVotesToken?: boolean;
  isTokenImported?: boolean;
}

export interface SafeMultisigDAO extends DAOEssentials, GnosisConfiguration {}

export type DAOTrigger = (daoData: SafeMultisigDAO | AzoriusGovernanceDAO | SubDAO) => void;

export type AddressValidationMap = Map<string, AddressValidation>;

export type AddressValidation = {
  address: string;
  isValidAddress: boolean;
};

export type TokenToFund = {
  asset: SafeBalanceUsdResponse;
  amount: BigNumberValuePair;
};

export type NFTToFund = {
  asset: SafeCollectibleResponse;
};

export type TokenAllocation<T = BigNumber> = {
  amount: T;
} & EthAddress;

export type CreateDAOFunc = (
  daoData: SafeMultisigDAO,
  successCallback: DeployDAOSuccessCallback
) => void;
export type DeployDAOSuccessCallback = (daoAddress: string) => void;
export type DAODetails = {
  daoName: string;
  governance: GovernanceModuleType;
};
