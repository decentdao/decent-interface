import { GnosisActions, GovernanceActions, TreasuryActions } from './actions';
import { GnosisTransactionsResponse } from './gnosis';
import { IGnosisModuleData, IGovernance } from './governance';
import { ITreasury } from './treasury';

export interface IFractalContext {
  gnosis: IGnosis;
  treasury: ITreasury;
  governance: IGovernance;
  account: IConnectedAccount;
  dispatches: {
    treasuryDispatch: React.Dispatch<TreasuryActions>;
    governanceDispatch: React.Dispatch<GovernanceActions>;
    gnosisDispatch: React.Dispatch<GnosisActions>;
  };
}

export interface IGnosis {
  daoName: string;
  safe: GnosisSafe;
  modules: IGnosisModuleData[];
  transactions: GnosisTransactionsResponse;
  isGnosisLoading: boolean;
}

export interface GnosisSafe {
  address?: string;
  nonce?: number;
  threshold?: number;
  owners?: string[];
  masterCopy?: string;
  modules?: string[];
  fallbackHandler?: string;
  guard?: string;
  version?: string;
}

export interface IConnectedAccount {
  favorites: IFavorites;
  audit: IAudit;
}

export interface IAudit {
  hasAccepted?: boolean;
  acceptAudit: () => void;
}

export interface IFavorites {
  favoritesList: string[];
  isConnectedFavorited: boolean;
  toggleFavorite: (key: string) => void;
}
