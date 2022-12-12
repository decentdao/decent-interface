import { GnosisAction, gnosisInitialState } from '../constants';
import { GnosisActions, IGnosis } from '../types';

export const initializeGnosisState = (_initialState: IGnosis) => {
  return _initialState;
};

export const gnosisReducer = (state: IGnosis, action: GnosisActions): IGnosis => {
  switch (action.type) {
    case GnosisAction.SET_SAFE_SERVICE_CLIENT:
      return { ...state, safeService: action.payload };
    case GnosisAction.SET_SAFE:
      return { ...state, safe: { ...action.payload }, isGnosisLoading: false };
    case GnosisAction.SET_SAFE_TRANSACTIONS:
      return { ...state, transactions: { ...action.payload }, isGnosisLoading: false };
    case GnosisAction.SET_MODULES:
      return { ...state, modules: action.payload, isGnosisLoading: false };
    case GnosisAction.SET_DAO_NAME:
      return { ...state, daoName: action.payload };
    case GnosisAction.SET_DAO_PARENT:
      return { ...state, parentDAOAddress: action.payload };
    case GnosisAction.RESET:
      return initializeGnosisState(gnosisInitialState);
    case GnosisAction.INVALIDATE:
      return { ...gnosisInitialState };
    default:
      return state;
  }
};
