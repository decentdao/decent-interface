import React, { createContext, useContext, Context } from 'react';
import { IGnosisModuleData } from '../../../controller/Modules/types';
import { GnosisSafe, GnosisActions } from '../types';

export interface IFractalContext {
  gnosis: {
    safe: GnosisSafe;
    modules: IGnosisModuleData[];
    dispatch: React.Dispatch<GnosisActions>;
  };
}

export const FractalContext = createContext<IFractalContext | null>(null);

export const useFractal = (): IFractalContext =>
  useContext(FractalContext as Context<IFractalContext>);
