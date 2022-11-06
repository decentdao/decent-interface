export enum GnosisAction {
  SET_SAFE,
  SET_MODULES,
  SET_DAO_NAME,
  INVALIDATE,
  RESET,
}

export enum GovernanceAction {
  ADD_GOVERNANCE_DATA,
  RESET,
}

export enum TreasuryAction {
  UPDATE_GNOSIS_SAFE_FUNGIBLE_ASSETS,
  UPDATE_GNOSIS_SAFE_NONFUNGIBLE_ASSETS,
  UPDATE_GNOSIS_SAFE_TRANSFERS,
  RESET,
}
