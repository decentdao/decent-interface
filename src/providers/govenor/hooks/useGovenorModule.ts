import { BigNumber } from 'ethers';
import { Context, createContext, useContext } from 'react';
import { GovernorModule, Timelock } from '../../../assets/typechain-types/metafactory';
import { VotesTokenWithSupply } from '../../../assets/typechain-types/votes-token';
import { ProposalData } from './useProposals';

export interface IGovernorModule {
  governorModuleContract: GovernorModule | undefined;
  timelockModuleContract: Timelock | undefined;
  proposals: ProposalData[] | undefined;
  votingToken: {
    votingTokenContract: VotesTokenWithSupply | undefined;
    votingTokenData: {
      name: string | undefined;
      symbol: string | undefined;
      decimals: number | undefined;
      userBalance: BigNumber | undefined;
      delegatee: string | undefined;
      votingWeight: BigNumber | undefined;
      address: string | undefined;
    };
  };
}

export const GovernorContext = createContext<IGovernorModule | null>(null);

export const useGovenorModule = (): IGovernorModule =>
  useContext(GovernorContext as Context<IGovernorModule>);
