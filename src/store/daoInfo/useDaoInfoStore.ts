import { create } from 'zustand';
import { DaoInfo, SafeWithNextNonce } from '../../types';

type DAOInfoWithoutLoaders = Omit<DaoInfo, 'isModulesLoaded' | 'isHierarchyLoaded'>;

export const initialDaoInfoStore: DaoInfo = {
  daoName: null,
  safe: null,
  fractalModules: [],
  nodeHierarchy: {
    parentAddress: null,
    childNodes: [],
  },
  isHierarchyLoaded: false,
  isModulesLoaded: false,
};
export interface DaoInfoStore extends DaoInfo {
  setSafeInfo: (safeWithNonce: SafeWithNextNonce) => void;
  setDaoInfo: (daoInfo: DAOInfoWithoutLoaders) => void;
  updateDaoName: (newDaoName: string) => void;
  resetDaoInfoStore: () => void;
}

export const useDaoInfoStore = create<DaoInfoStore>()(set => ({
  ...initialDaoInfoStore,
  setSafeInfo: (safeWithNonce: SafeWithNextNonce) => {
    set({ safe: safeWithNonce });
  },

  // called by subgraph data flow
  setDaoInfo: (daoInfo: DAOInfoWithoutLoaders) => {
    set({ ...daoInfo, isHierarchyLoaded: true, isModulesLoaded: true });
  },

  updateDaoName: (newDaoName: string) => {
    set({ daoName: newDaoName });
  },
  resetDaoInfoStore: () => set(initialDaoInfoStore),
}));
