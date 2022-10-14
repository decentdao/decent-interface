import { MVDDAO, FractalNode, GnosisSafe } from '../types';

export const nodeInitialState: FractalNode = {
  nodeType: undefined,
  isLoaded: false,
};

export const mvdInitialState: MVDDAO = {
  daoAddress: undefined,
  daoContract: undefined,
  daoName: undefined,
  accessControlAddress: undefined,
  accessControlContract: undefined,
  moduleAddresses: undefined,
  isLoading: true,
};

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
