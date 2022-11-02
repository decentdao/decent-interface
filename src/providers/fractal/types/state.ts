import { IGnosisModuleData } from '../../../controller/Modules/types';
import { GnosisActions, GovernanceActions, TreasuryActions } from './actions';
import { IGovernance } from './governance';
import { ITreasury } from './treasury';

export interface IFractalContext {
  gnosis: IGnosis;
  treasury: ITreasury;
  governance: IGovernance;
  dispatches: {
    treasuryDispatch: React.Dispatch<TreasuryActions>;
    governanceDispatch: React.Dispatch<GovernanceActions>;
    gnosisDispatch: React.Dispatch<GnosisActions>;
  };
}

export interface IGnosis {
  safe: GnosisSafe;
  modules: IGnosisModuleData[];
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
