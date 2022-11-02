import { IGnosis } from './../types/state';
import { ITreasury } from './../types/treasury';
import { IGovernance } from './../types/governance';

export const gnosisInitialState: IGnosis = {
  modules: [],
  safe: {},
  isGnosisLoading: true,
};

export const governanceInitialState: IGovernance = {
  createSubDAOFunc: undefined,
  isCreateSubDAOPending: undefined,
  createProposalFunc: undefined,
  isCreateProposalPending: undefined,
  proposalList: undefined,
  isConnectedUserAuth: undefined,
  governanceIsLoading: true,
};

export const treasuryInitialState: ITreasury = {
  transactions: [],
  assetsFungible: [],
  assetsNonFungible: [],
  treasuryIsLoading: true,
};
