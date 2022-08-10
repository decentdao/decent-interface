import { ReactNode, useMemo, useReducer } from 'react';

import { initialState } from './constants';
import { FractalAction } from './constants/enums';
import { useDAOLegacy } from './hooks/useDAOLegacy';
import { FractalContext } from './hooks/useFractal';
import { FractalActions, FractalDAO, IDaoLegacy } from './types';
import { useModuleTypes } from './hooks/useModuleTypes';
import { useModuleListeners } from './hooks/useModuleListeners';

const initializeState = (_initialState: FractalDAO) => {
  return _initialState;
};

export const reducer = (state: FractalDAO, action: FractalActions): FractalDAO => {
  switch (action.type) {
    case FractalAction.SET_DAO:
      return { ...action.payload, isLoading: false };
    case FractalAction.UPDATE_MODULE:
      return { ...state, moduleAddresses: action.payload };
    case FractalAction.RESET:
      return initializeState(initialState);
    case FractalAction.INVALID:
      return { ...initialState, isLoading: false };
    default:
      return state;
  }
};

/**
 * Uses Context API to provider DAO information to app
 */
export function FractalProvider({ children }: { children: ReactNode }) {
  const [dao, dispatch] = useReducer(reducer, initialState, initializeState);
  const daoLegacy: IDaoLegacy = useDAOLegacy(dao.daoAddress);

  const { timelockModule, treasuryModule, tokenVotingGovernanceModule, claimingContractModule } =
    useModuleTypes(dao.moduleAddresses);

  useModuleListeners(dao, dispatch);

  const value = useMemo(
    () => ({
      dao,
      modules: {
        timelockModule,
        treasuryModule,
        tokenVotingGovernanceModule,
        claimingContractModule,
      },
      dispatch,
      daoLegacy,
    }),
    [
      dao,
      daoLegacy,
      timelockModule,
      treasuryModule,
      tokenVotingGovernanceModule,
      claimingContractModule,
    ]
  );
  return <FractalContext.Provider value={value}>{children}</FractalContext.Provider>;
}
