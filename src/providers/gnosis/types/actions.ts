import { FungibleAssets, NonFungibleAssets, GnosisInformation } from './state';
export enum GnosisActions {
  UPDATE_GNOSIS_CONTRACT,
  UPDATE_GNOSIS_SAFE_INFORMATION,
  UPDATE_GNOSIS_SAFE_FUNGIBLE_ASSETS,
  UPDATE_GNOSIS_SAFE_NONFUNGIBLE_ASSETS,
  UPDATE_SIGNER_AUTH,
  RESET,
}

export type GnosisActionTypes =
  | { type: GnosisActions.UPDATE_GNOSIS_CONTRACT; payload: { safeAddress: string } }
  | {
      type: GnosisActions.UPDATE_GNOSIS_SAFE_INFORMATION;
      payload: GnosisInformation;
    }
  | {
      type: GnosisActions.UPDATE_GNOSIS_SAFE_FUNGIBLE_ASSETS;
      payload: FungibleAssets;
    }
  | {
      type: GnosisActions.UPDATE_GNOSIS_SAFE_NONFUNGIBLE_ASSETS;
      payload: NonFungibleAssets;
    }
  | { type: GnosisActions.UPDATE_SIGNER_AUTH; payload: boolean }
  | { type: GnosisActions.RESET };
