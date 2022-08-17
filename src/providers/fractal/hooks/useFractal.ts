import { createContext, useContext, Context } from 'react';
import { IModuleData } from '../../../controller/Modules/types';
import { FractalActions, FractalDAO, IDaoLegacy } from '../types';

export interface IFractalContext {
  dao: FractalDAO;
  daoLegacy: IDaoLegacy;
  dispatch: React.Dispatch<FractalActions>;
  modules: {
    timelockModule?: IModuleData;
    treasuryModule?: IModuleData;
    tokenVotingGovernanceModule?: IModuleData;
    claimingContractModule?: IModuleData;
    gnosisWrapperModule?: IModuleData;
  };
}

export const FractalContext = createContext<IFractalContext | null>(null);

export const useFractal = (): IFractalContext =>
  useContext(FractalContext as Context<IFractalContext>);
