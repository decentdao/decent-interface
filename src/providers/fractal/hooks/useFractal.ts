import React, { createContext, useContext, Context } from 'react';
import { IModuleData } from '../../../controller/Modules/types';
import { FractalNode, MVDActions, MVDDAO, IDaoLegacy, NodeActions } from '../types';

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
}

export const FractalContext = createContext<IFractalContext | null>(null);

export const useFractal = (): IFractalContext =>
  useContext(FractalContext as Context<IFractalContext>);
