import { KeyValuePairsData } from '../../../types';
import { KeyValuePairsAction, KeyValuePairsActions } from './action';

export const initialKeyValuePairsState: KeyValuePairsData = {
  hatsTreeId: undefined,
};

export function keyValuePairsReducer(state: KeyValuePairsData, action: KeyValuePairsActions) {
  switch (action.type) {
    case KeyValuePairsAction.SET_HATS_TREE_ID: {
      return {
        ...state,
        hatsTreeId: action.payload,
      };
    }
    default:
      return state;
  }
}
