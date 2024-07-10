import { useEffect } from 'react';

import { getAddress, getContract } from 'viem';
import { usePublicClient } from 'wagmi';
import { HatsAbi } from '../../assets/abi/HatsAbi';
import { useFractal } from '../../providers/App/AppProvider';
import { useNetworkConfig } from '../../providers/NetworkConfig/NetworkConfigProvider';

export function useHatsListeners() {
  const {
    node: { safe },
  } = useFractal();

  const {
    contracts: { hatsProtocol },
  } = useNetworkConfig();

  const publicClient = usePublicClient();

  const handleHatCreated = (args: {
    id?: bigint | undefined;
    details?: string | undefined;
    imageURI?: string | undefined;
  }) => {
    const { id, details, imageURI } = args;
    console.log('Hat Created:', { id, details, imageURI });
  };

  const handleHatDetailsChanged = (args: {
    hatId?: bigint | undefined;
    newDetails?: string | undefined;
  }) => {
    const { hatId, newDetails } = args;
    console.log('Hat Details Changed:', { hatId, newDetails });
  };

  const handleHatStatusChanged = (args: {
    hatId?: bigint | undefined;
    newStatus?: boolean | undefined;
  }) => {
    const { hatId, newStatus } = args;
    console.log('Hat Details Changed:', { hatId, newStatus });
  };

  const handleTransferSingle = (args: {
    operator?: string | undefined;
    from?: string | undefined;
    to?: string | undefined;
    id?: bigint | undefined;
  }) => {
    const { operator, from, to, id } = args;
    console.log('Transfer Single:', { operator, from, to, id });
  };

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
  }, [hatsProtocol, publicClient, safe]);
}
