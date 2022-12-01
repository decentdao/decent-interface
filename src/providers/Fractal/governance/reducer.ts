import { governanceInitialState } from '../constants';
import { GovernanceAction, GovernanceActions } from './actions';
import { IGovernance } from './types';

export const initializeGovernanceState = (_initialState: IGovernance) => {
  return _initialState;
};

export const governanceReducer = (state: IGovernance, action: GovernanceActions): IGovernance => {
  switch (action.type) {
    case GovernanceAction.ADD_GOVERNANCE_DATA:
      return { ...state, ...action.payload };
    case GovernanceAction.RESET:
      return initializeGovernanceState(governanceInitialState);
    default:
      return state;
  }
};
