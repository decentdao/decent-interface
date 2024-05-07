import { useCallback, useEffect, useState } from 'react';
import { getAddress, getContract } from 'viem';
import { useEnsName, usePublicClient } from 'wagmi';
import FractalRegistryAbi from '../../assets/abi/FractalRegistry';
import { useEthersProvider } from '../../providers/Ethers/hooks/useEthersProvider';
import { useNetworkConfig } from '../../providers/NetworkConfig/NetworkConfigProvider';
import { createAccountSubstring } from '../utils/useDisplayName';

export default function useDAOName(address: string) {
  const [daoRegistryName, setDAORegistryName] = useState<string>('');
  const { chain } = useNetworkConfig();
  const publicClient = usePublicClient();

  const { data: ensName } = useEnsName({
    address: getAddress(address),
    chainId: chain.id,
  });

  const {
    contracts: { fractalRegistry },
  } = useNetworkConfig();

  const getDaoName = useCallback(async () => {
    if (!address || !publicClient) {
      setDAORegistryName('');
      return;
    }

    if (ensName) {
      setDAORegistryName(ensName);
      return;
    }

    const fractalRegistryContract = getContract({
      abi: FractalRegistryAbi,
      address: fractalRegistry,
      client: publicClient,
    });

    const events = await fractalRegistryContract.getEvents.FractalNameUpdated({
      daoAddress: getAddress(address),
    });

    const latestEvent = events.pop();
    if (!latestEvent) {
      setDAORegistryName(createAccountSubstring(address));
      return;
    }

    const { daoName } = latestEvent.args;
    if (!daoName) {
      setDAORegistryName(createAccountSubstring(address));
      return;
    }

    setDAORegistryName(daoName);
  }, [address, ensName, fractalRegistry, publicClient]);

  useEffect(() => {
    (async () => {
      await getDaoName();
    })();
  }, [getDaoName]);

  return { daoRegistryName };
}

/**
 * Gets the 'display name' for a Fractal DAO, in the following order of preference:
 *
 * 1. Primary ENS Name (reverse record)
 * 2. Fractal name registry name
 * 3. Truncated Eth address in the form 0xbFC4...7551
 *
 * @dev this is used on initial load of the DAO Node, after subGraph data is loaded
 */
export function useLazyDAOName() {
  const provider = useEthersProvider();
  const getDaoName = useCallback(
    async (_address: string, _registryName?: string | null): Promise<string> => {
      if (provider) {
        // check if ens name resolves
        const ensName = await provider.lookupAddress(_address).catch(() => null);
        if (ensName) {
          return ensName;
        }
      }

      if (_registryName) {
        return _registryName;
      }

      return createAccountSubstring(_address);
    },
    [provider],
  );

  return { getDaoName };
}
