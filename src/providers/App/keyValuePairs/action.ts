export enum KeyValuePairsAction {
  SET_HATS_TREE_ID = 'SET_HATS_TREE_ID',
}

export type KeyValuePairsActions = {
  type: KeyValuePairsAction.SET_HATS_TREE_ID;
  payload: number | undefined;
};
