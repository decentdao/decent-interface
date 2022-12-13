import SafeServiceClient, {
  AllTransactionsListResponse,
  SafeInfoResponse,
} from '@safe-global/safe-service-client';
import { GovernanceActions } from '../governance/actions';
import { IGovernance, IGnosisModuleData } from '../governance/types';
import { GnosisActions, TreasuryActions } from './actions';
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
  safeService?: SafeServiceClient;
  safe: Partial<SafeInfoResponse>;
  modules: IGnosisModuleData[];
  transactions: AllTransactionsListResponse;
  isGnosisLoading: boolean;
  parentDAOAddress?: string;
  childNodes?: string[];
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
