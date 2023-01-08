import SafeServiceClient, {
  SafeInfoResponse,
  AllTransactionsListResponse,
} from '@safe-global/safe-service-client';
import { GovernanceActions } from '../governance/actions';
import {
  IGovernance,
  IGnosisModuleData,
  IGnosisFreezeData,
  IGnosisVetoContract,
} from '../governance/types';
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
  actions: {
    refreshSafeData: () => Promise<void>;
    lookupModules: (_moduleAddresses: string[]) => Promise<IGnosisModuleData[] | undefined>;
    getVetoGuardContracts: (
      _guardAddress: string,
      _modules?: IGnosisModuleData[] | undefined
    ) => Promise<IGnosisVetoContract | undefined>;
    lookupFreezeData: (
      _vetoGuardContracts: IGnosisVetoContract
    ) => Promise<IGnosisFreezeData | undefined>;
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
  freezeData: IGnosisFreezeData | undefined;
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
