import { ReactNode, useMemo, useReducer } from 'react';

import { mvdInitialState, nodeInitialState } from './constants';
import { MVDAction, NodeAction } from './constants/enums';
import { useDAOLegacy } from './hooks/useDAOLegacy';
import { FractalContext } from './hooks/useFractal';
import { FractalNode, NodeActions, MVDActions, MVDDAO, IDaoLegacy } from './types';
import { useModuleTypes } from './hooks/useModuleTypes';
import { useModuleListeners } from './hooks/useModuleListeners';

const initializeState = (_initialState: MVDDAO) => {
  return _initialState;
};

const initializeNodeState = (_initialState: FractalNode) => {
  return _initialState;
};

const mvdReducer = (state: MVDDAO, action: MVDActions): MVDDAO => {
  switch (action.type) {
    case MVDAction.SET_DAO:
      return { ...action.payload, isLoading: false };
    case MVDAction.UPDATE_MODULE:
      return { ...state, moduleAddresses: action.payload };
    case MVDAction.RESET:
      return initializeState(mvdInitialState);
    case MVDAction.INVALIDATE:
      return { ...mvdInitialState, isLoading: false };
    default:
      return state;
  }
};

const nodeReducer = (state: FractalNode, action: NodeActions): FractalNode => {
  switch (action.type) {
    case NodeAction.SET_NODE_TYPE:
      return { ...state, nodeType: action.payload, isLoaded: true };
    case NodeAction.RESET:
      return initializeNodeState(nodeInitialState);
    case NodeAction.INVALIDATE:
      return { ...nodeInitialState };
    default:
      return state;
  }
};

/**
 * Uses Context API to provider DAO information to app
 */
export function FractalProvider({ children }: { children: ReactNode }) {
  const [dao, dispatch] = useReducer(mvdReducer, mvdInitialState, initializeState);
  const daoLegacy: IDaoLegacy = useDAOLegacy(dao.daoAddress);
  const [node, nodeDispatch] = useReducer(nodeReducer, nodeInitialState, initializeNodeState);

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
      node: {
        node,
        dispatch: nodeDispatch,
      },
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
      node,
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
