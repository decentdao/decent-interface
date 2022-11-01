import { GnosisSafe } from '../types';

export const gnosisInitialState: GnosisSafe = {
  address: undefined,
  nonce: undefined,
  threshold: undefined,
  owners: undefined,
  masterCopy: undefined,
  modules: undefined,
  fallbackHandler: undefined,
  guard: undefined,
  version: undefined,
  isLoading: true,
};
