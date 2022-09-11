import { createContext, useContext, Context } from 'react';
import { DAOTrigger } from '../../../components/DaoCreator/provider/types';
import { TreasuryAssetFungible, TreasuryAssetNonFungible } from '../../../providers/treasury/types';
import { ProposalExecuteData } from '../../../types/proposal';

export interface IGovernanceInjectorContext {
  createProposal?: (proposal: {
    proposalData: ProposalExecuteData;
    successCallback: () => void;
  }) => void;
  pending?: boolean;
  isAuthorized?: boolean;
  createDAOTrigger: DAOTrigger;
  treasuryAssetsFungible: TreasuryAssetFungible[];
  treasuryAssetsNonFungible: TreasuryAssetNonFungible[];
}

export const GovernanceInjectorContext = createContext<IGovernanceInjectorContext | null>(null);

export const useGovernanceInjector = (): IGovernanceInjectorContext =>
  useContext(GovernanceInjectorContext as Context<IGovernanceInjectorContext>);
