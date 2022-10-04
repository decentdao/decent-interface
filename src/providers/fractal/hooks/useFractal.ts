import { createContext, useContext, Context } from 'react';
import { IModuleData } from '../../../controller/Modules/types';
import { MVDActions, MVDDAO, IDaoLegacy } from '../types';

export interface IFractalContext {
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
