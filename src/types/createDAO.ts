import { SafeBalanceResponse, SafeCollectibleResponse } from '@safe-global/safe-service-client';
import { FormikProps } from 'formik';
import { Address } from 'viem';
import { DAOCreateMode } from '../components/DaoCreator/formComponents/EstablishEssentials';
import { BigIntValuePair } from './common';
import { GovernanceType, VotingStrategyType } from './fractal';
import { EthAddress } from './utils';

export enum CreatorSteps {
  ESSENTIALS = 'essentials',
  MULTISIG_DETAILS = 'multisig',
  ERC20_DETAILS = 'erc20Token',
  ERC721_DETAILS = 'erc721Token',
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
  mode: DAOCreateMode;
}

export interface CreatorFormState<T = BigIntValuePair> {
  essentials: DAOEssentials;
  multisig: SafeConfiguration;
  azorius: DAOGovernorModuleConfig<T>;
  erc20Token: DAOGovernorERC20Token<T>;
  erc721Token: DAOGovernorERC721Token<T>;
  freeze: DAOFreezeGuardConfig<T>;
}

export type DAOEssentials = {
  daoName: string;
  governance: GovernanceType;
  snapshotENS: string;
};

export type DAOGovernorERC20Token<T = bigint> = {
  tokenCreationType: TokenCreationType;
  tokenImportAddress?: Address;
  tokenName: string;
  tokenSymbol: string;
  tokenSupply: T;
  tokenAllocations: { amount: T; address: string }[];
  parentAllocationAmount: T;
};

export type ERC721TokenConfig<T = bigint> = {
  tokenAddress?: Address;
  tokenWeight: T;
};

export type DAOGovernorERC721Token<T = bigint> = {
  nfts: ERC721TokenConfig<T>[];
  quorumThreshold: T;
};

export type DAOGovernorModuleConfig<T = bigint> = {
  votingStrategyType: VotingStrategyType;
  quorumPercentage: T;
  timelock: T;
  votingPeriod: T;
  executionPeriod: T;
};

export type DAOFreezeGuardConfig<T = bigint> = {
  executionPeriod: T;
  timelockPeriod: T;
  freezeVotesThreshold: T;
  freezeProposalPeriod: T;
  freezePeriod: T;
};

export interface SafeConfiguration {
  trustedAddresses: Address[];
  signatureThreshold: number;
  numOfSigners?: number;
  customNonce: number;
}

export interface SubDAO<T = bigint>
  extends SafeConfiguration,
    AzoriusGovernanceDAO<T>,
    DAOFreezeGuardConfig<T> {}

export interface AzoriusGovernanceDAO<T = bigint>
  extends DAOEssentials,
    DAOGovernorModuleConfig<T> {}

export interface AzoriusERC20DAO<T = bigint>
  extends AzoriusGovernanceDAO<T>,
    DAOGovernorERC20Token<T> {
  isVotesToken?: boolean;
  isTokenImported?: boolean;
}

export interface AzoriusERC721DAO<T = bigint>
  extends AzoriusGovernanceDAO<T>,
    DAOGovernorERC721Token<T> {}

export interface SafeMultisigDAO extends DAOEssentials, SafeConfiguration {}

export type DAOTrigger = (
  daoData: SafeMultisigDAO | AzoriusERC20DAO | AzoriusERC721DAO,
  customNonce?: number,
) => void;

export type AddressValidationMap = Map<string, AddressValidation>;

export type AddressValidation = {
  address: string;
  isValidAddress: boolean;
};

export type TokenToFund = {
  asset: SafeBalanceResponse;
  amount: BigIntValuePair;
};

export type NFTToFund = {
  asset: SafeCollectibleResponse;
};

export type TokenAllocation<T = bigint> = {
  amount: T;
} & EthAddress;

export type CreateDAOFunc = (
  daoData: SafeMultisigDAO,
  successCallback: DeployDAOSuccessCallback,
) => void;
export type DeployDAOSuccessCallback = (daoAddress: string) => void;
export type DAODetails = {
  daoName: string;
  governance: GovernanceType;
};
