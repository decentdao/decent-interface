export enum NodeType {
  MVD,
  GNOSIS,
}

export enum NodeAction {
  SET_NODE_TYPE,
  INVALIDATE,
  RESET,
}

export enum MVDAction {
  SET_DAO,
  UPDATE_MODULE,
  INVALIDATE,
  RESET,
}

export enum GnosisAction {
  SET_SAFE,
  INVALIDATE,
  RESET,
}
