import { useCallback, useEffect } from 'react';

import { getAddress, getContract, zeroAddress } from 'viem';
import { usePublicClient } from 'wagmi';
import { HatsAbi } from '../../assets/abi/HatsAbi';
import { useFractal } from '../../providers/App/AppProvider';
import { useNetworkConfig } from '../../providers/NetworkConfig/NetworkConfigProvider';
import { useHatsTree } from './loaders/useHatsTree';

export function useHatsListeners() {
  const {
    node: { safe },
  } = useFractal();

  const {
    contracts: { hatsProtocol },
  } = useNetworkConfig();

  const publicClient = usePublicClient();
  const { getHatsTree } = useHatsTree();

  const handleHatCreated = useCallback(
    (args: {
      id?: bigint | undefined;
      details?: string | undefined;
      imageURI?: string | undefined;
    }) => {
      const { id, details, imageURI } = args;
      getHatsTree();
    },
    [getHatsTree],
  );

  const handleHatDetailsChanged = useCallback(
    (args: { hatId?: bigint | undefined; newDetails?: string | undefined }) => {
      const { hatId, newDetails } = args;
      getHatsTree();
    },
    [getHatsTree],
  );

  const handleHatStatusChanged = useCallback(
    (args: { hatId?: bigint | undefined; newStatus?: boolean | undefined }) => {
      const { hatId, newStatus } = args;
      getHatsTree();
    },
    [getHatsTree],
  );

  const handleTransferSingle = useCallback(
    (args: {
      operator?: string | undefined;
      from?: string | undefined;
      to?: string | undefined;
      id?: bigint | undefined;
    }) => {
      const { from } = args;
      if (from === zeroAddress) {
        return;
      }

      getHatsTree();
    },
    [getHatsTree],
  );

  useEffect(() => {
    if (!publicClient || !safe) return;

    const hatsContract = getContract({
      abi: HatsAbi,
      address: getAddress(hatsProtocol),
      client: publicClient,
    });

    if (!hatsContract) return;

    hatsContract.watchEvent.HatCreated({
      onLogs: log => handleHatCreated(log[0].args),
    });

    hatsContract.watchEvent.HatDetailsChanged({
      onLogs: log => handleHatDetailsChanged(log[0].args),
    });

    hatsContract.watchEvent.HatStatusChanged({
      onLogs: log => handleHatStatusChanged(log[0].args),
    });

    hatsContract.watchEvent.TransferSingle(
      {
        operator: getAddress(safe.address),
      },
      {
        onLogs: log => handleTransferSingle(log[0].args),
      },
    );
  }, [
    handleHatCreated,
    handleHatDetailsChanged,
    handleHatStatusChanged,
    handleTransferSingle,
    hatsProtocol,
    publicClient,
    safe,
  ]);
}
