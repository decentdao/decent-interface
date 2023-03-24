import {
  IGnosis,
  VetoVotingType,
  VetoGuardType,
  IGovernance,
  ITreasury,
  IConnectedAccount,
} from '../../../types';

export const gnosisInitialState: IGnosis = {
  safeService: undefined,
  modules: [],
  guardContracts: {
    vetoGuardContract: undefined,
    vetoVotingContract: undefined,
    vetoVotingType: VetoVotingType.UNKNOWN,
    vetoGuardType: VetoGuardType.UNKNOWN,
  },
  freezeData: undefined,
  transactions: {
    count: 0,
    next: undefined,
    previous: undefined,
    results: [],
  },
  safe: {},
  isGnosisLoading: true,
  daoName: '',
  hierarchy: [],
};

export const governanceInitialState: IGovernance = {
  actions: {},
  type: null,
  txProposalsInfo: {
    txProposals: [],
    active: undefined,
    passed: undefined,
  },
  governanceIsLoading: true,
  governanceToken: undefined,
  contracts: {
    contractsIsLoading: true,
  },
};

export const treasuryInitialState: ITreasury = {
  transactions: [],
  assetsFungible: [],
  assetsNonFungible: [],
  transfers: undefined,
  treasuryIsLoading: true,
};

export const connectedAccountInitialState: IConnectedAccount = {
  audit: {
    acceptAuditWarning: () => {},
    hasAccepted: undefined,
  },
  favorites: {
    favoritesList: [],
    isConnectedFavorited: false,
    toggleFavorite: () => {},
  },
};
