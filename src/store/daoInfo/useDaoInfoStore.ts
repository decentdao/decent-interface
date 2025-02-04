import { Address, getAddress } from 'viem';
import { create } from 'zustand';
import { DAOSubgraph, DecentModule, IDAO, SafeWithNextNonce } from '../../types';

export const initialDaoInfoStore: IDAO = {
  safe: null,
  subgraphInfo: null,
  modules: null,
  gaslessVotingEnabled: false,
  gasTankAddress: null,
};

interface UpdateDAOInfoParams {
  daoName?: string;
  gaslessVotingEnabled?: boolean;
  gasTankAddress?: Address;
}

export interface DaoInfoStore extends IDAO {
  setSafeInfo: (safe: SafeWithNextNonce) => void;
  setDaoInfo: (daoInfo: DAOSubgraph) => void;
  setDecentModules: (modules: DecentModule[]) => void;
  updateDAOInfo: (params: UpdateDAOInfoParams) => void;
  resetDaoInfoStore: () => void;
}

export const useDaoInfoStore = create<DaoInfoStore>()(set => ({
  ...initialDaoInfoStore,
  setSafeInfo: (safe: SafeWithNextNonce) => {
    const { address, owners, nonce, nextNonce, threshold, modules, guard } = safe;
    set({
      safe: {
        owners: owners.map(getAddress),
        modulesAddresses: modules.map(getAddress),
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

  setDecentModules: (modules: DecentModule[]) => {
    set({ modules });
  },
  updateDAOInfo: ({ daoName, gaslessVotingEnabled, gasTankAddress }: UpdateDAOInfoParams) => {
    set(state => {
      const updates: Partial<IDAO> = {};

      if (daoName !== undefined) {
        if (!state.subgraphInfo) {
          throw new Error('Subgraph info is not set');
        }
        updates.subgraphInfo = { ...state.subgraphInfo, daoName };
      }

      if (gaslessVotingEnabled !== undefined) {
        updates.gaslessVotingEnabled = gaslessVotingEnabled;
      }

      if (gasTankAddress !== undefined) {
        updates.gasTankAddress = gasTankAddress;
      }

      return updates;
    });
  },
  resetDaoInfoStore: () => set(initialDaoInfoStore),
}));
