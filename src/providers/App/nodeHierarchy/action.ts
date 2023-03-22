import { NodeHierarchy, FractalNode } from '../../../types';

export enum NodeHierarchyAction {
  SET_NODE_HEIRARCHY,
  UPDATE_PARENT_NODE,
  UPDATE_CHILD_NODE,
  RESET,
}

export type NodeHierarchyActions =
  | { type: NodeHierarchyAction.SET_NODE_HEIRARCHY; payload: NodeHierarchy }
  | { type: NodeHierarchyAction.UPDATE_PARENT_NODE; payload: FractalNode }
  | { type: NodeHierarchyAction.UPDATE_CHILD_NODE; payload: FractalNode }
  | { type: NodeHierarchyAction.RESET };
