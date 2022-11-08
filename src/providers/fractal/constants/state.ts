import { IGovernance } from './../types/governance';
import { IGnosis } from './../types/state';
import { ITreasury } from './../types/treasury';

export const gnosisInitialState: IGnosis = {
  modules: [],
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
  treasuryIsLoading: true,
};
