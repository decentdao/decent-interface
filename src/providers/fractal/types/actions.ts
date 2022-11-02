import { IGnosisModuleData, IGovernance } from './governance';
import { GnosisAction, GovernanceAction, TreasuryAction } from '../constants';
import { GnosisSafe } from './state';
import { GnosisAssetNonFungible, GnosisAssetFungible } from './treasury';

export type GnosisActions =
  | { type: GnosisAction.SET_SAFE; payload: GnosisSafe }
  | { type: GnosisAction.SET_MODULES; payload: IGnosisModuleData[] }
  | { type: GnosisAction.INVALIDATE }
  | { type: GnosisAction.RESET };

export type GovernanceActions =
  | { type: GovernanceAction.ADD_GOVERNANCE_DATA; payload: IGovernance }
  | { type: GovernanceAction.RESET };

export type TreasuryActions =
  | {
      type: TreasuryAction.UPDATE_GNOSIS_SAFE_FUNGIBLE_ASSETS;
      payload: GnosisAssetFungible[];
    }
  | {
      type: TreasuryAction.UPDATE_GNOSIS_SAFE_NONFUNGIBLE_ASSETS;
      payload: GnosisAssetNonFungible[];
    }
  | { type: TreasuryAction.RESET };
