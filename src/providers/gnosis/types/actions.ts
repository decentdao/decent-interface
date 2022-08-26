import { GnosisInformation } from './state';
export enum GnosisActions {
  UPDATE_GNOSIS_CONTRACT,
  UPDATE_GNOSIS_SAFE_INFORMATION,
  UPDATE_GNOSIS_SAFE_SIGNERS,
  RESET,
}

export type GnosisActionTypes =
  | { type: GnosisActions.UPDATE_GNOSIS_CONTRACT; payload: { contractAddress: string } }
  | {
      type: GnosisActions.UPDATE_GNOSIS_SAFE_INFORMATION;
      payload: GnosisInformation;
    }
  | { type: GnosisActions.RESET };
