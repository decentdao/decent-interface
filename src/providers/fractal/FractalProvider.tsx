import { ReactNode, useEffect, useMemo, useReducer } from 'react';

import { initialState } from './constants';
import { FractalAction } from './constants/enums';
import { useDAOLegacy } from './hooks/useDAOLegacy';
import { FractalContext } from './hooks/useFractal';
import { ACRoleListener, FractalActions, FractalDAO, IDaoLegacy } from './types';
import { useModuleTypes } from './hooks/useModuleTypes';

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

export function FractalProvider({ children }: { children: ReactNode }) {
  const [dao, dispatch] = useReducer(reducer, initialState, initializeState);
  const daoLegacy: IDaoLegacy = useDAOLegacy(dao.daoAddress);

  const { timelockModule, treasuryModule, tokenVotingGovernanceModule, claimingContractModule } =
    useModuleTypes(dao.moduleAddresses);

  useEffect(() => {
    if (!dao.daoContract || !dao.accessControlContract) {
      return;
    }
    const addFilter = dao.accessControlContract.filters.ActionRoleAdded();

    const addRoleEventListener: ACRoleListener = (target: string) => {
      if (target === dao.daoContract!.address) {
        return;
      }
      const addresses = dao.moduleAddresses || [];
      if (!addresses?.includes(target)) {
        dispatch({
          type: FractalAction.UPDATE_MODULE,
          payload: [...addresses, target],
        });
      }
    };
    const removefilter = dao.accessControlContract.filters.ActionRoleRemoved();

    const removeRoleListener: ACRoleListener = (target: string) => {
      if (target === dao.daoContract!.address) {
        return;
      }
      const addresses = dao.moduleAddresses || [];
      if (!addresses?.includes(target)) {
        dispatch({
          type: FractalAction.UPDATE_MODULE,
          payload: [...addresses, target],
        });
      }
    };

    dao.accessControlContract.on(addFilter, addRoleEventListener);
    dao.accessControlContract.on(removefilter, removeRoleListener);

    return () => {
      dao.accessControlContract!.off(addFilter, addRoleEventListener);
      dao.accessControlContract!.off(removefilter, removeRoleListener);
    };
  }, [dao.daoContract, dao.accessControlContract, dao.moduleAddresses]);

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
