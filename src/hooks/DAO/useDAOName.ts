import { FractalRegistry } from '@fractal-framework/fractal-contracts';
import { useCallback, useEffect, useState } from 'react';
import { Address, useEnsName, useProvider } from 'wagmi';
import { getEventRPC } from '../../helpers';
import { CacheKeys, useLocalStorage } from '../../providers/Fractal/hooks/account/useLocalStorage';
import useSafeContracts from '../safe/useSafeContracts';
import { createAccountSubstring } from '../utils/useDisplayName';

/**
 * Gets the 'display name' for a Fractal DAO, in the following order of preference:
 *
 * 1. Primary ENS Name (reverse record)
 * 2. Fractal name registry name
 * 3. Truncated Eth address in the form 0xbFC4...7551
 */
export default function useDAOName({
  address,
  registryName,
}: {
  address?: string;
  registryName?: string | null;
}) {
  const { fractalRegistryContract } = useSafeContracts();
  const [daoRegistryName, setDAORegistryName] = useState<string>('');
  const provider = useProvider();
  const networkId = provider.network.chainId;
  const { data: ensName } = useEnsName({
    address: address as Address,
    chainId: networkId,
    cacheTime: 1000 * 60 * 30, // 30 min
  });
  const { setValue, getValue } = useLocalStorage();

  const getDaoName = useCallback(async () => {
    if (!address) {
      setDAORegistryName('');
      return;
    }

    if (ensName) {
      setDAORegistryName(ensName);
      return;
    }

    const cachedName = getValue(CacheKeys.DAO_NAME_PREFIX + address);
    if (cachedName) {
      setDAORegistryName(cachedName);
      return;
    }
    if (!fractalRegistryContract) {
      setDAORegistryName(createAccountSubstring(address));
      return;
    }

    if (registryName) {
      // Aka supplied from Subgraph
      setDAORegistryName(registryName);
    } else {
      const rpc = getEventRPC<FractalRegistry>(fractalRegistryContract, networkId);
      const events = await rpc.queryFilter(rpc.filters.FractalNameUpdated(address));

      const latestEvent = events.pop();
      if (!latestEvent) {
        setDAORegistryName(createAccountSubstring(address));
        return;
      }

      const { daoName } = latestEvent.args;
      setValue(CacheKeys.DAO_NAME_PREFIX + address, daoName, 60);
      setDAORegistryName(daoName);
    }
  }, [address, ensName, fractalRegistryContract, getValue, networkId, setValue, registryName]);

  useEffect(() => {
    (async () => {
      await getDaoName();
    })();
  }, [getDaoName]);

  return { daoRegistryName };
}
