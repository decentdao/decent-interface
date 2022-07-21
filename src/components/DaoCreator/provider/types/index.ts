import { TokenAllocation } from '../../../../types/tokenAllocation';
import { TokenToFund, NFTToFund } from '../../SubsidiaryFunding/types';

export enum CreatorProviderActions {
  SET_STEP,
  UPDATE_ESSENTIALS,
  UPDATE_TREASURY_GOV_TOKEN,
  UPDATE_GOV_CONFIG,
  UPDATE_FUNDING,
  UPDATE_STEP,
  RESET,
}

export enum CreatorSteps {
  ESSENTIALS,
  FUNDING,
  TREASURY_GOV_TOKEN,
  GOV_CONFIG,
}

export type CreatorProviderActionTypes =
  | {
      type: CreatorProviderActions.UPDATE_ESSENTIALS;
      payload: DAOEssentials;
    }
  | { type: CreatorProviderActions.UPDATE_TREASURY_GOV_TOKEN; payload: DAOGovenorToken }
  | { type: CreatorProviderActions.UPDATE_GOV_CONFIG; payload: DAOGovenorModuleConfig }
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
  tokenSupply: string;
  tokenAllocations: TokenAllocation[];
};

type DAOGovenorModuleConfig = {
  proposalThreshold: string;
  quorum: string;
  executionDelay: string;
  lateQuorumExecution: string;
  voteStartDelay: string;
  votingPeriod: string;
};

type DAOFunding = {
  tokensToFund: TokenToFund[];
  nftsToFund: NFTToFund[];
};

export interface CreatorState {
  step: CreatorSteps;
  nextStep: CreatorSteps | null;
  prevStep: CreatorSteps | null;
  essentials: DAOEssentials;
  govToken: DAOGovenorToken;
  govModule: DAOGovenorModuleConfig;
  funding: DAOFunding;
}

export type ICreatorContext = {
  state: CreatorState;
  dispatch: React.Dispatch<any>;
};

export type DAOTrigger = (
  daoName: string,
  tokenName: string,
  tokenSymbol: string,
  tokenSupply: string,
  tokenAllocations: TokenAllocation[],
  proposalThreshold: string,
  quorum: string,
  executionDelay: string,
  lateQuorumExecution: string,
  voteStartDelay: string,
  votingPeriod: string
) => void;
