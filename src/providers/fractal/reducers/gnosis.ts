import { GnosisAction, gnosisInitialState } from '../constants';
import { GnosisActions, IGnosis } from '../types';

export const initializeGnosisState = (_initialState: IGnosis) => {
  return _initialState;
};

export const gnosisReducer = (state: IGnosis, action: GnosisActions): IGnosis => {
  switch (action.type) {
    case GnosisAction.SET_SAFE:
      return { ...state, safe: { ...action.payload }, isGnosisLoading: false };
    case GnosisAction.SET_MODULES:
      return { ...state, modules: action.payload, isGnosisLoading: false };
    case GnosisAction.RESET:
      return initializeGnosisState(gnosisInitialState);
    case GnosisAction.INVALIDATE:
      return { ...gnosisInitialState };
    default:
      return state;
  }
};
