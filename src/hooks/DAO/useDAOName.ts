import { useCallback, useEffect, useState } from 'react';
import { Address, useEnsName, useProvider } from 'wagmi';
import useSafeContracts from '../safe/useSafeContracts';
import { createAccountSubstring } from '../utils/useDisplayName';

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
  const provider = useProvider();
  const networkId = provider.network.chainId;
  const { data: ensName } = useEnsName({
    address: address as Address,
    chainId: networkId,
  });

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
    const events = await fractalRegistryContract.asSigner.queryFilter(
      fractalRegistryContract.asSigner.filters.FractalNameUpdated(address)
    );

    const latestEvent = events.pop();
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
