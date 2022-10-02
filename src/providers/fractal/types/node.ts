import { NodeType, NodeAction } from '../constants/enums';

export interface FractalNode {
  nodeType?: NodeType;
  isLoading?: boolean;
}

export type NodeActions =
  | { type: NodeAction.SET_NODE_TYPE; payload: NodeType }
  | { type: NodeAction.INVALID }
  | { type: NodeAction.RESET };
