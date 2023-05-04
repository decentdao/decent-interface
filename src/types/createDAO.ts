import { SafeBalanceUsdResponse, SafeCollectibleResponse } from '@safe-global/safe-service-client';
import { BigNumber } from 'ethers';
import { FormikProps } from 'formik';
import { BigNumberValuePair } from './common';
import { StrategyType } from './fractal';
import { EthAddress } from './utils';
export enum CreatorSteps {
  ESSENTIALS = 'essentials',
  GNOSIS_GOVERNANCE = 'gnosis',
  GNOSIS_WITH_AZORIUS = 'govToken',
  GOV_CONFIG = 'govModule',
  GUARD_CONFIG = 'freezeGuard',
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
  gnosis: GnosisConfiguration;
  govToken: DAOGovenorToken<T>;
  govModule: DAOGovenorModuleConfig<T>;
  freezeGuard: DAOVetoGuardConfig<T>;
}

export type DAOEssentials = {
  daoName: string;
  governance: StrategyType;
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

export type DAOVetoGuardConfig<T = BigNumber> = {
  executionPeriod: T;
  timelockPeriod: T;
  vetoVotesThreshold: T;
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
    DAOVetoGuardConfig<T> {}

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
  governance: StrategyType;
};
