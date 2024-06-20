import { Tree } from '@hatsprotocol/sdk-v1-subgraph';

export enum RolesAction {
  SET_HATS_TREE = 'SET_HATS_TREE',
}

export type RolesActions = { type: RolesAction.SET_HATS_TREE; payload: Tree };
