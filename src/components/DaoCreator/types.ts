import { BigNumber } from 'ethers';
import { FormikProps } from 'formik';
import { GovernanceTypes } from '../../providers/Fractal/types';
import { TokenAllocation } from '../../types/tokenAllocation';
import { NFTToFund, TokenToFund } from './SubsidiaryFunding/types/index';

export enum CreatorSteps {
  ESSENTIALS,
  PURE_GNOSIS,
  GNOSIS_GOVERNANCE,
  GNOSIS_WITH_USUL,
  GOV_CONFIG,
  GUARD_CONFIG,
  FUNDING,
}

export interface ICreationStepProps extends Omit<FormikProps<CreatorFormState>, 'handleSubmit'> {
  transactionPending?: boolean;
  step: CreatorSteps;
  updateStep: (newStep: CreatorSteps) => void;
}

export interface CreatorFormState<T = BigNumberValuePair> {
  essentials: DAOEssentials;
  gnosis: GnosisConfiguration;
  govToken: DAOGovenorToken<T>;
  govModule: DAOGovenorModuleConfig<T>;
  vetoGuard: DAOVetoGuardConfig<T>;
  funding: DAOFunding;
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
  parentAllocationAmount?: T;
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

type DAOFunding = {
  tokensToFund: TokenToFund[];
  nftsToFund: NFTToFund[];
};

export interface GnosisConfiguration {
  trustedAddresses: string[];
  signatureThreshold: number;
  numOfSigners: number;
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

export type DAOTrigger = (daoData: GnosisDAO | TokenGovernanceDAO) => void;

export type AddressValidationMap = Map<string, AddressValidation>;

export type AddressValidation = {
  address: string;
  isValidAddress: boolean;
};

export interface BigNumberValuePair {
  value: string;
  bigNumberValue: BigNumber;
}
