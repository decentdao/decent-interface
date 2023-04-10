import { FractalGuardContracts } from '../../../types';

export enum GuardContractAction {
  SET_GUARD_CONTRACT = 'SET_GUARD_CONTRACT',
}

export type GuardContractActions = {
  type: GuardContractAction.SET_GUARD_CONTRACT;
  payload: FractalGuardContracts;
};
