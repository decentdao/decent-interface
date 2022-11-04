import { Context, createContext, useContext } from 'react';
import { IFractalContext } from '../types';

export const FractalContext = createContext<IFractalContext | null>(null);

export const useFractal = (): IFractalContext =>
  useContext(FractalContext as Context<IFractalContext>);
