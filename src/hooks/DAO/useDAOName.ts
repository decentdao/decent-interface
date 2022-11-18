import { useCallback, useEffect, useState } from 'react';
import useDisplayName from '../useDisplayName';
import useSafeContracts from '../useSafeContracts';

export default function useDAOName({ address }: { address?: string }) {
  const { fractalNameRegistryContract } = useSafeContracts();
  const { displayName } = useDisplayName(address);
  const [daoRegistryName, setDAORegistryName] = useState<string>();

  const getDaoName = useCallback(async () => {
    if (!fractalNameRegistryContract || !address) {
      return '';
    }
    const events = await fractalNameRegistryContract.queryFilter(
      fractalNameRegistryContract.filters.FractalNameUpdated(address)
    );

    const latestEvent = events[0];
    if (!latestEvent) {
      setDAORegistryName(displayName);
    }

    const { daoName } = latestEvent.args;

    setDAORegistryName(daoName);
  }, [fractalNameRegistryContract, address, displayName]);

  useEffect(() => {
    (async () => {
      await getDaoName();
    })();
  }, [getDaoName]);

  return { daoRegistryName };
}
