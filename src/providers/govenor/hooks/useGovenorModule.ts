import { Context, createContext, useContext } from 'react';

export interface IGovernorModule {}

export const GovernorContext = createContext<IGovernorModule | null>(null);

export const useGovenorModule = (): IGovernorModule =>
  useContext(GovernorContext as Context<IGovernorModule>);
