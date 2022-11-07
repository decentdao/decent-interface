import { BigNumber } from 'ethers';
import { Context, createContext, useContext } from 'react';
import { GovernorModule, Timelock } from '../../../assets/typechain-types/module-governor';
import { ClaimSubsidiary } from '../../../assets/typechain-types/votes-token';
import { ProposalExecuteData } from '../../../types/proposal';
import { ProposalData } from '../types';
import { VotesToken } from './../../../assets/typechain-types/module-treasury/contracts/mocks/VotesToken';

export interface IGovernorModule {
  governorModuleContract: GovernorModule | undefined;
  timelockModuleContract: Timelock | undefined;
  proposals: ProposalData[] | undefined;
  createProposal: {
    pendingCreateTx: boolean;
    submitProposal: (proposal: {
      proposalData: ProposalExecuteData | undefined;
      successCallback: () => void;
    }) => void;
  };
  votingToken: {
    votingTokenContract: VotesToken | undefined;
    votingTokenData: {
      name: string | undefined;
      symbol: string | undefined;
      decimals: number | undefined;
      userBalance: BigNumber | undefined;
      userClaimAmount: BigNumber | undefined;
      delegatee: string | undefined;
      votingWeight: BigNumber | undefined;
      proposalTokenThreshold: BigNumber | undefined;
      address: string | undefined;
      isDelegatesSet: boolean | undefined;
    };
  };
  claimModuleContract: ClaimSubsidiary | undefined;
}

export const GovernorContext = createContext<IGovernorModule | null>(null);

export const useGovenorModule = (): IGovernorModule =>
  useContext(GovernorContext as Context<IGovernorModule>);
