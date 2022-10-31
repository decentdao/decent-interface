export enum ModuleSelectActions {
  SET_MODULE_ADDRESS,
  SET_MODULE,
  INVALIDATE,
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

export enum GnosisModuleType {
  USUL = 'Usul Module',
  FRACTAL = 'Fractal Module',
  UNKNOWN = 'Unknown Module Type',
}
