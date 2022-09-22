import { BigNumber } from 'ethers';
import { NFTToFund, TokenToFund } from '../../SubsidiaryFunding/types/index';
import { TokenAllocation } from '../../../../types/tokenAllocation';

export enum CreatorProviderActions {
  SET_STEP,
  UPDATE_ESSENTIALS,
  UPDATE_TREASURY_GOV_TOKEN,
  UPDATE_GOVERNANCE,
  UPDATE_GNOSIS_CONFIG,
  UPDATE_GOV_CONFIG,
  UPDATE_FUNDING,
  UPDATE_STEP,
  RESET,
}

export enum CreatorSteps {
  CHOOSE_GOVERNANCE,
  ESSENTIALS,
  GNOSIS_GOVERNANCE,
  FUNDING,
  TREASURY_GOV_TOKEN,
  GOV_CONFIG,
}

export enum GovernanceTypes {
  TOKEN_VOTING_GOVERNANCE,
  GNOSIS_SAFE,
}

export type CreatorProviderActionTypes =
  | {
      type: CreatorProviderActions.UPDATE_ESSENTIALS;
      payload: DAOEssentials;
    }
  | { type: CreatorProviderActions.UPDATE_GOVERNANCE; payload: GovernanceTypes }
  | { type: CreatorProviderActions.UPDATE_TREASURY_GOV_TOKEN; payload: DAOGovenorToken }
  | { type: CreatorProviderActions.UPDATE_GOV_CONFIG; payload: DAOGovenorModuleConfig }
  | { type: CreatorProviderActions.UPDATE_GNOSIS_CONFIG; payload: GnosisDAO }
  | { type: CreatorProviderActions.UPDATE_FUNDING; payload: DAOFunding }
  | {
      type: CreatorProviderActions.UPDATE_STEP;
      payload: { nextStep: CreatorSteps; prevStep: CreatorSteps | null };
    }
  | {
      type: CreatorProviderActions.SET_STEP;
      payload: CreatorSteps;
    }
  | { type: CreatorProviderActions.RESET };

type DAOEssentials = {
  daoName: string;
};

type DAOGovenorToken = {
  tokenName: string;
  tokenSymbol: string;
  tokenSupply: BigNumberInput;
  tokenAllocations: TokenAllocation[];
  parentAllocationAmount?: BigNumberInput;
};

type DAOGovenorModuleConfig = {
  proposalThreshold: BigNumber;
  quorum: BigNumber;
  executionDelay: BigNumber;
  lateQuorumExecution: BigNumber;
  voteStartDelay: BigNumber;
  votingPeriod: BigNumber;
};

type DAOFunding = {
  tokensToFund: TokenToFund[];
  nftsToFund: NFTToFund[];
};

export interface CreatorState {
  step: CreatorSteps;
  nextStep: CreatorSteps | null;
  prevStep: CreatorSteps | null;
  governance: GovernanceTypes;
  gnosis: GnosisConfig;
  essentials: DAOEssentials;
  govToken: DAOGovenorToken;
  govModule: DAOGovenorModuleConfig;
  funding: DAOFunding;
}

export type ICreatorContext = {
  state: CreatorState;
  dispatch: React.Dispatch<any>;
};

export type BigNumberInput = {
  value: string;
  bigNumberValue: BigNumber | null;
};

export interface TokenGovernanceDAO extends DAODetails {
  tokenName: string;
  tokenSymbol: string;
  tokenSupply: BigNumberInput;
  tokenAllocations: TokenAllocation[];
  proposalThreshold: BigNumber;
  quorum: BigNumber;
  executionDelay: BigNumber;
  lateQuorumExecution: BigNumber;
  voteStartDelay: BigNumber;
  votingPeriod: BigNumber;
  nftsToFund: NFTToFund[];
  tokensToFund: TokenToFund[];
  parentAllocationAmount?: BigNumberInput;
}

export interface GnosisConfig {
  trustedAddresses: TrustedAddress[];
  signatureThreshold: string;
}

export interface GnosisDAO extends DAODetails, GnosisConfig {}

export type DAODetails = {
  daoName: string;
  governance: GovernanceTypes;
};

export type TrustedAddress = { address: string; error: boolean };

export type DAOTrigger = (tokenData: TokenGovernanceDAO | GnosisDAO) => void;
