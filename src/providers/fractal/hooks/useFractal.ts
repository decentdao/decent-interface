import { createContext, useContext, Context } from 'react';
import { FractalDAO, IDaoLegacy } from '../types';

export interface IFractalContext {
  dao: FractalDAO;
  daoLegacy: IDaoLegacy;
}

export const FractalContext = createContext<IFractalContext | null>(null);

export const useFractal = (): IFractalContext =>
  useContext(FractalContext as Context<IFractalContext>);
