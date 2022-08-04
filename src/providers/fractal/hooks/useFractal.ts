import { createContext, useContext, Context } from 'react';
import { FractalActions, FractalDAO, IDaoLegacy } from '../types';

export interface IFractalContext {
  dao: FractalDAO;
  daoLegacy: IDaoLegacy;
  dispatch: React.Dispatch<FractalActions>;
}

export const FractalContext = createContext<IFractalContext | null>(null);

export const useFractal = (): IFractalContext =>
  useContext(FractalContext as Context<IFractalContext>);
