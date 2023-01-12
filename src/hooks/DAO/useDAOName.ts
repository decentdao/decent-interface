import { useCallback, useEffect, useState } from 'react';
import useSafeContracts from '../safe/useSafeContracts';
import { createAccountSubstring } from '../utils/useDisplayName';
import useENSName from '../utils/useENSName';

/**
 * Gets the 'display name' for a Fractal DAO, in the following order of preference:
 *
 * 1. Primary ENS Name (reverse record)
 * 2. Fractal name registry name
 * 3. Truncated Eth address in the form 0xbFC4...7551
 */
export default function useDAOName({ address }: { address?: string }) {
  const { fractalRegistryContract } = useSafeContracts();
  const [daoRegistryName, setDAORegistryName] = useState<string>('');
  const ensName = useENSName(address);

  const getDaoName = useCallback(async () => {
    if (!address) {
      setDAORegistryName('');
      return;
    }

    if (ensName) {
      setDAORegistryName(ensName);
      return;
    }

    if (!fractalRegistryContract) {
      setDAORegistryName(createAccountSubstring(address));
      return;
    }

    const events = await fractalRegistryContract.queryFilter(
      fractalRegistryContract.filters.FractalNameUpdated(address)
    );

    const latestEvent = events[0];
    if (!latestEvent) {
      setDAORegistryName(createAccountSubstring(address));
      return;
    }

    const { daoName } = latestEvent.args;
    setDAORegistryName(daoName);
  }, [fractalRegistryContract, address, ensName]);

  useEffect(() => {
    (async () => {
      await getDaoName();
    })();
  }, [getDaoName]);

  return { daoRegistryName };
}
