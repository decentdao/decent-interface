import { Gnosis } from './../types/state';
import { createContext, useContext, Context } from 'react';

export interface IGnosisWrapperContext {
  state: Gnosis;
  createProposal: () => void;
  createPendingTx: boolean;
}

export const GnosisWrapperContext = createContext<IGnosisWrapperContext | null>(null);

export const useGnosisWrapper = (): IGnosisWrapperContext =>
  useContext(GnosisWrapperContext as Context<IGnosisWrapperContext>);
