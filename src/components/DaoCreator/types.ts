import { SafeBalanceUsdResponse, SafeCollectibleResponse } from '@safe-global/safe-service-client';
import { BigNumber } from 'ethers';
import { FormikProps } from 'formik';
import { GovernanceTypes } from '../../providers/Fractal/types';
import { TokenAllocation } from '../../types/tokenAllocation';
import { BigNumberValuePair } from '../ui/forms/BigNumberInput';

//
export enum CreatorSteps {
  ESSENTIALS = 'essentials',
  GNOSIS_GOVERNANCE = 'gnosis',
  GNOSIS_WITH_USUL = 'govToken',
  GOV_CONFIG = 'govModule',
  GUARD_CONFIG = 'vetoGuard',
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
  vetoGuard: DAOVetoGuardConfig<T>;
}

export type DAOEssentials = {
  daoName: string;
  governance: GovernanceTypes;
};

export type DAOGovenorToken<T = BigNumber> = {
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
  numOfSigners: number;
  customNonce?: number;
}

export interface SubDAO<T = BigNumber>
  extends GnosisConfiguration,
    TokenGovernanceDAO<T>,
    DAOVetoGuardConfig<T> {}

export interface TokenGovernanceDAO<T = BigNumber>
  extends DAOGovenorToken<T>,
    DAOEssentials,
    DAOGovenorModuleConfig<T> {}

export interface GnosisDAO extends DAOEssentials, GnosisConfiguration {}

export type DAOTrigger = (daoData: GnosisDAO | TokenGovernanceDAO | SubDAO) => void;

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
