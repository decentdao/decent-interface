import { GnosisAction } from '../constants/enums';

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
  isLoading?: boolean;
}

export type GnosisActions =
  | { type: GnosisAction.SET_SAFE; payload: GnosisSafe }
  | { type: GnosisAction.INVALIDATE }
  | { type: GnosisAction.RESET };
