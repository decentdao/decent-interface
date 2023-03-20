import { FractalNode } from '../../../types';

export enum NodeAction {
  SET_DAO_NODE,
  UPDATE_DAO_NAME, // listener for daoName changes
  RESET,
}

export type NodeActions =
  | { type: NodeAction.SET_DAO_NODE; payload: FractalNode }
  | { type: NodeAction.UPDATE_DAO_NAME; payload: string }
  | { type: NodeAction.RESET };
