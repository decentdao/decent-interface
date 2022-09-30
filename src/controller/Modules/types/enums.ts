export enum ModuleSelectActions {
  SET_MODULE_ADDRESS,
  SET_MODULE,
  INVALID,
  RESET,
}

// TODO left untranslated because this is likely going away
export enum ModuleTypes {
  TIMELOCK = 'Timelock Module',
  TOKEN_VOTING_GOVERNANCE = 'Token Governance',
  TREASURY = 'Treasury Module',
  CLAIMING = 'Claiming Contract',
  GNOSIS_WRAPPER = 'Gnosis Safe Governance',
}
