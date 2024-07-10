import { hatIdToTreeId } from '@hatsprotocol/sdk-v1-core';
import { useCallback, useEffect } from 'react';

import { getAddress, getContract, zeroAddress } from 'viem';
import { usePublicClient } from 'wagmi';
import { HatsAbi } from '../../assets/abi/HatsAbi';
import { useFractal } from '../../providers/App/AppProvider';
import { useNetworkConfig } from '../../providers/NetworkConfig/NetworkConfigProvider';
import { useRolesState } from '../../state/useRolesState';
import { useHatsTree } from './loaders/useHatsTree';

export function useHatsListeners() {
  const {
    node: { daoAddress },
  } = useFractal();

  const {
    contracts: { hatsProtocol },
  } = useNetworkConfig();

  const publicClient = usePublicClient();
  const { getHatsTree } = useHatsTree();
  const { hatsTreeId } = useRolesState();

  const isNotFromThisSafesTree = useCallback(
    (hatId: bigint | undefined) => {
      if (!hatId) return true;

      const treeId = hatIdToTreeId(hatId);
      return treeId !== hatsTreeId;
    },
    [hatsTreeId],
  );

  // @todo Each of these `handle*` functions can probably be updated to more granularly update a specific node on the hats tree. If it turns out to be impossible or unnecessary, them these functions are entirely bloat and `getHatsTree` should be called directly in each listener's `onLogs` callback.
  const handleHatCreated = useCallback(
    (args: {
      id?: bigint | undefined;
      details?: string | undefined;
      imageURI?: string | undefined;
    }) => {
      const { id } = args;
      if (isNotFromThisSafesTree(id)) {
        return;
      }
      getHatsTree();
    },
    [getHatsTree, isNotFromThisSafesTree],
  );

  const handleHatDetailsChanged = useCallback(
    (args: { hatId?: bigint | undefined; newDetails?: string | undefined }) => {
      const { hatId } = args;
      if (isNotFromThisSafesTree(hatId)) {
        return;
      }
      getHatsTree();
    },
    [getHatsTree, isNotFromThisSafesTree],
  );

  const handleHatStatusChanged = useCallback(
    (args: { hatId?: bigint | undefined; newStatus?: boolean | undefined }) => {
      const { hatId } = args;
      if (isNotFromThisSafesTree(hatId)) {
        return;
      }
      getHatsTree();
    },
    [getHatsTree, isNotFromThisSafesTree],
  );

  const handleTransferSingle = useCallback(
    (args: {
      operator?: string | undefined;
      from?: string | undefined;
      to?: string | undefined;
      id?: bigint | undefined;
    }) => {
      const { from } = args;
      if (from === zeroAddress || isNotFromThisSafesTree(args.id)) {
        return;
      }

      getHatsTree();
    },
    [getHatsTree, isNotFromThisSafesTree],
  );

  useEffect(() => {
    if (!publicClient || !daoAddress) return;

    const hatsContract = getContract({
      abi: HatsAbi,
      address: getAddress(hatsProtocol),
      client: publicClient,
    });

    const unwatchHatCreated = hatsContract.watchEvent.HatCreated({
      onLogs: log => handleHatCreated(log[0].args),
    });

    const unwatchHatDetailsChanged = hatsContract.watchEvent.HatDetailsChanged({
      onLogs: log => handleHatDetailsChanged(log[0].args),
    });

    const unwatchHatStatusChanged = hatsContract.watchEvent.HatStatusChanged({
      onLogs: log => handleHatStatusChanged(log[0].args),
    });

    const unwatchTransferSingle = hatsContract.watchEvent.TransferSingle(
      {
        operator: daoAddress,
      },
      {
        onLogs: log => handleTransferSingle(log[0].args),
      },
    );

    return () => {
      unwatchHatCreated();
      unwatchHatDetailsChanged();
      unwatchHatStatusChanged();
      unwatchTransferSingle();
    };
  }, [
    getHatsTree,
    handleHatCreated,
    handleHatDetailsChanged,
    handleHatStatusChanged,
    handleTransferSingle,
    hatsProtocol,
    publicClient,
    daoAddress,
  ]);
}
