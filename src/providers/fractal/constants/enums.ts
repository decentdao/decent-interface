export enum NodeType {
  MVD,
  GNOSIS,
}

export enum NodeAction {
  SET_NODE_TYPE,
  INVALID,
  RESET,
}

export enum MVDAction {
  SET_DAO,
  UPDATE_MODULE,
  INVALID,
  RESET,
}

export enum GnosisAction {
  SET_SAFE,
  INVALIDATE,
  RESET,
}
