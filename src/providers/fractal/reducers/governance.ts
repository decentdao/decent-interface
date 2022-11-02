import { GovernanceAction, governanceInitialState } from '../constants';
import { GovernanceActions } from './../types/actions';
import { IGovernance } from './../types/governance';

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
