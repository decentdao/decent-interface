import { GnosisInformation } from './state';
export enum GnosisActions {
  UPDATE_GNOSIS_CONTRACT,
  UPDATE_GNOSIS_SAFE_INFORMATION,
  UPDATE_SIGNER_AUTH,
  RESET,
}

export type GnosisActionTypes =
  | { type: GnosisActions.UPDATE_GNOSIS_CONTRACT; payload: { contractAddress: string } }
  | {
      type: GnosisActions.UPDATE_GNOSIS_SAFE_INFORMATION;
      payload: GnosisInformation;
    }
  | { type: GnosisActions.UPDATE_SIGNER_AUTH; payload: boolean }
  | { type: GnosisActions.RESET };
