import { FractalGuardContracts } from '../../../types';
import { GuardContractAction, GuardContractActions } from './action';

export const initialGuardContractsState: FractalGuardContracts = {
  vetoGuardType: null,
  vetoVotingType: null,
  vetoGuardContract: undefined,
  vetoVotingContract: undefined,
};

export const guardContractReducer = (
  state: FractalGuardContracts,
  action: GuardContractActions
) => {
  switch (action.type) {
    case GuardContractAction.SET_GUARD_CONTRACT:
      return action.payload;
    default:
      return state;
  }
};
