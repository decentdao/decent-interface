import { ReactNode, useMemo, useReducer } from 'react';

import { gnosisInitialState } from './constants';
import { GnosisAction } from './constants/enums';
import { FractalContext } from './hooks/useFractal';
import { GnosisSafe, GnosisActions } from './types';
import { useGnosisModuleTypes } from './hooks/useGnosisModuleTypes';

const initializeGnosisState = (_initialState: GnosisSafe) => {
  return _initialState;
};

const gnosisReducer = (state: GnosisSafe, action: GnosisActions): GnosisSafe => {
  switch (action.type) {
    case GnosisAction.SET_SAFE:
      return { ...action.payload, isLoading: false };
    case GnosisAction.RESET:
      return initializeGnosisState(gnosisInitialState);
    case GnosisAction.INVALIDATE:
      return { ...gnosisInitialState };
    default:
      return state;
  }
};

/**
 * Uses Context API to provider DAO information to app
 */
export function FractalProvider({ children }: { children: ReactNode }) {
  const [gnosis, gnosisDispatch] = useReducer(
    gnosisReducer,
    gnosisInitialState,
    initializeGnosisState
  );

  // @todo update to handle new contracts
  // const daoLegacy: IDaoLegacy = useDAOLegacy(dao.daoAddress);

  const modules = useGnosisModuleTypes(gnosis.modules);

  const value = useMemo(
    () => ({
      gnosis: {
        safe: gnosis,
        modules,
        dispatch: gnosisDispatch,
      },
    }),
    [gnosis, modules]
  );

  return <FractalContext.Provider value={value}>{children}</FractalContext.Provider>;
}
