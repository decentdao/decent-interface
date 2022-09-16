import { createContext, useContext } from 'react';
import { DAOTrigger } from '../../../components/DaoCreator/provider/types';
import { ProposalExecuteData } from '../../../types/proposal';

export interface IInjectorContext {
  createProposal?: (proposal: {
    proposalData: ProposalExecuteData;
    successCallback: () => void;
  }) => void;
  pending?: boolean;
  isAuthorized?: boolean;
  createDAOTrigger: DAOTrigger;
}

export const InjectorContext = createContext<IInjectorContext | null>(null);

export const useInjector = (): IInjectorContext =>
  useContext(InjectorContext as React.Context<IInjectorContext>);
