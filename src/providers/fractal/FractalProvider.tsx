import { ReactNode, useMemo, useReducer } from 'react';

import { mvdInitialState } from './constants';
import { MVDAction } from './constants/enums';
import { useDAOLegacy } from './hooks/useDAOLegacy';
import { FractalContext } from './hooks/useFractal';
import { MVDActions, MVDDAO, IDaoLegacy } from './types';
import { useModuleTypes } from './hooks/useModuleTypes';
import { useModuleListeners } from './hooks/useModuleListeners';

const initializeState = (_initialState: MVDDAO) => {
  return _initialState;
};

export const reducer = (state: MVDDAO, action: MVDActions): MVDDAO => {
  switch (action.type) {
    case MVDAction.SET_DAO:
      return { ...action.payload, isLoading: false };
    case MVDAction.UPDATE_MODULE:
      return { ...state, moduleAddresses: action.payload };
    case MVDAction.RESET:
      return initializeState(mvdInitialState);
    case MVDAction.INVALID:
      return { ...mvdInitialState, isLoading: false };
    default:
      return state;
  }
};

/**
 * Uses Context API to provider DAO information to app
 */
export function FractalProvider({ children }: { children: ReactNode }) {
  const [dao, dispatch] = useReducer(reducer, mvdInitialState, initializeState);
  const daoLegacy: IDaoLegacy = useDAOLegacy(dao.daoAddress);

  const {
    timelockModule,
    treasuryModule,
    tokenVotingGovernanceModule,
    claimingContractModule,
    gnosisWrapperModule,
  } = useModuleTypes(dao.moduleAddresses);

  useModuleListeners(dao, dispatch);

  const value = useMemo(
    () => ({
      mvd: {
        dao,
        modules: {
          timelockModule,
          treasuryModule,
          tokenVotingGovernanceModule,
          claimingContractModule,
          gnosisWrapperModule,
        },
        dispatch,
        daoLegacy,
      },
    }),
    [
      dao,
      daoLegacy,
      timelockModule,
      treasuryModule,
      tokenVotingGovernanceModule,
      claimingContractModule,
      gnosisWrapperModule,
    ]
  );
  return <FractalContext.Provider value={value}>{children}</FractalContext.Provider>;
}
