import { FractalNode } from '../../../types';
import { NodeAction, NodeActions } from './action';

export const initialNodeState: FractalNode = {
  daoName: null,
  daoAddress: null,
  safe: null,
  fractalModules: [],
};

export function nodeReducer(state: FractalNode, action: NodeActions) {
  switch (action.type) {
    case NodeAction.SET_DAO_NODE: {
      return action.payload;
    }
    case NodeAction.UPDATE_DAO_NAME: {
      return { ...state, daoName: action.payload };
    }
    case NodeAction.RESET:
      return initialNodeState;
    default:
      return state;
  }
}
