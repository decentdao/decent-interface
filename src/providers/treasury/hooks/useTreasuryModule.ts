import { createContext, useContext, Context } from 'react';

export interface ITreasuryContext {}

export const TreasuryContext = createContext<ITreasuryContext | null>(null);

export const useTreasuryModule = (): ITreasuryContext =>
  useContext({} as Context<ITreasuryContext>);
