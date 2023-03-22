import { NodeHierarchy } from '../../../types';
import { NodeHierarchyAction, NodeHierarchyActions } from './action';

export const initialNodeHierarchyState: NodeHierarchy = {
  parentNodes: [],
  childNodes: [],
};

export function nodeHierarchyReducer(state: NodeHierarchy, action: NodeHierarchyActions) {
  switch (action.type) {
    case NodeHierarchyAction.SET_NODE_HEIRARCHY: {
      return action.payload;
    }
    // @todo update these to properly update state with new node
    case NodeHierarchyAction.UPDATE_PARENT_NODE: {
      return { ...state, parentNode: [action.payload] };
    }
    case NodeHierarchyAction.UPDATE_CHILD_NODE: {
      return { ...state, childNode: [action.payload] };
    }
    case NodeHierarchyAction.RESET:
      return initialNodeHierarchyState;
    default:
      return state;
  }
}
