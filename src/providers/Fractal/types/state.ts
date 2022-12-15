import SafeServiceClient, {
  SafeInfoResponse,
  AllTransactionsListResponse,
} from '@safe-global/safe-service-client';
import { GovernanceActions } from '../governance/actions';
import { IGovernance, IGnosisModuleData } from '../governance/types';
import { GnosisActions, TreasuryActions } from './actions';
import { IGnosisFreezeData, IGnosisVetoContract } from './governance';
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
  actions: {
    getGnosisSafeTransactions: () => Promise<void>;
  };
}

export type SafeInfoResponseWithGuard = SafeInfoResponse & {
  guard?: string;
};

export interface IGnosis {
  providedSafeAddress?: string;
  daoName: string;
  safeService?: SafeServiceClient;
  safe: Partial<SafeInfoResponseWithGuard>;
  modules: IGnosisModuleData[];
  guardContracts: IGnosisVetoContract;
  freezeData: IGnosisFreezeData;
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
