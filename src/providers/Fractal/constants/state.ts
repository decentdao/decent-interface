import { BigNumber } from 'ethers';
import { IGovernance, VetoVotingType } from '../governance/types';
// eslint-disable-next-line import/namespace
import { IConnectedAccount, IGnosis } from '../types/state';
import { ITreasury } from '../types/treasury';

export const gnosisInitialState: IGnosis = {
  safeService: undefined,
  modules: [],
  guardContracts: {
    vetoGuardContract: undefined,
    vetoVotingContract: undefined,
    vetoVotingType: VetoVotingType.UNKNOWN,
  },
  freezeData: {
    freezeVotesThreshold: BigNumber.from(0),
    freezeProposalCreatedTime: BigNumber.from(0),
    freezeProposalVoteCount: BigNumber.from(0),
    freezeProposalPeriod: BigNumber.from(0),
    freezePeriod: BigNumber.from(0),
    userHasFreezeVoted: false,
    isFrozen: false,
  },
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
  actions: {},
  type: null,
  txProposalsInfo: {
    txProposals: [],
    pending: undefined,
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
    acceptAudit: () => {},
    hasAccepted: undefined,
  },
  favorites: {
    favoritesList: [],
    isConnectedFavorited: false,
    toggleFavorite: () => {},
  },
};
