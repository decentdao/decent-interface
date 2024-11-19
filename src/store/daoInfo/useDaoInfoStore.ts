import { create } from 'zustand';
import { FractalModuleData, DaoInfo, Node, SafeWithNextNonce } from '../../types';

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
  setDaoInfo: (daoInfo: Node | { daoName: string }) => void;
  setFractalModules: (fractalModules: FractalModuleData[]) => void;
  updateDaoName: (newDaoName: string) => void;
  resetDaoInfoStore: () => void;
}

export const useDaoInfoStore = create<DaoInfoStore>()(set => ({
  ...initialDaoInfoStore,
  setSafeInfo: (safeWithNonce: SafeWithNextNonce) => {
    set({ safe: safeWithNonce });
  },

  // called by subgraph data flow
  setDaoInfo: (daoInfo: Node | { daoName: string }) => {
    set({ ...daoInfo, isHierarchyLoaded: true });
  },
  setFractalModules: (fractalModules: FractalModuleData[]) => {
    set({ fractalModules, isModulesLoaded: true });
  },
  updateDaoName: (newDaoName: string) => {
    set({ daoName: newDaoName });
  },
  resetDaoInfoStore: () => set(initialDaoInfoStore),
}));
