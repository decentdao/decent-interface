import { MVDDAO, FractalNode } from '../types';

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
