import { SafeBalanceUsdResponse, SafeCollectibleResponse } from '@safe-global/safe-service-client';
import { FormikProps } from 'formik';
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

/**
 * `DAOEssentialsEdge` is a transitionary type that is used in place of the in-app-only `DAOEssentials` type.
 * `DAOEssentialsEdge` has a `snapshotURL` field in place of a `snapshotENS` field.
 *
 * A recent update necessitated the renaming of references to `snapshotURL` to `snapshotENS`,
 * but as the contracts and subgraph already use `snapshotURL`, this type is used to maintain compatibility
 * of the app with the contracts and subgraph of the outside world.
 */
type DAOEssentialsEdge = Omit<DAOEssentials, 'snapshotENS'> & { snapshotURL: string };

export type DAOGovernorERC20Token<T = bigint> = {
  tokenCreationType: TokenCreationType;
  tokenImportAddress?: string;
  tokenName: string;
  tokenSymbol: string;
  tokenSupply: T;
  tokenAllocations: TokenAllocation<T>[];
  parentAllocationAmount: T;
};

export type ERC721TokenConfig<T = bigint> = {
  tokenAddress: string;
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
  trustedAddresses: string[];
  signatureThreshold: number;
  numOfSigners?: number;
  customNonce: number;
}

export interface SubDAO<T = bigint>
  extends SafeConfiguration,
    AzoriusGovernanceDAO<T>,
    DAOFreezeGuardConfig<T> {}

export interface AzoriusGovernanceDAO<T = bigint>
  extends DAOEssentialsEdge,
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

export interface SafeMultisigDAO extends DAOEssentialsEdge, SafeConfiguration {}

export type DAOTrigger = (
  daoData: SafeMultisigDAO | AzoriusERC20DAO | AzoriusERC721DAO | SubDAO,
) => void;

export type AddressValidationMap = Map<string, AddressValidation>;

export type AddressValidation = {
  address: string;
  isValidAddress: boolean;
};

export type TokenToFund = {
  asset: SafeBalanceUsdResponse;
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
