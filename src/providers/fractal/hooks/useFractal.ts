import React, { createContext, useContext, Context } from 'react';
import { IGnosisModuleData, IModuleData } from '../../../controller/Modules/types';
import {
  FractalNode,
  MVDActions,
  MVDDAO,
  IDaoLegacy,
  NodeActions,
  GnosisSafe,
  GnosisActions,
} from '../types';

export interface IFractalContext {
  node: {
    node: FractalNode;
    dispatch: React.Dispatch<NodeActions>;
  };
  mvd: {
    dao: MVDDAO;
    daoLegacy: IDaoLegacy;
    dispatch: React.Dispatch<MVDActions>;
    modules: {
      timelockModule?: IModuleData;
      treasuryModule?: IModuleData;
      tokenVotingGovernanceModule?: IModuleData;
      claimingContractModule?: IModuleData;
      gnosisWrapperModule?: IModuleData;
    };
  };
  gnosis: {
    safe: GnosisSafe;
    modules: IGnosisModuleData[];
    dispatch: React.Dispatch<GnosisActions>;
  };
}

export const FractalContext = createContext<IFractalContext | null>(null);

export const useFractal = (): IFractalContext =>
  useContext(FractalContext as Context<IFractalContext>);
