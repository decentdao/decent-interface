import { IGovernance, VetoGuardType, VetoVotingType } from '../governance/types';
import { IConnectedAccount, IGnosis } from '../types/state';
import { ITreasury } from '../types/treasury';

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
  isNodesLoaded: false,
  daoName: '',
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
