import { Tree } from '@hatsprotocol/sdk-v1-subgraph';
import { Address, getContract, Hex, PublicClient } from 'viem';
import { create } from 'zustand';
import { SablierV2LockupLinearAbi } from '../../assets/abi/SablierV2LockupLinear';
import { convertStreamIdToBigInt } from '../../hooks/streams/useCreateSablierStream';
import { BigIntValuePair } from '../../types';
import { DecentRoleHat, DecentTree, initialHatsStore, sanitize } from './rolesStoreUtils';

const useRolesStore = create<{
  hatsTreeId: undefined | null | number;
  hatsTree: undefined | null | DecentTree;
  contextChainId: number | null;
  getHat: (hatId: Hex) => DecentRoleHat | null;
  getPayment: (
    hatId: Hex,
    streamId: string,
  ) => {
    streamId: string;
    contractAddress: Address;
    asset: {
      address: Address;
      name: string;
      symbol: string;
      decimals: number;
      logo: string;
    };
    amount: BigIntValuePair;
    startDate: Date;
    endDate: Date;
    cliffDate: Date | undefined;
    isStreaming: () => boolean;
    isCancellable: () => boolean;
    withdrawableAmount: bigint;
    isCancelled: boolean;
  } | null;
  setHatsTreeId: (args: { contextChainId: number | null; hatsTreeId?: number | null }) => void;
  setHatsTree: (params: {
    hatsTree: Tree | null | undefined;
    chainId: bigint;
    hatsProtocol: Address;
    erc6551Registry: Address;
    hatsAccountImplementation: Address;
    publicClient: PublicClient;
  }) => Promise<void>;
  refreshWithdrawableAmount: (hatId: Hex, streamId: string, publicClient: PublicClient) => void;
  updateRolesWithStreams: (updatedRolesWithStreams: DecentRoleHat[]) => void;
  resetHatsStore: () => void;
}>()((set, get) => ({
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
        return { hatsTreeId, hatsTree: hatsTreeId, contextChainId: null };
      }
      return { hatsTreeId, contextChainId };
    }),
  setHatsTree: async params => {
    const hatsTree = await sanitize(
      params.hatsTree,
      params.hatsAccountImplementation,
      params.erc6551Registry,
      params.hatsProtocol,
      params.chainId,
      params.publicClient,
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
            payments: roleHat.payments.map(p =>
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

    set(() => ({ hatsTree: updatedDecentTree }));
  },
  resetHatsStore: () => set(() => initialHatsStore),
}));

export { useRolesStore };
