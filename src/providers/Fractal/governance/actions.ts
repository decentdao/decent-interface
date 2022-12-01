import { IGovernance } from '../types';

export type GovernanceActions =
  | { type: GovernanceAction.ADD_GOVERNANCE_DATA; payload: IGovernance }
  | { type: GovernanceAction.RESET };

export enum GovernanceAction {
  ADD_GOVERNANCE_DATA,
  RESET,
}
