import { Gnosis } from './../types/state';
import { createContext, useContext, Context } from 'react';

export interface IGnosisContext {
  state: Gnosis;
  createProposal: () => void;
  createPendingTx: boolean;
}

export const GnosisContext = createContext<IGnosisContext | null>(null);

export const useGnosis = (): IGnosisContext => useContext(GnosisContext as Context<IGnosisContext>);
