import { createContext, useContext, Context } from 'react';
import { DAOTrigger } from '../../../components/DaoCreator/provider/types';
import { ProposalData } from '../../../providers/govenor/types';
import { ProposalExecuteData } from '../../../types/proposal';

export interface IGovernanceInjectorContext {
  createProposal?: (proposal: {
    proposalData: ProposalExecuteData;
    successCallback: () => void;
  }) => void;
  pending?: boolean;
  isAuthorized?: boolean;
  createDAOTrigger: DAOTrigger;
  proposals?: ProposalData[];
}

export const GovernanceInjectorContext = createContext<IGovernanceInjectorContext | null>(null);

export const useGovernanceInjector = (): IGovernanceInjectorContext =>
  useContext(GovernanceInjectorContext as Context<IGovernanceInjectorContext>);
