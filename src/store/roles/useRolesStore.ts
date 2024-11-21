import { getContract, Hex, PublicClient } from 'viem';
import { create } from 'zustand';
import { SablierV2LockupLinearAbi } from '../../assets/abi/SablierV2LockupLinear';
import { convertStreamIdToBigInt } from '../../hooks/streams/useCreateSablierStream';
import { DecentRoleHat, RolesStore } from '../../types/roles';
import { initialHatsStore, sanitize } from './rolesStoreUtils';

const useRolesStore = create<RolesStore>()((set, get) => ({
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
  getPayment: (hatId, streamId) => {
    const hat = get().getHat(hatId);

    if (!hat || !hat.payments) {
      return null;
    }

    const matches = hat.payments.filter(p => p.streamId === streamId);

    if (matches.length === 0) {
      return null;
    }

    if (matches.length > 1) {
      throw new Error('multiple payments with the same ID');
    }

    return matches[0];
  },
  setHatsTreeId: args =>
    set(() => {
      const { hatsTreeId, contextChainId } = args;
      // if `hatsTreeId` is null or undefined,
      // set `hatsTree` to that same value
      if (typeof hatsTreeId !== 'number') {
        return { hatsTreeId, hatsTree: hatsTreeId, streamsFetched: false, contextChainId: null };
      }
      return { hatsTreeId, streamsFetched: false, contextChainId };
    }),
  setHatsTree: async params => {
    const hatsTree = await sanitize(
      params.hatsTree,
      params.hatsAccountImplementation,
      params.hatsElectionsImplementation,
      params.erc6551Registry,
      params.hatsProtocol,
      params.chainId,
      params.publicClient,
      params.whitelistingVotingStrategy,
    );
    set(() => ({ hatsTree }));
  },
  refreshWithdrawableAmount: async (hatId: Hex, streamId: string, publicClient: PublicClient) => {
    const payment = get().getPayment(hatId, streamId);
    if (!payment) return;

    const streamContract = getContract({
      abi: SablierV2LockupLinearAbi,
      address: payment.contractAddress,
      client: publicClient,
    });

    const bigintStreamId = convertStreamIdToBigInt(streamId);

    const newWithdrawableAmount = await streamContract.read.withdrawableAmountOf([bigintStreamId]);
    const currentHatsTree = get().hatsTree;

    if (!currentHatsTree) return;
    set(() => ({
      hatsTree: {
        ...currentHatsTree,
        roleHats: currentHatsTree.roleHats.map(roleHat => {
          if (roleHat.id !== hatId) return roleHat;
          return {
            ...roleHat,
            payments: roleHat.payments?.map(p =>
              p.streamId === streamId ? { ...p, withdrawableAmount: newWithdrawableAmount } : p,
            ),
          };
        }),
      },
    }));
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
  updateCurrentTermStatus: (hatId: Hex, termStatus: 'inactive' | 'active') => {
    const currentHatsTree = get().hatsTree;
    if (!currentHatsTree) return;

    set(() => ({
      hatsTree: {
        ...currentHatsTree,
        roleHats: currentHatsTree.roleHats.map(roleHat => {
          if (roleHat.id !== hatId) return roleHat;
          return {
            ...roleHat,
            roleTerms: {
              ...roleHat.roleTerms,
              currentTerm: roleHat.roleTerms.currentTerm
                ? {
                    ...roleHat.roleTerms.currentTerm,
                    termStatus,
                  }
                : undefined,
            },
          };
        }),
      },
    }));
  },
  setHatIdsToStreamIds: hatIdsToStreamIds => {
    set(() => ({ hatIdsToStreamIds }));
  },
  resetHatsStore: () => set(() => initialHatsStore),
}));

export { useRolesStore };
