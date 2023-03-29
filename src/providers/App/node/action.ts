import { FractalModuleData, Node } from '../../../types';
import { SafeInfoResponseWithGuard } from './../../../types/safeGlobal';

export enum NodeAction {
  SET_SAFE_INFO,
  SET_DAO_INFO,
  SET_FRACTAL_MODULES,
  UPDATE_DAO_NAME, // listener for daoName changes
  RESET,
}

export type NodeActions =
  | { type: NodeAction.SET_SAFE_INFO; payload: SafeInfoResponseWithGuard }
  | { type: NodeAction.SET_DAO_INFO; payload: Node }
  | { type: NodeAction.SET_FRACTAL_MODULES; payload: FractalModuleData[] }
  | { type: NodeAction.UPDATE_DAO_NAME; payload: string }
  | { type: NodeAction.RESET };
