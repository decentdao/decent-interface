import { FractalGuardContracts } from '../../../types';

export enum GuardContractAction {
  SET_GUARD_CONTRACT,
  RESET,
}

export type GuardContractActions =
  | {
      type: GuardContractAction.SET_GUARD_CONTRACT;
      payload: FractalGuardContracts;
    }
  | {
      type: GuardContractAction.RESET;
    };
