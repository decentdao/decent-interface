import { FractalGuardContracts } from '../../../types';
import { GuardContractAction, GuardContractActions } from './action';

export const initialGuardContractsState: FractalGuardContracts = {
  vetoGuardType: null,
  vetoVotingType: null,
};

export const guardContractReducer = (
  state: FractalGuardContracts,
  action: GuardContractActions
) => {
  switch (action.type) {
    case GuardContractAction.SET_GUARD_CONTRACT:
      return action.payload;
    case GuardContractAction.RESET:
      return initialGuardContractsState;
    default:
      return state;
  }
};
