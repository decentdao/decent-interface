import { create } from 'zustand';
import { DecentRoleHat, initialHatsStore, RolesStore, sanitize } from './rolesStateUtils';

const useRolesState = create<RolesStore>()((set, get) => ({
  ...initialHatsStore,
  getHat: hatId => {
    const matches = get().hatsTree?.roleHats.filter(h => h.id === hatId);

    if (matches === undefined || matches.length === 0) {
      return null;
    }

    if (matches.length > 1) {
      throw new Error('multiple hats with the same ID');
    }

    return matches[0];
  },
  setHatsTreeId: hatsTreeId =>
    set(() => {
      // if `hatsTreeId` is null or undefined,
      // set `hatsTree` to that same value
      if (typeof hatsTreeId !== 'number') {
        return { hatsTreeId, hatsTree: hatsTreeId, streamsFetched: false };
      }
      return { hatsTreeId, streamsFetched: false };
    }),
  setHatsTree: async params => {
    const hatsTree = await sanitize(
      params.hatsTree,
      params.hatsAccountImplementation,
      params.erc6551Registry,
      params.hatsProtocol,
      params.chainId,
      params.publicClient,
      params.decentHats,
    );
    set(() => ({ hatsTree }));
  },
  updateRolesWithStreams: (updatedRoles: DecentRoleHat[]) => {
    const existingHatsTree = get().hatsTree;
    if (!existingHatsTree) return;

    const updatedDecentTree = {
      ...existingHatsTree,
      roleHats: updatedRoles,
    };

    set(() => ({ hatsTree: updatedDecentTree, streamsFetched: true }));
  },
  resetHatsStore: () => set(() => initialHatsStore),
}));

export { useRolesState };
