import { getAddress } from 'viem';
import { create } from 'zustand';
import { DAOSubgraph, FractalModuleData, IDAO, SafeWithNextNonce } from '../../types';

export const initialDaoInfoStore: IDAO = {
  safe: null,
  subgraphInfo: null,
  daoModules: null,
};
export interface DaoInfoStore extends IDAO {
  setSafeInfo: (safe: SafeWithNextNonce) => void;
  setDaoInfo: (daoInfo: DAOSubgraph) => void;
  setDecentModules: (modules: FractalModuleData[]) => void;
  updateDaoName: (newDaoName: string) => void;
  resetDaoInfoStore: () => void;
}

export const useDaoInfoStore = create<DaoInfoStore>()(set => ({
  ...initialDaoInfoStore,
  setSafeInfo: (safe: SafeWithNextNonce) => {
    const { address, owners, nonce, nextNonce, threshold, modules, guard } = safe;
    set({
      safe: {
        owners: owners.map(getAddress),
        modules: modules.map(getAddress),
        guard: getAddress(guard),
        address: getAddress(address),
        nextNonce,
        threshold,
        nonce,
      },
    });
  },

  // called by subgraph data flow
  setDaoInfo: (subgraphInfo: DAOSubgraph) => {
    set({ subgraphInfo });
  },

  setDecentModules: (daoModules: FractalModuleData[]) => {
    set({ daoModules });
  },
  updateDaoName: (newDaoName: string) => {
    set(state => {
      if (!state.subgraphInfo) {
        throw new Error('Subgraph info is not set');
      }
      return {
        subgraphInfo: { ...state.subgraphInfo, daoName: newDaoName },
      };
    });
  },
  resetDaoInfoStore: () => set(initialDaoInfoStore),
}));
