import { FractalNode } from '../../../types';
import { NodeAction, NodeActions } from './action';

export const initialNodeState: FractalNode = {
  daoName: null,
  daoAddress: null,
  safe: null,
  parentDAO: null,
  fractalModules: [],
};

export function nodeReducer(state: FractalNode, action: NodeActions) {
  switch (action.type) {
    case NodeAction.RESET:
      return initialNodeState;
    default:
      // Throw Error here (this would help check for missing cases in the switch statement)
      return state;
  }
}
