import { useCallback, useEffect, useState } from 'react';
import useENSName from '../useENSName';
import useSafeContracts from '../useSafeContracts';

export const createAccountSubstring = (account: string) => {
  return `${account.substring(0, 6)}...${account.slice(-4)}`;
};

export default function useDAOName({ address }: { address?: string }) {
  const { fractalNameRegistryContract } = useSafeContracts();
  const [daoRegistryName, setDAORegistryName] = useState<string>();
  const ensName = useENSName(address);

  const getDaoName = useCallback(async () => {
    if (!fractalNameRegistryContract || !address) {
      return '';
    }

    if (ensName) {
      setDAORegistryName(ensName);
      return;
    }

    const events = await fractalNameRegistryContract.queryFilter(
      fractalNameRegistryContract.filters.FractalNameUpdated(address)
    );

    const latestEvent = events[0];
    if (!latestEvent) {
      if (!address) {
        setDAORegistryName('');
        return;
      }

      setDAORegistryName(createAccountSubstring(address));
      return;
    }

    const { daoName } = latestEvent.args;
    setDAORegistryName(daoName);
  }, [fractalNameRegistryContract, address, ensName]);

  useEffect(() => {
    (async () => {
      await getDaoName();
    })();
  }, [getDaoName]);

  return { daoRegistryName };
}
