import { IGovernance } from '../types';

export type GovernanceActions =
  | { type: GovernanceAction.SET_GOVERNANCE; payload: IGovernance }
  | { type: GovernanceAction.RESET };

export enum GovernanceAction {
  SET_GOVERNANCE,
  RESET,
}
