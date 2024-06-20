import { Roles } from '../../../types';
import { RolesAction, RolesActions } from './action';

export const initiaRolesState: Roles = {
  hatsTree: undefined,
};

export function rolesReducer(state: Roles, action: RolesActions) {
  switch (action.type) {
    case RolesAction.SET_HATS_TREE: {
      return {
        ...state,
        hatsTree: action.payload,
      };
    }
    default:
      return state;
  }
}
