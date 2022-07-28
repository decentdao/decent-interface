import { VotesToken } from './../../../assets/typechain-types/module-treasury/contracts/mocks/VotesToken';
import { BigNumber } from 'ethers';
import { Context, createContext, useContext } from 'react';
import { ProposalData } from './useProposals';
import { GovernorModule, Timelock } from '../../../assets/typechain-types/module-governor';

export interface IGovernorModule {
  governorModuleContract: GovernorModule | undefined;
  timelockModuleContract: Timelock | undefined;
  proposals: ProposalData[] | undefined;
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
      address: string | undefined;
    };
  };
}

export const GovernorContext = createContext<IGovernorModule | null>(null);

export const useGovenorModule = (): IGovernorModule =>
  useContext(GovernorContext as Context<IGovernorModule>);
