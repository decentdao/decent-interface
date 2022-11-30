import { IGovernance } from '../types/governance';
import { IConnectedAccount, IGnosis } from '../types/state';
import { ITreasury } from '../types/treasury';

export const gnosisInitialState: IGnosis = {
  safeService: undefined,
  modules: [],
  transactions: {
    count: 0,
    next: undefined,
    previous: undefined,
    results: [],
  },
  safe: {},
  isGnosisLoading: true,
  daoName: '',
};

export const governanceInitialState: IGovernance = {
  createSubDAOFunc: undefined,
  isCreateSubDAOPending: undefined,
  createProposalFunc: undefined,
  isCreateProposalPending: undefined,
  proposalList: undefined,
  isConnectedUserAuth: undefined,
  governanceIsLoading: true,
  governanceToken: undefined,
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
    acceptAudit: () => {},
    hasAccepted: undefined,
  },
  favorites: {
    favoritesList: [],
    isConnectedFavorited: false,
    toggleFavorite: () => {},
  },
};
