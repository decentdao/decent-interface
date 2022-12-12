import SafeServiceClient, {
  AllTransactionsListResponse,
  SafeInfoResponse,
} from '@gnosis.pm/safe-service-client';
import { GnosisActions, GovernanceActions, TreasuryActions } from './actions';
import { IGnosisModuleData, IGnosisVetoData, IGovernance } from './governance';
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

export type SafeInfoResponseWithGuard = SafeInfoResponse & {
  guard?: string;
};

export interface IGnosis {
  daoName: string;
  safeService?: SafeServiceClient;
  safe: Partial<SafeInfoResponseWithGuard>;
  modules: IGnosisModuleData[];
  guard: IGnosisVetoData;
  transactions: AllTransactionsListResponse;
  isGnosisLoading: boolean;
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
