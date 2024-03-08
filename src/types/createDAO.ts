import { SafeBalanceUsdResponse, SafeCollectibleResponse } from '@safe-global/safe-service-client';
import { BigNumber } from 'ethers';
import { FormikProps } from 'formik';
import { DAOCreateMode } from '../components/DaoCreator/formComponents/EstablishEssentials';
import { BigNumberValuePair } from './common';
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

export interface CreatorFormState<T = BigNumberValuePair> {
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
  snapshotURL: string;
};

export type DAOGovernorERC20Token<T = BigNumber> = {
  tokenCreationType: TokenCreationType;
  tokenImportAddress?: string;
  tokenName: string;
  tokenSymbol: string;
  tokenSupply: T;
  tokenAllocations: TokenAllocation<T>[];
  parentAllocationAmount: T;
};

export type ERC721TokenConfig<T = BigNumber> = {
  tokenAddress: string;
  tokenWeight: T;
};

export type DAOGovernorERC721Token<T = BigNumber> = {
  nfts: ERC721TokenConfig<T>[];
  quorumThreshold: T;
};

export type DAOGovernorModuleConfig<T = BigNumber> = {
  votingStrategyType: VotingStrategyType;
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

export interface SafeConfiguration {
  trustedAddresses: string[];
  signatureThreshold: number;
  numOfSigners?: number;
  customNonce: number;
}

export interface SubDAO<T = BigNumber>
  extends SafeConfiguration,
    AzoriusGovernanceDAO<T>,
    DAOFreezeGuardConfig<T> {}

export interface AzoriusGovernanceDAO<T = BigNumber>
  extends DAOEssentials,
    DAOGovernorModuleConfig<T> {}

export interface AzoriusERC20DAO<T = BigNumber>
  extends AzoriusGovernanceDAO<T>,
    DAOGovernorERC20Token<T> {
  isVotesToken?: boolean;
  isTokenImported?: boolean;
}

export interface AzoriusERC721DAO<T = BigNumber>
  extends AzoriusGovernanceDAO<T>,
    DAOGovernorERC721Token<T> {}

export interface SafeMultisigDAO extends DAOEssentials, SafeConfiguration {}

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
  successCallback: DeployDAOSuccessCallback,
) => void;
export type DeployDAOSuccessCallback = (daoAddress: string) => void;
export type DAODetails = {
  daoName: string;
  governance: GovernanceType;
};
